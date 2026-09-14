import { renderGroup } from '../core/UniformGroupNode.js';
import { uniform } from '../core/UniformNode.js';

/**
 * Represents the elapsed time in seconds.
 *
 * @dsl
 * @type {UniformNode<float>}
 */
export const time = /*@__PURE__*/ uniform( 0 ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.time );

/**
 * Represents the delta time in seconds.
 *
 * @dsl
 * @type {UniformNode<float>}
 */
export const deltaTime = /*@__PURE__*/ uniform( 0 ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.deltaTime );

/**
 * Represents the current frame ID.
 *
 * @dsl
 * @type {UniformNode<uint>}
 */
export const frameId = /*@__PURE__*/ uniform( 0, 'uint' ).setGroup( renderGroup ).onRenderUpdate( ( frame ) => frame.frameId );
