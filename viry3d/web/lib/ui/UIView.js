var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./UIRect", "./UIEventHandler", "../Component", "../graphics/Color", "../math/Vector2", "../math/Vector3", "../math/Matrix4x4", "../container/Vector"], function (require, exports, UIRect_1, UIEventHandler_1, Component_1, Color_1, Vector2_1, Vector3_1, Matrix4x4_1, Vector_1) {
    "use strict";
    var UIViewRect = (function (_super) {
        __extends(UIViewRect, _super);
        function UIViewRect(transform) {
            _super.call(this, transform);
        }
        UIViewRect.prototype.SetAnchors = function (min, max) {
            _super.prototype.SetAnchors.call(this, min, max);
            if (this.m_dirty) {
                this.MarkRendererDirty();
            }
        };
        UIViewRect.prototype.SetOffsets = function (min, max) {
            _super.prototype.SetOffsets.call(this, min, max);
            if (this.m_dirty) {
                this.MarkRendererDirty();
            }
        };
        UIViewRect.prototype.SetPivot = function (v) {
            _super.prototype.SetPivot.call(this, v);
            if (this.m_dirty) {
                this.MarkRendererDirty();
            }
        };
        UIViewRect.prototype.MarkRendererDirty = function () {
            if (this.m_renderer) {
                this.m_renderer.MarkDirty();
                this.m_renderer == null;
            }
        };
        UIViewRect.prototype.SetRenderer = function (v) {
            this.m_renderer = v;
        };
        UIViewRect.prototype.GetRenderer = function () {
            return this.m_renderer;
        };
        return UIViewRect;
    }(UIRect_1.UIRect));
    exports.UIViewRect = UIViewRect;
    var UIView = (function (_super) {
        __extends(UIView, _super);
        function UIView() {
            _super.call(this);
            this.event_handler = new UIEventHandler_1.UIEventHandler();
            this.m_color = new Color_1.Color(1, 1, 1, 1);
        }
        UIView.ClassName = function () {
            return "UIView";
        };
        UIView.prototype.GetTypeName = function () {
            return UIView.ClassName();
        };
        UIView.RegisterComponent = function () {
            UIView.m_class_names = Component_1.Component.m_class_names.slice(0);
            UIView.m_class_names.push("UIView");
            Component_1.Component.Register(UIView.ClassName(), function () {
                return new UIView();
            });
        };
        UIView.prototype.GetClassNames = function () {
            return UIView.m_class_names;
        };
        UIView.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.m_color.Set(src.m_color);
            this.rect.SetAnchors(src.rect.anchor_min, src.rect.anchor_max);
            this.rect.SetOffsets(src.rect.offset_min, src.rect.offset_max);
            this.rect.SetPivot(src.rect.pivot);
            this.rect.SetDirty(true);
        };
        UIView.prototype.SetColor = function (v) {
            if (!this.m_color.Equals(v)) {
                this.m_color.Set(v);
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UIView.prototype.GetVertexMatrix = function () {
            var local_position = this.rect.transform.GetLocalPosition();
            var local_rotation = this.rect.transform.GetLocalRotation();
            var local_scale = this.rect.transform.GetLocalScale();
            var mat_local = Matrix4x4_1.Matrix4x4.TRS(local_position, local_rotation, local_scale);
            var mat_parent_to_world = this.rect.transform.GetParent().GetLocalToWorldMatrix();
            var mat_world_to_canvas = this.rect.GetRenderer().GetTransform().GetWorldToLocalMatrix();
            var mat = mat_world_to_canvas.Multiply(mat_parent_to_world).Multiply(mat_local);
            return mat;
        };
        UIView.prototype.GetBoundsVertices = function () {
            var vertices = new Vector_1.Vector();
            var size = this.rect.GetSize();
            var min = new Vector2_1.Vector2(-this.rect.pivot.x * size.x, -this.rect.pivot.y * size.y);
            var max = new Vector2_1.Vector2((1 - this.rect.pivot.x) * size.x, (1 - this.rect.pivot.y) * size.y);
            vertices.Add(new Vector3_1.Vector3(min.x, min.y, 0));
            vertices.Add(new Vector3_1.Vector3(max.x, min.y, 0));
            vertices.Add(new Vector3_1.Vector3(max.x, max.y, 0));
            vertices.Add(new Vector3_1.Vector3(min.x, max.y, 0));
            var mat = this.GetVertexMatrix();
            for (var i = 0; i < 4; i++) {
                var v = vertices.Get(i);
                v.x = Math.floor(v.x);
                v.y = Math.floor(v.y);
                vertices.Set(i, mat.MultiplyPoint3x4(v));
            }
            return vertices;
        };
        UIView.prototype.FillVertices = function (vertices, uv, colors, indices) {
            var vertex_array = this.GetBoundsVertices();
            vertices.AddRange(vertex_array.toArray());
            uv.Add(new Vector2_1.Vector2(0, 1));
            uv.Add(new Vector2_1.Vector2(1, 1));
            uv.Add(new Vector2_1.Vector2(1, 0));
            uv.Add(new Vector2_1.Vector2(0, 0));
            colors.Add(this.m_color);
            colors.Add(this.m_color);
            colors.Add(this.m_color);
            colors.Add(this.m_color);
            var index_begin = vertices.Size() - 4;
            indices.Add(index_begin + 0);
            indices.Add(index_begin + 1);
            indices.Add(index_begin + 2);
            indices.Add(index_begin + 0);
            indices.Add(index_begin + 2);
            indices.Add(index_begin + 3);
        };
        UIView.prototype.FillMaterial = function (mat) { };
        UIView.prototype.Awake = function () {
            this.rect = new UIViewRect(this.GetTransform());
        };
        UIView.prototype.OnTranformChanged = function () {
            this.rect.SetDirty(true);
            this.rect.MarkRendererDirty();
        };
        return UIView;
    }(Component_1.Component));
    exports.UIView = UIView;
});
//# sourceMappingURL=UIView.js.map