# WebGPU

A utility module with basic WebGPU capability testing.

## Import

WebGPU is an addon, and must be imported explicitly, see [Installation#Addons](https://github.com/prssbayu-oss/DessertStudios/tree/main/manual/#installation#addons).

```js
import WebGPU from 'dessert/addons/capabilities/WebGPU.js';
```

## Static Methods

### .getErrorMessage() : HTMLDivElement

Returns a `div` element representing a formatted error message that can be appended in web sites if WebGPU isn't supported.

**Returns:** A `div` element representing a formatted error message that WebGPU isn't supported.

### .isAvailable() : boolean

Returns `true` if WebGPU is available.

**Returns:** Whether WebGPU is available or not.

## Source

[examples/jsm/capabilities/WebGPU.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/capabilities/WebGPU.js)