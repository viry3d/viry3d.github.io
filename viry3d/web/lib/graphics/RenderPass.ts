import { RenderTexture } from "./RenderTexture"
import { CameraClearFlags } from "./Camera"
import { FrameBuffer } from "./FrameBuffer"
import { Rect } from "../math/Rect"
import { Color } from "./Color"
import { Viry3D } from "../Viry3D"
import { Graphics } from "./Graphics"

export class RenderPass {
	static Create(color_texture: RenderTexture, depth_texture: RenderTexture, clear_flag: CameraClearFlags, need_depth: boolean, rect: Rect): RenderPass {
		let pass = new RenderPass();
		pass.m_frame_buffer.color_texture = color_texture;
		pass.m_frame_buffer.depth_texture = depth_texture;
		pass.m_clear_flag = clear_flag;
		pass.m_need_depth = need_depth;
		pass.m_rect = rect;

		pass.CreateInternal();

		return pass;
	}

	static GetRenderPassBinding(): RenderPass {
		return RenderPass.m_render_pass_binding;
	}

	private CreateInternal() {
		if(!this.HasFrameBuffer()) {
			this.m_framebuffer = null;
		} else {
		
		}
	}

	Begin(clear_color: Color) {
		this.Bind();

		let gl = Graphics.GetDisplay().GetGL();

		let clear_flag = this.m_clear_flag;
		let has_stencil = false;
		let invalidate_bits = 0;
		let width = this.GetFrameBufferWidth();
		let height = this.GetFrameBufferHeight();

		gl.viewport(0, 0, width, height);

		if(this.m_framebuffer == null) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_framebuffer);
			has_stencil = true;
			invalidate_bits = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT;
		} else {
		
		}

		switch(clear_flag) {
			case CameraClearFlags.Color: {
				gl.colorMask(true, true, true, true);
				gl.depthMask(true);

				let clear_bit = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
				if(has_stencil) {
					clear_bit |= gl.STENCIL_BUFFER_BIT;
				}

				gl.clearColor(clear_color.r, clear_color.g, clear_color.b, clear_color.a);
				gl.clear(clear_bit);
				break;
			}
			case CameraClearFlags.Depth: {
				gl.depthMask(true);

				let clear_bit = gl.DEPTH_BUFFER_BIT;
				if(has_stencil) {
					clear_bit |= gl.STENCIL_BUFFER_BIT;
				}

				gl.clear(clear_bit);
				break;
			}
			case CameraClearFlags.Nothing:
				break;
			case CameraClearFlags.Invalidate:
				gl.clearColor(clear_color.r, clear_color.g, clear_color.b, clear_color.a);
				gl.clear(invalidate_bits);
				break;
		}
	}

	End() {
		this.Unbind();
	}

	Bind() {
		RenderPass.m_render_pass_binding = this;
	}

	Unbind() {
		RenderPass.m_render_pass_binding = null;
	}

	HasFrameBuffer(): boolean {
		return this.m_frame_buffer.color_texture != null || this.m_frame_buffer.depth_texture != null;
	}

	GetFrameBufferWidth(): number {
		if(!this.HasFrameBuffer()) {
			return (<any>Viry3D.Camera).Current().GetTargetWidth();
		} else {
			if(this.m_frame_buffer.color_texture != null) {
				return this.m_frame_buffer.color_texture.GetWidth();
			}

			if(this.m_frame_buffer.depth_texture != null) {
				return this.m_frame_buffer.depth_texture.GetWidth();
			}
		}

		return -1;
	}

	GetFrameBufferHeight(): number {
		if(!this.HasFrameBuffer()) {
			return (<any>Viry3D.Camera).Current().GetTargetHeight();
		} else {
			if(this.m_frame_buffer.color_texture != null) {
				return this.m_frame_buffer.color_texture.GetHeight();
			}

			if(this.m_frame_buffer.depth_texture != null) {
				return this.m_frame_buffer.depth_texture.GetHeight();
			}
		}

		return -1;
	}

	GetRect(): Rect {
		return this.m_rect;
	}

	private static m_render_pass_binding: RenderPass = null;
	private m_frame_buffer = new FrameBuffer();
	private m_clear_flag: CameraClearFlags;
	private m_need_depth: boolean;
	private m_rect: Rect;
	private m_framebuffer: WebGLFramebuffer;
}