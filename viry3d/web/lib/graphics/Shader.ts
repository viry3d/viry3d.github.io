import { VRObject } from "../Object"
import { VRString } from "../string/String"
import { Matrix4x4 } from "../math/Matrix4x4"
import { VRMap } from "../container/Map"
import { Vector } from "../container/Vector"
import { File } from "../io/File"
import { XMLShader, XMLPass, XMLRenderState, XMLInclude, XMLVertexShader } from "./XMLShader"
import { Graphics } from "./Graphics"
import { RenderPass } from "./RenderPass"

class GLRenderState {
	offset_enable = false;			//	GL_POLYGON_OFFSET_FILL
	offset_factor = 0.0;		//	glPolygonOffset
	offset_units = 0.0;
	cull_enable = false;			//	GL_CULL_FACE
	cull_face = 0;			//	glCullFace
	color_mask_r = false;		//	glColorMask
	color_mask_g = false;
	color_mask_b = false;
	color_mask_a = false;
	blend_enable = false;			//	GL_BLEND
	blend_src_c = 0;			//	glBlendFuncSeparate
	blend_dst_c = 0;
	blend_src_a = 0;
	blend_dst_a = 0;
	depth_mask = false;		//	glDepthMask
	depth_func = 0;			//	glDepthFunc	
	stencil_enable = false;		//	GL_STENCIL_TEST
	stencil_func = 0;		//	glStencilFunc
	stencil_ref = 0;
	stencil_read_mask = 0;
	stencil_write_mask = 0;	//	glStencilMask
	stencil_op_fail = 0;		//	glStencilOp
	stencil_op_zfail = 0;
	stencil_op_pass = 0;
};

const g_shader_header =
	"#define VR_GLES 1\n";

function combine_shader_src(includes: Vector<XMLInclude>, src: string): string {
	let source = g_shader_header;

	includes.ForEach((i) => {
		source += i.src + "\n";
		return true;
	});

	source += src;

	return source;
}

function create_shader(type: number, src: string): WebGLShader {
	let gl = Graphics.GetDisplay().GetGL();

	let shader = gl.createShader(type);

	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if(!success) {
		let log = gl.getShaderInfoLog(shader);
		console.log(log);

		gl.deleteShader(shader);
		shader = null;
	}

	return shader;
}

function create_program(vs: WebGLShader, ps: WebGLShader): WebGLProgram {
	let gl = Graphics.GetDisplay().GetGL();

	let program = gl.createProgram();

	gl.attachShader(program, vs);
	gl.attachShader(program, ps);

	gl.linkProgram(program);

	let success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if(!success) {
		let log = gl.getProgramInfoLog(program);
		console.log(log);

		gl.deleteProgram(program);
		program = null;
	}

	return program;
}

