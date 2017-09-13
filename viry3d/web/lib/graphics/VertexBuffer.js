var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./BufferGL"], function (require, exports, BufferGL_1) {
    "use strict";
    var VertexBuffer = (function (_super) {
        __extends(VertexBuffer, _super);
        function VertexBuffer() {
            _super.call(this);
        }
        VertexBuffer.Create = function (size, dynamic) {
            if (dynamic === void 0) { dynamic = false; }
            var buffer = new VertexBuffer();
            buffer.m_size = size;
            buffer.CreateInternal(BufferGL_1.BufferType.Vertex, dynamic);
            return buffer;
        };
        return VertexBuffer;
    }(BufferGL_1.BufferGL));
    exports.VertexBuffer = VertexBuffer;
});
//# sourceMappingURL=VertexBuffer.js.map