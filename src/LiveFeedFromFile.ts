import * as crypto from 'crypto';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnFlow } from 'aws-cdk-lib/aws-mediaconnect';
import * as asm from 'aws-cdk-lib/aws-secretsmanager';
import { MediaLive, startChannel } from 'awscdk-construct-medialive-channel';
import { Construct } from 'constructs';
import {
  LiveFeedProps,
  SOURCE_INGEST_PORT,
  DISCOVERY_SERVER_PORT,
  VPC_INTERFACE_NAME,
  createNdiDiscoveryServer,
  startFlow,
} from './util';

export interface FileSpec {
  readonly type?: 'MP4_FILE' | 'TS_FILE'; // Type of the input file
  readonly url: string; // S3 URL of the input file
}

export interface EncoderSettings {
  readonly gopLengthInSeconds?: number; // The length of the GOP in seconds.
  readonly timecodeBurninPrefix?: string; // The prefix for the timecode burn-in.
  readonly framerateNumerator?: number; // The numerator for the framerate.
  readonly framerateDenominator?: number; // The denominator for the framerate.
  readonly scanType?: 'PROGRESSIVE' | 'INTERLACED'; // The scan type.
  readonly width?: number; // The width of the video.
  readonly height?: number; // The height of the video.
}

export interface LiveFeedFromFileProps extends LiveFeedProps {
  readonly file: FileSpec; // File specification
  readonly encoderSpec?: EncoderSettings; // Optional encoder settings for MediaLive
}

export class LiveFeedFromFile extends Construct {
  public readonly flow: CfnFlow;
  public readonly vpc?: ec2.IVpc;
  public readonly ndiDiscoveryServer?: ec2.Instance;