function prepare_pipeline(pass: XMLPass, xml: XMLShader, shader_pass: ShaderPass) {
	let gl = Graphics.GetDisplay().GetGL();

	let program = shader_pass.program;

	xml.vss.ForEach((i) => {
		if(i.name == pass.vs) {
			i.uniforms.ForEach((j) => {
				j.location = gl.getUniformLocation(program, j.name);
				return true;
			});

			i.attrs.ForEach((j) => {
				j.location = gl.getAttribLocation(program, j.name);
				return true;
			});

			return false;
		}
		
		return true;
	});

	xml.pss.ForEach((i) => {
		if(i.name == pass.ps) {
			i.uniforms.ForEach((j) => {
				j.location = gl.getUniformLocation(program, j.name);
				return true;
			});

			i.samplers.ForEach((j) => {
				j.location = gl.getUniformLocation(program, j.name);
				return true;
			});

			return false;
		}

		return true;
	});

	let prs: XMLRenderState = null;
	xml.rss.ForEach((i) => {
		if(i.name == pass.rs) {
			prs = i;
			return false;
		}

		return true;
	});

	let state = shader_pass.render_state;

	state.offset_enable = prs.Offset.enable;
	if(prs.Offset.enable) {
		state.offset_factor = prs.Offset.factor;
		state.offset_units = prs.Offset.units;
	}

	if(prs.Cull == "Off") {
		state.cull_enable = false;
	} else {
		state.cull_enable = true;

		if(prs.Cull == "Back") {
			state.cull_face = gl.BACK;
		} else if(prs.Cull == "Front") {
			state.cull_face = gl.FRONT;
		}
	}

	{
		state.color_mask_r = false;
		state.color_mask_g = false;
		state.color_mask_b = false;
		state.color_mask_a = false;

		let mask = new VRString(prs.ColorMask);

		if(mask.Contains("R")) {
			state.color_mask_r = true;
		}
		if(mask.Contains("G")) {
			state.color_mask_g = true;
		}
		if(mask.Contains("B")) {
			state.color_mask_b = true;
		}
		if(mask.Contains("A")) {
			state.color_mask_a = true;
		}
	}

	state.blend_enable = prs.Blend.enable;
	if(prs.Blend.enable) {
		const strs = [
			"One",
			"Zero",
			"SrcColor",
			"SrcAlpha",
			"DstColor",
			"DstAlpha",
			"OneMinusSrcColor",
			"OneMinusSrcAlpha",
			"OneMinusDstColor",
			"OneMinusDstAlpha"
		];
		const values = [
			gl.ONE,
			gl.ZERO,
			gl.SRC_COLOR,
			gl.SRC_ALPHA,
			gl.DST_COLOR,
			gl.DST_ALPHA,
			gl.ONE_MINUS_SRC_COLOR,
			gl.ONE_MINUS_SRC_ALPHA,
			gl.ONE_MINUS_DST_COLOR,
			gl.ONE_MINUS_DST_ALPHA
		];

		const count = values.length;
		for(let i = 0; i < count; i++) {
			if(prs.Blend.src == strs[i]) {
				state.blend_src_c = values[i];
			}

			if(prs.Blend.dst == strs[i]) {
				state.blend_dst_c = values[i];
			}

			if(prs.Blend.src_a == strs[i]) {
				state.blend_src_a = values[i];
			}

			if(prs.Blend.dst_a == strs[i]) {
				state.blend_dst_a = values[i];
			}
		}
	}
	
	state.depth_mask = prs.ZWrite == "On" ? true : false;

	{
		const strs = [
			"Less",
			"Greater",
			"LEqual",
			"GEqual",
			"Equal",
			"NotEqual",
			"Always"
		];
		const values = [
			gl.LESS,
			gl.GREATER,
			gl.LEQUAL,
			gl.GEQUAL,
			gl.EQUAL,
			gl.NOTEQUAL,
			gl.ALWAYS
		];

		const count = values.length;
		for(let i = 0; i < count; i++) {
			if(prs.ZTest == strs[i]) {
				state.depth_func = values[i];
				break;
			}
		}
	}

	state.stencil_enable = prs.Stencil.enable;
	if(prs.Stencil.enable) {
		state.stencil_ref = prs.Stencil.RefValue;
		state.stencil_read_mask = prs.Stencil.ReadMask;
		state.stencil_write_mask = prs.Stencil.WriteMask;

		{
			const strs = [
				"Less",
				"Greater",
				"LEqual",
				"GEqual",
				"Equal",
				"NotEqual",
				"Always",
				"Never"
			];
			const values = [
				gl.LESS,
				gl.GREATER,
				gl.LEQUAL,
				gl.GEQUAL,
				gl.EQUAL,
				gl.NOTEQUAL,
				gl.ALWAYS,
				gl.NEVER
			];

			const count = values.length;
			for(let i = 0; i < count; i++) {
				if(prs.Stencil.Comp == strs[i]) {
					state.stencil_func = values[i];
					break;
				}
			}
		}

		{
			const strs = [
				"Keep",
				"Zero",
				"Replace",
				"IncrSat",
				"DecrSat",
				"Invert",
				"IncrWrap",
				"DecrWrap"
			];
			const values = [
				gl.KEEP,
				gl.ZERO,
				gl.REPLACE,
				gl.INCR,
				gl.DECR,
				gl.INVERT,
				gl.INCR_WRAP,
				gl.DECR_WRAP,
			];

			const count = values.length;
			for(let i = 0; i < count; i++) {
				if(prs.Stencil.Pass == strs[i]) {
					state.stencil_op_pass = values[i];
				}

				if(prs.Stencil.Fail == strs[i]) {
					state.stencil_op_fail = values[i];
				}

				if(prs.Stencil.ZFail == strs[i]) {
					state.stencil_op_zfail = values[i];
				}
			}
		}
	}
}

