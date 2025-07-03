import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Kuu Miyazaki',
  authorAddress: 'miyazaqui@gmail.com',
  cdkVersion: '2.203.1',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.8.10',
  name: 'awscdk-construct-mediaconnect-flow',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/kuu/awscdk-construct-mediaconnect-flow.git',
  keywords: [
    'cdk',
    'cdk-construct',
    'MediaConnect',
  ],
  license: 'MIT',
  licensed: true,
  deps: ['aws-cdk-lib', 'constructs', 'awscdk-construct-medialive-channel'],
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
