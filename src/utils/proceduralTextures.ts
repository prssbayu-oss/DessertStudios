import * as DESSERT from '../dessert/Dessert.js';

// Cache generated textures to avoid regenerating identical textures
const textureCache = new Map<string, DESSERT.CanvasTexture>();

/**
 * Generates a procedural checkerboard texture using Canvas 2D
 */
export function createCheckerTexture(
  color1 = '#ffffff',
  color2 = '#222226',
  size = 512,
  squares = 8
): DESSERT.CanvasTexture {
  const key = `checker_${color1}_${color2}_${size}_${squares}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const squareSize = size / squares;
  for (let x = 0; x < squares; x++) {
    for (let y = 0; y < squares; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? color1 : color2;
      ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    }
  }

  const texture = new DESSERT.CanvasTexture(canvas);
  texture.wrapS = DESSERT.RepeatWrapping;
  texture.wrapT = DESSERT.RepeatWrapping;
  texture.colorSpace = DESSERT.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Generates a procedural technical grid texture
 */
export function createGridTexture(
  bgColor = '#111827',
  gridColor = '#3b82f6',
  size = 512,
  divisions = 16
): DESSERT.CanvasTexture {
  const key = `grid_${bgColor}_${gridColor}_${size}_${divisions}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 2;
  const step = size / divisions;

  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // Inner subtle dots
  ctx.fillStyle = gridColor;
  for (let x = 0; x <= size; x += step) {
    for (let y = 0; y <= size; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new DESSERT.CanvasTexture(canvas);
  texture.wrapS = DESSERT.RepeatWrapping;
  texture.wrapT = DESSERT.RepeatWrapping;
  texture.colorSpace = DESSERT.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Generates a procedural marble / organic noise texture
 */
export function createMarbleTexture(size = 512): DESSERT.CanvasTexture {
  const key = `marble_${size}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Simple multi-frequency sine turbulence
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      const turbulence =
        Math.sin(nx * 12 + Math.sin(ny * 16) * 3) +
        0.5 * Math.sin(nx * 24 + ny * 20) +
        0.25 * Math.sin(nx * 48 - ny * 32);
      
      const v = Math.floor((Math.sin(turbulence * 4 + (nx + ny) * 8) * 0.5 + 0.5) * 255);
      const idx = (y * size + x) * 4;
      data[idx] = Math.min(255, v + 40);     // R
      data[idx + 1] = Math.min(255, v + 45); // G
      data[idx + 2] = Math.min(255, v + 55); // B
      data[idx + 3] = 255;                   // A
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new DESSERT.CanvasTexture(canvas);
  texture.wrapS = DESSERT.RepeatWrapping;
  texture.wrapT = DESSERT.RepeatWrapping;
  texture.colorSpace = DESSERT.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Generates a procedural hexagonal sci-fi pattern
 */
export function createHexTexture(size = 512): DESSERT.CanvasTexture {
  const key = `hex_${size}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);

  const radius = 28;
  const hexHeight = radius * 2;
  const hexWidth = Math.sqrt(3) * radius;

  function drawHexagon(cx: number, cy: number, r: number) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const hx = cx + r * Math.cos(angle);
      const hy = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0284c718';
    ctx.fill();
  }

  for (let row = -1; row * (hexHeight * 0.75) < size + hexHeight; row++) {
    for (let col = -1; col * hexWidth < size + hexWidth; col++) {
      const cx = col * hexWidth + (row % 2 === 0 ? 0 : hexWidth / 2);
      const cy = row * (hexHeight * 0.75);
      drawHexagon(cx, cy, radius * 0.92);
    }
  }

  const texture = new DESSERT.CanvasTexture(canvas);
  texture.wrapS = DESSERT.RepeatWrapping;
  texture.wrapT = DESSERT.RepeatWrapping;
  texture.colorSpace = DESSERT.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Generates a procedural normal bump map
 */
export function createNormalMapTexture(size = 512): DESSERT.CanvasTexture {
  const key = `normal_${size}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = Math.cos((x / size) * Math.PI * 8) * 0.4;
      const dy = Math.sin((y / size) * Math.PI * 8) * 0.4;

      // Tangent space normal map encoding: [128 + 127*dx, 128 + 127*dy, 255]
      data[idx] = Math.floor((dx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((dy * 0.5 + 0.5) * 255);
      data[idx + 2] = 255;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new DESSERT.CanvasTexture(canvas);
  texture.wrapS = DESSERT.RepeatWrapping;
  texture.wrapT = DESSERT.RepeatWrapping;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Generates a procedural equirectangular studio environment map
 * for realistic PBR reflections without downloading external HDR files!
 */
export function createProceduralEnvironmentTexture(renderer: DESSERT.WebGLRenderer): DESSERT.WebGLRenderTarget {
  const scene = new DESSERT.Scene();
  const camera = new DESSERT.CubeCamera(0.1, 100, new DESSERT.WebGLCubeRenderTarget(256));

  // Studio lights inside cube
  const ambient = new DESSERT.AmbientLight(0x223344, 1.0);
  scene.add(ambient);

  const keyLight = new DESSERT.DirectionalLight(0xffffff, 3.5);
  keyLight.position.set(5, 10, 7);
  scene.add(keyLight);

  const fillLight = new DESSERT.DirectionalLight(0x88bbff, 2.0);
  fillLight.position.set(-8, 6, -5);
  scene.add(fillLight);

  const rimLight = new DESSERT.DirectionalLight(0xffaa66, 2.5);
  rimLight.position.set(0, -6, -8);
  scene.add(rimLight);

  // Gradient dome
  const domeGeo = new DESSERT.SphereGeometry(50, 32, 16);
  const domeMat = new DESSERT.MeshBasicMaterial({
    color: 0x181c24,
    side: DESSERT.BackSide,
  });
  const dome = new DESSERT.Mesh(domeGeo, domeMat);
  scene.add(dome);

  // Render cube map once
  camera.update(renderer, scene);
  return camera.renderTarget;
}