export class ShaderPass {
	name: string;
	program: WebGLProgram;
	render_state = new GLRenderState();
}

export class Shader extends VRObject {
	static Find(name: string, finish: (shader: Shader) => void, bundle: any): Shader {
		let shader_path = "Assets/shader/" + name + ".shader.xml";

		if(VRObject.IsLoading(shader_path)) {
			VRObject.WatchLoad(shader_path, (obj) => {
				if(finish) {
					finish(<Shader>obj);
				}
			});
			return null;
		}

		let find = VRObject.GetCache(shader_path);
		if(find) {
			if(bundle == null) {
				finish(<Shader>find);
			} else {
				return <Shader>find;
			}
		} else {
			if(bundle == null) {
				VRObject.BeginLoad(shader_path);

				File.ReadXml(shader_path, (xml: any) => {
					if(xml != null) {
						let shader = new Shader(name);
						shader.m_xml.Load(xml);

						let includes = new Vector<XMLInclude>();

						shader.m_xml.vss.ForEach((i) => {
							includes.AddRange(i.includes.toArray());
							return true;
						});
						shader.m_xml.pss.ForEach((i) => {
							includes.AddRange(i.includes.toArray());
							return true;
						});

						// check includes
						let check_includes = function () {
							let done = true;
							includes.ForEach((i) => {
								if(i.src == null) {
									done = false;
									return false;
								}
								return true;
							});

							if(done) {
								shader.Compile();

								VRObject.AddCache(shader_path, shader);
								VRObject.EndLoad(shader_path);

								finish(shader);
							}
						}

						// load includes
						includes.ForEach((i) => {
							File.ReadAllText("Assets/shader/Include/" + i.name, (text) => {
								i.src = text;

								check_includes();
							});
							return true;
						});
					}
				});
			} else {
				let ms = bundle.GetAssetData(shader_path);
				let xml_str = ms.ReadString(ms.GetSize());
				let xml = new DOMParser().parseFromString(xml_str, "text/xml");
				if(xml != null) {
					let shader = new Shader(name);
					shader.m_xml.Load(xml);

					let includes = new Vector<XMLInclude>();

					shader.m_xml.vss.ForEach((i) => {
						includes.AddRange(i.includes.toArray());
						return true;
					});
					shader.m_xml.pss.ForEach((i) => {
						includes.AddRange(i.includes.toArray());
						return true;
					});

					includes.ForEach((i) => {
						let ms_include = bundle.GetAssetData("Assets/shader/Include/" + i.name);
						i.src = ms_include.ReadString(ms_include.GetSize());
						return true;
					});

					shader.Compile();

					VRObject.AddCache(shader_path, shader);

					return shader;
				}
			}
		}

		return null;
	}

	private constructor(name: string) {
		super();

		this.SetName(name);
	}

	private Compile() {
		this.CreateShaders();
		this.CreatePasses();
	}

	private CreateShaders() {
		let gl = Graphics.GetDisplay().GetGL();
		
		let xml = this.m_xml;

		xml.vss.ForEach((i) => {
			let source = combine_shader_src(i.includes, i.src);
			let shader = create_shader(gl.VERTEX_SHADER, source);
			this.m_vertex_shaders.Add(i.name, shader);
			return true;
		});

		xml.pss.ForEach((i) => {
			let source = combine_shader_src(i.includes, i.src);
			let shader = create_shader(gl.FRAGMENT_SHADER, source);
			this.m_pixel_shaders.Add(i.name, shader);
			return true;
		});
	}

