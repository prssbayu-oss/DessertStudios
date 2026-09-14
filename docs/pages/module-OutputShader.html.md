# OutputShader

## Import

OutputShader is an addon, and must be imported explicitly, see [Installation#Addons](https://github.com/prssbayu-oss/DessertStudios/tree/main/manual/#installation#addons).

```js
import { OutputShader } from 'dessert/addons/shaders/OutputShader.js';
```

## Properties

### .OutputShader : ShaderMaterial~Shader (inner, constant)

Performs tone mapping and color space conversion for FX workflows.

Used by [OutputPass](OutputPass.html).

## Source

[examples/jsm/shaders/OutputShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/OutputShader.js)