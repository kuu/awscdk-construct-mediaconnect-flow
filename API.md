# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### LiveFeed <a name="LiveFeed" id="awscdk-construct-mediaconnect-flow.LiveFeed"></a>

#### Initializers <a name="Initializers" id="awscdk-construct-mediaconnect-flow.LiveFeed.Initializer"></a>

```typescript
import { LiveFeed } from 'awscdk-construct-mediaconnect-flow'

new LiveFeed(scope: Construct, id: string, props: LiveFeedProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeed.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeed.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeed.Initializer.parameter.props">props</a></code> | <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedProps">LiveFeedProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="awscdk-construct-mediaconnect-flow.LiveFeed.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="awscdk-construct-mediaconnect-flow.LiveFeed.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="awscdk-construct-mediaconnect-flow.LiveFeed.Initializer.parameter.props"></a>

- *Type:* <a href="#awscdk-construct-mediaconnect-flow.LiveFeedProps">LiveFeedProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeed.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="awscdk-construct-mediaconnect-flow.LiveFeed.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeed.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="awscdk-construct-mediaconnect-flow.LiveFeed.isConstruct"></a>

```typescript
import { LiveFeed } from 'awscdk-construct-mediaconnect-flow'

LiveFeed.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="awscdk-construct-mediaconnect-flow.LiveFeed.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeed.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeed.property.flow">flow</a></code> | <code>aws-cdk-lib.aws_mediaconnect.CfnFlow</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeed.property.ndiDiscoveryServer">ndiDiscoveryServer</a></code> | <code>aws-cdk-lib.aws_ec2.Instance</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeed.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="awscdk-construct-mediaconnect-flow.LiveFeed.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `flow`<sup>Required</sup> <a name="flow" id="awscdk-construct-mediaconnect-flow.LiveFeed.property.flow"></a>

```typescript
public readonly flow: CfnFlow;
```

- *Type:* aws-cdk-lib.aws_mediaconnect.CfnFlow

---

##### `ndiDiscoveryServer`<sup>Optional</sup> <a name="ndiDiscoveryServer" id="awscdk-construct-mediaconnect-flow.LiveFeed.property.ndiDiscoveryServer"></a>

```typescript
public readonly ndiDiscoveryServer: Instance;
```

- *Type:* aws-cdk-lib.aws_ec2.Instance

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="awscdk-construct-mediaconnect-flow.LiveFeed.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---


### LiveFeedFromFile <a name="LiveFeedFromFile" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile"></a>

#### Initializers <a name="Initializers" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile.Initializer"></a>

```typescript
import { LiveFeedFromFile } from 'awscdk-construct-mediaconnect-flow'

new LiveFeedFromFile(scope: Construct, id: string, props: LiveFeedFromFileProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFile.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFile.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFile.Initializer.parameter.props">props</a></code> | <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps">LiveFeedFromFileProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile.Initializer.parameter.props"></a>

- *Type:* <a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps">LiveFeedFromFileProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFile.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFile.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile.isConstruct"></a>

```typescript
import { LiveFeedFromFile } from 'awscdk-construct-mediaconnect-flow'

LiveFeedFromFile.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFile.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFile.property.flow">flow</a></code> | <code>aws-cdk-lib.aws_mediaconnect.CfnFlow</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFile.property.ndiDiscoveryServer">ndiDiscoveryServer</a></code> | <code>aws-cdk-lib.aws_ec2.Instance</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFile.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `flow`<sup>Required</sup> <a name="flow" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile.property.flow"></a>

```typescript
public readonly flow: CfnFlow;
```

- *Type:* aws-cdk-lib.aws_mediaconnect.CfnFlow

---

##### `ndiDiscoveryServer`<sup>Optional</sup> <a name="ndiDiscoveryServer" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile.property.ndiDiscoveryServer"></a>

```typescript
public readonly ndiDiscoveryServer: Instance;
```

- *Type:* aws-cdk-lib.aws_ec2.Instance

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFile.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---


## Structs <a name="Structs" id="Structs"></a>

### EncoderSettings <a name="EncoderSettings" id="awscdk-construct-mediaconnect-flow.EncoderSettings"></a>

#### Initializer <a name="Initializer" id="awscdk-construct-mediaconnect-flow.EncoderSettings.Initializer"></a>

