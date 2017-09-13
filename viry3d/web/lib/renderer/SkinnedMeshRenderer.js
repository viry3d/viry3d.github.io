var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Renderer", "../Component", "../container/Vector"], function (require, exports, Renderer_1, Component_1, Vector_1) {
    "use strict";
    var SkinnedMeshRenderer = (function (_super) {
        __extends(SkinnedMeshRenderer, _super);
        function SkinnedMeshRenderer() {
            _super.call(this);
            this.bones = new Vector_1.Vector();
        }
        SkinnedMeshRenderer.ClassName = function () {
            return "SkinnedMeshRenderer";
        };
        SkinnedMeshRenderer.prototype.GetTypeName = function () {
            return SkinnedMeshRenderer.ClassName();
        };
        SkinnedMeshRenderer.RegisterComponent = function () {
            SkinnedMeshRenderer.m_class_names = Renderer_1.Renderer.m_class_names.slice(0);
            SkinnedMeshRenderer.m_class_names.push("SkinnedMeshRenderer");
            Component_1.Component.Register(SkinnedMeshRenderer.ClassName(), function () {
                return new SkinnedMeshRenderer();
            });
        };
        SkinnedMeshRenderer.prototype.GetClassNames = function () {
            return SkinnedMeshRenderer.m_class_names;
        };
        SkinnedMeshRenderer.prototype.DeepCopy = function (source) {
            var _this = this;
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.shared_mesh = src.shared_mesh;
            this.bones = new Vector_1.Vector();
            src.bones.ForEach(function (i) {
                _this.bones.Add(i);
                return true;
            });
        };
        SkinnedMeshRenderer.prototype.GetVertexBuffer = function () {
            if (this.shared_mesh) {
                return this.shared_mesh.GetVertexBuffer();
            }
            else {
                return null;
            }
        };
        SkinnedMeshRenderer.prototype.GetIndexBuffer = function () {
            if (this.shared_mesh) {
                return this.shared_mesh.GetIndexBuffer();
            }
            else {
                return null;
            }
        };
        SkinnedMeshRenderer.prototype.GetIndexRange = function (material_index, start, count) {
            if (this.shared_mesh) {
                this.shared_mesh.GetIndexRange(material_index, start, count);
            }
        };
        SkinnedMeshRenderer.prototype.PreRender = function (material_index) {
            _super.prototype.PreRender.call(this, material_index);
            var mat = this.GetSharedMaterials().Get(material_index);
            var bindposes = this.shared_mesh.bind_poses;
            var bones = this.bones;
            var bone_matrix = new Float32Array(bones.Size() * 3 * 4);
            for (var i = 0; i < bones.Size(); i++) {
                var m = bones.Get(i).GetLocalToWorldMatrix().Multiply(bindposes.Get(i));
                for (var j = 0; j < 3; j++) {
                    var row = m.GetRow(j);
                    bone_matrix[(i * 3 + j) * 4 + 0] = row.x;
                    bone_matrix[(i * 3 + j) * 4 + 1] = row.y;
                    bone_matrix[(i * 3 + j) * 4 + 2] = row.z;
                    bone_matrix[(i * 3 + j) * 4 + 3] = row.w;
                }
            }
            mat.SetVectorArray("_Bones", bone_matrix);
        };
        SkinnedMeshRenderer.BONE_MAX = 80;
        return SkinnedMeshRenderer;
    }(Renderer_1.Renderer));
    exports.SkinnedMeshRenderer = SkinnedMeshRenderer;
});
//# sourceMappingURL=SkinnedMeshRenderer.js.map