import Node from './Node.js';
import { nodeImmutable, nodeObject } from '../dsl/DSLCore.js';
import { hashString } from './NodeUtils.js';

/**
 * This class represents a shader property. It can be used
 * to explicitly define a property and assign a value to it.
 *
 * ```js
 * const threshold = property( 'float', 'threshold' ).assign( THRESHOLD );
 *```
 * `PropertyNode` is used by the engine to predefined common material properties
 * for DSL code.
 *
 * @augments Node
 */
class PropertyNode extends Node {

	static get type() {

		return 'PropertyNode';

	}

	/**
	 * Constructs a new property node.
	 *
	 * @param {string} nodeType - The type of the node.
	 * @param {?string} [name=null] - The name of the property in the shader.
	 * @param {boolean} [varying=false] - Whether this property is a varying or not.
	 * @param {?Node} [placeholderNode=null] - The placeholder node if not assigned.
	 */
	constructor( nodeType, name = null, varying = false, placeholderNode = null ) {

		super( nodeType );

		/**
		 * The name of the property in the shader. If no name is defined,
		 * the node system auto-generates one.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.name = name;

		/**
		 * Whether this property is a varying or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.varying = varying;

		/**
		 * The placeholder node of the property if it is not assigned.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.placeholderNode = nodeObject( placeholderNode );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPropertyNode = true;

		/**
		 * This flag is used for global cache.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.global = true;

	}

	getNodeType( builder ) {

		const nodeType = super.getNodeType( builder );

		if ( nodeType === 'output' ) {

			return builder.getOutputType();

		}

		return nodeType;

	}

	customCacheKey() {

		return hashString( this.type + ':' + ( this.name || '' ) + ':' + ( this.varying ? '1' : '0' ) );

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	generate( builder ) {

		let nodeVar;

		if ( this.varying === true ) {

			nodeVar = builder.getVaryingFromNode( this, this.name );
			nodeVar.needsInterpolation = true;

		} else {

			nodeVar = builder.getVarFromNode( this, this.name );

			if ( this.placeholderNode !== null ) {

				if ( builder.hasWriteUsage( this ) === false ) {

					const snippet = this.placeholderNode.build( builder, this.getNodeType( builder ) );

					builder.addLineFlowCode( `${ builder.getPropertyName( nodeVar ) } = ${ snippet }`, this );

				}

			}

		}

		return builder.getPropertyName( nodeVar );

	}

}

export default PropertyNode;

/**
 * DSL function for creating a property node.
 *
 * @dsl
 * @function
 * @param {string} type - The type of the node.
 * @param {?string} [name=null] - The name of the property in the shader.
 * @param {?Node} [placeholderNode=null] - The placeholder node if not assigned.
 * @returns {PropertyNode}
 */
export const property = ( type, name, placeholderNode = null ) => new PropertyNode( type, name, false, placeholderNode );

/**
 * DSL function for creating a varying property node.
 *
 * @dsl
 * @function
 * @param {string} type - The type of the node.
 * @param {?string} [name=null] - The name of the varying in the shader.
 * @param {?Node} [placeholderNode=null] - The placeholder node if not assigned.
 * @returns {PropertyNode}
 */
export const varyingProperty = ( type, name, placeholderNode = null ) => new PropertyNode( type, name, true, placeholderNode );

/**
 * DSL object that represents the shader variable `DiffuseColor`.
 *
 * @dsl
 * @type {PropertyNode<vec4>}
 */
export const diffuseColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec4', 'DiffuseColor' );

/**
 * DSL object that represents the shader variable `DiffuseContribution`.
 *
 * @dsl
 * @type {PropertyNode<vec3>}
 */
export const diffuseContribution = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'DiffuseContribution' );

/**
 * DSL object that represents the shader variable `DiffuseRoughness`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const diffuseRoughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'DiffuseRoughness' );

/**
 * DSL object that represents the shader variable `EmissiveColor`.
 *
 * @dsl
 * @type {PropertyNode<vec3>}
 */
export const emissive = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'EmissiveColor' );

