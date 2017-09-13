import { Vector } from "../container/Vector"

export class XMLPass {
	name: string;
	vs: string;
	ps: string;
	rs: string;
}

export class XMLUniform {
	name: string;
	size: number;
	location: WebGLUniformLocation;
}

export enum VertexAttributeType {
	None = -1,

	Vertex = 0,
	Color,
	Texcoord,
	Texcoord2,
	Normal,
	Tangent,
	BlendWeight,
	BlendIndices,

	Count
};

let VERTEX_ATTR_TYPES = [
	"Vertex",
	"Color",
	"Texcoord",
	"Texcoord2",
	"Normal",
	"Tangent",
	"BlendWeight",
	"BlendIndices"
];

export class XMLVertexAttribute {
	type_name: string;
	name: string;
	type: VertexAttributeType;
	size: number;
	location: number;
}

export class XMLSampler {
	name: string;
	type: string;
	location: WebGLUniformLocation;
}

export class XMLInclude {
	name: string;
	src: string;
}

export class XMLVertexShader {
	name: string;
	uniforms = new Vector<XMLUniform>();
	attrs = new Vector<XMLVertexAttribute>();
	includes = new Vector<XMLInclude>();
	src: string;
	vertex_layout_mask: number;
	stride: number;
}

export class XMLPixelShader {
	name: string;
	uniforms = new Vector<XMLUniform>();
	samplers = new Vector<XMLSampler>();
	includes = new Vector<XMLInclude>();
	src: string;
}

export class XMLBlend {
	enable = false;
	src: string;
	dst: string;
	src_a: string;
	dst_a: string;
}

export class XMLOffset {
	enable = false;
	factor: number;
	units: number;
}

export class XMLStencil {
	enable = false;
	RefValue = 0;
	ReadMask = 255;
	WriteMask = 255;
	Comp = "Always";
	Pass = "Keep";
	Fail = "Keep";
	ZFail ="Keep";
}

export class XMLRenderState {
	name: string;
	Cull = "Back";
	ZTest = "LEqual";
	ZWrite = "On";
	AlphaTest = "Off";
	ColorMask = "RGBA";
	Blend = new XMLBlend();
	Offset = new XMLOffset();
	Stencil = new XMLStencil();
}

