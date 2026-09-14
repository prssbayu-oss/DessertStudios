import { rm, mkdir, writeFile } from 'node:fs/promises';

await rm( './build', { recursive: true, force: true } );

await mkdir( './build' );

const contents = {
    'dessert.core.js': `export * from '../src/dessert/Dessert.Core.js';`,
    'dessert.module.js': `export * from '../src/dessert/Dessert.js';`,
    'dessert.dsl.js': `export * from '../src/dessert/Dessert.dsl.js';`,
    'dessert.webgpu.js': `export * from '../src/dessert/Dessert.webgpu.js';`,
    'dessert.webgpu.nodes.js': `export * from '../src/dessert/Dessert.webgpu.nodes.js';`,
    'three.core.js': `export * from '../src/dessert/Dessert.Core.js';`,
    'three.module.js': `export * from '../src/dessert/Dessert.js';`,
    'three.tsl.js': `export * from '../src/dessert/Dessert.dsl.js';`,
    'three.webgpu.js': `export * from '../src/dessert/Dessert.webgpu.js';`,
    'three.webgpu.nodes.js': `export * from '../src/dessert/Dessert.webgpu.nodes.js';`,
}

await Promise.all( Object.entries( contents ).map( ( [ filename, content ] ) => 
    writeFile( `./build/${ filename }`, '// dev build\n' + content + '\n' )
) );
