export interface PlaygroundPreset {
  id: string;
  name: string;
  description: string;
  code: string;
}

export const PLAYGROUND_PRESETS: PlaygroundPreset[] = [
  {
    id: 'torus-knot-bloom',
    name: 'Iridescent Torus Knot',
    description: 'A physically-based Torus Knot with metallic clearcoat and orbiting dynamic point lights',
    code: `// Set up scene background
scene.background = new DESSERT.Color(0x0a0c10);

// Create knot geometry
const geometry = new DESSERT.TorusKnotGeometry(1.2, 0.4, 160, 32, 2, 3);
const material = new DESSERT.MeshPhysicalMaterial({
  color: 0x6366f1,
  metalness: 0.9,
  roughness: 0.15,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  wireframe: false
});

const knot = new DESSERT.Mesh(geometry, material);
knot.castShadow = true;
scene.add(knot);

// Dynamic colored lights
const light1 = new DESSERT.PointLight(0x06b6d4, 50, 20);
const light2 = new DESSERT.PointLight(0xf43f5e, 50, 20);
scene.add(light1);
scene.add(light2);

// Ambient light
scene.add(new DESSERT.AmbientLight(0x1e293b, 1.5));

// Animation callback
return function animate(time) {
  knot.rotation.x = time * 0.4;
  knot.rotation.y = time * 0.6;

  light1.position.x = Math.sin(time * 1.5) * 3;
  light1.position.y = Math.cos(time * 1.2) * 3;
  light1.position.z = Math.sin(time * 0.8) * 3;

  light2.position.x = Math.cos(time * 1.2) * 3;
  light2.position.y = Math.sin(time * 1.7) * 3;
  light2.position.z = Math.cos(time * 0.9) * 3;
};`,
  },
  {
    id: 'custom-shader-wave',
    name: 'Custom GLSL Ripple Shader',
    description: 'Custom Vertex & Fragment ShaderMaterial creating dynamic sinusoidal wave displacement',
    code: `scene.background = new DESSERT.Color(0x05070a);

const vertexShader = \`
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float dist = distance(uv, vec2(0.5));
    float elevation = sin(dist * 20.0 - uTime * 3.0) * 0.35 * exp(-dist * 1.5);
    pos.z += elevation;
    vElevation = elevation;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
\`;

const fragmentShader = \`
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;

  void main() {
    vec3 colorA = vec3(0.06, 0.45, 0.95);
    vec3 colorB = vec3(0.95, 0.15, 0.55);
    vec3 mixedColor = mix(colorA, colorB, vElevation * 3.0 + 0.5);
    
    // Grid line effect
    vec2 grid = abs(fract(vUv * 30.0 - 0.5) - 0.5) / fwidth(vUv * 30.0);
    float line = min(grid.x, grid.y);
    float c = 1.0 - min(line, 1.0);
    
    gl_FragColor = vec4(mixedColor + vec3(c * 0.4), 1.0);
  }
\`;

const uniforms = {
  uTime: { value: 0.0 }
};

const geometry = new DESSERT.PlaneGeometry(6, 6, 96, 96);
const material = new DESSERT.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
  wireframe: false,
  side: DESSERT.DoubleSide
});

const plane = new DESSERT.Mesh(geometry, material);
plane.rotation.x = -Math.PI * 0.35;
scene.add(plane);

return function animate(time) {
  uniforms.uTime.value = time;
  plane.rotation.z = time * 0.1;
};`,
  },
  {
    id: 'instanced-swarm',
    name: '1,000 Instanced Cubes Vortex',
    description: 'High-performance GPU instancing with dynamic matrix transformations and rainbow color gradients',
    code: `scene.background = new DESSERT.Color(0x090d16);

const count = 1000;
const geometry = new DESSERT.BoxGeometry(0.12, 0.12, 0.12);
const material = new DESSERT.MeshStandardMaterial({
  roughness: 0.3,
  metalness: 0.7
});

const instancedMesh = new DESSERT.InstancedMesh(geometry, material, count);
scene.add(instancedMesh);

const dummy = new DESSERT.Object3D();
const color = new DESSERT.Color();

// Setup colors
for (let i = 0; i < count; i++) {
  color.setHSL(i / count, 0.85, 0.55);
  instancedMesh.setColorAt(i, color);
}
instancedMesh.instanceColor.needsUpdate = true;

scene.add(new DESSERT.AmbientLight(0xffffff, 1.0));
const dirLight = new DESSERT.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

return function animate(time) {
  let idx = 0;
  for (let i = 0; i < count; i++) {
    const angle = i * 0.1 + time * 0.5;
    const radius = 0.5 + Math.sqrt(i) * 0.12;
    const y = Math.sin(time * 2.0 + i * 0.05) * 0.8 + Math.cos(angle * 3.0) * 0.3;

    dummy.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );
    dummy.rotation.set(time + i * 0.02, time * 0.5 + i * 0.03, 0);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(idx++, dummy.matrix);
  }
  instancedMesh.instanceMatrix.needsUpdate = true;
};`,
  },
  {
    id: 'particle-spiral',
    name: 'Cosmic Particle Spiral',
    description: 'Point cloud particle system with 25,000 animated vertices',
    code: `scene.background = new DESSERT.Color(0x030712);

const count = 25000;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

const color = new DESSERT.Color();
for (let i = 0; i < count; i++) {
  const i3 = i * 3;
  const radius = Math.random() * 5;
  const spinAngle = radius * 4.0;
  const branchAngle = ((i % 3) * 2 * Math.PI) / 3;

  positions[i3] = Math.cos(branchAngle + spinAngle) * radius + (Math.random() - 0.5) * 0.3;
  positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
  positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + (Math.random() - 0.5) * 0.3;

  // Mixed inside/outside colors
  const mixedColor = color.set(radius < 2.0 ? 0xff4488 : 0x00ccff);
  colors[i3] = mixedColor.r;
  colors[i3 + 1] = mixedColor.g;
  colors[i3 + 2] = mixedColor.b;
}

const geometry = new DESSERT.BufferGeometry();
geometry.setAttribute('position', new DESSERT.BufferAttribute(positions, 3));
geometry.setAttribute('color', new DESSERT.BufferAttribute(colors, 3));

const material = new DESSERT.PointsMaterial({
  size: 0.025,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
  blending: DESSERT.AdditiveBlending
});

const particles = new DESSERT.Points(geometry, material);
scene.add(particles);

return function animate(time) {
  particles.rotation.y = time * 0.15;
  particles.rotation.x = Math.sin(time * 0.1) * 0.2;
};`,
  }
];
