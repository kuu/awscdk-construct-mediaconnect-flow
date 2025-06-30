# awscdk-construct-mediaconnect-flow
[![View on Construct Hub](https://constructs.dev/badge?package=awscdk-construct-mediaconnect-flow)](https://constructs.dev/packages/awscdk-construct-mediaconnect-flow)

CDK Construct for creating MediaConnect flow using a file as a source
* The file can be either MP4 or TS
* MediaLive channel will be created internally for producing a live source (SRT or RTP) of the loop playback of the file
* MediaConnect flow will be returned so you can freely add outputs to it

## Install
[![NPM](https://nodei.co/npm/awscdk-construct-mediaconnect-flow.png?mini=true)](https://nodei.co/npm/awscdk-construct-mediaconnect-flow/)

## Usage

### Sample code
Here's an example of setting up a MediaConnect flow using an MP4 file in your S3 bucket as a source.
The source can be VPC-SOURCE or STANRDAR-SOURCE. A separate VPC will be created internally if you specify vpcConfig.
2 outputs are created, a VPC output for NDI protocol and a Standard output for SRT-Listener protocol.

```ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LiveFeedFromFile } from 'awscdk-construct-mediaconnect-flow';

export class ExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const {flow, vpc} = new LiveFeedFromFile(this, 'MediaConnectFlow', {
      file: {
        type: 'MP4_FILE',
        url: 's3://bucket/test.mp4',
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

    if (vpc) {
      // Create a VPC output
      new CfnFlowOutput(this, 'VpcOutput', {
        flowArn: flow.attrFlowArn,
        name: 'vpc-output',
        protocol: 'ndi-speed-hq',
        ndiSpeedHqQuality: 100,
      });
    }
    // Create a Standard output
    new CfnFlowOutput(this, 'StandardOutput', {
      flowArn: flow.attrFlowArn,
      name: 'standard-output',
      protocol: 'srt-listener',
      destination,
    });

    // Access MediaConnect flow attributes via `flow`
    new cdk.CfnOutput(this, "MediaConnectFlow", {
      value: flow.attrFlowArn,
      exportName: cdk.Aws.STACK_NAME + "MediaConnectFlow",
      description: "MediaConnect Flow ARN",
    });
  }
}
```
