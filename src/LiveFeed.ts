/// <reference types="node" />
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
  readonly name?: string; // Name of the live feed, used as prefix for all created resources
  readonly source?: LiveSourceSpec; // Optional live source specification
  readonly vpc?: ec2.IVpc; // Predifined VPC. If not provided, a new VPC will be created when the source type is VPC-SOURCE.
  readonly vpcConfig?: VpcConfig; // Settings for VPC. Required when the source type is VPC-SOURCE and/or VPC outputs will be added to this flow.
  readonly sg?: ec2.ISecurityGroup; // Optional security group for VPC source interface
  readonly autoStart?: boolean; // Whether to automatically start the MediaLive channel and MediaConnect flow
  readonly sourceIngestPort?: number; // Source ingest port (default: 5000)
  readonly secretParams?: SecretParams; // Optional secret parameters for accessing the source password
  readonly forceDisableEncryption?: boolean; // Whether to disable encryption for the MediaConnect flow
}

export interface LiveSourceSpec {
  readonly protocol: 'RTP' | 'RTP-FEC' | 'SRT'; // Protocol of the live source
  readonly type: 'STANDARD-SOURCE' | 'VPC-SOURCE'; // Type of the live source
  readonly minLatency?: number; // Minimum latency in milliseconds (applicable for SRT)
}

export interface VpcConfig {
  readonly props?: ec2.VpcProps;
  readonly availabilityZone?: string;
  readonly subnetId?: string;
  readonly enableNDI?: boolean; // Settings for NDI output
}

export interface SecretParams {
  readonly secret: asm.ISecret;
  readonly role: iam.IRole;
  readonly keyType?: 'static-key' | 'srt-password';
}

export const DISCOVERY_SERVER_PORT = 5959;
export const VPC_INTERFACE_NAME = 'vpcInterfaceName';

export class LiveFeed extends Construct {
  public readonly flow: CfnFlow;
  public readonly vpc?: ec2.IVpc;
  public readonly ndiDiscoveryServer?: ec2.Instance;
  protected readonly secret?: asm.ISecret;

  constructor(scope: Construct, id: string, props: LiveFeedProps) {
    super(scope, id);

    const {
      name = `${crypto.randomUUID()}`,
      source = {
        protocol: 'SRT',
        type: 'STANDARD-SOURCE',
        minLatency: 1000,
      },
      vpc: predifinedVpc,
      vpcConfig,
      sg: predefinedSg,
      autoStart = true,
      sourceIngestPort = 5000,
      secretParams,
      forceDisableEncryption = false,
    } = props;

    // Throw exception if vpcConfig is not specified when the source type is VPC-SOURCE
    if (source.type === 'VPC-SOURCE' && !predifinedVpc && !vpcConfig) {
      throw new Error('VpcConfig is required when source type is VPC-SOURCE');
    }

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
    const vpc = predifinedVpc ?? (vpcConfig ? new ec2.Vpc(this, `${name}-VPC`, vpcConfig.props) : undefined);
    vpc && vpc.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // Create a security group to allow push input
    const description = 'Allow Push input from MediaLive';
    const sg = predefinedSg ?? (vpc ? new ec2.SecurityGroup(this, `${name}-SecurityGroup`, {

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

    let sourcePassword: asm.ISecret | undefined;
    let role: iam.IRole | undefined;
    if (secretParams) {
      sourcePassword = secretParams.secret;
      role = secretParams.role;
    } else if (!forceDisableEncryption) {
      // Create a secret
      const randomstring = Math.random().toString(36).slice(-8);
      sourcePassword = new asm.Secret(this, `${name}-Secret`, {
        secretName: `secret-${name}`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ password: randomstring }),
          generateStringKey: 'password',
          excludePunctuation: true,
        },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      // Create an IAM role for MediaConnect to access the VPC
      role = new iam.Role(this, `${name}-Role`, {
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
    }

    // Create a MediaConnect flow
    const flow = new CfnFlow(this, `${name}-Flow`, {
      name,
      source: {
        name: `${name}-source`,
        protocol,
        minLatency: source.protocol === 'SRT' ? source.minLatency ?? 1000 : undefined,
        whitelistCidr: source.type === 'STANDARD-SOURCE' ? '0.0.0.0/0' : undefined,
        decryption: forceDisableEncryption ? undefined : {
          algorithm: secretParams?.keyType === 'srt-password' ? undefined : 'aes128',
          keyType: secretParams?.keyType,
          roleArn: role!.roleArn,
          secretArn: sourcePassword!.secretArn,
        },
        vpcInterfaceName: source.type === 'VPC-SOURCE' ? VPC_INTERFACE_NAME : undefined,
      },
      availabilityZone: vpcConfig?.availabilityZone ?? vpc?.availabilityZones[0],
      flowSize: vpc ? (vpcConfig?.enableNDI ? 'LARGE' : 'MEDIUM') : undefined,
      ndiConfig,
      sourceMonitoringConfig: {
        thumbnailState: 'ENABLED',
        contentQualityAnalysisState: 'ENABLED',
      },
      vpcInterfaces: vpc ? [{
        name: VPC_INTERFACE_NAME,
        roleArn: role!.roleArn,
        securityGroupIds: [sg!.securityGroupId],
        subnetId: vpcConfig?.subnetId ?? vpc.privateSubnets[0].subnetId,
      }] : undefined,
    });
    flow.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // Start the MediaConnect Flow
    autoStart && startFlow(this, `${name}-StartFlow`, flow.attrFlowArn);

    this.flow = flow;
    this.vpc = vpc;
    this.secret = sourcePassword;
  }
}
