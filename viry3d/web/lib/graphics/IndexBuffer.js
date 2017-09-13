var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./BufferGL"], function (require, exports, BufferGL_1) {
    "use strict";
    (function (IndexType) {
        IndexType[IndexType["UnsignedShort"] = 0] = "UnsignedShort";
        IndexType[IndexType["UnsignedInt"] = 1] = "UnsignedInt";
    })(exports.IndexType || (exports.IndexType = {}));
    var IndexType = exports.IndexType;
    var IndexBuffer = (function (_super) {
        __extends(IndexBuffer, _super);
        function IndexBuffer() {
            _super.call(this);
        }
        IndexBuffer.Create = function (size, dynamic) {
            if (dynamic === void 0) { dynamic = false; }
            var buffer = new IndexBuffer();
            buffer.m_size = size;
            buffer.CreateInternal(BufferGL_1.BufferType.Index, dynamic);
            return buffer;
        };
        return IndexBuffer;
    }(BufferGL_1.BufferGL));
    exports.IndexBuffer = IndexBuffer;
});
//# sourceMappingURL=IndexBuffer.js.map