	private CreatePasses() {
		let xml = this.m_xml;

		xml.passes.ForEach((i) => {
			let pass = new ShaderPass();
			pass.name = i.name;
			pass.program = create_program(this.m_vertex_shaders.Get(i.vs), this.m_pixel_shaders.Get(i.ps));

			prepare_pipeline(i, xml, pass);

			this.m_passes.Add(pass);
			return true;
		});
	}

	PreparePass(pass_index: number) { }

	BeginPass(pass_index: number) {
		let gl = Graphics.GetDisplay().GetGL();

		let rs = this.m_passes.Get(pass_index).render_state;
		if(rs.offset_enable) {
			gl.enable(gl.POLYGON_OFFSET_FILL);
			gl.polygonOffset(rs.offset_factor, rs.offset_units);
		} else {
			gl.disable(gl.POLYGON_OFFSET_FILL);
		}

		if(rs.cull_enable) {
			gl.enable(gl.CULL_FACE);
			gl.cullFace(rs.cull_face);
		} else {
			gl.disable(gl.CULL_FACE);
		}

		gl.colorMask(rs.color_mask_r, rs.color_mask_g, rs.color_mask_b, rs.color_mask_a);

		if(rs.blend_enable) {
			gl.enable(gl.BLEND);
			gl.blendFuncSeparate(rs.blend_src_c, rs.blend_dst_c, rs.blend_src_a, rs.blend_dst_a);
		} else {
			gl.disable(gl.BLEND);
		}

		gl.depthMask(rs.depth_mask);
		gl.depthFunc(rs.depth_func);

		if(rs.stencil_enable) {
			gl.enable(gl.STENCIL_TEST);
			gl.stencilFunc(rs.stencil_func, rs.stencil_ref, rs.stencil_read_mask);
			gl.stencilMask(rs.stencil_write_mask);
			gl.stencilOp(rs.stencil_op_fail, rs.stencil_op_zfail, rs.stencil_op_pass);
		} else {
			gl.disable(gl.STENCIL_TEST);
		}

		let width = RenderPass.GetRenderPassBinding().GetFrameBufferWidth();
		let height = RenderPass.GetRenderPassBinding().GetFrameBufferHeight();
		let rect = RenderPass.GetRenderPassBinding().GetRect();

		let viewport_x = rect.x * width;
		let viewport_y = rect.y * height;
		let viewport_width = rect.width * width;
		let viewport_height = rect.height * height;

		gl.viewport(viewport_x, viewport_y, viewport_width, viewport_height);

		gl.useProgram(this.m_passes.Get(pass_index).program);
	}

	EndPass(pass_index: number) { }

	BindMaterial(pass_index: number, material: any) {
		material.UseProgram(pass_index);
	}

	PushWorldMatrix(pass_index: number, matrix: Matrix4x4) {
		let gl = Graphics.GetDisplay().GetGL();

		let xml_vs = this.m_xml.GetVertexShader(pass_index);

		xml_vs.uniforms.ForEach((i) => {
			if(i.name == "_World") {
				gl.uniformMatrix4fv(i.location, false, matrix.m);
				return false;
			}
			return true;
		});
	}

	GetPassCount(): number {
		return this.m_xml.passes.Size();
	}

	GetVertexLayoutMask(): number {
		return this.m_xml.vss.Get(0).vertex_layout_mask;
	}

	GetQueue(): number {
		return this.m_xml.queue;
	}

	GetXML(): XMLShader {
		return this.m_xml;
	}

	private m_xml = new XMLShader();
	private m_vertex_shaders = new VRMap<string, WebGLShader>();
	private m_pixel_shaders = new VRMap<string, WebGLShader>();
	private m_passes = new Vector<ShaderPass>();
}