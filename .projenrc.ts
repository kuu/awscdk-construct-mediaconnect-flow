import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Kuu Miyazaki',
  authorAddress: 'miyazaqui@gmail.com',
  cdkVersion: '2.202.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.8.9',
  name: 'awscdk-construct-mediaconnect-flow',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/miyazaqui/awscdk-construct-mediaconnect-flow.git',
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
