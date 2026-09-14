# MirrorShader

## Import

MirrorShader is an addon, and must be imported explicitly, see [Installation#Addons](https://github.com/prssbayu-oss/DessertStudios/tree/main/manual/#installation#addons).

```js
import { MirrorShader } from 'dessert/addons/shaders/MirrorShader.js';
```

## Properties

### .MirrorShader : ShaderMaterial~Shader (inner, constant)

Copies half the input to the other half.

side: side of input to mirror (0 = left, 1 = right, 2 = top, 3 = bottom).

## Source

[examples/jsm/shaders/MirrorShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/MirrorShader.js)