/**
 * DSL object that represents the shader variable `Roughness`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const roughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Roughness' );

/**
 * DSL object that represents the shader variable `Metalness`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const metalness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Metalness' );

/**
 * DSL object that represents the shader variable `Clearcoat`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const clearcoat = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Clearcoat' );

/**
 * DSL object that represents the shader variable `ClearcoatRoughness`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const clearcoatRoughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'ClearcoatRoughness' );

/**
 * DSL object that represents the shader variable `Sheen`.
 *
 * @dsl
 * @type {PropertyNode<vec3>}
 */
export const sheen = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'Sheen' );

/**
 * DSL object that represents the shader variable `SheenRoughness`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const sheenRoughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'SheenRoughness' );

/**
 * DSL object that represents the shader variable `Iridescence`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const iridescence = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Iridescence' );

/**
 * DSL object that represents the shader variable `IridescenceIOR`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const iridescenceIOR = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IridescenceIOR' );

/**
 * DSL object that represents the shader variable `IridescenceThickness`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const iridescenceThickness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IridescenceThickness' );

/**
 * DSL object that represents the shader variable `AlphaT`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const alphaT = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'AlphaT' );

/**
 * DSL object that represents the shader variable `Anisotropy`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const anisotropy = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Anisotropy' );

/**
 * DSL object that represents the shader variable `AnisotropyT`.
 *
 * @dsl
 * @type {PropertyNode<vec3>}
 */
export const anisotropyT = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'AnisotropyT' );

/**
 * DSL object that represents the shader variable `AnisotropyB`.
 *
 * @dsl
 * @type {PropertyNode<vec3>}
 */
export const anisotropyB = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'AnisotropyB' );

/**
 * DSL object that represents the shader variable `SpecularColor`.
 *
 * @dsl
 * @type {PropertyNode<color>}
 */
export const specularColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'color', 'SpecularColor' );

/**
 * DSL object that represents the shader variable `SpecularColorBlended`.
 *
 * @dsl
 * @type {PropertyNode<color>}
 */
export const specularColorBlended = /*@__PURE__*/ nodeImmutable( PropertyNode, 'color', 'SpecularColorBlended' );

/**
 * DSL object that represents the shader variable `SpecularF90`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const specularF90 = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'SpecularF90' );

/**
 * DSL object that represents the shader variable `Shininess`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const shininess = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Shininess' );

/**
 * DSL object that represents the shader variable `Output`.
 *
 * @dsl
 * @type {PropertyNode<vec4>}
 */
export const output = /*@__PURE__*/ nodeImmutable( PropertyNode, 'output', 'Output' );

/**
 * DSL object that represents the shader variable `dashSize`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const dashSize = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'dashSize' );

/**
 * DSL object that represents the shader variable `gapSize`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const gapSize = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'gapSize' );

/**
 * DSL object that represents the shader variable `pointWidth`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const pointWidth = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'pointWidth' );

/**
 * DSL object that represents the shader variable `IOR`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const ior = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IOR' );

/**
 * DSL object that represents the shader variable `Transmission`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const transmission = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Transmission' );

/**
 * DSL object that represents the shader variable `Thickness`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const thickness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Thickness' );

/**
 * DSL object that represents the shader variable `AttenuationDistance`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const attenuationDistance = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'AttenuationDistance' );

/**
 * DSL object that represents the shader variable `AttenuationColor`.
 *
 * @dsl
 * @type {PropertyNode<color>}
 */
export const attenuationColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'color', 'AttenuationColor' );

/**
 * DSL object that represents the shader variable `Dispersion`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const dispersion = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Dispersion' );

/**
 * DSL object that represents the shader variable `Retroreflectivity`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const retroreflectivity = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Retroreflectivity' );

/**
 * DSL object that represents the shader variable `AmbientOcclusion`.
 * If no value is assigned to this property, it defaults to a placeholder value of `1.0`.
 *
 * @dsl
 * @type {PropertyNode<float>}
 */
export const ambientOcclusion = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'AmbientOcclusion', false, 1 );
