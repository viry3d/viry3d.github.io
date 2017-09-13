var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../renderer/Renderer", "../Component", "../Viry3D", "./UIRect", "../graphics/Mesh", "../container/Vector", "../container/List", "../graphics/Material", "../graphics/Shader"], function (require, exports, Renderer_1, Component_1, Viry3D_1, UIRect_1, Mesh_1, Vector_1, List_1, Material_1, Shader_1) {
    "use strict";
    var RenderType;
    (function (RenderType) {
        RenderType[RenderType["BaseView"] = 0] = "BaseView";
        RenderType[RenderType["Sprite"] = 1] = "Sprite";
        RenderType[RenderType["Text"] = 2] = "Text";
    })(RenderType || (RenderType = {}));
    var UICanvasRenderer = (function (_super) {
        __extends(UICanvasRenderer, _super);
        function UICanvasRenderer() {
            _super.call(this);
            this.sorting_order = 0;
            this.m_type = RenderType.BaseView;
        }
        UICanvasRenderer.ClassName = function () {
            return "UICanvasRenderer";
        };
        UICanvasRenderer.prototype.GetTypeName = function () {
            return UICanvasRenderer.ClassName();
        };
        UICanvasRenderer.RegisterComponent = function () {
            UICanvasRenderer.m_class_names = Renderer_1.Renderer.m_class_names.slice(0);
            UICanvasRenderer.m_class_names.push("UICanvasRenderer");
            Component_1.Component.Register(UICanvasRenderer.ClassName(), function () {
                return new UICanvasRenderer();
            });
        };
        UICanvasRenderer.prototype.GetClassNames = function () {
            return UICanvasRenderer.m_class_names;
        };
        UICanvasRenderer.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.sorting_order = src.sorting_order;
        };
        UICanvasRenderer.prototype.MarkDirty = function () {
            this.rect.SetDirty(true);
        };
        UICanvasRenderer.prototype.Awake = function () {
            this.rect = new UIRect_1.UIRect(this.GetTransform());
        };
        UICanvasRenderer.prototype.LateUpdate = function () {
            this.UpdateViews();
        };
        UICanvasRenderer.prototype.OnTranformHierarchyChanged = function () {
            this.MarkDirty();
        };
        UICanvasRenderer.prototype.GetVertexBuffer = function () {
            var buffer;
            if (this.m_mesh) {
                buffer = this.m_mesh.GetVertexBuffer();
            }
            return buffer;
        };
        UICanvasRenderer.prototype.GetIndexBuffer = function () {
            var buffer;
            if (this.m_mesh) {
                buffer = this.m_mesh.GetIndexBuffer();
            }
            return buffer;
        };
        UICanvasRenderer.prototype.GetIndexRange = function (material_index, start, count) {
            if (this.m_mesh) {
                this.m_mesh.GetIndexRange(material_index, start, count);
            }
        };
        UICanvasRenderer.prototype.GetViews = function () {
            return this.m_views;
        };
        UICanvasRenderer.prototype.FindViews = function () {
            this.m_views = new Vector_1.Vector();
            var to_find = new List_1.List();
            to_find.AddFirst(this.rect.transform);
            while (!to_find.Empty()) {
                var t = to_find.First();
                to_find.RemoveFirst();
                var view = t.GetGameObject().GetComponent("UIView");
                if (view &&
                    view.IsEnable() &&
                    t.GetGameObject().IsActiveSelf()) {
                    var type_name = view.GetTypeName();
                    if (type_name == "UISprite") {
                        if (this.m_type == RenderType.BaseView || this.m_type == RenderType.Sprite) {
                            this.m_type = RenderType.Sprite;
                            this.m_views.Add(view);
                        }
                    }
                    else if (type_name == "UILabel") {
                        if (this.m_type == RenderType.BaseView || this.m_type == RenderType.Text) {
                            this.m_type = RenderType.Text;
                            this.m_views.Add(view);
                        }
                    }
                    else if (type_name == "UIView") {
                    }
                    else {
                        console.error("unknown view type");
                    }
                }
                var child_count = t.GetChildCount();
                for (var i = child_count - 1; i >= 0; i--) {
                    var child = t.GetChild(i);
                    var canvas = child.GetGameObject().GetComponent("UICanvasRenderer");
                    if (!canvas && child.GetGameObject().IsActiveSelf()) {
                        to_find.AddFirst(child);
                    }
                }
            }
            for (var i = 0; i < this.m_views.Size(); i++) {
                this.m_views.Get(i).rect.SetRenderer(this);
            }
        };
        UICanvasRenderer.prototype.UpdateViews = function () {
            if (!this.rect.dirty) {
                return;
            }
            this.rect.SetDirty(false);
            this.FindViews();
            if (!this.m_views.Empty()) {
                var mat = this.GetSharedMaterial();
                if (!mat) {
                    var asset_bundle = Viry3D_1.Viry3D.Resource.GetGlobalAssetBundle();
                    if (this.m_type == RenderType.BaseView || this.m_type == RenderType.Sprite) {
                        if (asset_bundle != null) {
                            var shader = Shader_1.Shader.Find("UI/Sprite", null, asset_bundle);
                            mat = Material_1.Material.Create(shader);
                            this.SetSharedMaterial(mat);
                        }
                        else {
                            console.error("asset bundle is null");
                        }
                    }
                    else if (this.m_type == RenderType.Text) {
                        if (asset_bundle != null) {
                            var shader = Shader_1.Shader.Find("UI/Text", null, asset_bundle);
                            mat = Material_1.Material.Create(shader);
                            this.SetSharedMaterial(mat);
                        }
                        else {
                            console.error("asset bundle is null");
                        }
                    }
                }
                var vertices = new Vector_1.Vector();
                var uv = new Vector_1.Vector();
                var colors = new Vector_1.Vector();
                var indices = new Vector_1.Vector();
                for (var i = 0; i < this.m_views.Size(); i++) {
                    this.m_views.Get(i).rect.SetRenderer(this);
                    this.m_views.Get(i).FillVertices(vertices, uv, colors, indices);
                    this.m_views.Get(i).FillMaterial(mat);
                }
                if (!vertices.Empty()) {
                    if (!this.m_mesh) {
                        this.m_mesh = Mesh_1.Mesh.Create(true);
                    }
                    this.m_mesh.vertices = vertices;
                    this.m_mesh.uv = uv;
                    this.m_mesh.colors = colors;
                    this.m_mesh.triangles = indices;
                    this.m_mesh.Update(mat.GetShader().GetVertexLayoutMask());
                }
            }
        };
        return UICanvasRenderer;
    }(Renderer_1.Renderer));
    exports.UICanvasRenderer = UICanvasRenderer;
    Viry3D_1.Viry3D.UICanvasRenderer = UICanvasRenderer;
});
//# sourceMappingURL=UICanvasRenderer.js.map