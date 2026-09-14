import * as DESSERT from './dessert/Dessert.js';

export type AppMode = 'editor' | 'showcase' | 'playground' | 'docs';

export type TransformMode = 'translate' | 'rotate' | 'scale';

export interface SceneObjectMeta {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  children?: SceneObjectMeta[];
  isMesh?: boolean;
  isLight?: boolean;
  isCamera?: boolean;
  isGroup?: boolean;
  geometryType?: string;
  materialType?: string;
}

export interface GeometryParams {
  type: string;
  // Box
  width?: number;
  height?: number;
  depth?: number;
  // Sphere / Cylinder / Cone / Torus
  radius?: number;
  radiusTop?: number;
  radiusBottom?: number;
  radialSegments?: number;
  heightSegments?: number;
  tube?: number;
  tubularSegments?: number;
  p?: number;
  q?: number;
  // Plane
  widthSegments?: number;
  // TorusKnot
  detail?: number;
}

export interface MaterialParams {
  type: 'MeshStandardMaterial' | 'MeshPhysicalMaterial' | 'MeshPhongMaterial' | 'MeshToonMaterial' | 'MeshBasicMaterial' | 'MeshNormalMaterial' | 'MeshLambertMaterial';
  color: string;
  roughness: number;
  metalness: number;
  transmission: number;
  clearcoat: number;
  ior: number;
  wireframe: boolean;
  flatShading: boolean;
  emissive: string;
  emissiveIntensity: number;
  opacity: number;
  transparent: boolean;
  proceduralTexture: 'none' | 'checker' | 'marble' | 'grid' | 'hex' | 'noise' | 'normalMap';
}

export interface ShowcaseDemo {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  tags: string[];
}

export interface WebGLStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  webglVersion: string;
  renderer: string;
}

export interface DocItem {
  id: string;
  title: string;
  category: 'Core' | 'Geometries' | 'Materials' | 'Lights' | 'Cameras' | 'Math' | 'Controls';
  summary: string;
  codeSnippet: string;
  parameters: { name: string; type: string; desc: string }[];
  methods: { name: string; returns: string; desc: string }[];
}
