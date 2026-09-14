import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject } from '../dsl/DSLCore.js';
import { log } from '../../utils.js';

class DebugNode extends TempNode {

	static get type() {

		return 'DebugNode';

	}

	constructor( node, callback = null ) {

		super();

		this.node = node;
		this.callback = callback;

	}

	generateNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	setup( builder ) {

		return this.node.build( builder );

	}

	analyze( builder ) {

		return this.node.build( builder );

	}

	generate( builder ) {

		const callback = this.callback;
		const snippet = this.node.build( builder );

		if ( callback !== null ) {

			callback( builder, snippet );

		} else {

			const title = '--- DSL debug - ' + builder.shaderStage + ' shader ---';
			const border = '-'.repeat( title.length );

			let code = '';
			code += '// #' + title + '#\n';
			code += builder.flow.code.replace( /^\t/mg, '' ) + '\n';
			code += '/* ... */ ' + snippet + ' /* ... */\n';
			code += '// #' + border + '#\n';

			log( code );

		}

		return snippet;

	}

}

export default DebugNode;

/**
 * DSL function for creating a debug node.
 *
 * @dsl
 * @function
 * @param {Node} node - The node to debug.
 * @param {?Function} [callback=null] - Optional callback function to handle the debug output.
 * @returns {DebugNode}
 */
export const debug = ( node, callback = null ) => new DebugNode( nodeObject( node ), callback ).toStack();

addMethodChaining( 'debug', debug );
