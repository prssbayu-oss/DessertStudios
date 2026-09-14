import React, { useEffect, useRef, useState } from 'react';
import * as DESSERT from '../../dessert/Dessert.js';
import { OrbitControls } from '../../dessert/controls/OrbitControls.js';
import { Play, RotateCcw, Copy, Check, Terminal, Code2, AlertTriangle } from 'lucide-react';
import { PLAYGROUND_PRESETS } from '../../data/playgroundPresets';

export const PlaygroundView: React.FC = () => {
  const [activePreset, setActivePreset] = useState<string>(PLAYGROUND_PRESETS[0].id);
  const [code, setCode] = useState<string>(PLAYGROUND_PRESETS[0].code);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [stats, setStats] = useState<{ fps: number; calls: number }>({ fps: 60, calls: 0 });

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const sceneRef = useRef<DESSERT.Scene | null>(null);
  const rendererRef = useRef<DESSERT.WebGLRenderer | null>(null);
  const cameraRef = useRef<DESSERT.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const userAnimateRef = useRef<((t: number) => void) | null>(null);

  // Switch preset
  const handleSelectPreset = (id: string) => {
    const found = PLAYGROUND_PRESETS.find((p) => p.id === id);
    if (found) {
      setActivePreset(id);
      setCode(found.code);
      executeCode(found.code);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe executor for user's DESSERT script
  const executeCode = (codeStr: string) => {
    setErrorMsg(null);
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    const scene = sceneRef.current;
    // Clear previous scene children except camera
    while (scene.children.length > 0) {
      const obj = scene.children[0];
      scene.remove(obj);
    }

    try {
      // Execute the user code function
      const runFn = new Function(
        'DESSERT',
        'THREE',
        'scene',
        'camera',
        'renderer',
        codeStr
      );

      const animCallback = runFn(DESSERT, DESSERT, scene, cameraRef.current, rendererRef.current);
      if (typeof animCallback === 'function') {
        userAnimateRef.current = animCallback;
      } else {
        userAnimateRef.current = null;
      }
    } catch (err: any) {
      console.error('Playground Execution Error:', err);
      setErrorMsg(err.message || 'Unknown runtime error in DESSERT script');
    }
  };

  // Setup WebGL Canvas
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new DESSERT.Scene();
    sceneRef.current = scene;

    const camera = new DESSERT.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    const renderer = new DESSERT.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = DESSERT.ACESFilmicToneMapping;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Run initial code
    executeCode(code);

    let lastTime = performance.now();
    let frames = 0;
    let lastFps = performance.now();

    const animate = (now: number) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const timeInSec = now / 1000;

      if (userAnimateRef.current) {
        try {
          userAnimateRef.current(timeInSec);
        } catch (e: any) {
          setErrorMsg(`Runtime loop error: ${e.message}`);
          userAnimateRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      frames++;
      if (now - lastFps >= 500) {
        setStats({
          fps: Math.round((frames * 1000) / (now - lastFps)),
          calls: renderer.info.render.calls,
        });
        frames = 0;
        lastFps = now;
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
      controls.dispose();
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div id="playground-container" className="flex h-[calc(100vh-64px)] bg-slate-950 text-slate-100 font-sans">
      {/* Code Editor Panel (Left) */}
      <div id="playground-editor-panel" className="w-1/2 flex flex-col border-r border-slate-800 bg-slate-900/70">
        {/* Presets & Actions Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">Preset:</span>
            <select
              id="playground-preset-select"
              value={activePreset}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              {PLAYGROUND_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="playground-copy-code"
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              id="playground-run-button"
              onClick={() => executeCode(code)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Code</span>
            </button>
          </div>
        </div>

        {/* Textarea Code Editor */}
        <div className="flex-1 relative flex flex-col">
          <textarea
            id="playground-code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full p-4 bg-slate-950 font-mono text-xs leading-relaxed text-slate-200 resize-none border-none focus:outline-none focus:ring-0 selection:bg-indigo-600/40"
          />

          {/* Error Banner */}
          {errorMsg && (
            <div id="playground-error-banner" className="p-3 bg-red-950/80 border-t border-red-800 text-red-300 text-xs font-mono flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="overflow-x-auto whitespace-pre-wrap">{errorMsg}</div>
            </div>
          )}
        </div>

        {/* Console / Hint Footer */}
        <div className="p-2.5 px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Scope available: <code>scene</code>, <code>camera</code>, <code>renderer</code>, <code>THREE</code></span>
          </div>
          <span className="text-slate-500">Return an <code>animate(time)</code> function for loops</span>
        </div>
      </div>

      {/* Live WebGL Output Panel (Right) */}
      <div id="playground-viewport-panel" className="w-1/2 flex flex-col relative bg-slate-950">
        {/* Top HUD */}
        <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">FPS:</span>
            <span className="text-emerald-400 font-semibold">{stats.fps}</span>
          </div>
          <div className="h-3 w-px bg-slate-700"></div>
          <div>
            <span className="text-slate-400">Draw calls: </span>
            <span className="text-indigo-300">{stats.calls}</span>
          </div>
        </div>

        {/* Canvas */}
        <div ref={canvasContainerRef} id="playground-canvas" className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>
    </div>
  );
};