```typescript
import { EncoderSettings } from 'awscdk-construct-mediaconnect-flow'

const encoderSettings: EncoderSettings = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.EncoderSettings.property.framerateDenominator">framerateDenominator</a></code> | <code>number</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.EncoderSettings.property.framerateNumerator">framerateNumerator</a></code> | <code>number</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.EncoderSettings.property.gopLengthInSeconds">gopLengthInSeconds</a></code> | <code>number</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.EncoderSettings.property.height">height</a></code> | <code>number</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.EncoderSettings.property.scanType">scanType</a></code> | <code>string</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.EncoderSettings.property.timecodeBurninPrefix">timecodeBurninPrefix</a></code> | <code>string</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.EncoderSettings.property.width">width</a></code> | <code>number</code> | *No description.* |

---

##### `framerateDenominator`<sup>Optional</sup> <a name="framerateDenominator" id="awscdk-construct-mediaconnect-flow.EncoderSettings.property.framerateDenominator"></a>

```typescript
public readonly framerateDenominator: number;
```

- *Type:* number

---

##### `framerateNumerator`<sup>Optional</sup> <a name="framerateNumerator" id="awscdk-construct-mediaconnect-flow.EncoderSettings.property.framerateNumerator"></a>

```typescript
public readonly framerateNumerator: number;
```

- *Type:* number

---

##### `gopLengthInSeconds`<sup>Optional</sup> <a name="gopLengthInSeconds" id="awscdk-construct-mediaconnect-flow.EncoderSettings.property.gopLengthInSeconds"></a>

```typescript
public readonly gopLengthInSeconds: number;
```

- *Type:* number

---

##### `height`<sup>Optional</sup> <a name="height" id="awscdk-construct-mediaconnect-flow.EncoderSettings.property.height"></a>

```typescript
public readonly height: number;
```

- *Type:* number

---

##### `scanType`<sup>Optional</sup> <a name="scanType" id="awscdk-construct-mediaconnect-flow.EncoderSettings.property.scanType"></a>

```typescript
public readonly scanType: string;
```

- *Type:* string

---

##### `timecodeBurninPrefix`<sup>Optional</sup> <a name="timecodeBurninPrefix" id="awscdk-construct-mediaconnect-flow.EncoderSettings.property.timecodeBurninPrefix"></a>

```typescript
public readonly timecodeBurninPrefix: string;
```

- *Type:* string

---

##### `width`<sup>Optional</sup> <a name="width" id="awscdk-construct-mediaconnect-flow.EncoderSettings.property.width"></a>

```typescript
public readonly width: number;
```

- *Type:* number

---

### FileSpec <a name="FileSpec" id="awscdk-construct-mediaconnect-flow.FileSpec"></a>

#### Initializer <a name="Initializer" id="awscdk-construct-mediaconnect-flow.FileSpec.Initializer"></a>

```typescript
import { FileSpec } from 'awscdk-construct-mediaconnect-flow'

const fileSpec: FileSpec = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.FileSpec.property.url">url</a></code> | <code>string</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.FileSpec.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `url`<sup>Required</sup> <a name="url" id="awscdk-construct-mediaconnect-flow.FileSpec.property.url"></a>

```typescript
public readonly url: string;
```

- *Type:* string

---

##### `type`<sup>Optional</sup> <a name="type" id="awscdk-construct-mediaconnect-flow.FileSpec.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---

### LiveFeedFromFileProps <a name="LiveFeedFromFileProps" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps"></a>

#### Initializer <a name="Initializer" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.Initializer"></a>

```typescript
import { LiveFeedFromFileProps } from 'awscdk-construct-mediaconnect-flow'

const liveFeedFromFileProps: LiveFeedFromFileProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.autoStart">autoStart</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.source">source</a></code> | <code><a href="#awscdk-construct-mediaconnect-flow.LiveSourceSpec">LiveSourceSpec</a></code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.vpcConfig">vpcConfig</a></code> | <code><a href="#awscdk-construct-mediaconnect-flow.VpcConfig">VpcConfig</a></code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.file">file</a></code> | <code><a href="#awscdk-construct-mediaconnect-flow.FileSpec">FileSpec</a></code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.encoderSpec">encoderSpec</a></code> | <code><a href="#awscdk-construct-mediaconnect-flow.EncoderSettings">EncoderSettings</a></code> | *No description.* |

---

##### `autoStart`<sup>Optional</sup> <a name="autoStart" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.autoStart"></a>

```typescript
public readonly autoStart: boolean;
```

- *Type:* boolean

---

##### `source`<sup>Optional</sup> <a name="source" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.source"></a>

```typescript
public readonly source: LiveSourceSpec;
```

- *Type:* <a href="#awscdk-construct-mediaconnect-flow.LiveSourceSpec">LiveSourceSpec</a>

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---

##### `vpcConfig`<sup>Optional</sup> <a name="vpcConfig" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.vpcConfig"></a>

```typescript
public readonly vpcConfig: VpcConfig;
```

- *Type:* <a href="#awscdk-construct-mediaconnect-flow.VpcConfig">VpcConfig</a>

---

##### `file`<sup>Required</sup> <a name="file" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.file"></a>

```typescript
public readonly file: FileSpec;
```

- *Type:* <a href="#awscdk-construct-mediaconnect-flow.FileSpec">FileSpec</a>

---

##### `encoderSpec`<sup>Optional</sup> <a name="encoderSpec" id="awscdk-construct-mediaconnect-flow.LiveFeedFromFileProps.property.encoderSpec"></a>

```typescript
public readonly encoderSpec: EncoderSettings;
```

- *Type:* <a href="#awscdk-construct-mediaconnect-flow.EncoderSettings">EncoderSettings</a>

---

### LiveFeedProps <a name="LiveFeedProps" id="awscdk-construct-mediaconnect-flow.LiveFeedProps"></a>

#### Initializer <a name="Initializer" id="awscdk-construct-mediaconnect-flow.LiveFeedProps.Initializer"></a>

```typescript
import { LiveFeedProps } from 'awscdk-construct-mediaconnect-flow'

