import { CfnFlow } from 'aws-cdk-lib/aws-mediaconnect';
import { MediaLive, startChannel } from 'awscdk-construct-medialive-channel';
import { Construct } from 'constructs';
import { LiveFeed, LiveFeedProps } from './LiveFeed';

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

export class LiveFeedFromFile extends LiveFeed {
  constructor(scope: Construct, id: string, props: LiveFeedFromFileProps) {
    super(scope, id, props);

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
      autoStart = true,
      vpcConfig,
    } = props;

    // Create MediaLive channel
    const eml = new MediaLive(this, 'MediaLive', {
      sources: [{ url: file.url.replace('s3://', 's3ssl://'), type: file.type ?? 'MP4_FILE' }],
      destinations: [{
        id: 'SRT',
        srtSettings: [{
          url: `srt://${this.flow.attrSourceIngestIp}:${this.flow.attrSourceSourceIngestPort}`, // Use the MediaConnect Flow URL
          encryptionPassphraseSecretArn: this.secret.secretArn,
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
      vpc: source.type === 'VPC-SOURCE' && this.vpc ? {
        subnetIds: [vpcConfig?.subnetId ?? this.vpc.privateSubnets[0].subnetId],
        securityGroupIds: (this.flow.vpcInterfaces as CfnFlow.VpcInterfaceProperty[])[0].securityGroupIds,
      } : undefined,
      secret: this.secret,
    });

    // Start the MediaLive channel
    autoStart && startChannel(this, 'StartMediaLiveChannel', eml.channel.ref);
  }
}
