import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as DESSERT from '../../dessert/Dessert.js';
import { OrbitControls } from '../../dessert/controls/OrbitControls.js';
import { TransformControls } from '../../dessert/controls/TransformControls.js';
import {
  Move,
  RotateCw,
  Maximize2,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Sun,
  Camera,
  Layers,
  Download,
  Play,
  Pause,
  Sliders,
  Palette,
  Grid,
  Sparkles,
  Image as ImageIcon,
  Compass,
  FileCode,
  Box,
  Circle,
  HelpCircle,
} from 'lucide-react';
import {
  createCheckerTexture,
  createMarbleTexture,
  createGridTexture,
  createHexTexture,
  createNormalMapTexture,
} from '../../utils/proceduralTextures';
import { exportSceneToJSON, exportObjectToOBJ, exportSceneToGLTF, captureCanvasSnapshot } from '../../utils/exporters';
import { TransformMode } from '../../types';

export const EditorView: React.FC = () => {
  // UI States
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [activeInspectorTab, setActiveInspectorTab] = useState<'object' | 'geometry' | 'material' | 'scene'>('object');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [wireframeAll, setWireframeAll] = useState<boolean>(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState<boolean>(false);
  const [addDropdownOpen, setAddDropdownOpen] = useState<boolean>(false);

  // Scene Stats
  const [sceneObjects, setSceneObjects] = useState<{ id: string; name: string; type: string; visible: boolean }[]>([]);
  const [stats, setStats] = useState<{ fps: number; triangles: number; drawCalls: number }>({
    fps: 60,
    triangles: 0,
    drawCalls: 0,
  });

  // Selected Object Inspector States
  const [pos, setPos] = useState<[number, number, number]>([0, 0, 0]);
  const [rot, setRot] = useState<[number, number, number]>([0, 0, 0]);
  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
  const [objName, setObjName] = useState<string>('');
  const [objVisible, setObjVisible] = useState<boolean>(true);
  const [castShadow, setCastShadow] = useState<boolean>(true);

  // Material Inspector States
  const [matColor, setMatColor] = useState<string>('#4f46e5');
  const [matRoughness, setMatRoughness] = useState<number>(0.3);
  const [matMetalness, setMatMetalness] = useState<number>(0.2);
  const [matTransmission, setMatTransmission] = useState<number>(0.0);
  const [matClearcoat, setMatClearcoat] = useState<number>(0.0);
  const [matWireframe, setMatWireframe] = useState<boolean>(false);
  const [matType, setMatType] = useState<string>('MeshStandardMaterial');
  const [matTexture, setMatTexture] = useState<string>('none');

  // Scene Settings States
  const [sceneBgColor, setSceneBgColor] = useState<string>('#13161f');
  const [fogEnabled, setFogEnabled] = useState<boolean>(true);
  const [fogDensity, setFogDensity] = useState<number>(0.02);

  // Geometry Parameters State
  const [geoParams, setGeoParams] = useState<any>({});

  // Canvas & DESSERT Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<DESSERT.Scene | null>(null);
  const cameraRef = useRef<DESSERT.PerspectiveCamera | null>(null);
  const rendererRef = useRef<DESSERT.WebGLRenderer | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const gridHelperRef = useRef<DESSERT.GridHelper | null>(null);
  const axesHelperRef = useRef<DESSERT.AxesHelper | null>(null);
  const selectedMeshRef = useRef<DESSERT.Object3D | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);

  isPlayingRef.current = isPlaying;

  // Refresh scene objects list for hierarchy tree
  const updateHierarchyList = useCallback(() => {
    if (!sceneRef.current) return;
    const list: { id: string; name: string; type: string; visible: boolean }[] = [];
    sceneRef.current.traverse((child) => {
      // Exclude helpers and transform controls internal gizmos
      if (
        child !== sceneRef.current &&
        !child.name.startsWith('__helper_') &&
        !(child as any).isTransformControls
      ) {
        list.push({
          id: child.uuid,
          name: child.name || `${child.type}_${child.id}`,
          type: child.type,
          visible: child.visible,
        });
      }
    });
    setSceneObjects(list);
  }, []);

  // Update inspector states when selected object changes
  const syncInspectorFromSelected = useCallback((obj: DESSERT.Object3D | null) => {
    if (!obj) {
      setSelectedObjectId(null);
      selectedMeshRef.current = null;
      if (transformControlsRef.current) transformControlsRef.current.detach();
      return;
    }

    selectedMeshRef.current = obj;
    setSelectedObjectId(obj.uuid);
    setObjName(obj.name || obj.type);
    setObjVisible(obj.visible);
    setCastShadow(obj.castShadow);

    setPos([obj.position.x, obj.position.y, obj.position.z]);
    setRot([
      DESSERT.MathUtils.radToDeg(obj.rotation.x),
      DESSERT.MathUtils.radToDeg(obj.rotation.y),
      DESSERT.MathUtils.radToDeg(obj.rotation.z),
    ]);
    setScale([obj.scale.x, obj.scale.y, obj.scale.z]);

    // Material sync
    if ((obj as DESSERT.Mesh).isMesh && (obj as DESSERT.Mesh).material) {
      const mat = (obj as DESSERT.Mesh).material as any;
      if (mat.color) setMatColor('#' + mat.color.getHexString());
      if (mat.roughness !== undefined) setMatRoughness(mat.roughness);
      if (mat.metalness !== undefined) setMatMetalness(mat.metalness);
      if (mat.transmission !== undefined) setMatTransmission(mat.transmission);
      if (mat.clearcoat !== undefined) setMatClearcoat(mat.clearcoat);
      if (mat.wireframe !== undefined) setMatWireframe(mat.wireframe);
      setMatType(mat.type || 'MeshStandardMaterial');
    }

    // Geometry sync
    if ((obj as DESSERT.Mesh).isMesh && (obj as DESSERT.Mesh).geometry) {
      const geo = (obj as DESSERT.Mesh).geometry;
      setGeoParams((geo as any).parameters || {});
    }

    if (transformControlsRef.current) {
      transformControlsRef.current.attach(obj);
    }
  }, []);

  // Initialize WebGL Scene
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    mount.innerHTML = '';
    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 500;

    // Scene
    const scene = new DESSERT.Scene();
    scene.background = new DESSERT.Color(sceneBgColor);
    scene.fog = new DESSERT.FogExp2(sceneBgColor, fogDensity);
    sceneRef.current = scene;

    // Camera
    const camera = new DESSERT.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(4, 5, 8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new DESSERT.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = DESSERT.PCFSoftShadowMap;
    renderer.toneMapping = DESSERT.ACESFilmicToneMapping;
    rendererRef.current = renderer;
    canvasRef.current = renderer.domElement;
    mount.appendChild(renderer.domElement);

    // OrbitControls
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.05;
    orbitControlsRef.current = orbit;

    // TransformControls Gizmo
    const transform = new TransformControls(camera, renderer.domElement);
    (transform as any).name = '__helper_transform_controls';
    transform.getHelper().name = '__helper_transform_controls';
    transform.setMode(transformMode);
    scene.add(transform.getHelper());
    transformControlsRef.current = transform;

    // Disable OrbitControls while dragging Gizmo
    transform.addEventListener('dragging-changed', (event) => {
      orbit.enabled = !event.value;
    });

    // Update coordinates in UI when user drags gizmo
    transform.addEventListener('change', () => {
      if (selectedMeshRef.current) {
        const obj = selectedMeshRef.current;
        setPos([obj.position.x, obj.position.y, obj.position.z]);
        setRot([
          DESSERT.MathUtils.radToDeg(obj.rotation.x),
          DESSERT.MathUtils.radToDeg(obj.rotation.y),
          DESSERT.MathUtils.radToDeg(obj.rotation.z),
        ]);
        setScale([obj.scale.x, obj.scale.y, obj.scale.z]);
      }
    });

    // Grid & Axes Helpers
    const grid = new DESSERT.GridHelper(20, 20, 0x4f46e5, 0x334155);
    grid.name = '__helper_grid';
    grid.position.y = -0.01;
    scene.add(grid);
    gridHelperRef.current = grid;

    const axes = new DESSERT.AxesHelper(3);
    axes.name = '__helper_axes';
    scene.add(axes);
    axesHelperRef.current = axes;

    // Default Lights
    const ambientLight = new DESSERT.AmbientLight(0xffffff, 0.8);
    ambientLight.name = 'Ambient Light';
    scene.add(ambientLight);

    const dirLight = new DESSERT.DirectionalLight(0xffffff, 2.5);
    dirLight.name = 'Sun Light';
    dirLight.position.set(5, 10, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    // Default Pedestal / Floor
    const floorGeo = new DESSERT.PlaneGeometry(20, 20);
    const floorMat = new DESSERT.MeshStandardMaterial({
      map: createGridTexture('#0b0f19', '#1e293b', 512, 20),
      roughness: 0.4,
      metalness: 0.1,
    });
    const floor = new DESSERT.Mesh(floorGeo, floorMat);
    floor.name = 'Ground Floor';
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Default Hero Objects
    const heroBoxGeo = new DESSERT.BoxGeometry(1.5, 1.5, 1.5);
    const heroBoxMat = new DESSERT.MeshStandardMaterial({
      color: 0x4f46e5,
      roughness: 0.2,
      metalness: 0.8,
    });
    const heroBox = new DESSERT.Mesh(heroBoxGeo, heroBoxMat);
    heroBox.name = 'Default Cube';
    heroBox.position.set(-1.5, 0.75, 0);
    heroBox.castShadow = true;
    heroBox.receiveShadow = true;
    scene.add(heroBox);

    const knotGeo = new DESSERT.TorusKnotGeometry(0.8, 0.25, 120, 24);
    const knotMat = new DESSERT.MeshPhysicalMaterial({
      color: 0xec4899,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0,
    });
    const heroKnot = new DESSERT.Mesh(knotGeo, knotMat);
    heroKnot.name = 'Torus Knot';
    heroKnot.position.set(1.5, 1.2, 0);
    heroKnot.castShadow = true;
    scene.add(heroKnot);

    // Initial selection
    syncInspectorFromSelected(heroBox);
    updateHierarchyList();

    // Raycaster for viewport selection
    const raycaster = new DESSERT.Raycaster();
    const mouse = new DESSERT.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      // Don't select if user was dragging transform gizmo
      if (transform.dragging) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Filter out helpers and internal gizmos
      const hit = intersects.find(
        (i) =>
          !i.object.name.startsWith('__helper_') &&
          !(i.object as any).isTransformControls &&
          i.object !== floor
      );

      if (hit) {
        let target: DESSERT.Object3D = hit.object;
        // Ascend to top mesh if needed
        while (target.parent && target.parent !== scene && !(target as DESSERT.Mesh).isMesh) {
          target = target.parent;
        }
        syncInspectorFromSelected(target);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handleCanvasClick);

    // Hotkeys (W: Translate, E: Rotate, R: Scale, Delete: Remove)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'w' || e.key === 'W') {
        setTransformMode('translate');
        transform.setMode('translate');
      } else if (e.key === 'e' || e.key === 'E') {
        setTransformMode('rotate');
        transform.setMode('rotate');
      } else if (e.key === 'r' || e.key === 'R') {
        setTransformMode('scale');
        transform.setMode('scale');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedMeshRef.current && selectedMeshRef.current !== floor) {
          deleteSelectedObject();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Animation Render Loop
    let frames = 0;
    let lastFpsTime = performance.now();

    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (isPlayingRef.current) {
        const t = time * 0.001;
        heroKnot.rotation.x = t * 0.6;
        heroKnot.rotation.y = t * 0.9;
        heroBox.rotation.y = t * 0.5;
      }

      orbit.update();
      renderer.render(scene, camera);

      frames++;
      if (time - lastFpsTime >= 500) {
        setStats({
          fps: Math.round((frames * 1000) / (time - lastFpsTime)),
          triangles: renderer.info.render.triangles,
          drawCalls: renderer.info.render.calls,
        });
        frames = 0;
        lastFpsTime = time;
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      renderer.domElement.removeEventListener('pointerdown', handleCanvasClick);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      orbit.dispose();
      transform.dispose();
      renderer.dispose();
      scene.clear();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update transform mode when state changes
  useEffect(() => {
    if (transformControlsRef.current) {
      transformControlsRef.current.setMode(transformMode);
    }
  }, [transformMode]);

  // Update grid & axes helpers
  useEffect(() => {
    if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
  }, [showGrid]);

  useEffect(() => {
    if (axesHelperRef.current) axesHelperRef.current.visible = showAxes;
  }, [showAxes]);

  // Update wireframe for all meshes
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.traverse((child) => {
      if ((child as DESSERT.Mesh).isMesh && (child as DESSERT.Mesh).material) {
        const mat = (child as DESSERT.Mesh).material as any;
        if (mat.wireframe !== undefined) mat.wireframe = wireframeAll;
      }
    });
  }, [wireframeAll]);

  // Background and Fog
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new DESSERT.Color(sceneBgColor);
      if (fogEnabled) {
        sceneRef.current.fog = new DESSERT.FogExp2(sceneBgColor, fogDensity);
      } else {
        sceneRef.current.fog = null;
      }
    }
  }, [sceneBgColor, fogEnabled, fogDensity]);

  // Add Primitives into Scene
  const handleAddMesh = (type: string) => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    let geo: DESSERT.BufferGeometry;
    let name = type;

    switch (type) {
      case 'Box':
        geo = new DESSERT.BoxGeometry(1, 1, 1);
        break;
      case 'Sphere':
        geo = new DESSERT.SphereGeometry(0.75, 32, 32);
        break;
      case 'Cylinder':
        geo = new DESSERT.CylinderGeometry(0.5, 0.5, 1.5, 32);
        break;
      case 'Torus':
        geo = new DESSERT.TorusGeometry(0.8, 0.25, 24, 64);
        break;
      case 'TorusKnot':
        geo = new DESSERT.TorusKnotGeometry(0.7, 0.2, 96, 24);
        break;
      case 'Cone':
        geo = new DESSERT.ConeGeometry(0.7, 1.5, 32);
        break;
      case 'Icosahedron':
        geo = new DESSERT.IcosahedronGeometry(0.8, 2);
        break;
      case 'Capsule':
        geo = new DESSERT.CapsuleGeometry(0.5, 1, 16, 32);
        break;
      case 'Plane':
        geo = new DESSERT.PlaneGeometry(2, 2);
        break;
      default:
        geo = new DESSERT.BoxGeometry(1, 1, 1);
    }

    const mat = new DESSERT.MeshStandardMaterial({
      color: new DESSERT.Color().setHSL(Math.random(), 0.7, 0.6),
      roughness: 0.3,
      metalness: 0.4,
    });

    const mesh = new DESSERT.Mesh(geo, mat);
    mesh.name = `${name}_${Date.now().toString().slice(-4)}`;
    mesh.position.set((Math.random() - 0.5) * 3, 1, (Math.random() - 0.5) * 3);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
    syncInspectorFromSelected(mesh);
    updateHierarchyList();
    setAddDropdownOpen(false);
  };

  // Add Lights
  const handleAddLight = (type: 'Directional' | 'Point' | 'Spot') => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    let light: DESSERT.Light;
    if (type === 'Point') {
      light = new DESSERT.PointLight(0xffffff, 40, 20);
      light.name = `PointLight_${Date.now().toString().slice(-4)}`;
    } else if (type === 'Spot') {
      light = new DESSERT.SpotLight(0xffffff, 40);
      light.name = `SpotLight_${Date.now().toString().slice(-4)}`;
    } else {
      light = new DESSERT.DirectionalLight(0xffffff, 2.0);
      light.name = `DirLight_${Date.now().toString().slice(-4)}`;
    }

    light.position.set(2, 4, 2);
    light.castShadow = true;
    scene.add(light);
    syncInspectorFromSelected(light);
    updateHierarchyList();
    setAddDropdownOpen(false);
  };

  // Delete Selected Object
  const deleteSelectedObject = () => {
    if (!selectedMeshRef.current || !sceneRef.current) return;
    const obj = selectedMeshRef.current;

    if (transformControlsRef.current) transformControlsRef.current.detach();
    sceneRef.current.remove(obj);
    selectedMeshRef.current = null;
    setSelectedObjectId(null);
    updateHierarchyList();
  };

  // Duplicate Selected Object
  const duplicateSelectedObject = () => {
    if (!selectedMeshRef.current || !sceneRef.current) return;
    const clone = selectedMeshRef.current.clone();
    clone.position.x += 0.8;
    clone.position.z += 0.8;
    clone.name = `${selectedMeshRef.current.name}_copy`;
    sceneRef.current.add(clone);
    syncInspectorFromSelected(clone);
    updateHierarchyList();
  };

  // Apply Changes to Object Transforms
  const updatePosition = (axis: 0 | 1 | 2, val: number) => {
    if (!selectedMeshRef.current) return;
    const newPos: [number, number, number] = [pos[0], pos[1], pos[2]];
    newPos[axis] = val;
    setPos(newPos);
    selectedMeshRef.current.position.set(newPos[0], newPos[1], newPos[2]);
  };

  const updateRotation = (axis: 0 | 1 | 2, deg: number) => {
    if (!selectedMeshRef.current) return;
    const newRot: [number, number, number] = [rot[0], rot[1], rot[2]];
    newRot[axis] = deg;
    setRot(newRot);
    selectedMeshRef.current.rotation.set(
      DESSERT.MathUtils.degToRad(newRot[0]),
      DESSERT.MathUtils.degToRad(newRot[1]),
      DESSERT.MathUtils.degToRad(newRot[2])
    );
  };

  const updateScale = (axis: 0 | 1 | 2, val: number) => {
    if (!selectedMeshRef.current) return;
    const newScale: [number, number, number] = [scale[0], scale[1], scale[2]];
    newScale[axis] = val;
    setScale(newScale);
    selectedMeshRef.current.scale.set(newScale[0], newScale[1], newScale[2]);
  };

  // Apply Material Changes
  const applyMaterialChanges = (
    colorHex: string,
    rough: number,
    metal: number,
    trans: number,
    clear: number,
    wire: boolean,
    type: string,
    textureType: string
  ) => {
    if (!selectedMeshRef.current || !(selectedMeshRef.current as DESSERT.Mesh).isMesh) return;
    const mesh = selectedMeshRef.current as DESSERT.Mesh;

    let texture: DESSERT.Texture | null = null;
    if (textureType === 'checker') texture = createCheckerTexture();
    else if (textureType === 'marble') texture = createMarbleTexture();
    else if (textureType === 'grid') texture = createGridTexture();
    else if (textureType === 'hex') texture = createHexTexture();

    const matProps: any = {
      color: new DESSERT.Color(colorHex),
      roughness: rough,
      metalness: metal,
      wireframe: wire,
      map: texture,
    };

    if (type === 'MeshPhysicalMaterial') {
      matProps.transmission = trans;
      matProps.clearcoat = clear;
      matProps.roughness = rough;
      matProps.transparent = trans > 0;
      mesh.material = new DESSERT.MeshPhysicalMaterial(matProps);
    } else if (type === 'MeshPhongMaterial') {
      mesh.material = new DESSERT.MeshPhongMaterial({
        color: new DESSERT.Color(colorHex),
        wireframe: wire,
        map: texture,
      });
    } else if (type === 'MeshToonMaterial') {
      mesh.material = new DESSERT.MeshToonMaterial({
        color: new DESSERT.Color(colorHex),
        wireframe: wire,
      });
    } else if (type === 'MeshNormalMaterial') {
      mesh.material = new DESSERT.MeshNormalMaterial({ wireframe: wire });
    } else {
      mesh.material = new DESSERT.MeshStandardMaterial(matProps);
    }
  };

  return (
    <div id="editor-container" className="flex h-[calc(100vh-64px)] bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Hierarchy Outliner Panel (Left) */}
      <div id="editor-hierarchy" className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold text-slate-200">Scene Outliner</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
            {sceneObjects.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sceneObjects.map((item) => {
            const isSelected = item.id === selectedObjectId;
            return (
              <div
                key={item.id}
                id={`hierarchy-item-${item.id}`}
                onClick={() => {
                  if (!sceneRef.current) return;
                  const obj = sceneRef.current.getObjectByProperty('uuid', item.id);
                  if (obj) syncInspectorFromSelected(obj);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-indigo-600/30 text-white font-medium border border-indigo-500/50'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Box className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!sceneRef.current) return;
                    const obj = sceneRef.current.getObjectByProperty('uuid', item.id);
                    if (obj) {
                      obj.visible = !obj.visible;
                      updateHierarchyList();
                    }
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  {item.visible ? <Eye className="w-3 h-3 text-slate-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Action Controls for Selected */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
          <button
            id="editor-duplicate-btn"
            onClick={duplicateSelectedObject}
            disabled={!selectedObjectId}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-slate-200 transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>Clone</span>
          </button>
          <button
            id="editor-delete-btn"
            onClick={deleteSelectedObject}
            disabled={!selectedObjectId}
            className="flex items-center justify-center p-1.5 text-xs bg-red-950/60 hover:bg-red-900/80 text-red-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Delete Selected"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center 3D Viewport */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Control Toolbar */}
        <div id="editor-toolbar" className="h-12 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between z-10 shrink-0">
          {/* Add primitives / lights dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                id="editor-add-dropdown-btn"
                onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Object</span>
              </button>

              {addDropdownOpen && (
                <div
                  id="editor-add-dropdown-menu"
                  className="absolute left-0 mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs"
                >
                  <div className="px-3 py-1 text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                    Geometries
                  </div>
                  {['Box', 'Sphere', 'Cylinder', 'Torus', 'TorusKnot', 'Cone', 'Icosahedron', 'Capsule', 'Plane'].map(
                    (m) => (
                      <button
                        key={m}
                        id={`add-mesh-${m.toLowerCase()}`}
                        onClick={() => handleAddMesh(m)}
                        className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        {m}
                      </button>
                    )
                  )}
                  <div className="my-1 border-t border-slate-800"></div>
                  <div className="px-3 py-1 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                    Lights
                  </div>
                  {(['Directional', 'Point', 'Spot'] as const).map((l) => (
                    <button
                      key={l}
                      id={`add-light-${l.toLowerCase()}`}
                      onClick={() => handleAddLight(l)}
                      className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      {l} Light
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-slate-800 mx-1"></div>

            {/* Transform Gizmo modes */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700/60">
              <button
                id="tool-translate"
                onClick={() => setTransformMode('translate')}
                className={`p-1.5 rounded-md transition-colors ${
                  transformMode === 'translate' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Translate (W)"
              >
                <Move className="w-3.5 h-3.5" />
              </button>
              <button
                id="tool-rotate"
                onClick={() => setTransformMode('rotate')}
                className={`p-1.5 rounded-md transition-colors ${
                  transformMode === 'rotate' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Rotate (E)"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                id="tool-scale"
                onClick={() => setTransformMode('scale')}
                className={`p-1.5 rounded-md transition-colors ${
                  transformMode === 'scale' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Scale (R)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View Helpers */}
            <button
              id="toggle-grid"
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg border border-slate-700/60 transition-colors ${
                showGrid ? 'bg-slate-800 text-indigo-400' : 'bg-slate-900 text-slate-500'
              }`}
              title="Toggle Grid"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              id="toggle-axes"
              onClick={() => setShowAxes(!showAxes)}
              className={`p-1.5 rounded-lg border border-slate-700/60 transition-colors ${
                showAxes ? 'bg-slate-800 text-indigo-400' : 'bg-slate-900 text-slate-500'
              }`}
              title="Toggle Axes"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
            <button
              id="toggle-wireframe"
              onClick={() => setWireframeAll(!wireframeAll)}
              className={`p-1.5 rounded-lg border border-slate-700/60 transition-colors ${
                wireframeAll ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
              title="Toggle Global Wireframe"
            >
              <Circle className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simulation & Export Actions */}
          <div className="flex items-center gap-2">
            <button
              id="editor-play-pause"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
            </button>

            <button
              id="editor-snapshot-btn"
              onClick={() => {
                if (canvasRef.current) captureCanvasSnapshot(canvasRef.current);
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
              title="Take High-Res PNG Snapshot"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                id="editor-export-btn"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              {exportDropdownOpen && (
                <div
                  id="editor-export-menu"
                  className="absolute right-0 mt-1.5 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs"
                >
                  <button
                    id="export-json-btn"
                    onClick={() => {
                      if (sceneRef.current) exportSceneToJSON(sceneRef.current);
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Scene JSON (.json)
                  </button>
                  <button
                    id="export-obj-btn"
                    onClick={() => {
                      if (selectedMeshRef.current) {
                        exportObjectToOBJ(selectedMeshRef.current);
                      } else if (sceneRef.current) {
                        exportObjectToOBJ(sceneRef.current);
                      }
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Wavefront OBJ (.obj)
                  </button>
                  <button
                    id="export-gltf-btn"
                    onClick={() => {
                      if (sceneRef.current) exportSceneToGLTF(sceneRef.current, 'threejs-scene.gltf');
                      setExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    glTF 2.0 (.gltf)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div ref={mountRef} id="editor-webgl-canvas" className="w-full flex-1 cursor-grab active:cursor-grabbing" />

        {/* Bottom HUD info */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono flex items-center gap-3 text-slate-400 pointer-events-none">
          <div>FPS: <span className="text-emerald-400 font-semibold">{stats.fps}</span></div>
          <div className="w-px h-3 bg-slate-700"></div>
          <div>Triangles: <span className="text-indigo-300 font-semibold">{stats.triangles.toLocaleString()}</span></div>
          <div className="w-px h-3 bg-slate-700"></div>
          <div>Calls: <span className="text-indigo-300 font-semibold">{stats.drawCalls}</span></div>
        </div>
      </div>

      {/* Inspector Panel (Right) */}
      <div id="editor-inspector" className="w-80 border-l border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col shrink-0">
        {/* Tab Selector */}
        <div className="p-1.5 border-b border-slate-800 bg-slate-900/90 grid grid-cols-4 gap-1 text-[11px] font-medium">
          <button
            id="tab-inspector-object"
            onClick={() => setActiveInspectorTab('object')}
            className={`py-1.5 rounded-md transition-colors ${
              activeInspectorTab === 'object' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transform
          </button>
          <button
            id="tab-inspector-geometry"
            onClick={() => setActiveInspectorTab('geometry')}
            className={`py-1.5 rounded-md transition-colors ${
              activeInspectorTab === 'geometry' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Geometry
          </button>
          <button
            id="tab-inspector-material"
            onClick={() => setActiveInspectorTab('material')}
            className={`py-1.5 rounded-md transition-colors ${
              activeInspectorTab === 'material' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Material
          </button>
          <button
            id="tab-inspector-scene"
            onClick={() => setActiveInspectorTab('scene')}
            className={`py-1.5 rounded-md transition-colors ${
              activeInspectorTab === 'scene' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scene
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* TAB 1: OBJECT TRANSFORM */}
          {activeInspectorTab === 'object' && (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1">Object Name</label>
                <input
                  id="inspector-obj-name"
                  type="text"
                  value={objName}
                  onChange={(e) => {
                    setObjName(e.target.value);
                    if (selectedMeshRef.current) {
                      selectedMeshRef.current.name = e.target.value;
                      updateHierarchyList();
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Position */}
              <div>
                <label className="text-slate-400 block mb-1.5 font-semibold">Position (X, Y, Z)</label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                    <div key={axis} className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                      <span className="text-slate-500 mr-1.5 text-[10px]">{axis}</span>
                      <input
                        id={`pos-${axis.toLowerCase()}`}
                        type="number"
                        step="0.1"
                        value={pos[i].toFixed(2)}
                        onChange={(e) => updatePosition(i as any, parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-slate-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rotation */}
              <div>
                <label className="text-slate-400 block mb-1.5 font-semibold">Rotation (Deg)</label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                    <div key={axis} className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                      <span className="text-slate-500 mr-1.5 text-[10px]">{axis}</span>
                      <input
                        id={`rot-${axis.toLowerCase()}`}
                        type="number"
                        step="5"
                        value={rot[i].toFixed(1)}
                        onChange={(e) => updateRotation(i as any, parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-slate-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Scale */}
              <div>
                <label className="text-slate-400 block mb-1.5 font-semibold">Scale</label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                    <div key={axis} className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                      <span className="text-slate-500 mr-1.5 text-[10px]">{axis}</span>
                      <input
                        id={`scale-${axis.toLowerCase()}`}
                        type="number"
                        step="0.1"
                        value={scale[i].toFixed(2)}
                        onChange={(e) => updateScale(i as any, parseFloat(e.target.value) || 1)}
                        className="w-full bg-transparent text-slate-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Shadows toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-300">Cast Shadow</span>
                <input
                  id="inspector-cast-shadow"
                  type="checkbox"
                  checked={castShadow}
                  onChange={(e) => {
                    setCastShadow(e.target.checked);
                    if (selectedMeshRef.current) selectedMeshRef.current.castShadow = e.target.checked;
                  }}
                  className="rounded accent-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: GEOMETRY */}
          {activeInspectorTab === 'geometry' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-xs text-slate-400 block mb-1">Active Geometry</span>
                <span className="font-mono text-sm font-semibold text-indigo-300">
                  {selectedMeshRef.current && (selectedMeshRef.current as DESSERT.Mesh).geometry
                    ? (selectedMeshRef.current as DESSERT.Mesh).geometry.type
                    : 'No Mesh Selected'}
                </span>
              </div>

              {/* Procedural rebuild buttons */}
              <div>
                <span className="text-xs text-slate-400 block mb-2 font-semibold">Transform Geometry Shape</span>
                <div className="grid grid-cols-2 gap-2">
                  {['Box', 'Sphere', 'Cylinder', 'TorusKnot'].map((geom) => (
                    <button
                      key={geom}
                      id={`convert-geo-${geom.toLowerCase()}`}
                      onClick={() => {
                        if (!selectedMeshRef.current || !(selectedMeshRef.current as DESSERT.Mesh).isMesh) return;
                        const mesh = selectedMeshRef.current as DESSERT.Mesh;
                        if (geom === 'Box') mesh.geometry = new DESSERT.BoxGeometry(1.2, 1.2, 1.2);
                        if (geom === 'Sphere') mesh.geometry = new DESSERT.SphereGeometry(0.8, 32, 32);
                        if (geom === 'Cylinder') mesh.geometry = new DESSERT.CylinderGeometry(0.6, 0.6, 1.6, 32);
                        if (geom === 'TorusKnot') mesh.geometry = new DESSERT.TorusKnotGeometry(0.8, 0.25, 96, 24);
                        mesh.geometry.computeVertexNormals();
                      }}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-colors"
                    >
                      {geom}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MATERIAL */}
          {activeInspectorTab === 'material' && (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1">Material Type</label>
                <select
                  id="mat-type-select"
                  value={matType}
                  onChange={(e) => {
                    setMatType(e.target.value);
                    applyMaterialChanges(matColor, matRoughness, matMetalness, matTransmission, matClearcoat, matWireframe, e.target.value, matTexture);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="MeshStandardMaterial">MeshStandardMaterial (PBR)</option>
                  <option value="MeshPhysicalMaterial">MeshPhysicalMaterial (Glass/Clearcoat)</option>
                  <option value="MeshPhongMaterial">MeshPhongMaterial (Shiny)</option>
                  <option value="MeshToonMaterial">MeshToonMaterial (Cel Shaded)</option>
                  <option value="MeshNormalMaterial">MeshNormalMaterial</option>
                </select>
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-slate-400 block mb-1">Base Color</label>
                <div className="flex items-center gap-2">
                  <input
                    id="mat-color-picker"
                    type="color"
                    value={matColor}
                    onChange={(e) => {
                      setMatColor(e.target.value);
                      applyMaterialChanges(e.target.value, matRoughness, matMetalness, matTransmission, matClearcoat, matWireframe, matType, matTexture);
                    }}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-300 uppercase">{matColor}</span>
                </div>
              </div>

              {/* Roughness */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Roughness</span>
                  <span className="font-mono">{matRoughness.toFixed(2)}</span>
                </div>
                <input
                  id="mat-roughness-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={matRoughness}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setMatRoughness(v);
                    applyMaterialChanges(matColor, v, matMetalness, matTransmission, matClearcoat, matWireframe, matType, matTexture);
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Metalness */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Metalness</span>
                  <span className="font-mono">{matMetalness.toFixed(2)}</span>
                </div>
                <input
                  id="mat-metalness-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={matMetalness}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setMatMetalness(v);
                    applyMaterialChanges(matColor, matRoughness, v, matTransmission, matClearcoat, matWireframe, matType, matTexture);
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Procedural Texture */}
              <div>
                <label className="text-slate-400 block mb-1">Procedural Map (100% Offline)</label>
                <select
                  id="mat-texture-select"
                  value={matTexture}
                  onChange={(e) => {
                    setMatTexture(e.target.value);
                    applyMaterialChanges(matColor, matRoughness, matMetalness, matTransmission, matClearcoat, matWireframe, matType, e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="none">None (Solid Color)</option>
                  <option value="checker">Procedural Checkerboard</option>
                  <option value="marble">Procedural Marble Noise</option>
                  <option value="grid">Procedural Grid Matrix</option>
                  <option value="hex">Procedural Sci-Fi Hex</option>
                </select>
              </div>

              {/* Wireframe toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-300">Wireframe</span>
                <input
                  id="mat-wireframe-toggle"
                  type="checkbox"
                  checked={matWireframe}
                  onChange={(e) => {
                    setMatWireframe(e.target.checked);
                    applyMaterialChanges(matColor, matRoughness, matMetalness, matTransmission, matClearcoat, e.target.checked, matType, matTexture);
                  }}
                  className="rounded accent-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: SCENE ENVIRONMENT */}
          {activeInspectorTab === 'scene' && (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    id="scene-bg-picker"
                    type="color"
                    value={sceneBgColor}
                    onChange={(e) => setSceneBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-300 uppercase">{sceneBgColor}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300">Atmospheric Fog</span>
                  <input
                    id="scene-fog-toggle"
                    type="checkbox"
                    checked={fogEnabled}
                    onChange={(e) => setFogEnabled(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                </div>
                {fogEnabled && (
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Density</span>
                      <span className="font-mono">{fogDensity.toFixed(3)}</span>
                    </div>
                    <input
                      id="scene-fog-slider"
                      type="range"
                      min="0.005"
                      max="0.08"
                      step="0.005"
                      value={fogDensity}
                      onChange={(e) => setFogDensity(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
