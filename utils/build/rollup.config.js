import MagicString from 'magic-string';

function glsl() {

	return {

		transform( code, id ) {

			if ( /\.glsl.js$/.test( id ) === false ) return;

			code = new MagicString( code );

			code.replace( /\/\* glsl \*\/\`(.*?)\`/sg, function ( match, p1 ) {

				return JSON.stringify(
					p1
						.trim()
						.replace( /\r/g, '' )
						.replace( /[ \t]*\/\/.*\n/g, '' ) // remove //
						.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' ) // remove /* */
						.replace( /\n{2,}/g, '\n' ) // # \n+ to \n
				);

			} );

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}

	};

}

function header() {

	return {

		renderChunk( code ) {

			code = new MagicString( code );

			code.prepend( `/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */\n` );

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}

	};

}

/**
 * @type {Array<import('rollup').RollupOptions>}
 */
const builds = [
	{
		input: {
			'dessert.core.js': 'src/dessert/Dessert.Core.js',
			'dessert.webgpu.nodes.js': 'src/dessert/Dessert.webgpu.nodes.js',
			'three.core.js': 'src/dessert/Dessert.Core.js',
			'three.webgpu.nodes.js': 'src/dessert/Dessert.webgpu.nodes.js',
		},
		plugins: [
			glsl(),
			header()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'esm',
				dir: 'build',
				minifyInternalExports: false,
				entryFileNames: '[name]',
			}
		]
	},
	{
		input: {
			'dessert.core.js': 'src/dessert/Dessert.Core.js',
			'dessert.module.js': 'src/dessert/Dessert.js',
			'dessert.webgpu.js': 'src/dessert/Dessert.webgpu.js',
			'three.core.js': 'src/dessert/Dessert.Core.js',
			'three.module.js': 'src/dessert/Dessert.js',
			'three.webgpu.js': 'src/dessert/Dessert.webgpu.js',
		},
		plugins: [
			glsl(),
			header()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'esm',
				dir: 'build',
				minifyInternalExports: false,
				entryFileNames: '[name]',
			}
		]
	},
	{
		input: {
			'dessert.dsl.js': 'src/dessert/Dessert.dsl.js',
			'three.tsl.js': 'src/dessert/Dessert.dsl.js',
		},
		plugins: [
			header()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'esm',
				dir: 'build',
				minifyInternalExports: false,
				entryFileNames: '[name]',
			}
		],
		external: [ 'dessert/webgpu', 'three/webgpu' ]
	}
];

export default builds;
