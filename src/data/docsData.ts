import { DocItem } from '../types';

export const DOCS_DATA: DocItem[] = [
  {
    id: 'CDN-Installation',
    title: 'jsDelivr CDN Setup',
    category: 'Core',
    summary: 'Import DESSERT 3D Engine and its addons directly into any modern browser via jsDelivr CDN without installing npm dependencies.',
    codeSnippet: `<script type="importmap">
{
  "imports": {
    "dessert": "https://cdn.jsdelivr.net/gh/prssbayu-oss/DessertStudios@main/src/dessert/Dessert.js",
    "dessert/webgpu": "https://cdn.jsdelivr.net/gh/prssbayu-oss/DessertStudios@main/src/dessert/Dessert.webgpu.js",
    "dessert/dsl": "https://cdn.jsdelivr.net/gh/prssbayu-oss/DessertStudios@main/src/dessert/Dessert.dsl.js",
    "dessert/addons/": "https://cdn.jsdelivr.net/gh/prssbayu-oss/DessertStudios@main/examples/jsm/"
  }
}
</script>

<script type="module">
  import * as DESSERT from 'dessert';
  import { OrbitControls } from 'dessert/addons/controls/OrbitControls.js';

  const scene = new DESSERT.Scene();
  const camera = new DESSERT.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new DESSERT.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
</script>`,
    parameters: [
      { name: 'dessert', type: 'ES Module', desc: 'Core WebGL & 3D Math runtime engine.' },
      { name: 'dessert/webgpu', type: 'ES Module', desc: 'Next-generation WebGPU renderer with native node compute support.' },
      { name: 'dessert/dsl', type: 'ES Module', desc: 'Dessert Shading Language for visual and programmatic node shaders.' },
      { name: 'dessert/addons/', type: 'Path Prefix', desc: 'Direct access to loaders (GLTFLoader, OBJLoader), controls (OrbitControls), postprocessing, etc.' },
    ],
    methods: [
      { name: 'Import Map Mapping', returns: 'Browser Native', desc: 'Uses native W3C import maps supported in all modern browsers (Chrome, Edge, Safari, Firefox).' },
    ],
  },
  {
    id: 'Scene',
    title: 'DESSERT.Scene',
    category: 'Core',
    summary: 'Scenes allow you to set up what and where is to be rendered by dessert.js. This is where you place objects, lights and cameras.',
    codeSnippet: `const scene = new DESSERT.Scene();
scene.background = new DESSERT.Color(0x1a1a24);
scene.fog = new DESSERT.FogExp2(0x1a1a24, 0.035);

const geometry = new DESSERT.BoxGeometry(1, 1, 1);
const material = new DESSERT.MeshStandardMaterial({ color: 0x3b82f6 });
const mesh = new DESSERT.Mesh(geometry, material);
scene.add(mesh);`,
    parameters: [
      { name: 'background', type: 'Color | Texture', desc: 'Defines the background of the scene. Default is null.' },
      { name: 'environment', type: 'Texture', desc: 'Sets the environment map for all PBR materials in the scene.' },
      { name: 'fog', type: 'Fog | FogExp2', desc: 'A fog instance defining the type of fog that affects everything rendered.' },
    ],
    methods: [
      { name: 'add(object: Object3D)', returns: 'this', desc: 'Adds object as child of this scene.' },
      { name: 'remove(object: Object3D)', returns: 'this', desc: 'Removes object as child of this scene.' },
      { name: 'getObjectByName(name: string)', returns: 'Object3D', desc: 'Searches through the scene and its children, starting with the object itself, and returns the first with a matching name.' },
    ],
  },
  {
    id: 'MeshStandardMaterial',
    title: 'DESSERT.MeshStandardMaterial',
    category: 'Materials',
    summary: 'A standard physically based material, using Metallic-Roughness workflow. PBR produces more realistic results than Phong or Lambert under varied lighting conditions.',
    codeSnippet: `const material = new DESSERT.MeshStandardMaterial({
  color: 0x4f46e5,
  roughness: 0.25,
  metalness: 0.85,
  flatShading: false,
  wireframe: false
});`,
    parameters: [
      { name: 'color', type: 'Color', desc: 'Color of the material. Default is white (0xffffff).' },
      { name: 'roughness', type: 'Float [0.0 - 1.0]', desc: 'How rough the material appears. 0.0 means mirror reflection, 1.0 means diffuse.' },
      { name: 'metalness', type: 'Float [0.0 - 1.0]', desc: 'How much the material is like a metal. Default is 0.0.' },
      { name: 'emissive', type: 'Color', desc: 'Emissive (light emitting) color of the material.' },
      { name: 'map', type: 'Texture', desc: 'The color map. Default is null.' },
      { name: 'normalMap', type: 'Texture', desc: 'The texture to create a normal map.' },
    ],
    methods: [
      { name: 'clone()', returns: 'Material', desc: 'Returns a new material with the same parameters as this one.' },
      { name: 'dispose()', returns: 'void', desc: 'Frees GPU-related resources allocated by this instance.' },
    ],
  },
  {
    id: 'MeshPhysicalMaterial',
    title: 'DESSERT.MeshPhysicalMaterial',
    category: 'Materials',
    summary: 'An extension of MeshStandardMaterial, providing more advanced physically-based rendering properties like clearcoat, transmission, and sheen.',
    codeSnippet: `const glass = new DESSERT.MeshPhysicalMaterial({
  color: 0xffffff,
  transmission: 0.95, // Glass refractive transmission
  opacity: 1,
  transparent: true,
  roughness: 0.05,
  ior: 1.52, // Index of refraction for crown glass
  thickness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1
});`,
    parameters: [
      { name: 'clearcoat', type: 'Float [0.0 - 1.0]', desc: 'Clearcoat layer intensity, like lacquer on car paint.' },
      { name: 'transmission', type: 'Float [0.0 - 1.0]', desc: 'Degree of transmission (optical transparency). 1.0 for complete thin glass.' },
      { name: 'ior', type: 'Float [1.0 - 2.333]', desc: 'Index-of-refraction for non-metallic materials.' },
      { name: 'thickness', type: 'Float', desc: 'Thickness of the volume beneath the surface.' },
      { name: 'sheen', type: 'Float', desc: 'The intensity of the sheen layer, offering velvet/cloth highlights.' },
    ],
    methods: [
      { name: 'dispose()', returns: 'void', desc: 'Frees GPU resources.' },
    ],
  },
  {
    id: 'TorusKnotGeometry',
    title: 'DESSERT.TorusKnotGeometry',
    category: 'Geometries',
    summary: 'Creates a torus knot, the particular shape of which is handled by a pair of coprime integers, p and q. If p and q are not coprime, the result will be a torus link.',
    codeSnippet: `const geometry = new DESSERT.TorusKnotGeometry(
  radius = 1,
  tube = 0.35,
  tubularSegments = 128,
  radialSegments = 32,
  p = 2,
  q = 3
);`,
    parameters: [
      { name: 'radius', type: 'Float', desc: 'Radius of the torus. Default is 1.' },
      { name: 'tube', type: 'Float', desc: 'Radius of the tube. Default is 0.4.' },
      { name: 'tubularSegments', type: 'Integer', desc: 'Number of segments along the tube. Default is 64.' },
      { name: 'radialSegments', type: 'Integer', desc: 'Number of segments around the cross section. Default is 8.' },
      { name: 'p', type: 'Integer', desc: 'Determines how many times the geometry winds around its axis of rotational symmetry. Default is 2.' },
      { name: 'q', type: 'Integer', desc: 'Determines how many times the geometry winds around a circle in the interior of the torus. Default is 3.' },
    ],
    methods: [
      { name: 'computeVertexNormals()', returns: 'void', desc: 'Computes vertex normals by averaging face normals.' },
      { name: 'scale(x, y, z)', returns: 'this', desc: 'Scales the geometry data.' },
    ],
  },
  {
    id: 'DirectionalLight',
    title: 'DESSERT.DirectionalLight',
    category: 'Lights',
    summary: 'A light that gets emitted in a specific direction. This light will behave as though it is infinitely far away and the rays produced from it are all parallel. Commonly used to simulate the sun.',
    codeSnippet: `const dirLight = new DESSERT.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(5, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
scene.add(dirLight);`,
    parameters: [
      { name: 'color', type: 'Color', desc: 'Hexadecimal color of the light. Default is 0xffffff (white).' },
      { name: 'intensity', type: 'Float', desc: 'Numeric value of the light\'s strength/prescience. Default is 1.' },
      { name: 'castShadow', type: 'Boolean', desc: 'If set to true light will cast dynamic shadows. Default is false.' },
      { name: 'shadow', type: 'DirectionalLightShadow', desc: 'A DirectionalLightShadow used to calculate shadows for this light.' },
    ],
    methods: [
      { name: 'dispose()', returns: 'void', desc: 'Frees GPU resources allocated by this instance.' },
    ],
  },
  {
    id: 'PerspectiveCamera',
    title: 'DESSERT.PerspectiveCamera',
    category: 'Cameras',
    summary: 'Camera that uses perspective projection. This projection mode is designed to mimic the way the human eye sees.',
    codeSnippet: `const camera = new DESSERT.PerspectiveCamera(
  fov = 50,
  aspect = window.innerWidth / window.innerHeight,
  near = 0.1,
  far = 1000
);
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);`,
    parameters: [
      { name: 'fov', type: 'Float', desc: 'Camera frustum vertical field of view in degrees. Default is 50.' },
      { name: 'aspect', type: 'Float', desc: 'Camera frustum aspect ratio. Usually canvas width / canvas height. Default is 1.' },
      { name: 'near', type: 'Float', desc: 'Camera frustum near plane. Default is 0.1.' },
      { name: 'far', type: 'Float', desc: 'Camera frustum far plane. Default is 2000.' },
    ],
    methods: [
      { name: 'updateProjectionMatrix()', returns: 'void', desc: 'Updates the camera projection matrix. Must be called after any change of parameters.' },
      { name: 'lookAt(target: Vector3)', returns: 'void', desc: 'Rotates the camera to face target in world space.' },
    ],
  },
  {
    id: 'OrbitControls',
    title: 'OrbitControls',
    category: 'Controls',
    summary: 'Orbit controls allow the camera to orbit around a target, pan, and zoom via mouse or touch inputs.',
    codeSnippet: `import { OrbitControls } from '../dessert/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2; // don't go below ground`,
    parameters: [
      { name: 'enableDamping', type: 'Boolean', desc: 'Set to true to enable damping (inertia), which can be used to give a sense of weight to the controls.' },
      { name: 'dampingFactor', type: 'Float', desc: 'The damping inertia factor. Default is 0.05.' },
      { name: 'autoRotate', type: 'Boolean', desc: 'Set to true to automatically rotate around the target.' },
      { name: 'maxDistance', type: 'Float', desc: 'How far you can dolly out. Default is Infinity.' },
    ],
    methods: [
      { name: 'update()', returns: 'Boolean', desc: 'Update the controls. Must be called in your animation loop if enableDamping is set to true.' },
      { name: 'reset()', returns: 'void', desc: 'Reset the controls to their state from when either the constructor was called or the last saveState was called.' },
    ],
  },
  {
    id: 'Vector3',
    title: 'DESSERT.Vector3',
    category: 'Math',
    summary: 'Class representing a 3D vector. A 3D vector is an ordered triplet of numbers (labeled x, y, and z), which can be used to represent a point in 3D space or a direction with magnitude.',
    codeSnippet: `const a = new DESSERT.Vector3(1, 0, 0);
const b = new DESSERT.Vector3(0, 1, 0);
const c = new DESSERT.Vector3();
c.crossVectors(a, b); // [0, 0, 1]
const length = c.length(); // 1`,
    parameters: [
      { name: 'x', type: 'Float', desc: 'The x value of this vector. Default is 0.' },
      { name: 'y', type: 'Float', desc: 'The y value of this vector. Default is 0.' },
      { name: 'z', type: 'Float', desc: 'The z value of this vector. Default is 0.' },
    ],
    methods: [
      { name: 'add(v: Vector3)', returns: 'this', desc: 'Adds v to this vector.' },
      { name: 'distanceTo(v: Vector3)', returns: 'Float', desc: 'Computes the distance from this vector to v.' },
      { name: 'normalize()', returns: 'this', desc: 'Converts this vector to a unit vector with length 1.' },
      { name: 'dot(v: Vector3)', returns: 'Float', desc: 'Calculate the dot product of this vector and v.' },
      { name: 'cross(v: Vector3)', returns: 'this', desc: 'Sets this vector to cross product of itself and v.' },
    ],
  },
  {
    id: 'WebGLRenderer',
    title: 'DESSERT.WebGLRenderer',
    category: 'Core',
    summary: 'The WebGL renderer displays your beautifully crafted scenes using WebGL.',
    codeSnippet: `const renderer = new DESSERT.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = DESSERT.PCFSoftShadowMap;
renderer.toneMapping = DESSERT.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);`,
    parameters: [
      { name: 'antialias', type: 'Boolean', desc: 'Whether to perform antialiasing. Default is false.' },
      { name: 'alpha', type: 'Boolean', desc: 'Whether the canvas contains an alpha (transparency) buffer or not. Default is false.' },
      { name: 'powerPreference', type: 'String', desc: 'Provides a hint to the user agent indicating what configuration of GPU is suitable for this WebGL context.' },
    ],
    methods: [
      { name: 'render(scene, camera)', returns: 'void', desc: 'Render a scene or another type of object using a camera.' },
      { name: 'setSize(width, height, updateStyle)', returns: 'void', desc: 'Resizes the output canvas to (width, height).' },
      { name: 'setPixelRatio(value)', returns: 'void', desc: 'Sets device pixel ratio. Usually window.devicePixelRatio.' },
    ],
  }
];
