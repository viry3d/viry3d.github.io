define(["require", "exports", "./Camera", "./FrameBuffer", "../Viry3D", "./Graphics"], function (require, exports, Camera_1, FrameBuffer_1, Viry3D_1, Graphics_1) {
    "use strict";
    var RenderPass = (function () {
        function RenderPass() {
            this.m_frame_buffer = new FrameBuffer_1.FrameBuffer();
        }
        RenderPass.Create = function (color_texture, depth_texture, clear_flag, need_depth, rect) {
            var pass = new RenderPass();
            pass.m_frame_buffer.color_texture = color_texture;
            pass.m_frame_buffer.depth_texture = depth_texture;
            pass.m_clear_flag = clear_flag;
            pass.m_need_depth = need_depth;
            pass.m_rect = rect;
            pass.CreateInternal();
            return pass;
        };
        RenderPass.GetRenderPassBinding = function () {
            return RenderPass.m_render_pass_binding;
        };
        RenderPass.prototype.CreateInternal = function () {
            if (!this.HasFrameBuffer()) {
                this.m_framebuffer = null;
            }
            else {
            }
        };
        RenderPass.prototype.Begin = function (clear_color) {
            this.Bind();
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            var clear_flag = this.m_clear_flag;
            var has_stencil = false;
            var invalidate_bits = 0;
            var width = this.GetFrameBufferWidth();
            var height = this.GetFrameBufferHeight();
            gl.viewport(0, 0, width, height);
            if (this.m_framebuffer == null) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_framebuffer);
                has_stencil = true;
                invalidate_bits = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT;
            }
            else {
            }
            switch (clear_flag) {
                case Camera_1.CameraClearFlags.Color: {
                    gl.colorMask(true, true, true, true);
                    gl.depthMask(true);
                    var clear_bit = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
                    if (has_stencil) {
                        clear_bit |= gl.STENCIL_BUFFER_BIT;
                    }
                    gl.clearColor(clear_color.r, clear_color.g, clear_color.b, clear_color.a);
                    gl.clear(clear_bit);
                    break;
                }
                case Camera_1.CameraClearFlags.Depth: {
                    gl.depthMask(true);
                    var clear_bit = gl.DEPTH_BUFFER_BIT;
                    if (has_stencil) {
                        clear_bit |= gl.STENCIL_BUFFER_BIT;
                    }
                    gl.clear(clear_bit);
                    break;
                }
                case Camera_1.CameraClearFlags.Nothing:
                    break;
                case Camera_1.CameraClearFlags.Invalidate:
                    gl.clearColor(clear_color.r, clear_color.g, clear_color.b, clear_color.a);
                    gl.clear(invalidate_bits);
                    break;
            }
        };
        RenderPass.prototype.End = function () {
            this.Unbind();
        };
        RenderPass.prototype.Bind = function () {
            RenderPass.m_render_pass_binding = this;
        };
        RenderPass.prototype.Unbind = function () {
            RenderPass.m_render_pass_binding = null;
        };
        RenderPass.prototype.HasFrameBuffer = function () {
            return this.m_frame_buffer.color_texture != null || this.m_frame_buffer.depth_texture != null;
        };
        RenderPass.prototype.GetFrameBufferWidth = function () {
            if (!this.HasFrameBuffer()) {
                return Viry3D_1.Viry3D.Camera.Current().GetTargetWidth();
            }
            else {
                if (this.m_frame_buffer.color_texture != null) {
                    return this.m_frame_buffer.color_texture.GetWidth();
                }
                if (this.m_frame_buffer.depth_texture != null) {
                    return this.m_frame_buffer.depth_texture.GetWidth();
                }
            }
            return -1;
        };
        RenderPass.prototype.GetFrameBufferHeight = function () {
            if (!this.HasFrameBuffer()) {
                return Viry3D_1.Viry3D.Camera.Current().GetTargetHeight();
            }
            else {
                if (this.m_frame_buffer.color_texture != null) {
                    return this.m_frame_buffer.color_texture.GetHeight();
                }
                if (this.m_frame_buffer.depth_texture != null) {
                    return this.m_frame_buffer.depth_texture.GetHeight();
                }
            }
            return -1;
        };
        RenderPass.prototype.GetRect = function () {
            return this.m_rect;
        };
        RenderPass.m_render_pass_binding = null;
        return RenderPass;
    }());
    exports.RenderPass = RenderPass;
});
//# sourceMappingURL=RenderPass.js.map