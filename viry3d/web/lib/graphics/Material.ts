import { VRObject } from "../Object"
import { Matrix4x4 } from "../math/Matrix4x4"
import { Vector4 } from "../math/Vector4"
import { VRMap } from "../container/Map"
import { Vector } from "../container/Vector"
import { Shader } from "./Shader"
import { XMLVertexShader, XMLPixelShader } from "./XMLShader"
import { Color } from "./Color"
import { Texture } from "./Texture"
import { Texture2D } from "./Texture2D"
import { Graphics } from "./Graphics"

const MAIN_TEX_NAME = "_MainTex";
const MAIN_TEX_TILLING_OFFSET_NAME = "_MainTex_ST";
const MAIN_COLOR_NAME = "_Color";

export class Material extends VRObject {
	static Create(shader: Shader): Material {
		let mat = new Material();
		mat.SetName(shader.GetName());
		mat.m_shader = shader;

		return mat;
	}

	private constructor() {
		super();

		this.SetMainColor(new Color(1, 1, 1, 1));
		this.SetMainTextureTillingOffset(new Vector4(1, 1, 0, 0));
	}

	SetMatrix(name: string, v: Matrix4x4) {
		if(!this.m_matrices.Add(name, v)) {
			this.m_matrices.Set(name, v);
		}
	}

	GetMatrix(name: string): Matrix4x4 {
		return this.m_matrices.Get(name);
	}

	SetVector(name: string, v: Vector4) {
		if(!this.m_vectors.Add(name, v)) {
			this.m_vectors.Set(name, v);
		}
	}

	GetVector(name: string): Vector4 {
		return this.m_vectors.Get(name);
	}

	SetMainColor(v: Color) {
		this.SetColor(MAIN_COLOR_NAME, v);
	}

	GetMainColor(): Color {
		return this.GetColor(MAIN_COLOR_NAME);
	}

	SetColor(name: string, v: Color) {
		if(!this.m_colors.Add(name, v)) {
			this.m_colors.Set(name, v);
		}
	}

	GetColor(name: string): Color {
		return this.m_colors.Get(name);
	}

	SetVectorArray(name: string, v: Float32Array) {
		if(!this.m_vector_arrays.Add(name, v)) {
			this.m_vector_arrays.Set(name, v);
		}
	}

	GetVectorArray(name: string): Float32Array {
		return this.m_vector_arrays.Get(name);
	}

	SetMainTexture(v: Texture) {
		this.SetTexture(MAIN_TEX_NAME, v);
	}

	HasMainTexture(): boolean {
		return this.m_textures.Contains(MAIN_TEX_NAME);
	}

	GetMainTexture(): Texture {
		return this.GetTexture(MAIN_TEX_NAME);
	}

	SetTexture(name: string, v: Texture) {
		if(!this.m_textures.Add(name, v)) {
			this.m_textures.Set(name, v);
		}
	}

	GetTexture(name: string): Texture {
		return this.m_textures.Get(name);
	}

	SetMainTextureTillingOffset(v: Vector4) {
		this.SetVector(MAIN_TEX_TILLING_OFFSET_NAME, v);
	}

	GetMainTextureTillingOffset(): Vector4 {
		return this.GetVector(MAIN_TEX_TILLING_OFFSET_NAME);
	}

	UpdateUniforms(pass_index: number) { }

	UseProgram(pass_index: number) {
		let gl = Graphics.GetDisplay().GetGL();

		let shader = this.GetShader();
		let textures = this.m_textures;
		let xml = shader.GetXML();
		let xml_vs = xml.GetVertexShader(pass_index);
		let xml_ps = xml.GetPixelShader(pass_index);

		for(let i = 0; i < xml_ps.samplers.Size(); i++) {
			let sampler = xml_ps.samplers.Get(i);

			gl.activeTexture(gl.TEXTURE0 + i);

			let find = [<Texture>null];
			if(textures.TryGet(sampler.name, find)) {
				if(sampler.type == "2D") {
					gl.bindTexture(gl.TEXTURE_2D, find[0].GetTexture());
				}
			} else {
				if(sampler.type == "2D") {
					let texture = Texture2D.GetDefaultTexture2D();
					gl.bindTexture(gl.TEXTURE_2D, texture.GetTexture());
				}
			}

			gl.uniform1i(sampler.location, i);
		}

		this.m_matrices.ForEach((k, v) => {
			xml_vs.uniforms.ForEach((i) => {
				if(i.name == k) {
					gl.uniformMatrix4fv(i.location, false, v.m);
					return false;
				}
				return true;
			});

			xml_ps.uniforms.ForEach((i) => {
				if(i.name == k) {
					gl.uniformMatrix4fv(i.location, false, v.m);
					return false;
				}
				return true;
			});

			return true;	
		});

		this.m_vectors.ForEach((k, v) => {
			this.SetUniform4fv(k, xml_vs, xml_ps, v.array);

			return true;
		});

		this.m_vector_arrays.ForEach((k, v) => {
			this.SetUniform4fv(k, xml_vs, xml_ps, v);

			return true;
		});

		this.m_colors.ForEach((k, v) => {
			this.SetUniform4fv(k, xml_vs, xml_ps, v.array);

			return true;
		});
	}

	private SetUniform4fv(name: string, xml_vs: XMLVertexShader, xml_ps: XMLPixelShader, v: Float32Array) {
		let gl = Graphics.GetDisplay().GetGL();

		xml_vs.uniforms.ForEach((i) => {
			if(i.name == name) {
				gl.uniform4fv(i.location, v);
				return false;
			}
			return true;
		});

		xml_ps.uniforms.ForEach((i) => {
			if(i.name == name) {
				gl.uniform4fv(i.location, v);
				return false;
			}
			return true;
		});
	}

	GetShader(): Shader {
		return this.m_shader;
	}

	SetShader(shader: Shader) {
		this.m_shader = shader;
	}

	DeepCopy(source: VRObject) {
		super.DeepCopy(source);

		let src = <Material>(source);
		this.m_matrices.Clear();
		this.m_vectors.Clear();
		this.m_vector_arrays.Clear();
		this.m_colors.Clear();

		src.m_matrices.ForEach((k, v) => {
			let mat = new Matrix4x4();
			mat.Set(v);
			this.m_matrices.Add(k, mat);
			return true;
		});

		src.m_vectors.ForEach((k, v) => {
			let vec = new Vector4();
			vec.Set(v);
			this.m_vectors.Add(k, vec);
			return true;
		});

		src.m_colors.ForEach((k, v) => {
			let col = new Color();
			col.Set(v);
			this.m_colors.Add(k, col);
			return true;
		});

		src.m_vector_arrays.ForEach((k, v) => {
			let arr = new Float32Array(v.length);
			arr.set(v);
			this.m_vector_arrays.Add(k, arr);
			return true;
		});

		this.m_textures.Copy(src.m_textures);
	}

	private m_shader: Shader;
	private m_matrices = new VRMap<string, Matrix4x4>();
	private m_vectors = new VRMap<string, Vector4>();
	private m_vector_arrays = new VRMap<string, Float32Array>();
	private m_colors = new VRMap<string, Color>();
	private m_textures = new VRMap<string, Texture>();
}