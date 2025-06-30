import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { LiveFeedFromFile } from '../src';

test('Create MediaConnect flow', () => {
  const app = new App();
  const stack = new Stack(app, 'SmokeStack');

  new LiveFeedFromFile(stack, 'LiveFeedFromFile', {
    file: {
      type: 'MP4_FILE',
      url: 's3://aems-input/dog.mp4',
    },
    source: {
      protocol: 'SRT',
      type: 'VPC-SOURCE',
    },
    vpcConfig: {
      props: {
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        flowLogs: {
          'video-flow-logs': {
            destination: ec2.FlowLogDestination.toCloudWatchLogs(),
          },
        },
      },
      enableNDI: true,
    },
  });

  const template = Template.fromStack(stack);

  template.hasResource('AWS::MediaConnect::Flow', 1);
  template.hasResource('AWS::MediaLive::Channel', 1);
  template.hasResource('AWS::MediaLive::Input', 1);
  template.hasResource('AWS::EC2::VPC', 1);
});