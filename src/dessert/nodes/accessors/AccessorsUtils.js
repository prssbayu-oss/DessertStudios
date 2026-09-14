import { normalView } from './Normal.js';
import { tangentView } from './Tangent.js';
import { bitangentView } from './Bitangent.js';
import { Fn, mat3 } from '../dsl/DSLBase.js';
import { mix } from '../math/MathNode.js';
import { anisotropy, anisotropyB, roughness } from '../core/PropertyNode.js';
import { positionViewDirection } from './Position.js';

/**
 * DSL object that represents the TBN matrix in view space.
 *
 * @dsl
 * @type {Node<mat3>}
 */
export const TBNViewMatrix = /*@__PURE__*/ mat3( tangentView, bitangentView, normalView ).toVar( 'TBNViewMatrix' );

/**
 * DSL object that represents the parallax direction.
 *
 * @dsl
 * @type {Node<mat3>}
 */
export const parallaxDirection = /*@__PURE__*/ positionViewDirection.mul( TBNViewMatrix )/*.normalize()*/;

/**
 * DSL function for computing parallax uv coordinates.
 *
 * @dsl
 * @function
 * @param {Node<vec2>} uv - A uv node.
 * @param {Node<vec2>} scale - A scale node.
 * @returns {Node<vec2>} Parallax uv coordinates.
 */
export const parallaxUV = ( uv, scale ) => uv.sub( parallaxDirection.mul( scale ) );

/**
 * DSL function for computing bent normals.
 *
 * @dsl
 * @function
 * @returns {Node<vec3>} Bent normals.
 */
export const bentNormalView = /*@__PURE__*/ ( Fn( () => {

	// https://google.github.io/filament/Filament.md.html#lighting/imagebasedlights/anisotropy

	let bentNormal = anisotropyB.cross( positionViewDirection );
	bentNormal = bentNormal.cross( anisotropyB ).normalize();
	bentNormal = mix( bentNormal, normalView, anisotropy.mul( roughness.oneMinus() ).oneMinus().pow2().pow2() ).normalize();

	return bentNormal;

} ).once() )();
