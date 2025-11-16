import * as crypto from 'crypto';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnFlow } from 'aws-cdk-lib/aws-mediaconnect';
import * as asm from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import {
  createNdiDiscoveryServer,
  startFlow,
} from './util';

export interface LiveFeedProps {
  readonly source?: LiveSourceSpec; // Optional live source specification
  readonly vpc?: ec2.IVpc; // Predifined VPC. If not provided, a new VPC will be created when the source type is VPC-SOURCE.
  readonly vpcConfig?: VpcConfig; // Settings for VPC. Required when the source type is VPC-SOURCE and/or VPC outputs will be added to this flow.
  readonly sg?: ec2.ISecurityGroup; // Optional security group for VPC source interface
  readonly autoStart?: boolean; // Whether to automatically start the MediaLive channel and MediaConnect flow
  readonly sourceIngestPort?: number; // Source ingest port (default: 5000)
}

export interface LiveSourceSpec {
  readonly protocol: 'RTP' | 'RTP-FEC' | 'SRT'; // Protocol of the live source
  readonly type: 'STANDARD-SOURCE' | 'VPC-SOURCE'; // Type of the live source
}

export interface VpcConfig {
  readonly props: ec2.VpcProps;
  readonly availabilityZone?: string;
  readonly subnetId?: string;
  readonly enableNDI?: boolean; // Settings for NDI output
}

export const DISCOVERY_SERVER_PORT = 5959;
export const VPC_INTERFACE_NAME = 'vpcInterfaceName';

export class LiveFeed extends Construct {
  public readonly flow: CfnFlow;
  public readonly vpc?: ec2.IVpc;
  public readonly ndiDiscoveryServer?: ec2.Instance;
  protected readonly secret: asm.ISecret;

  constructor(scope: Construct, id: string, props: LiveFeedProps) {
    super(scope, id);

    const {
      source = {
        protocol: 'SRT',
        type: 'STANDARD-SOURCE',
      },
      vpc: predifinedVpc,
      vpcConfig,
      sg: predefinedSg,
      autoStart = true,
      sourceIngestPort = 5000,
    } = props;

    // Throw exception if vpcConfig is not specified when the source type is VPC-SOURCE
    if (source.type === 'VPC-SOURCE' && !predifinedVpc && !vpcConfig) {
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

    // Create a security group to allow push input
    const description = 'Allow Push input from MediaLive';
    const sg = predefinedSg ?? (vpc ? new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description,
      allowAllOutbound: true,
    }): undefined);
    sg && sg.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    sg && sg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.udp(sourceIngestPort),
      description,
    );

    // Create an NDI discovery server
    let ndiConfig: CfnFlow.NdiConfigProperty | undefined;
    if (vpc && vpcConfig?.enableNDI) {
      const instance = createNdiDiscoveryServer(this, vpc, DISCOVERY_SERVER_PORT);
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

    this.flow = flow;
    this.vpc = vpc;
    this.secret = sourcePassword;
  }
}
