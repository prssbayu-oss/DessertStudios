# Dessert 3D Engine & Studios

> Complete, autonomous, zero-external-dependency clone of the 3D Engine and Shading Language (DSL).

## CDN Links (jsDelivr via GitHub)

Since the repository is public at [github.com/prssbayu-oss/DessertStudios](https://github.com/prssbayu-oss/DessertStudios), all engine modules and addons can be directly imported via the **jsDelivr CDN**:

### Core 3D Engine (ES Modules)
```html
<script type="importmap">
{
  "imports": {
    "dessert": "https://cdn.jsdelivr.net/gh/prssbayu-oss/DessertStudios@main/src/dessert/Dessert.js",
    "dessert/webgpu": "https://cdn.jsdelivr.net/gh/prssbayu-oss/DessertStudios@main/src/dessert/Dessert.webgpu.js",
    "dessert/dsl": "https://cdn.jsdelivr.net/gh/prssbayu-oss/DessertStudios@main/src/dessert/Dessert.dsl.js",
    "dessert/addons/": "https://cdn.jsdelivr.net/gh/prssbayu-oss/DessertStudios@main/examples/jsm/"
  }
}
</script>
```

### Usage Example
```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
  {
    "imports": {
      "dessert": "https://cdn.jsdelivr.net/gh/prssbayu-oss/DessertStudios@main/src/dessert/Dessert.js",
      "dessert/addons/": "https://cdn.jsdelivr.net/gh/prssbayu-oss/DessertStudios@main/examples/jsm/"
    }
  }
  </script>
</head>
<body>
  <script type="module">
    import * as DESSERT from 'dessert';
    import { OrbitControls } from 'dessert/addons/controls/OrbitControls.js';

    const scene = new DESSERT.Scene();
    const camera = new DESSERT.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new DESSERT.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new DESSERT.BoxGeometry(1, 1, 1);
    const material = new DESSERT.MeshStandardMaterial({ color: 0xe066ff, roughness: 0.2, metalness: 0.8 });
    const cube = new DESSERT.Mesh(geometry, material);
    scene.add(cube);

    const light = new DESSERT.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new DESSERT.AmbientLight(0x404040));

    camera.position.z = 3;
    const controls = new OrbitControls(camera, renderer.domElement);

    renderer.setAnimationLoop(() => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    });
  </script>
</body>
</html>
```

## Features
- **Dessert Shading Language (DSL)** node-based materials
- **WebGPU & WebGL2 Renderers**
- Built-in Scene Editor, Showcase, and Interactive Shader Sandbox
- 100% autonomous with custom controls and loaders
