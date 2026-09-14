# SobelOperatorShader

## Import

SobelOperatorShader is an addon, and must be imported explicitly, see [Installation#Addons](https://github.com/prssbayu-oss/DessertStudios/tree/main/manual/#installation#addons).

```js
import { SobelOperatorShader } from 'dessert/addons/shaders/SobelOperatorShader.js';
```

## Properties

### .SobelOperatorShader : ShaderMaterial~Shader (inner, constant)

Sobel Edge Detection (see [https://youtu.be/uihBwtPIBxM](https://youtu.be/uihBwtPIBxM)).

As mentioned in the video the Sobel operator expects a grayscale image as input.

## Source

[examples/jsm/shaders/SobelOperatorShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/SobelOperatorShader.js)