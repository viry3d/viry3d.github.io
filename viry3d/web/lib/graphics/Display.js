define(["require", "exports", "./IndexBuffer", "../container/Vector", "../Input"], function (require, exports, IndexBuffer_1, Vector_1, Input_1) {
    "use strict";
    var Display = (function () {
        function Display() {
        }
        Display.prototype.Init = function (width, height, fps) {
            this.m_width = width;
            this.m_height = height;
            this.m_fps = fps;
            var context_attributes = {
                alpha: false,
                depth: true,
                stencil: true,
                antialias: false,
            };
            var canvas = document.getElementById('canvas');
            canvas.width = this.m_width;
            canvas.height = this.m_height;
            var gl = canvas.getContext("webgl", context_attributes) || canvas.getContext("experimental-webgl", context_attributes);
            this.m_gl_context = gl;
            gl.clearDepth(1.0);
            gl.clearStencil(0);
            gl.frontFace(gl.CCW);
            gl.enable(gl.DEPTH_TEST);
            var max_vertex_uniform_vectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
            console.log("max_vertex_uniform_vectors: " + max_vertex_uniform_vectors);
            var exts = new Vector_1.Vector();
            exts.AddRange(gl.getSupportedExtensions());
            console.log("extensions:", exts.toString());
            var canvas2d = document.getElementById('canvas2d');
            canvas2d.width = this.m_width;
            canvas2d.height = this.m_height;
            this.m_2d_context = canvas2d.getContext("2d");
            Input_1.Input.BindTouchEventListener(canvas2d);
        };
        Display.prototype.Deinit = function () {
            this.m_gl_context = null;
            this.m_2d_context = null;
        };
        Display.prototype.OnResize = function (width, height) {
            this.m_width = width;
            this.m_height = height;
        };
        Display.prototype.GetGL = function () {
            return this.m_gl_context;
        };
        Display.prototype.Get2D = function () {
            return this.m_2d_context;
        };
        Display.prototype.GetWidth = function () {
            return this.m_width;
        };
        Display.prototype.GetHeight = function () {
            return this.m_height;
        };
        Display.prototype.GetPreferredFPS = function () {
            return this.m_fps;
        };
        Display.prototype.Show = function (visible) {
            this.m_gl_context.canvas.style.visibility = visible ? "visible" : "hidden";
        };
        Display.prototype.SupportETC1 = function () {
            var gl = this.GetGL();
            var ext = gl.getExtension("WEBGL_compressed_texture_etc1");
            return ext != null;
        };
        Display.prototype.SupportDXT = function () {
            var gl = this.GetGL();
            var ext = (gl.getExtension("WEBGL_compressed_texture_s3tc") ||
                gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
                gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc"));
            return ext != null;
        };
        Display.prototype.SupportPVRTC = function () {
            var gl = this.GetGL();
            var ext = (gl.getExtension("WEBGL_compressed_texture_pvrtc") ||
                gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"));
            return ext != null;
        };
        Display.prototype.BindVertexBuffer = function (buffer, shader, pass_index) {
            var gl = this.GetGL();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.GetBuffer());
            var vs = shader.GetXML().GetVertexShader(pass_index);
            var offset = 0;
            vs.attrs.ForEach(function (i) {
                gl.enableVertexAttribArray(i.location);
                gl.vertexAttribPointer(i.location, i.size / 4, gl.FLOAT, false, vs.stride, offset);
                offset += i.size;
                return true;
            });
        };
        Display.prototype.BindIndexBuffer = function (buffer, index_type) {
            var gl = this.GetGL();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.GetBuffer());
        };
        Display.prototype.DrawIndexed = function (start, count, index_type) {
            var gl = this.GetGL();
            var type = 0;
            if (index_type == IndexBuffer_1.IndexType.UnsignedShort) {
                type = gl.UNSIGNED_SHORT;
            }
            else {
                type = gl.UNSIGNED_INT;
            }
            gl.drawElements(gl.TRIANGLES, count, type, start);
        };
        return Display;
    }());
    exports.Display = Display;
});
//# sourceMappingURL=Display.js.map