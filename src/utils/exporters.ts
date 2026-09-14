import * as DESSERT from '../dessert/Dessert.js';
import { OBJExporter } from '../dessert/exporters/OBJExporter.js';
import { GLTFExporter } from '../dessert/exporters/GLTFExporter.js';

export function exportSceneToJSON(scene: any, filename = 'dessert-scene.json') {
  const json = scene.toJSON();
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
}

export function exportObjectToOBJ(object: any, filename = 'dessert-model.obj') {
  const exporter = new OBJExporter();
  const result = exporter.parse(object);
  const blob = new Blob([result], { type: 'text/plain' });
  downloadBlob(blob, filename);
}

export function exportSceneToGLTF(
  scene: any,
  filename = 'dessert-scene.gltf',
  binary = false
) {
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (result: any) => {
      if (result instanceof ArrayBuffer) {
        const blob = new Blob([result], { type: 'application/octet-stream' });
        downloadBlob(blob, filename.replace('.gltf', '.glb'));
      } else {
        const output = JSON.stringify(result, null, 2);
        const blob = new Blob([output], { type: 'application/json' });
        downloadBlob(blob, filename);
      }
    },
    (error: any) => {
      console.error('An error occurred during GLTF export:', error);
    },
    { binary }
  );
}

export function captureCanvasSnapshot(canvas: HTMLCanvasElement, filename = 'dessert-render.png') {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  link.click();
}

function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