  constructor(scope: Construct, id: string, props: LiveFeedFromFileProps) {
    super(scope, id);

    const {
      file,
      encoderSpec = {
        gopLengthInSeconds: 2,
        timecodeBurninPrefix: 'Ch',
        framerateNumerator: 30,
        framerateDenominator: 1,
        scanType: 'PROGRESSIVE',
        width: 1920,
        height: 1080,
      },
      source = {
        protocol: 'SRT',
        type: 'STANDARD-SOURCE',
      },
      vpc: predifinedVpc,
      vpcConfig,
      autoStart = true,
    } = props;

    // Throw exception if vpcConfig is not specified when the source type is VPC-SOURCE
    if (source.type === 'VPC-SOURCE' && !vpcConfig) {
      throw new Error('VpcConfig is required when source type is VPC-SOURCE');
    }

    const uuid = `${crypto.randomUUID()}`;
    const protocol = (() => {
      switch (source.protocol) {
        case 'RTP':
          return 'rtp';
        case 'RTP-FEC':
          return 'rtp-fec';
        case 'SRT':
        default:
          return 'srt-listener';
      }
    })();

    // Create a VPC
    const vpc = predifinedVpc ?? (vpcConfig ? new ec2.Vpc(this, 'VPC', vpcConfig.props) : undefined);
    vpc && vpc.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // Allocate an Elastic IP for the VPC interface
    const eip = vpc ? new ec2.CfnEIP(this, 'EIP', {
      domain: 'vpc', // Ensure the EIP is allocated in the VPC
    }) : undefined;

    // Create a security group to allow push input
    const description = 'Allow Push input from MediaLive';
    const sg = vpc ? new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description,
      allowAllOutbound: true,
    }): undefined;
    sg && sg.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    sg && sg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.udp(SOURCE_INGEST_PORT),
      description,
    );

    // Create an NDI discovery server
    let ndiConfig: CfnFlow.NdiConfigProperty | undefined;
    if (vpc && vpcConfig?.enableNDI) {
      const instance = createNdiDiscoveryServer(this, vpc);
      ndiConfig = {
        ndiDiscoveryServers: [{
          discoveryServerAddress: instance.instancePrivateIp, // Use the private IP of the NDI Discovery Server
          vpcInterfaceAdapter: VPC_INTERFACE_NAME,
          discoveryServerPort: DISCOVERY_SERVER_PORT,
        }],
        ndiState: 'ENABLED',
      };
      sg && sg.addIngressRule(
        ec2.Peer.anyIpv4(),
        ec2.Port.tcpRange(5961, 65535),
        description,
      );
      this.ndiDiscoveryServer = instance;
    }

    // Create a secret
    const randomstring = Math.random().toString(36).slice(-8);
    const sourcePassword = new asm.Secret(this, 'SourcePassword', {
      secretName: `secret-${uuid}`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ password: randomstring }),
        generateStringKey: 'password',
        excludePunctuation: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create an IAM role for MediaConnect to access the VPC
    const role = new iam.Role(this, 'MediaConnectRole', {
      assumedBy: new iam.ServicePrincipal('mediaconnect.amazonaws.com'),
      inlinePolicies: {
        policy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              resources: [sourcePassword.secretArn],
              actions: [
                'secretsmanager:GetResourcePolicy',
                'secretsmanager:GetSecretValue',
                'secretsmanager:DescribeSecret',
                'secretsmanager:ListSecretVersionIds',
              ],
            }),
          ],
        }),
      },
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonVPCFullAccess'),
      ],
    });

    // Create a MediaConnect flow
    const flow = new CfnFlow(this, 'MyCfnFlow', {
      name: `lcp-demo-${uuid}`,
      source: {
        name: `lcp-demo-source-${uuid}`,
        protocol,
        // maxLatency: 2000,
        // minLatency: 1000,
        // vpcInterfaceName: VPC_INTERFACE_NAME,
        whitelistCidr: source.type === 'STANDARD-SOURCE' ? '0.0.0.0/0' : undefined,
        decryption: {
          // algorithm: 'aes128',
          roleArn: role.roleArn,
          secretArn: sourcePassword.secretArn,
        },
        // SOURCE_INGEST_PORT: `${SOURCE_INGEST_PORT}`,
        vpcInterfaceName: source.type === 'VPC-SOURCE' ? VPC_INTERFACE_NAME : undefined,
      },
      availabilityZone: vpcConfig?.availabilityZone ?? vpc?.availabilityZones[0],
      flowSize: vpcConfig?.enableNDI ? 'LARGE' : 'MEDIUM',
      ndiConfig,
      sourceMonitoringConfig: {
        thumbnailState: 'ENABLED',
        contentQualityAnalysisState: 'ENABLED',
      },
      vpcInterfaces: vpc ? [{
        name: VPC_INTERFACE_NAME,
        roleArn: role.roleArn,
        securityGroupIds: [sg!.securityGroupId],
        subnetId: vpcConfig?.subnetId ?? vpc.privateSubnets[0].subnetId,
      }] : [],
    });
    flow.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // Start the MediaConnect Flow
    autoStart && startFlow(this, 'StartMediaConnectFlow', flow.attrFlowArn);

    // Create MediaLive channel
    const eml = new MediaLive(this, 'MediaLive', {
      sources: [{ url: file.url.replace('s3://', 's3ssl://'), type: file.type ?? 'MP4_FILE' }],
      destinations: [{
        id: 'SRT',
        srtSettings: [{
          url: `srt://${flow.attrSourceIngestIp}:${flow.attrSourceSourceIngestPort}`, // Use the MediaConnect Flow URL
          encryptionPassphraseSecretArn: sourcePassword.secretArn,
        }],
      }],
      channelClass: 'SINGLE_PIPELINE',
      encoderSpec: {
        outputGroupSettingsList: [{
          srtGroupSettings: {
            inputLossAction: 'DROP_TS',
          },
        }],
        outputSettingsList: [{
          // Add valid OutputSettingsProperty fields here if needed
          srtOutputSettings: {
            latency: 2000, // Latency in milliseconds
            destination: {
              destinationRefId: 'SRT',
            },
            encryptionType: 'AES128', // Encryption type
            containerSettings: {
              m2TsSettings: {},
            },
          },
        }],
        gopLengthInSeconds: encoderSpec.gopLengthInSeconds ?? 2,
        timecodeBurninPrefix: encoderSpec.timecodeBurninPrefix,
        framerateNumerator: encoderSpec.framerateNumerator,
        framerateDenominator: encoderSpec.framerateDenominator,
        scanType: encoderSpec.scanType,
        width: encoderSpec.width,
        height: encoderSpec.height,
      },
      vpc: source.type === 'VPC-SOURCE' && vpc ? {
        publicAddressAllocationIds: [eip!.attrAllocationId],
        subnetIds: [vpc.privateSubnets[0].subnetId],
        securityGroupIds: [sg!.securityGroupId],
      } : undefined,
      secret: sourcePassword,
    });

    // Start the MediaLive channel
    autoStart && startChannel(this, 'StartMediaLiveChannel', eml.channel.ref);

    this.flow = flow;
    this.vpc = vpc;
  }
}
