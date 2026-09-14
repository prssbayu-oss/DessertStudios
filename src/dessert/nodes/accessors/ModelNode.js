import Object3DNode from './Object3DNode.js';
import { Fn, nodeImmutable } from '../dsl/DSLBase.js';
import { uniform } from '../core/UniformNode.js';

import { Matrix4 } from '../../math/Matrix4.js';
import { builtin } from './BuiltinNode.js';
import { cameraIndex, cameraViewMatrix } from './Camera.js';
import { uniformArray } from './UniformArrayNode.js';
import { Matrix3 } from '../../math/Matrix3.js';

const _modelViewMatrix = /*@__PURE__*/ new Matrix4();

/**
 * This type of node is a specialized version of `Object3DNode`
 * with larger set of model related metrics. Unlike `Object3DNode`,
 * `ModelNode` extracts the reference to the 3D object from the
 * current node frame state.
 *
 * @augments Object3DNode
 */
class ModelNode extends Object3DNode {

	static get type() {

		return 'ModelNode';

	}

	/**
	 * Constructs a new object model node.
	 *
	 * @param {('position'|'viewPosition'|'direction'|'scale'|'worldMatrix')} scope - The node represents a different type of transformation depending on the scope.
	 */
	constructor( scope ) {

		super( scope );

	}

	/**
	 * Extracts the model reference from the frame state and then
	 * updates the uniform value depending on the scope.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	update( frame ) {

		this.object3d = frame.object;

		super.update( frame );

	}

}

export default ModelNode;

/**
 * DSL object that represents the object's direction in world space.
 *
 * @dsl
 * @type {ModelNode<vec3>}
 */
export const modelDirection = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.DIRECTION );

/**
 * DSL object that represents the object's world matrix.
 *
 * @dsl
 * @type {ModelNode<mat4>}
 */
export const modelWorldMatrix = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.WORLD_MATRIX );

/**
 * DSL object that represents the object's position in world space.
 *
 * @dsl
 * @type {ModelNode<vec3>}
 */
export const modelPosition = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.POSITION );

/**
 * DSL object that represents the object's scale in world space.
 *
 * @dsl
 * @type {ModelNode<vec3>}
 */
export const modelScale = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.SCALE );

/**
 * DSL object that represents the object's position in view/camera space.
 *
 * @dsl
 * @type {ModelNode<vec3>}
 */
export const modelViewPosition = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.VIEW_POSITION );

/**
 * DSL object that represents the object's radius.
 *
 * @dsl
 * @type {ModelNode<float>}
 */
export const modelRadius = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.RADIUS );

/**
 * DSL object that represents the object's normal matrix.
 *
 * @dsl
 * @type {UniformNode<mat3>}
 */
export const modelNormalMatrix = /*@__PURE__*/ uniform( new Matrix3() ).onObjectUpdate( ( { object }, self ) => self.value.getNormalMatrix( object.matrixWorld ) );

/**
 * DSL object that represents the object's inverse world matrix.
 *
 * @dsl
 * @type {UniformNode<mat4>}
 */
export const modelWorldMatrixInverse = /*@__PURE__*/ uniform( new Matrix4() ).onObjectUpdate( ( { object }, self ) => self.value.copy( object.matrixWorld ).invert() );

/**
 * DSL object that represents the object's model view matrix.
 *
 * @dsl
 * @type {Node<mat4>}
 */
export const modelViewMatrix = /*@__PURE__*/ ( Fn( ( builder ) => {

	return builder.context.modelViewMatrix || mediumpModelViewMatrix;

} ).once() )().toVar( 'modelViewMatrix' );

// GPU Precision

/**
 * DSL object that represents the object's model view in `mediump` precision.
 *
 * @dsl
 * @type {Node<mat4>}
 */
export const mediumpModelViewMatrix = /*@__PURE__*/ cameraViewMatrix.mul( modelWorldMatrix );

// CPU Precision

/**
 * DSL object that represents the object's model view in `highp` precision
 * which is achieved by computing the matrix in JS and not in the shader.
 *
 * @dsl
 * @type {Node<mat4>}
 */
export const highpModelViewMatrix = /*@__PURE__*/ ( Fn( ( builder ) => {

	builder.context.isHighPrecisionModelViewMatrix = true;

	const camera = builder.camera;

	let highpModelViewMatrix;

	if ( camera.isArrayCamera && camera.cameras.length > 0 ) {

		const matrices = [];

		for ( let i = 0; i < camera.cameras.length; i ++ ) {

			matrices.push( new Matrix4() );

		}

		const modelViewMatrices = uniformArray( matrices ).onObjectUpdate( ( { object, camera }, self ) => {

			const subCameras = camera.cameras;
			const array = self.array;

			for ( let i = 0, l = subCameras.length; i < l; i ++ ) {

				array[ i ].multiplyMatrices( subCameras[ i ].matrixWorldInverse, object.matrixWorld );

			}

		} );

		highpModelViewMatrix = modelViewMatrices.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex );

	} else {

		highpModelViewMatrix = uniform( 'mat4' ).onObjectUpdate( ( { object, camera } ) => {

			return object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );

		} );

	}

	return highpModelViewMatrix;

} ).once() )().toVar( 'highpModelViewMatrix' );

/**
 * DSL object that represents the object's model normal view in `highp` precision
 * which is achieved by computing the matrix in JS and not in the shader.
 *
 * @dsl
 * @type {Node<mat3>}
 */
export const highpModelNormalViewMatrix = /*@__PURE__*/ ( Fn( ( builder ) => {

	const isHighPrecisionModelViewMatrix = builder.context.isHighPrecisionModelViewMatrix;

	const camera = builder.camera;

	let highpModelNormalViewMatrix;

	if ( camera.isArrayCamera && camera.cameras.length > 0 ) {

		const matrices = [];

		for ( let i = 0; i < camera.cameras.length; i ++ ) {

			matrices.push( new Matrix3() );

		}

		const normalViewMatrices = uniformArray( matrices ).onObjectUpdate( ( { object, camera }, self ) => {

			const subCameras = camera.cameras;
			const array = self.array;

			for ( let i = 0, l = subCameras.length; i < l; i ++ ) {

				_modelViewMatrix.multiplyMatrices( subCameras[ i ].matrixWorldInverse, object.matrixWorld );

				array[ i ].getNormalMatrix( _modelViewMatrix );

			}

		} );

		highpModelNormalViewMatrix = normalViewMatrices.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex );

	} else {

		highpModelNormalViewMatrix = uniform( 'mat3' ).onObjectUpdate( ( { object, camera } ) => {

			if ( isHighPrecisionModelViewMatrix !== true ) {

				object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );

			}

			return object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

		} );

	}

	return highpModelNormalViewMatrix;

} ).once() )().toVar( 'highpModelNormalViewMatrix' );
