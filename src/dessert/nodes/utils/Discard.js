import { select } from '../math/ConditionalNode.js';
import { expression } from '../code/ExpressionNode.js';
import { addMethodChaining } from '../dsl/DSLCore.js';

/**
 * Represents a `discard` shader operation in DSL.
 *
 * @dsl
 * @function
 * @param {?ConditionalNode} conditional - An optional conditional node. It allows to decide whether the discard should be executed or not.
 * @return {Node} The `discard` expression.
 */
export const Discard = ( conditional ) => ( conditional ? select( conditional, expression( 'discard' ) ) : expression( 'discard' ) ).toStack();

/**
 * Represents a `return` shader operation in DSL.
 *
 * @dsl
 * @function
 * @return {ExpressionNode} The `return` expression.
 */
export const Return = () => expression( 'return' ).toStack();

addMethodChaining( 'discard', Discard );
