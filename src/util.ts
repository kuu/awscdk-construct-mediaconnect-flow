import * as crypto from 'crypto';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

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

export const SOURCE_INGEST_PORT = 5000;
export const DISCOVERY_SERVER_PORT = 5959;
export const VPC_INTERFACE_NAME = 'vpcInterfaceName';

export function createNdiDiscoveryServer(scope: Construct, vpc: ec2.IVpc): ec2.Instance {
  const description = 'Allow NDI Discovery Service';
  const sg = new ec2.SecurityGroup(scope, 'NDISecurityGroup', {
    vpc,
    description,
    allowAllOutbound: true,
  });
  sg.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  sg.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(DISCOVERY_SERVER_PORT),
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
