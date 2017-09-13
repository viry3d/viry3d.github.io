var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Component", "../container/List", "../container/Vector", "../graphics/IndexBuffer", "../graphics/Graphics", "../Viry3D", "../ui/UIEventHandler"], function (require, exports, Component_1, List_1, Vector_1, IndexBuffer_1, Graphics_1, Viry3D_1, UIEventHandler_1) {
    "use strict";
    var MaterialPass = (function () {
        function MaterialPass() {
        }
        return MaterialPass;
    }());
    var Renderer = (function (_super) {
        __extends(Renderer, _super);
        function Renderer() {
            _super.call(this);
            this.m_shared_materials = new Vector_1.Vector();
        }
        Renderer.ClassName = function () {
            return "Renderer";
        };
        Renderer.prototype.GetTypeName = function () {
            return Renderer.ClassName();
        };
        Renderer.RegisterComponent = function () {
            Renderer.m_class_names = Component_1.Component.m_class_names.slice(0);
            Renderer.m_class_names.push("Renderer");
        };
        Renderer.prototype.GetClassNames = function () {
            return Renderer.m_class_names;
        };
        Renderer.GetRenderers = function () {
            return Renderer.m_renderers;
        };
        Renderer.HandleUIEvent = function () {
            var canvas_list = new List_1.List();
            Renderer.m_renderers.ForEach(function (i) {
                var skip = false;
                if (!i.GetGameObject().IsActiveInHierarchy() ||
                    !i.IsEnable()) {
                    skip = true;
                }
                if (!skip) {
                    if (i instanceof Viry3D_1.Viry3D.UICanvasRenderer) {
                        canvas_list.AddLast(i);
                    }
                }
                return true;
            });
            canvas_list.Sort(function (left, right) {
                return left.sorting_order < right.sorting_order;
            });
            UIEventHandler_1.UIEventHandler.HandleUIEvent(canvas_list);
        };
        Renderer.PrepareAllPass = function () {
            Renderer.m_renderers.ForEach(function (i) {
                var skip = false;
                if (!i.GetGameObject().IsActiveInHierarchy() ||
                    !i.IsEnable() ||
                    Viry3D_1.Viry3D.Camera.Current().IsCulling(i.GetGameObject())) {
                    skip = true;
                }
                if (!skip) {
                    var mats = i.GetSharedMaterials();
                    for (var j = 0; j < mats.Size(); j++) {
                        var mat = mats.Get(j);
                        var shader = mat.GetShader();
                        var pass_count = shader.GetPassCount();
                        for (var k = 0; k < pass_count; k++) {
                            shader.PreparePass(k);
                        }
                    }
                }
                return true;
            });
            var mat_passes = new List_1.List();
            Renderer.m_renderers.ForEach(function (i) {
                var skip = false;
                if (!i.GetGameObject().IsActiveInHierarchy() ||
                    !i.IsEnable() ||
                    Viry3D_1.Viry3D.Camera.Current().IsCulling(i.GetGameObject())) {
                    skip = true;
                }
                if (!skip) {
                    var mats = i.GetSharedMaterials();
                    for (var j = 0; j < mats.Size(); j++) {
                        var mat = mats.Get(j);
                        var shader = mat.GetShader();
                        var pass_count = shader.GetPassCount();
                        console.assert(pass_count >= 1);
                        var pass_1 = new MaterialPass();
                        pass_1.queue = shader.GetQueue();
                        pass_1.shader_pass_count = pass_count;
                        pass_1.renderer = i;
                        pass_1.material_index = j;
                        pass_1.shader_id = shader.GetId();
                        pass_1.material_id = mat.GetId();
                        mat_passes.AddLast(pass_1);
                    }
                }
                return true;
            });
            mat_passes.Sort(function (a, b) {
                if (a.queue == b.queue) {
                    if (a.shader_pass_count == 1 && b.shader_pass_count == 1) {
                        if (a.shader_id == b.shader_id) {
                            return a.material_id < b.material_id;
                        }
                        else {
                            return a.shader_id < b.shader_id;
                        }
                    }
                    else {
                        return a.shader_pass_count < b.shader_pass_count;
                    }
                }
                else {
                    return a.queue < b.queue;
                }
            });
            var cam_index = Viry3D_1.Viry3D.Camera.CurrentIndex();
            if (this.m_passes.Size() < cam_index + 1) {
                this.m_passes.Resize(cam_index + 1);
                this.m_passes.Set(cam_index, new List_1.List());
            }
            var passes = this.m_passes.Get(cam_index);
            passes.Clear();
            var pass = new List_1.List();
            mat_passes.ForEach(function (i) {
                if (pass.Empty()) {
                    pass.AddLast(i);
                }
                else {
                    var last = pass.Last();
                    if (i.queue == last.queue &&
                        i.shader_pass_count == 1 && last.shader_pass_count == 1 &&
                        i.shader_id == last.shader_id) {
                        pass.AddLast(i);
                    }
                    else {
                        passes.AddLast(pass);
                        pass = new List_1.List();
                        pass.AddLast(i);
                    }
                }
                return true;
            });
            if (!pass.Empty()) {
                passes.AddLast(pass);
            }
            /*
            passes.ForEach((i) => {
                Renderer.PreparePass(i);
                return true;
            });
            */
        };
        Renderer.RenderAllPass = function () {
            var cam_index = Viry3D_1.Viry3D.Camera.CurrentIndex();
            var passes = this.m_passes.Get(cam_index);
            var passes_transparent = new List_1.List();
            var passes_ui = new List_1.List();
            passes.ForEach(function (i) {
                var first = i.First();
                if (first.queue < 3000) {
                    Renderer.CommitPass(i);
                }
                else {
                    if (first.renderer instanceof Viry3D_1.Viry3D.UICanvasRenderer) {
                        var renderer_ui = first.renderer;
                        i.ForEach(function (j) {
                            var pass = new List_1.List();
                            pass.AddLast(j);
                            passes_ui.AddLast(pass);
                            return true;
                        });
                    }
                    else {
                        passes_transparent.AddLast(i);
                    }
                }
                return true;
            });
            //	render transparent object
            passes_transparent.ForEach(function (i) {
                Renderer.CommitPass(i);
                return true;
            });
            //	sort canvas renderers
            passes_ui.Sort(function (a, b) {
                var renderer_a = a.First().renderer;
                var renderer_b = b.First().renderer;
                return renderer_a.sorting_order < renderer_b.sorting_order;
            });
            //	render ui
            passes_ui.ForEach(function (i) {
                Renderer.CommitPass(i);
                return true;
            });
        };
        Renderer.PreparePass = function (pass) {
            var first = pass.First();
            if (first.shader_pass_count == 1) {
                var old_id_1 = -1;
                pass.ForEach(function (i) {
                    var mat = i.renderer.GetSharedMaterials().Get(i.material_index);
                    var mat_id = mat.GetId();
                    if (old_id_1 == -1 || old_id_1 != mat_id) {
                        i.renderer.PreRender(i.material_index);
                        mat.UpdateUniforms(0);
                    }
                    old_id_1 = mat_id;
                    return true;
                });
            }
            else {
                var mat = first.renderer.GetSharedMaterials().Get(first.material_index);
                first.renderer.PreRender(first.material_index);
                for (var i = 0; i < first.shader_pass_count; i++) {
                    mat.UpdateUniforms(i);
                }
            }
        };
        /*
        private static CommitPass_1(pass: List<MaterialPass>) {
            pass.ForEach((i) => {
                let mat = i.renderer.GetSharedMaterials().Get(i.material_index);
                let shader = mat.GetShader();
    
                i.renderer.PreRender(i.material_index);
    
                for(let j = 0; j < i.shader_pass_count; j++) {
                    shader.BeginPass(j);
    
                    shader.BindMaterial(j, mat);
    
                    let world = i.renderer.GetTransform().GetLocalToWorldMatrix();
                    shader.PushWorldMatrix(j, world);
    
                    i.renderer.Render(i.material_index, j);
    
                    shader.EndPass(j);
                }
    
                return true;
            });
        }
        */
        Renderer.CommitPass = function (pass) {
            var first = pass.First();
            var shader = first.renderer.GetSharedMaterials().Get(first.material_index).GetShader();
            if (first.shader_pass_count == 1) {
                shader.BeginPass(0);
                pass.ForEach(function (i) {
                    i.renderer.PreRender(i.material_index);
                    var mat = i.renderer.GetSharedMaterials().Get(i.material_index);
                    shader.BindMaterial(0, mat);
                    var world = i.renderer.GetTransform().GetLocalToWorldMatrix();
                    shader.PushWorldMatrix(0, world);
                    i.renderer.Render(i.material_index, 0);
                    return true;
                });
                shader.EndPass(0);
            }
            else {
                console.assert(pass.Size() == 1);
                first.renderer.PreRender(first.material_index);
                for (var i = 0; i < first.shader_pass_count; i++) {
                    shader.BeginPass(i);
                    var mat = first.renderer.GetSharedMaterials().Get(first.material_index);
                    shader.BindMaterial(i, mat);
                    var world = first.renderer.GetTransform().GetLocalToWorldMatrix();
                    shader.PushWorldMatrix(i, world);
                    first.renderer.Render(first.material_index, i);
                    shader.EndPass(i);
                }
            }
        };
        Renderer.prototype.GetSharedMaterials = function () {
            return this.m_shared_materials;
        };
        Renderer.prototype.SetSharedMaterials = function (mats) {
            var _this = this;
            this.m_shared_materials.Clear();
            mats.ForEach(function (i) {
                _this.m_shared_materials.Add(i);
                return true;
            });
        };
        Renderer.prototype.GetSharedMaterial = function () {
            var mat = null;
            var mats = this.GetSharedMaterials();
            if (!mats.Empty()) {
                mat = mats.Get(0);
            }
            return mat;
        };
        Renderer.prototype.SetSharedMaterial = function (mat) {
            var mats = new Vector_1.Vector();
            mats.Add(mat);
            this.SetSharedMaterials(mats);
        };
        Renderer.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.SetSharedMaterials(src.GetSharedMaterials());
        };
        Renderer.prototype.GetVertexBuffer = function () {
            return null;
        };
        Renderer.prototype.GetIndexBuffer = function () {
            return null;
        };
        Renderer.prototype.GetIndexRange = function (material_index, start, count) { };
        Renderer.prototype.PreRender = function (material_index) {
            var vp = Viry3D_1.Viry3D.Camera.Current().GetViewProjectionMatrix();
            var mat = this.GetSharedMaterials().Get(material_index);
            mat.SetMatrix("_ViewProjection", vp);
        };
        Renderer.prototype.Render = function (material_index, pass_index) {
            var mat = this.GetSharedMaterials().Get(material_index);
            var shader = mat.GetShader();
            var index_type = IndexBuffer_1.IndexType.UnsignedShort;
            if (this.GetVertexBuffer()) {
                Graphics_1.Graphics.GetDisplay().BindVertexBuffer(this.GetVertexBuffer(), shader, pass_index);
                Graphics_1.Graphics.GetDisplay().BindIndexBuffer(this.GetIndexBuffer(), index_type);
                var start = [0];
                var count = [0];
                this.GetIndexRange(material_index, start, count);
                Graphics_1.Graphics.GetDisplay().DrawIndexed(start[0], count[0], index_type);
            }
        };
        Renderer.m_renderers = new List_1.List();
        Renderer.m_passes = new Vector_1.Vector();
        return Renderer;
    }(Component_1.Component));
    exports.Renderer = Renderer;
});
//# sourceMappingURL=Renderer.js.map