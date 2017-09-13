define(["require", "exports", "./Graphics"], function (require, exports, Graphics_1) {
    "use strict";
    (function (BufferType) {
        BufferType[BufferType["None"] = 0] = "None";
        BufferType[BufferType["Vertex"] = 1] = "Vertex";
        BufferType[BufferType["Index"] = 2] = "Index";
        BufferType[BufferType["Uniform"] = 3] = "Uniform";
        BufferType[BufferType["Image"] = 4] = "Image";
    })(exports.BufferType || (exports.BufferType = {}));
    var BufferType = exports.BufferType;
    ;
    var BufferGL = (function () {
        function BufferGL() {
            this.m_type = 0;
            this.m_usage = 0;
            this.m_size = 0;
        }
        BufferGL.prototype.Fill = function (param, fill) {
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            var buffer = new ArrayBuffer(this.m_size);
            fill(param, new DataView(buffer));
            gl.bindBuffer(this.m_type, this.m_buffer);
            if (this.m_usage == gl.DYNAMIC_DRAW) {
                gl.bufferSubData(this.m_type, 0, buffer);
            }
            else {
                gl.bufferData(this.m_type, buffer, this.m_usage);
            }
            gl.bindBuffer(this.m_type, null);
        };
        BufferGL.prototype.GetBuffer = function () {
            return this.m_buffer;
        };
        BufferGL.prototype.GetSize = function () {
            return this.m_size;
        };
        BufferGL.prototype.CreateInternal = function (type, dynamic) {
            if (dynamic === void 0) { dynamic = false; }
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            switch (type) {
                case BufferType.Vertex:
                    this.m_type = gl.ARRAY_BUFFER;
                    break;
                case BufferType.Index:
                    this.m_type = gl.ELEMENT_ARRAY_BUFFER;
                    break;
                default:
                    this.m_type = 0;
                    this.m_usage = 0;
                    break;
            }
            if (dynamic) {
                this.m_usage = gl.DYNAMIC_DRAW;
            }
            else {
                this.m_usage = gl.STATIC_DRAW;
            }
            this.m_buffer = gl.createBuffer();
            if (this.m_usage == gl.DYNAMIC_DRAW) {
                gl.bindBuffer(this.m_type, this.m_buffer);
                gl.bufferData(this.m_type, this.m_size, this.m_usage);
                gl.bindBuffer(this.m_type, null);
            }
        };
        return BufferGL;
    }());
    exports.BufferGL = BufferGL;
});
//# sourceMappingURL=BufferGL.js.map