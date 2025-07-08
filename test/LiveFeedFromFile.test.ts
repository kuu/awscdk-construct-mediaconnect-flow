import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { LiveFeedFromFile } from '../src';

test('Standard source + Standard output', () => {
  const app = new App();
  const stack = new Stack(app, 'SmokeStack');

  new LiveFeedFromFile(stack, 'LiveFeedFromFile', {
    file: {
      type: 'MP4_FILE',
      url: 's3://aems-input/dog.mp4',
    },
    source: {
      protocol: 'SRT',
      type: 'STANDARD-SOURCE',
    },
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::MediaConnect::Flow', 1);
  template.resourceCountIs('AWS::MediaLive::Channel', 1);
  template.resourceCountIs('AWS::MediaLive::Input', 1);
  template.resourceCountIs('AWS::EC2::VPC', 0);
  template.resourceCountIs('AWS::EC2::Instance', 0);
});

test('Standard source + VPC output', () => {
  const app = new App();
  const stack = new Stack(app, 'SmokeStack');

  new LiveFeedFromFile(stack, 'LiveFeedFromFile', {
    file: {
      type: 'MP4_FILE',
      url: 's3://aems-input/dog.mp4',
    },
    source: {
      protocol: 'SRT',
      type: 'STANDARD-SOURCE',
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
    },
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::MediaConnect::Flow', 1);
  template.resourceCountIs('AWS::MediaLive::Channel', 1);
  template.resourceCountIs('AWS::MediaLive::Input', 1);
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.resourceCountIs('AWS::EC2::Instance', 0);
});

test('Standard source + VPC output with NDI', () => {
  const app = new App();
  const stack = new Stack(app, 'SmokeStack');

  new LiveFeedFromFile(stack, 'LiveFeedFromFile', {
    file: {
      type: 'MP4_FILE',
      url: 's3://aems-input/dog.mp4',
    },
    source: {
      protocol: 'SRT',
      type: 'STANDARD-SOURCE',
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

  template.resourceCountIs('AWS::MediaConnect::Flow', 1);
  template.resourceCountIs('AWS::MediaLive::Channel', 1);
  template.resourceCountIs('AWS::MediaLive::Input', 1);
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.resourceCountIs('AWS::EC2::Instance', 1);
});

test('VPC source + Standard output', () => {
  const app = new App();
  const stack = new Stack(app, 'SmokeStack');

  expect(() => {
    new LiveFeedFromFile(stack, 'LiveFeedFromFile', {
      file: {
        type: 'MP4_FILE',
        url: 's3://aems-input/dog.mp4',
      },
      source: {
        protocol: 'SRT',
        type: 'VPC-SOURCE',
      },
    });
  }).toThrow('VpcConfig is required when source type is VPC-SOURCE');
});

test('VPC source + VPC output', () => {
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
    },
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::MediaConnect::Flow', 1);
  template.resourceCountIs('AWS::MediaLive::Channel', 1);
  template.resourceCountIs('AWS::MediaLive::Input', 1);
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.resourceCountIs('AWS::EC2::Instance', 0);
});

test('VPC source + VPC output with NDI', () => {
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

  template.resourceCountIs('AWS::MediaConnect::Flow', 1);
  template.resourceCountIs('AWS::MediaLive::Channel', 1);
  template.resourceCountIs('AWS::MediaLive::Input', 1);
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.resourceCountIs('AWS::EC2::Instance', 1);
});