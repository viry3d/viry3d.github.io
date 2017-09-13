var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Renderer", "../Component"], function (require, exports, Renderer_1, Component_1) {
    "use strict";
    var MeshRenderer = (function (_super) {
        __extends(MeshRenderer, _super);
        function MeshRenderer() {
            _super.call(this);
        }
        MeshRenderer.ClassName = function () {
            return "MeshRenderer";
        };
        MeshRenderer.prototype.GetTypeName = function () {
            return MeshRenderer.ClassName();
        };
        MeshRenderer.RegisterComponent = function () {
            MeshRenderer.m_class_names = Renderer_1.Renderer.m_class_names.slice(0);
            MeshRenderer.m_class_names.push("MeshRenderer");
            Component_1.Component.Register(MeshRenderer.ClassName(), function () {
                return new MeshRenderer();
            });
        };
        MeshRenderer.prototype.GetClassNames = function () {
            return MeshRenderer.m_class_names;
        };
        MeshRenderer.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.shared_mesh = src.shared_mesh;
        };
        MeshRenderer.prototype.GetVertexBuffer = function () {
            if (this.shared_mesh) {
                return this.shared_mesh.GetVertexBuffer();
            }
            else {
                return null;
            }
        };
        MeshRenderer.prototype.GetIndexBuffer = function () {
            if (this.shared_mesh) {
                return this.shared_mesh.GetIndexBuffer();
            }
            else {
                return null;
            }
        };
        MeshRenderer.prototype.GetIndexRange = function (material_index, start, count) {
            if (this.shared_mesh) {
                this.shared_mesh.GetIndexRange(material_index, start, count);
            }
        };
        return MeshRenderer;
    }(Renderer_1.Renderer));
    exports.MeshRenderer = MeshRenderer;
});
//# sourceMappingURL=MeshRenderer.js.map