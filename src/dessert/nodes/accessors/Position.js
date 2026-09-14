import { attribute } from '../core/AttributeNode.js';
import { Fn, vec3, vec4 } from '../dsl/DSLCore.js';
import { modelWorldMatrix } from './ModelNode.js';
import { cameraProjectionMatrixInverse } from './Camera.js';
import { warnOnce } from '../../utils.js';

/**
 * DSL object that represents the clip space position of the current rendered object.
 *
 * @dsl
 * @type {VaryingNode<vec4>}
 */
export const clipSpace = /*@__PURE__*/ ( Fn( ( builder ) => {

	if ( builder.shaderStage !== 'fragment' ) {

		warnOnce( 'DSL: `clipSpace` is only available in fragment stage.' );

		return vec4();

	}

	return builder.context.clipSpace.toVarying( 'v_clipSpace' );

} ).once() )();

/**
 * DSL object that represents the position attribute of the current rendered object.
 *
 * @dsl
 * @type {AttributeNode<vec3>}
 */
export const positionGeometry = /*@__PURE__*/ attribute( 'position', 'vec3' );

/**
 * DSL object that represents the transformed vertex position in local space of the current rendered object.
 *
 * The term "transformed" indicates that an object or material's properties, such as skinning, batch,
 * instancing, or displacement mapping, will change the vertex position of the node when present.
 * To use the pre-transformed local space position of the object, use {@link positionGeometry}.
 *
 * @dsl
 * @type {AttributeNode<vec3>}
 */
export const positionLocal = /*@__PURE__*/ positionGeometry.toVarying( 'positionLocal' );

/**
 * DSL object that represents the previous vertex position in local space of the current rendered object.
 * Used in context of {@link VelocityNode} for rendering motion vectors.
 *
 * @dsl
 * @type {AttributeNode<vec3>}
 */
export const positionPrevious = /*@__PURE__*/ positionGeometry.toVarying( 'positionPrevious' );

/**
 * DSL object that represents the vertex position in world space of the current rendered object.
 *
 * @dsl
 * @type {VaryingNode<vec3>}
 */
export const positionWorld = /*@__PURE__*/ ( Fn( ( builder ) => {

	return modelWorldMatrix.mul( positionLocal ).xyz.toVarying( builder.getSubBuildProperty( 'v_positionWorld' ) );

}, 'vec3' ).once( [ 'POSITION' ] ) )();

/**
 * DSL object that represents the position world direction of the current rendered object.
 *
 * @dsl
 * @type {Node<vec3>}
 */
export const positionWorldDirection = /*@__PURE__*/ ( Fn( () => {

	const vertexPWD = positionLocal.transformDirection( modelWorldMatrix ).toVarying( 'v_positionWorldDirection' );

	return vertexPWD.normalize().toVar( 'positionWorldDirection' );

}, 'vec3' ).once( [ 'POSITION' ] ) )();

/**
 * DSL object that represents the vertex position in view space of the current rendered object.
 *
 * @dsl
 * @type {VaryingNode<vec3>}
 */
export const positionView = /*@__PURE__*/ ( Fn( ( builder ) => {

	if ( builder.shaderStage === 'fragment' && builder.material.vertexNode ) {

		// reconstruct view position from clip space

		const viewPos = cameraProjectionMatrixInverse.mul( clipSpace );

		return viewPos.xyz.div( viewPos.w ).toVar( 'positionView' );

	}

	return builder.context.setupPositionView().toVarying( 'v_positionView' );

}, 'vec3' ).once( [ 'POSITION', 'VERTEX' ] ) )();

/**
 * DSL object that represents the position view direction of the current rendered object.
 *
 * @dsl
 * @type {VaryingNode<vec3>}
 */
export const positionViewDirection = /*@__PURE__*/ ( Fn( ( builder ) => {

	let output;

	if ( builder.camera.isOrthographicCamera ) {

		output = vec3( 0, 0, 1 );

	} else {

		output = positionView.negate().toVarying( 'v_positionViewDirection' ).normalize();

	}

	return output.toVar( 'positionViewDirection' );

}, 'vec3' ).once( [ 'POSITION' ] ) )();