const liveFeedProps: LiveFeedProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedProps.property.autoStart">autoStart</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedProps.property.source">source</a></code> | <code><a href="#awscdk-construct-mediaconnect-flow.LiveSourceSpec">LiveSourceSpec</a></code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveFeedProps.property.vpcConfig">vpcConfig</a></code> | <code><a href="#awscdk-construct-mediaconnect-flow.VpcConfig">VpcConfig</a></code> | *No description.* |

---

##### `autoStart`<sup>Optional</sup> <a name="autoStart" id="awscdk-construct-mediaconnect-flow.LiveFeedProps.property.autoStart"></a>

```typescript
public readonly autoStart: boolean;
```

- *Type:* boolean

---

##### `source`<sup>Optional</sup> <a name="source" id="awscdk-construct-mediaconnect-flow.LiveFeedProps.property.source"></a>

```typescript
public readonly source: LiveSourceSpec;
```

- *Type:* <a href="#awscdk-construct-mediaconnect-flow.LiveSourceSpec">LiveSourceSpec</a>

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="awscdk-construct-mediaconnect-flow.LiveFeedProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---

##### `vpcConfig`<sup>Optional</sup> <a name="vpcConfig" id="awscdk-construct-mediaconnect-flow.LiveFeedProps.property.vpcConfig"></a>

```typescript
public readonly vpcConfig: VpcConfig;
```

- *Type:* <a href="#awscdk-construct-mediaconnect-flow.VpcConfig">VpcConfig</a>

---

### LiveSourceSpec <a name="LiveSourceSpec" id="awscdk-construct-mediaconnect-flow.LiveSourceSpec"></a>

#### Initializer <a name="Initializer" id="awscdk-construct-mediaconnect-flow.LiveSourceSpec.Initializer"></a>

```typescript
import { LiveSourceSpec } from 'awscdk-construct-mediaconnect-flow'

const liveSourceSpec: LiveSourceSpec = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveSourceSpec.property.protocol">protocol</a></code> | <code>string</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.LiveSourceSpec.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `protocol`<sup>Required</sup> <a name="protocol" id="awscdk-construct-mediaconnect-flow.LiveSourceSpec.property.protocol"></a>

```typescript
public readonly protocol: string;
```

- *Type:* string

---

##### `type`<sup>Required</sup> <a name="type" id="awscdk-construct-mediaconnect-flow.LiveSourceSpec.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---

### VpcConfig <a name="VpcConfig" id="awscdk-construct-mediaconnect-flow.VpcConfig"></a>

#### Initializer <a name="Initializer" id="awscdk-construct-mediaconnect-flow.VpcConfig.Initializer"></a>

```typescript
import { VpcConfig } from 'awscdk-construct-mediaconnect-flow'

const vpcConfig: VpcConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#awscdk-construct-mediaconnect-flow.VpcConfig.property.props">props</a></code> | <code>aws-cdk-lib.aws_ec2.VpcProps</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.VpcConfig.property.availabilityZone">availabilityZone</a></code> | <code>string</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.VpcConfig.property.enableNDI">enableNDI</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#awscdk-construct-mediaconnect-flow.VpcConfig.property.subnetId">subnetId</a></code> | <code>string</code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="awscdk-construct-mediaconnect-flow.VpcConfig.property.props"></a>

```typescript
public readonly props: VpcProps;
```

- *Type:* aws-cdk-lib.aws_ec2.VpcProps

---

##### `availabilityZone`<sup>Optional</sup> <a name="availabilityZone" id="awscdk-construct-mediaconnect-flow.VpcConfig.property.availabilityZone"></a>

```typescript
public readonly availabilityZone: string;
```

- *Type:* string

---

##### `enableNDI`<sup>Optional</sup> <a name="enableNDI" id="awscdk-construct-mediaconnect-flow.VpcConfig.property.enableNDI"></a>

```typescript
public readonly enableNDI: boolean;
```

- *Type:* boolean

---

##### `subnetId`<sup>Optional</sup> <a name="subnetId" id="awscdk-construct-mediaconnect-flow.VpcConfig.property.subnetId"></a>

```typescript
public readonly subnetId: string;
```

- *Type:* string

---