export class XMLShader {
	Load(xml: XMLDocument) {
		let shader_ele = xml.documentElement;

		this.name = shader_ele.getAttribute("name");
		let shader_queue = shader_ele.getAttribute("queue");

		if(shader_queue == "Background") {
			this.queue = 1000;
		} else if(shader_queue == "Geometry") {
			this.queue = 2000;
		} else if(shader_queue == "AlphaTest") {
			this.queue = 2450;
		} else if(shader_queue == "Transparent") {
			this.queue = 3000;
		} else if(shader_queue == "Overlay") {
			this.queue = 4000;
		}

		for(let node = shader_ele.firstElementChild; node; node = node.nextElementSibling) {
			let type = node.nodeName;
			let name = node.getAttribute("name");

			if(type == "Pass") {
				let pass = new XMLPass();
				pass.name = name;

				pass.vs = node.getAttribute("vs");
				pass.ps = node.getAttribute("ps");
				pass.rs = node.getAttribute("rs");

				this.passes.Add(pass);
			} else if(type == "VertexShader") {
				let vs = new XMLVertexShader();
				vs.name = name;

				const attr_sizes = [
					12, 16, 8, 8, 12, 16, 16, 16
				];
				let attr_offset = 0;
				let layout_mask = 0;
				let attr_index = 0;

				for(let vs_node = node.firstElementChild; vs_node; vs_node = vs_node.nextElementSibling) {
					let vs_type = vs_node.nodeName;

					if(vs_type == "Uniform") {
						let uniform = new XMLUniform();
						uniform.name = vs_node.getAttribute("name");
						uniform.size = parseInt(vs_node.getAttribute("size"));
						
						vs.uniforms.Add(uniform);
					} else if(vs_type == "VertexAttribute") {
						let attr = new XMLVertexAttribute();
						attr.type_name = vs_node.getAttribute("type");
						attr.name = vs_node.getAttribute("name");

						for(let i = 0; i < VertexAttributeType.Count; i++) {
							if(attr.type_name == VERTEX_ATTR_TYPES[i]) {
								attr.type = <VertexAttributeType>i;
								attr.size = attr_sizes[i];

								attr_offset += attr.size;
								layout_mask |= (i + 1) << (attr_index * 4);
								attr_index++;

								break;
							}
						}

						vs.attrs.Add(attr);
					} else if(vs_type == "Include") {
						let inc = new XMLInclude();
						inc.name = vs_node.getAttribute("name");
						inc.src = null;
						vs.includes.Add(inc);
					} else if(vs_type == "Source") {
						vs.src = vs_node.textContent;
					}
				}

				vs.vertex_layout_mask = layout_mask;
				vs.stride = attr_offset;

				this.vss.Add(vs);
			} else if(type == "PixelShader") {
				let ps = new XMLPixelShader();
				ps.name = name;

				for(let ps_node = node.firstElementChild; ps_node; ps_node = ps_node.nextElementSibling) {
					let ps_type = ps_node.nodeName;

					if(ps_type == "Uniform") {
						let uniform = new XMLUniform();
						uniform.name = ps_node.getAttribute("name");
						uniform.size = parseInt(ps_node.getAttribute("size"));

						ps.uniforms.Add(uniform);
					} else if(ps_type == "Include") {
						let inc = new XMLInclude();
						inc.name = ps_node.getAttribute("name");
						inc.src = null;
						ps.includes.Add(inc);
					} else if(ps_type == "Source") {
						ps.src = ps_node.textContent;
					} else if(ps_type == "Sampler") {
						let sampler = new XMLSampler();
						sampler.name = ps_node.getAttribute("name");
						sampler.type = ps_node.getAttribute("type");

						ps.samplers.Add(sampler);
					}
				}

				this.pss.Add(ps);
			} else if(type == "RenderState") {
				let rs = new XMLRenderState();
				rs.name = name;

				for(let rs_node = node.firstElementChild; rs_node; rs_node = rs_node.nextElementSibling) {
					let rs_type = rs_node.nodeName;

					if(rs_type == "Cull") {
						rs.Cull = rs_node.getAttribute("value");
					} else if(rs_type == "ZTest") {
						rs.ZTest = rs_node.getAttribute("value");
					} else if(rs_type == "ZWrite") {
						rs.ZWrite = rs_node.getAttribute("value");
					} else if(rs_type == "AlphaTest") {
						rs.AlphaTest = rs_node.getAttribute("value");
					} else if(rs_type == "ColorMask") {
						rs.ColorMask = rs_node.getAttribute("value");
					} else if(rs_type == "Blend") {
						rs.Blend.enable = true;
						let enable = rs_node.getAttribute("enable");
						if(enable == "Off") {
							rs.Blend.enable = false;
						}
						if(rs.Blend.enable) {
							rs.Blend.src = rs_node.getAttribute("src");
							rs.Blend.dst = rs_node.getAttribute("dst");
							rs.Blend.src_a = rs_node.getAttribute("src_a");
							rs.Blend.dst_a = rs_node.getAttribute("dst_a");

							if(rs.Blend.src_a == null) {
								rs.Blend.src_a = rs.Blend.src;
							}
							if(rs.Blend.dst_a == null) {
								rs.Blend.dst_a = rs.Blend.dst;
							}
						}
					} else if(rs_type == "Offset") {
						rs.Offset.enable = true;

						let factor = rs_node.getAttribute("factor");
						if(factor != null) {
							rs.Offset.factor = parseFloat(factor);
						}

						let units = rs_node.getAttribute("units");
						if(units != null) {
							rs.Offset.units = parseFloat(units);
						}
					} else if(rs_type == "Stencil") {
						rs.Stencil.enable = true;

						let RefValue = rs_node.getAttribute("RefValue");
						if(RefValue != null) {
							rs.Stencil.RefValue = parseInt(RefValue);
						}

						let ReadMask = rs_node.getAttribute("ReadMask");
						if(ReadMask != null) {
							rs.Stencil.ReadMask = parseInt(ReadMask);
						}

						let WriteMask = rs_node.getAttribute("WriteMask");
						if(WriteMask != null) {
							rs.Stencil.WriteMask = parseInt(WriteMask);
						}

						let Comp = rs_node.getAttribute("Comp");
						if(Comp != null) {
							rs.Stencil.Comp = Comp;
						}

						let Pass = rs_node.getAttribute("Pass");
						if(Pass != null) {
							rs.Stencil.Pass = Pass;
						}

						let Fail = rs_node.getAttribute("Fail");
						if(Fail != null) {
							rs.Stencil.Fail = Fail;
						}

						let ZFail = rs_node.getAttribute("ZFail");
						if(ZFail != null) {
							rs.Stencil.ZFail = ZFail;
						}
					}
				}

				this.rss.Add(rs);
			}
		}
	}

	GetVertexShader(pass: number): XMLVertexShader {
		let name = this.passes.Get(pass).vs;

		for(let i = 0; i < this.vss.Size(); i++) {
			let vs = this.vss.Get(i);
			if(vs.name == name) {
				return vs;
			}
		}
		
		return null;
	}

	GetPixelShader(pass: number): XMLPixelShader {
		let name = this.passes.Get(pass).ps;

		for(let i = 0; i < this.pss.Size(); i++) {
			let ps = this.pss.Get(i);
			if(ps.name == name) {
				return ps;
			}
		}

		return null;
	}

	GetRenderState(pass: number): XMLRenderState {
		let name = this.passes.Get(pass).rs;

		for(let i = 0; i < this.rss.Size(); i++) {
			let rs = this.rss.Get(i);
			if(rs.name == name) {
				return rs;
			}
		}

		return null;
	}

	name: string;
	queue: number;
	passes = new Vector<XMLPass>();
	vss = new Vector<XMLVertexShader>();
	pss = new Vector<XMLPixelShader>();
	rss = new Vector<XMLRenderState>();
}