import * as crypto from 'crypto';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnFlow } from 'aws-cdk-lib/aws-mediaconnect';
import * as asm from 'aws-cdk-lib/aws-secretsmanager';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { MediaLive, startChannel } from 'awscdk-construct-medialive-channel';
import { Construct } from 'constructs';

export interface FileSpec {
  readonly type?: 'MP4_FILE' | 'TS_FILE'; // Type of the input file
  readonly url: string; // S3 URL of the input file
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

export interface EncoderSettings {
  readonly gopLengthInSeconds?: number; // The length of the GOP in seconds.
  readonly timecodeBurninPrefix?: string; // The prefix for the timecode burn-in.
  readonly framerateNumerator?: number; // The numerator for the framerate.
  readonly framerateDenominator?: number; // The denominator for the framerate.
  readonly scanType?: 'PROGRESSIVE' | 'INTERLACED'; // The scan type.
  readonly width?: number; // The width of the video.
  readonly height?: number; // The height of the video.
}

export interface LiveFeedFromFileProps {
  readonly file: FileSpec; // File specification
  readonly encoderSpec?: EncoderSettings; // Optional encoder settings for MediaLive
  readonly source?: LiveSourceSpec; // Optional live source specification
  readonly vpcConfig?: VpcConfig; // Settings for VPC. Required when the source type is VPC-SOURCE and/or VPC outputs will be added to this flow.
  readonly autoStart?: boolean; // Whether to automatically start the MediaLive channel and MediaConnect flow
}

const sourceIngestPort = 5000;
const discoveryServerPort = 5959;
const VPC_INTERFACE_NAME = 'vpcInterfaceName';

export class LiveFeedFromFile extends Construct {
  public readonly flow: CfnFlow;
  public readonly vpc?: ec2.IVpc;

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
      vpcConfig,
      autoStart = true,
    } = props;

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
    const vpc = vpcConfig ? new ec2.Vpc(this, 'VPC', vpcConfig.props) : undefined;
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
      ec2.Port.udp(sourceIngestPort),
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
          discoveryServerPort,
        }],
        ndiState: 'ENABLED',
      };
      sg && sg.addIngressRule(
        ec2.Peer.anyIpv4(),
        ec2.Port.tcpRange(5961, 65535),
        description,
      );
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
        // sourceIngestPort: `${sourceIngestPort}`,
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

function createNdiDiscoveryServer(scope: Construct, vpc: ec2.IVpc): ec2.Instance {
  const description = 'Allow NDI Discovery Service';
  const sg = new ec2.SecurityGroup(scope, 'NDISecurityGroup', {
    vpc,
    description,
    allowAllOutbound: true,
  });
  sg.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  sg.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(discoveryServerPort),
    description,
  );
  const instance = new ec2.Instance(scope, 'Instance', {
    vpc,
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
    machineImage: ec2.MachineImage.latestAmazonLinux2023(),
    vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    securityGroup: sg,
  });
  instance.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  // Get the CloudFormation logical ID for the instance
  const cfnInstance = instance.node.defaultChild as cdk.CfnResource;
  const logicalId = cfnInstance.logicalId;
  instance.applyCloudFormationInit(ec2.CloudFormationInit.fromConfigSets({
    configSets: {
      // Applies the configs below in this order
      default: ['configInstance', 'finalize'],
    },
    configs: {
      configInstance: new ec2.InitConfig([
        // NDI Discovery Service script
        ec2.InitFile.fromString(
          '/etc/systemd/ndi-discovery.service',
          `[Unit]
          Description=NDI Discovery Service
          
          [Service]
          ExecStartPre=/bin/sleep 30
          User=ec2-user
          WorkingDirectory=/home/ec2-user/bin/x86_64-linux-gnu
          ExecStart=/home/ec2-user/bin/x86_64-linux-gnu/ndi-discovery-server
          Restart=always

          [Install]
          WantedBy=multi-user.target
        `),
        // NDI Discovery Server Installation script
        ec2.InitFile.fromString(
          '/tmp/install-ndi-discovery.sh',
          `#!/bin/bash -xe
          cd /home/ec2-user

          #Install updates
          yum update -y

          #Download the NDI Linux SDK and extract it and run the install script
          wget https://downloads.ndi.tv/SDK/NDI_SDK_Linux/Install_NDI_SDK_v6_Linux.tar.gz
          tar -xzf Install_NDI_SDK_v6_Linux.tar.gz
          yes | sudo ./Install_NDI_SDK_v6_Linux.sh

          #Clean up and prepare directories
          rm -f Install_NDI_SDK_v6_Linux.tar.gz
          rm -f Install_NDI_SDK_v6_Linux.sh
          cp -r 'NDI SDK for Linux'/* ./
          rm -r 'NDI SDK for Linux'/
        `),
        // Install the NDI Discovery Service
        ec2.InitCommand.shellCommand('sudo bash /tmp/install-ndi-discovery.sh'),
        // Run the NDI Discovery Service
        ec2.InitCommand.shellCommand('sudo systemctl enable /etc/systemd/ndi-discovery.service'),
      ]),
      finalize: new ec2.InitConfig([
        // Start the NDI Discovery Service
        ec2.InitCommand.shellCommand(
          cdk.Fn.sub('/opt/aws/bin/cfn-signal -e $? --stack ${StackName} --resource ${Resource} --region ${Region}',
            {
              StackName: cdk.Aws.STACK_NAME,
              Resource: logicalId,
              Region: cdk.Aws.REGION,
            }),
        ),
      ]),
    },
  }));
  instance.addUserData(cdk.Fn.sub(`
    #!/bin/bash -xe
    yum install -y aws-cfn-bootstrap
    sudo /opt/aws/bin/cfn-init --configsets default -v --stack \${StackName} --resource \${Resource} --region \${Region}
    sudo reboot
  `, {
    StackName: cdk.Aws.STACK_NAME,
    Resource: logicalId,
    Region: cdk.Aws.REGION,
  }));
  return instance;
}

export function startFlow(scope: Construct, id: string, flowArn: string): Date {
  // Start channel
  new AwsCustomResource(scope, id, {
    onCreate: {
      service: 'MediaConnect',
      action: 'StartFlow',
      parameters: {
        FlowArn: flowArn,
      },
      physicalResourceId: PhysicalResourceId.of(`${crypto.randomUUID()}`),
      // ignoreErrorCodesMatching: '*',
      outputPaths: ['FlowArn', 'Status'],
    },
    onDelete: {
      service: 'MediaConnect',
      action: 'StopFlow',
      parameters: {
        FlowArn: flowArn,
      },
      physicalResourceId: PhysicalResourceId.of(`${crypto.randomUUID()}`),
      // ignoreErrorCodesMatching: '*',
      outputPaths: ['FlowArn', 'Status'],
    },
    //Will ignore any resource and use the assumedRoleArn as resource and 'sts:AssumeRole' for service:action
    policy: AwsCustomResourcePolicy.fromSdkCalls({
      resources: AwsCustomResourcePolicy.ANY_RESOURCE,
    }),
  });
  return new Date();
}
