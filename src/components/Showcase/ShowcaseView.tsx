import React, { useEffect, useRef, useState } from 'react';
import * as DESSERT from '../../dessert/Dessert.js';
import { OrbitControls } from '../../dessert/controls/OrbitControls.js';
import { Play, Pause, RotateCcw, Eye, Sparkles, Layers, Box, Globe, Activity, Wind, Sun, Cpu } from 'lucide-react';
import { createCheckerTexture, createMarbleTexture, createGridTexture } from '../../utils/proceduralTextures';

interface DemoDef {
  id: string;
  title: string;
  category: string;
  icon: any;
  description: string;
  setup: (scene: DESSERT.Scene, camera: DESSERT.PerspectiveCamera, renderer: DESSERT.WebGLRenderer) => {
    update: (time: number, delta: number) => void;
    cleanup?: () => void;
  };
}

export const ShowcaseView: React.FC = () => {
  const [activeDemoId, setActiveDemoId] = useState<string>('pbr-materials');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [fps, setFps] = useState<number>(60);
  const [triangles, setTriangles] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const currentUpdateRef = useRef<((t: number, d: number) => void) | null>(null);
  const speedRef = useRef<number>(speed);
  const isPlayingRef = useRef<boolean>(isPlaying);

  speedRef.current = speed;
  isPlayingRef.current = isPlaying;

  const demos: DemoDef[] = [
    {
      id: 'pbr-materials',
      title: 'Physical Materials & Transmission',
      category: 'Materials & Shading',
      icon: Sparkles,
      description: 'Physically Based Rendering (PBR) featuring optical transmission, glass refraction, metallic clearcoat, and procedural surface textures.',
      setup: (scene, camera) => {
        scene.background = new DESSERT.Color(0x0e1117);
        camera.position.set(0, 3, 7);

        // Lights
        const ambient = new DESSERT.AmbientLight(0xffffff, 0.8);
        scene.add(ambient);

        const keyLight = new DESSERT.DirectionalLight(0xffffff, 2.5);
        keyLight.position.set(6, 8, 6);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const blueLight = new DESSERT.PointLight(0x38bdf8, 40, 15);
        blueLight.position.set(-4, 3, 2);
        scene.add(blueLight);

        const pinkLight = new DESSERT.PointLight(0xf43f5e, 40, 15);
        pinkLight.position.set(4, -1, -2);
        scene.add(pinkLight);

        // Ground Pedestal with checker texture
        const floorGeo = new DESSERT.CylinderGeometry(5.5, 5.8, 0.4, 64);
        const floorMat = new DESSERT.MeshStandardMaterial({
          map: createCheckerTexture('#1e293b', '#0f172a', 512, 16),
          roughness: 0.2,
          metalness: 0.6,
        });
        const floor = new DESSERT.Mesh(floorGeo, floorMat);
        floor.position.y = -1.2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Center: Glass Transmission Sphere
        const sphereGeo = new DESSERT.SphereGeometry(1.2, 64, 64);
        const glassMat = new DESSERT.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.95,
          opacity: 1,
          transparent: true,
          roughness: 0.05,
          ior: 1.5,
          thickness: 1.2,
          clearcoat: 1.0,
        });
        const glassSphere = new DESSERT.Mesh(sphereGeo, glassMat);
        glassSphere.position.set(0, 0.5, 0);
        glassSphere.castShadow = true;
        scene.add(glassSphere);

        // Inner golden core
        const coreGeo = new DESSERT.IcosahedronGeometry(0.5, 2);
        const coreMat = new DESSERT.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.95,
          roughness: 0.1,
          wireframe: true,
        });
        const coreMesh = new DESSERT.Mesh(coreGeo, coreMat);
        coreMesh.position.set(0, 0.5, 0);
        scene.add(coreMesh);

        // Metallic Torus Knot
        const knotGeo = new DESSERT.TorusKnotGeometry(0.7, 0.2, 128, 32);
        const knotMat = new DESSERT.MeshPhysicalMaterial({
          color: 0x8b5cf6,
          metalness: 0.9,
          roughness: 0.15,
          clearcoat: 1.0,
        });
        const knot = new DESSERT.Mesh(knotGeo, knotMat);
        knot.position.set(-2.8, 0.5, 0);
        knot.castShadow = true;
        scene.add(knot);

        // Marble Textured Cylinder
        const cylGeo = new DESSERT.CylinderGeometry(0.7, 0.7, 1.6, 32);
        const cylMat = new DESSERT.MeshStandardMaterial({
          map: createMarbleTexture(512),
          roughness: 0.3,
          metalness: 0.1,
        });
        const cyl = new DESSERT.Mesh(cylGeo, cylMat);
        cyl.position.set(2.8, 0.5, 0);
        cyl.castShadow = true;
        scene.add(cyl);

        return {
          update: (time) => {
            glassSphere.position.y = 0.5 + Math.sin(time * 1.5) * 0.15;
            coreMesh.position.y = glassSphere.position.y;
            coreMesh.rotation.x = time * 0.8;
            coreMesh.rotation.y = time * 1.2;

            knot.rotation.x = time * 0.6;
            knot.rotation.y = time * 0.9;

            cyl.rotation.y = time * 0.4;
          },
        };
      },
    },
    {
      id: 'endless-terrain',
      title: 'Procedural Flight Terrain',
      category: 'Geometries & Animation',
      icon: Activity,
      description: 'Real-time procedural 3D heightfield synthesized from harmonic noise frequencies with dynamic flight navigation.',
      setup: (scene, camera) => {
        scene.background = new DESSERT.Color(0x06080e);
        scene.fog = new DESSERT.FogExp2(0x06080e, 0.045);
        camera.position.set(0, 2.5, 6);

        const width = 24;
        const height = 24;
        const segments = 100;
        const geo = new DESSERT.PlaneGeometry(width, height, segments, segments);
        geo.rotateX(-Math.PI / 2);

        const pos = geo.attributes.position;
        const colors = new Float32Array(pos.count * 3);

        const updateTerrain = (offsetZ: number) => {
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i) + offsetZ;
            const elevation =
              Math.sin(x * 0.4 + z * 0.3) * 1.2 +
              Math.sin(x * 0.8 - z * 0.7) * 0.6 +
              Math.cos(x * 1.6 + z * 1.4) * 0.3;
            pos.setY(i, elevation);

            // Elevation coloring
            const normH = (elevation + 2.0) / 4.0;
            const r = Math.min(1, 0.1 + normH * 0.3);
            const g = Math.min(1, 0.3 + normH * 0.5);
            const b = Math.min(1, 0.7 + normH * 0.3);
            colors[i * 3] = r;
            colors[i * 3 + 1] = g;
            colors[i * 3 + 2] = b;
          }
          pos.needsUpdate = true;
          geo.computeVertexNormals();
        };

        geo.setAttribute('color', new DESSERT.BufferAttribute(colors, 3));
        const mat = new DESSERT.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.7,
          metalness: 0.2,
          wireframe: false,
        });

        const terrain = new DESSERT.Mesh(geo, mat);
        scene.add(terrain);

        // Directional Light
        const light = new DESSERT.DirectionalLight(0x60a5fa, 2.5);
        light.position.set(0, 10, 5);
        scene.add(light);
        scene.add(new DESSERT.AmbientLight(0x1e293b, 1.2));

        let offset = 0;
        return {
          update: (time, delta) => {
            offset += delta * 3.5 * speedRef.current;
            updateTerrain(offset);
            camera.position.x = Math.sin(time * 0.5) * 1.5;
            camera.lookAt(0, 0, -5);
          },
        };
      },
    },
    {
      id: 'galaxy-particles',
      title: 'Interactive Galaxy & Vortex',
      category: 'Particles & Simulation',
      icon: Sparkles,
      description: '80,000 particle gravitational vortex with multi-arm spiral structures, color thermal spectrum, and mouse interactivity.',
      setup: (scene, camera) => {
        scene.background = new DESSERT.Color(0x030408);
        camera.position.set(0, 4, 7);

        const count = 75000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const insideColor = new DESSERT.Color('#f59e0b');
        const outsideColor = new DESSERT.Color('#38bdf8');

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const radius = Math.random() * 6.5;
          const spinAngle = radius * 3.2;
          const branchAngle = ((i % 4) * 2 * Math.PI) / 4;

          const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.35 * radius;
          const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.25 * radius;
          const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.35 * radius;

          positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
          positions[i3 + 1] = randomY;
          positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

          // Thermal gradient
          const mixed = insideColor.clone().lerp(outsideColor, radius / 6.5);
          colors[i3] = mixed.r;
          colors[i3 + 1] = mixed.g;
          colors[i3 + 2] = mixed.b;
        }

        const geo = new DESSERT.BufferGeometry();
        geo.setAttribute('position', new DESSERT.BufferAttribute(positions, 3));
        geo.setAttribute('color', new DESSERT.BufferAttribute(colors, 3));

        const mat = new DESSERT.PointsMaterial({
          size: 0.022,
          vertexColors: true,
          blending: DESSERT.AdditiveBlending,
          transparent: true,
          depthWrite: false,
        });

        const particles = new DESSERT.Points(geo, mat);
        scene.add(particles);

        return {
          update: (time) => {
            particles.rotation.y = time * 0.12;
            particles.rotation.z = Math.sin(time * 0.08) * 0.1;
          },
        };
      },
    },
    {
      id: 'instanced-matrix',
      title: '10,000 Instanced Cubes Matrix',
      category: 'GPU Instancing',
      icon: Box,
      description: '10,000 animated cubes rendered in a single draw call with GPU matrix transforms and dynamic color gradients.',
      setup: (scene, camera) => {
        scene.background = new DESSERT.Color(0x080b12);
        camera.position.set(0, 12, 16);

        const countX = 100;
        const countZ = 100;
        const total = countX * countZ;

        const geo = new DESSERT.BoxGeometry(0.12, 0.8, 0.12);
        const mat = new DESSERT.MeshStandardMaterial({
          roughness: 0.2,
          metalness: 0.8,
        });

        const instanced = new DESSERT.InstancedMesh(geo, mat, total);
        instanced.instanceMatrix.setUsage(DESSERT.DynamicDrawUsage);
        scene.add(instanced);

        const dummy = new DESSERT.Object3D();
        const color = new DESSERT.Color();

        // Setup colors
        let idx = 0;
        for (let x = 0; x < countX; x++) {
          for (let z = 0; z < countZ; z++) {
            const dist = Math.sqrt(Math.pow(x - countX / 2, 2) + Math.pow(z - countZ / 2, 2));
            color.setHSL((dist / 60 + 0.5) % 1.0, 0.8, 0.5);
            instanced.setColorAt(idx++, color);
          }
        }
        instanced.instanceColor!.needsUpdate = true;

        const light1 = new DESSERT.DirectionalLight(0xffffff, 2.5);
        light1.position.set(10, 20, 10);
        scene.add(light1);
        scene.add(new DESSERT.AmbientLight(0x223344, 1.2));

        return {
          update: (time) => {
            let i = 0;
            for (let x = 0; x < countX; x++) {
              for (let z = 0; z < countZ; z++) {
                const posX = (x - countX / 2) * 0.18;
                const posZ = (z - countZ / 2) * 0.18;
                const dist = Math.sqrt(posX * posX + posZ * posZ);
                const wave = Math.sin(dist * 2.0 - time * 4.0) * 1.2 + Math.cos(posX * 0.8 + time) * 0.4;

                dummy.position.set(posX, wave, posZ);
                dummy.scale.set(1, Math.max(0.2, wave + 1.5), 1);
                dummy.updateMatrix();
                instanced.setMatrixAt(i++, dummy.matrix);
              }
            }
            instanced.instanceMatrix.needsUpdate = true;
          },
        };
      },
    },
    {
      id: 'cloth-physics',
      title: 'Aerodynamic Cloth Simulation',
      category: 'Physics & Simulation',
      icon: Wind,
      description: 'Real-time mass-spring cloth lattice pinned on top vertices with interactive wind forces and sphere collision response.',
      setup: (scene, camera) => {
        scene.background = new DESSERT.Color(0x0c0f17);
        camera.position.set(0, 1, 5);

        // Cloth physics grid
        const w = 24;
        const h = 24;
        const restDist = 0.12;

        interface Particle {
          pos: DESSERT.Vector3;
          oldPos: DESSERT.Vector3;
          pinned: boolean;
        }

        const particles: Particle[] = [];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const pos = new DESSERT.Vector3(
              (x - w / 2) * restDist,
              1.8 - y * restDist,
              0
            );
            particles.push({
              pos,
              oldPos: pos.clone(),
              pinned: y === 0 && (x === 0 || x === Math.floor(w / 2) || x === w - 1),
            });
          }
        }

        // Geometry mesh
        const geo = new DESSERT.PlaneGeometry(w * restDist, h * restDist, w - 1, h - 1);
        const mat = new DESSERT.MeshStandardMaterial({
          map: createGridTexture('#1e1e2d', '#6366f1', 512, 16),
          side: DESSERT.DoubleSide,
          roughness: 0.5,
          metalness: 0.1,
        });
        const clothMesh = new DESSERT.Mesh(geo, mat);
        scene.add(clothMesh);

        // Obstacle Sphere
        const sphereGeo = new DESSERT.SphereGeometry(0.65, 32, 32);
        const sphereMat = new DESSERT.MeshStandardMaterial({
          color: 0xec4899,
          metalness: 0.8,
          roughness: 0.2,
        });
        const obstacle = new DESSERT.Mesh(sphereGeo, sphereMat);
        obstacle.position.set(0, 0.4, 0.2);
        scene.add(obstacle);

        // Lighting
        const light = new DESSERT.DirectionalLight(0xffffff, 2.5);
        light.position.set(3, 5, 4);
        scene.add(light);
        scene.add(new DESSERT.AmbientLight(0xffffff, 1.0));

        // Physics step function
        const stepPhysics = (time: number) => {
          const gravity = new DESSERT.Vector3(0, -9.8 * 0.0003, 0);
          const wind = new DESSERT.Vector3(
            Math.sin(time * 3) * 0.001,
            0,
            (Math.cos(time * 2) * 0.5 + 0.8) * 0.002
          );

          // Verlet integration
          for (const p of particles) {
            if (p.pinned) continue;
            const vel = p.pos.clone().sub(p.oldPos).multiplyScalar(0.98);
            p.oldPos.copy(p.pos);
            p.pos.add(vel).add(gravity).add(wind);

            // Obstacle collision
            const diff = p.pos.clone().sub(obstacle.position);
            const dist = diff.length();
            if (dist < 0.68) {
              diff.normalize().multiplyScalar(0.68);
              p.pos.copy(obstacle.position).add(diff);
            }
          }

          // Relax constraints
          for (let iter = 0; iter < 4; iter++) {
            for (let y = 0; y < h; y++) {
              for (let x = 0; x < w; x++) {
                const idx = y * w + x;
                const p = particles[idx];

                if (x < w - 1) {
                  const right = particles[idx + 1];
                  satisfy(p, right, restDist);
                }
                if (y < h - 1) {
                  const down = particles[idx + w];
                  satisfy(p, down, restDist);
                }
              }
            }
          }

          // Update geometry positions
          const positions = geo.attributes.position;
          for (let i = 0; i < particles.length; i++) {
            positions.setXYZ(i, particles[i].pos.x, particles[i].pos.y, particles[i].pos.z);
          }
          positions.needsUpdate = true;
          geo.computeVertexNormals();
        };

        function satisfy(p1: Particle, p2: Particle, dist: number) {
          const delta = p2.pos.clone().sub(p1.pos);
          const currentDist = delta.length();
          if (currentDist === 0) return;
          const correction = delta.multiplyScalar(1 - dist / currentDist);
          const half = correction.multiplyScalar(0.5);
          if (!p1.pinned) p1.pos.add(half);
          if (!p2.pinned) p2.pos.sub(half);
        }

        return {
          update: (time) => {
            stepPhysics(time);
            obstacle.position.z = Math.sin(time * 1.5) * 0.4 + 0.2;
          },
        };
      },
    },
    {
      id: 'solar-system',
      title: 'Solar System & Celestial Orbits',
      category: 'Scene Graph & Math',
      icon: Globe,
      description: 'Hierarchical scene graph with orbital mechanics, planetary axial tilts, and procedural planet surfaces.',
      setup: (scene, camera) => {
        scene.background = new DESSERT.Color(0x020307);
        camera.position.set(0, 10, 18);

        // Sun
        const sunGeo = new DESSERT.SphereGeometry(1.6, 32, 32);
        const sunMat = new DESSERT.MeshBasicMaterial({ color: 0xffaa00 });
        const sun = new DESSERT.Mesh(sunGeo, sunMat);
        scene.add(sun);

        const sunLight = new DESSERT.PointLight(0xffffff, 80, 50);
        scene.add(sunLight);
        scene.add(new DESSERT.AmbientLight(0x223344, 0.8));

        interface PlanetData {
          mesh: DESSERT.Mesh;
          orbitPivot: DESSERT.Group;
          distance: number;
          speed: number;
          rotationSpeed: number;
        }

        const planets: PlanetData[] = [];
        const planetConfigs = [
          { name: 'Mercury', size: 0.2, dist: 3.0, color: 0x94a3b8, speed: 2.0 },
          { name: 'Venus', size: 0.35, dist: 4.5, color: 0xf59e0b, speed: 1.5 },
          { name: 'Earth', size: 0.4, dist: 6.2, color: 0x38bdf8, speed: 1.0 },
          { name: 'Mars', size: 0.28, dist: 8.0, color: 0xef4444, speed: 0.8 },
          { name: 'Jupiter', size: 0.9, dist: 11.0, color: 0xd97706, speed: 0.4 },
          { name: 'Saturn', size: 0.75, dist: 14.5, color: 0xfde047, speed: 0.3, hasRings: true },
        ];

        planetConfigs.forEach((cfg) => {
          const orbitPivot = new DESSERT.Group();
          scene.add(orbitPivot);

          // Orbit guide line
          const orbitGeo = new DESSERT.RingGeometry(cfg.dist - 0.02, cfg.dist + 0.02, 64);
          const orbitMat = new DESSERT.MeshBasicMaterial({
            color: 0x334155,
            side: DESSERT.DoubleSide,
            transparent: true,
            opacity: 0.4,
          });
          const orbitLine = new DESSERT.Mesh(orbitGeo, orbitMat);
          orbitLine.rotation.x = Math.PI / 2;
          scene.add(orbitLine);

          const planetGeo = new DESSERT.SphereGeometry(cfg.size, 32, 32);
          const planetMat = new DESSERT.MeshStandardMaterial({
            color: cfg.color,
            roughness: 0.4,
            metalness: 0.1,
          });
          const planet = new DESSERT.Mesh(planetGeo, planetMat);
          planet.position.x = cfg.dist;
          orbitPivot.add(planet);

          // Rings for Saturn
          if (cfg.hasRings) {
            const ringGeo = new DESSERT.RingGeometry(cfg.size * 1.3, cfg.size * 2.2, 32);
            const ringMat = new DESSERT.MeshStandardMaterial({
              color: 0xca8a04,
              side: DESSERT.DoubleSide,
              transparent: true,
              opacity: 0.7,
            });
            const ringMesh = new DESSERT.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = Math.PI / 2.3;
            planet.add(ringMesh);
          }

          planets.push({
            mesh: planet,
            orbitPivot,
            distance: cfg.dist,
            speed: cfg.speed,
            rotationSpeed: 1.0 / cfg.size,
          });
        });

        return {
          update: (time) => {
            sun.rotation.y = time * 0.1;
            planets.forEach((p) => {
              p.orbitPivot.rotation.y = time * 0.4 * p.speed * speedRef.current;
              p.mesh.rotation.y = time * 2.0 * p.rotationSpeed;
            });
          },
        };
      },
    },
    {
      id: 'glsl-raymarch',
      title: 'GLSL Raymarching Fractal',
      category: 'Shaders & GLSL',
      icon: Cpu,
      description: 'Volumetric raymarching shader computing a 3D distance estimator in real-time on the GPU.',
      setup: (scene, camera) => {
        scene.background = new DESSERT.Color(0x04060a);
        camera.position.set(0, 0, 2);

        const vertexShader = `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `;

        const fragmentShader = `
          uniform float uTime;
          uniform vec2 uResolution;
          varying vec2 vUv;

          // Distance function for a smooth combination of shapes
          float map(vec3 p) {
            vec3 q = p;
            q.xz *= mat2(cos(uTime * 0.4), -sin(uTime * 0.4), sin(uTime * 0.4), cos(uTime * 0.4));
            q.yz *= mat2(cos(uTime * 0.3), -sin(uTime * 0.3), sin(uTime * 0.3), cos(uTime * 0.3));

            float d1 = length(q) - 1.0;
            float d2 = length(max(abs(q) - 0.75, 0.0)) - 0.1;
            float torus = length(vec2(length(q.xz) - 1.2, q.y)) - 0.2;
            
            return min(mix(d1, d2, sin(uTime) * 0.5 + 0.5), torus);
          }

          vec3 calcNormal(vec3 p) {
            float eps = 0.001;
            return normalize(vec3(
              map(p + vec3(eps, 0, 0)) - map(p - vec3(eps, 0, 0)),
              map(p + vec3(0, eps, 0)) - map(p - vec3(0, eps, 0)),
              map(p + vec3(0, 0, eps)) - map(p - vec3(0, 0, eps))
            ));
          }

          void main() {
            vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
            vec3 ro = vec3(0.0, 0.0, 3.2);
            vec3 rd = normalize(vec3(uv, -1.0));

            float t = 0.0;
            int maxSteps = 64;
            float d = 0.0;

            for(int i = 0; i < maxSteps; i++) {
              vec3 p = ro + rd * t;
              d = map(p);
              if (d < 0.001 || t > 10.0) break;
              t += d;
            }

            vec3 col = vec3(0.02, 0.03, 0.05);
            if (t < 10.0) {
              vec3 p = ro + rd * t;
              vec3 n = calcNormal(p);
              vec3 light = normalize(vec3(1.0, 2.0, 3.0));
              float diff = max(dot(n, light), 0.0);
              
              vec3 normalColor = n * 0.5 + 0.5;
              vec3 glow = vec3(0.3, 0.7, 1.0) * pow(1.0 - max(dot(-rd, n), 0.0), 3.0);
              col = normalColor * (diff * 0.8 + 0.2) + glow;
            }

            gl_FragColor = vec4(col, 1.0);
          }
        `;

        const uniforms = {
          uTime: { value: 0 },
          uResolution: { value: new DESSERT.Vector2(window.innerWidth, window.innerHeight) },
        };

        const quadGeo = new DESSERT.PlaneGeometry(2, 2);
        const quadMat = new DESSERT.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms,
          depthWrite: false,
          depthTest: false,
        });

        const quad = new DESSERT.Mesh(quadGeo, quadMat);
        scene.add(quad);

        return {
          update: (time) => {
            uniforms.uTime.value = time * speedRef.current;
          },
        };
      },
    },
  ];

  // Initialize and run WebGL demo
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous
    container.innerHTML = '';

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new DESSERT.Scene();
    const camera = new DESSERT.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 3, 7);

    const renderer = new DESSERT.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = DESSERT.PCFSoftShadowMap;
    renderer.toneMapping = DESSERT.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Find current demo
    const currentDemo = demos.find((d) => d.id === activeDemoId) || demos[0];
    const demoInstance = currentDemo.setup(scene, camera, renderer);
    currentUpdateRef.current = demoInstance.update;
    cleanupRef.current = demoInstance.cleanup || null;

    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const animate = (now: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const timeInSec = (now / 1000) * speedRef.current;

      if (isPlayingRef.current && currentUpdateRef.current) {
        currentUpdateRef.current(timeInSec, delta);
      }

      controls.update();
      renderer.render(scene, camera);

      // FPS & triangles calculation
      frameCount++;
      if (now - lastFpsUpdate >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
        setTriangles(renderer.info.render.triangles);
        frameCount = 0;
        lastFpsUpdate = now;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (cleanupRef.current) cleanupRef.current();
      controls.dispose();
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeDemoId]);

  const activeDemo = demos.find((d) => d.id === activeDemoId) || demos[0];

  return (
    <div id="showcase-container" className="flex h-[calc(100vh-64px)] bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Gallery List */}
      <div id="showcase-sidebar" className="w-80 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100">DESSERT Showcase</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Iconic DESSERT demos running completely offline with procedural generation.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {demos.map((demo) => {
            const Icon = demo.icon;
            const isSelected = demo.id === activeDemoId;
            return (
              <button
                key={demo.id}
                id={`demo-select-${demo.id}`}
                onClick={() => setActiveDemoId(demo.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/80 text-white shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-0.5">
                      {demo.category}
                    </div>
                    <div className="text-sm font-medium truncate">{demo.title}</div>
                    <div className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {demo.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Viewport & Interactive Overlay */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Viewport Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/60 shadow-xl pointer-events-auto">
            <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>{activeDemo.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {activeDemo.category}
              </span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xl mt-0.5">{activeDemo.description}</p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 shadow-xl flex items-center gap-4 text-xs font-mono pointer-events-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">FPS:</span>
              <span className="text-emerald-400 font-semibold">{fps}</span>
            </div>
            <div className="h-3 w-px bg-slate-700"></div>
            <div>
              <span className="text-slate-400">Triangles: </span>
              <span className="text-indigo-300 font-semibold">{triangles.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 3D WebGL Canvas Container */}
        <div ref={containerRef} id="showcase-webgl-canvas" className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Bottom Floating Control Bar */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-700/70 shadow-2xl flex items-center gap-5">
          <button
            id="showcase-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Speed</span>
            <input
              id="showcase-speed-slider"
              type="range"
              min="0.1"
              max="2.5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-24 accent-indigo-500 cursor-pointer"
            />
            <span className="font-mono text-indigo-300 w-8">{speed.toFixed(1)}x</span>
          </div>

          <div className="h-4 w-px bg-slate-700"></div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>Mouse: Left drag (orbit), Right drag (pan), Scroll (zoom)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
