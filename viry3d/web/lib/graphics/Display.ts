import { VertexBuffer } from "./VertexBuffer"
import { Shader } from "./Shader"
import { IndexBuffer, IndexType } from "./IndexBuffer"
import { Vector } from "../container/Vector"
import { Input } from "../Input"

export class Display {
	Init(width: number, height: number, fps: number) {
		this.m_width = width;
		this.m_height = height;
		this.m_fps = fps;

		let context_attributes: WebGLContextAttributes = {
			alpha: false,
			depth: true,
			stencil: true,
			antialias: false,
		};
		let canvas = (<HTMLCanvasElement>document.getElementById('canvas'));
		canvas.width = this.m_width;
		canvas.height = this.m_height;

		let gl = canvas.getContext("webgl", context_attributes) || canvas.getContext("experimental-webgl", context_attributes);
		this.m_gl_context = gl;

		gl.clearDepth(1.0);
		gl.clearStencil(0);
		gl.frontFace(gl.CCW);
		gl.enable(gl.DEPTH_TEST);

		let max_vertex_uniform_vectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
		console.log("max_vertex_uniform_vectors: " + max_vertex_uniform_vectors);

		let exts = new Vector<string>();
		exts.AddRange(gl.getSupportedExtensions());

		console.log("extensions:", exts.toString());

		let canvas2d = (<HTMLCanvasElement>document.getElementById('canvas2d'));
		canvas2d.width = this.m_width;
		canvas2d.height = this.m_height;
		this.m_2d_context = canvas2d.getContext("2d");

		Input.BindTouchEventListener(canvas2d);
	}

    Deinit() {
		this.m_gl_context = null;
		this.m_2d_context = null;
	}

	OnResize(width: number, height: number) {
		this.m_width = width;
		this.m_height = height;
	}

	GetGL(): WebGLRenderingContext {
		return this.m_gl_context;
	}

	Get2D(): CanvasRenderingContext2D {
		return this.m_2d_context;
	}

	GetWidth(): number {
		return this.m_width;
	}

	GetHeight(): number {
		return this.m_height;
	}

	GetPreferredFPS(): number {
		return this.m_fps;
	}

	Show(visible: boolean) {
		this.m_gl_context.canvas.style.visibility = visible ? "visible" : "hidden";
	}

	SupportETC1(): boolean {
		let gl = this.GetGL();

		let ext = gl.getExtension("WEBGL_compressed_texture_etc1");

		return ext != null;
	}

	SupportDXT(): boolean {
		let gl = this.GetGL();

		let ext = (
			gl.getExtension("WEBGL_compressed_texture_s3tc") ||
			gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
			gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc")
		);

		return ext != null;
	}

	SupportPVRTC(): boolean {
		let gl = this.GetGL();

		let ext = (
			gl.getExtension("WEBGL_compressed_texture_pvrtc") ||
			gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc")
		);

		return ext != null;
	}

	BindVertexBuffer(buffer: VertexBuffer, shader: Shader, pass_index: number) {
		let gl = this.GetGL();

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.GetBuffer());

		let vs = shader.GetXML().GetVertexShader(pass_index);

		let offset = 0;
		vs.attrs.ForEach((i) => {
			gl.enableVertexAttribArray(i.location);
			gl.vertexAttribPointer(i.location, i.size / 4, gl.FLOAT, false, vs.stride, offset);
			offset += i.size;
			return true;
		});
	}

	BindIndexBuffer(buffer: IndexBuffer, index_type: IndexType) {
		let gl = this.GetGL();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.GetBuffer());
	}

	DrawIndexed(start: number, count: number, index_type: IndexType) {
		let gl = this.GetGL();

		let type = 0;
		if(index_type == IndexType.UnsignedShort) {
			type = gl.UNSIGNED_SHORT;
		} else {
			type = gl.UNSIGNED_INT;
		}

		gl.drawElements(gl.TRIANGLES, count, type, start);
	}

	private m_width: number;
	private m_height: number;
	private m_fps: number;
	private m_gl_context: WebGLRenderingContext;
	private m_2d_context: CanvasRenderingContext2D;
}