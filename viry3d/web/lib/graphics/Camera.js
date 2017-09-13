var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Component", "./Color", "./RenderPass", "./Graphics", "../container/List", "../math/Rect", "../math/Matrix4x4", "../Viry3D", "../renderer/Renderer"], function (require, exports, Component_1, Color_1, RenderPass_1, Graphics_1, List_1, Rect_1, Matrix4x4_1, Viry3D_1, Renderer_1) {
    "use strict";
    (function (CameraClearFlags) {
        CameraClearFlags[CameraClearFlags["Invalidate"] = 1] = "Invalidate";
        CameraClearFlags[CameraClearFlags["Color"] = 2] = "Color";
        CameraClearFlags[CameraClearFlags["Depth"] = 3] = "Depth";
        CameraClearFlags[CameraClearFlags["Nothing"] = 4] = "Nothing";
    })(exports.CameraClearFlags || (exports.CameraClearFlags = {}));
    var CameraClearFlags = exports.CameraClearFlags;
    var Camera = (function (_super) {
        __extends(Camera, _super);
        function Camera() {
            _super.call(this);
            Camera.m_cameras.AddLast(this);
            this.m_clear_flags = CameraClearFlags.Color;
            this.m_clear_color = new Color_1.Color(0, 0, 0, 1);
            this.SetDepth(0);
            this.m_culling_mask = -1;
            this.m_orthographic = false;
            this.m_orthographic_size = 1;
            this.m_field_of_view = 60;
            this.m_near_clip = 0.3;
            this.m_far_clip = 1000;
            this.m_rect = new Rect_1.Rect(0, 0, 1, 1);
            this.m_hdr = false;
            this.m_frame_buffer = null;
            this.m_target_rendering = null;
            this.m_matrix_dirty = true;
            this.m_view_matrix = Matrix4x4_1.Matrix4x4.Identity();
            this.m_projection_matrix = Matrix4x4_1.Matrix4x4.Identity();
            this.m_view_projection_matrix = Matrix4x4_1.Matrix4x4.Identity();
            this.m_render_pass = null;
        }
        Camera.ClassName = function () {
            return "Camera";
        };
        Camera.prototype.GetTypeName = function () {
            return Camera.ClassName();
        };
        Camera.RegisterComponent = function () {
            Camera.m_class_names = Component_1.Component.m_class_names.slice(0);
            Camera.m_class_names.push("Camera");
            Component_1.Component.Register(Camera.ClassName(), function () {
                return new Camera();
            });
        };
        Camera.prototype.GetClassNames = function () {
            return Camera.m_class_names;
        };
        Camera.PrepareAll = function () {
            Camera.m_current_index = 0;
            Camera.m_cameras.ForEach(function (i) {
                if (i.CanRender()) {
                    Camera.m_current = i;
                    i.Prepare();
                    Camera.m_current_index++;
                }
                return true;
            });
            Camera.m_current = null;
            Camera.m_current_index = -1;
        };
        Camera.RenderAll = function () {
            Camera.m_current_index = 0;
            Camera.m_cameras.ForEach(function (i) {
                if (i.CanRender()) {
                    Camera.m_current = i;
                    i.Render();
                    Camera.m_current_index++;
                }
                return true;
            });
            Camera.m_current = null;
            Camera.m_current_index = -1;
        };
        Camera.Current = function () {
            return Camera.m_current;
        };
        Camera.CurrentIndex = function () {
            return Camera.m_current_index;
        };
        Camera.OnResize = function (width, height) {
            Camera.m_cameras.ForEach(function (i) {
                i.ResetRenderPass();
                i.m_matrix_dirty = true;
                return true;
            });
            Camera.m_post_target_front = null;
            Camera.m_post_target_back = null;
        };
        Camera.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
        };
        Camera.prototype.OnDestroy = function () {
            Camera.m_cameras.Remove(this);
            this.ResetRenderPass();
        };
        Camera.prototype.ResetRenderPass = function () {
            this.m_render_pass = null;
        };
        Camera.prototype.OnTranformChanged = function () {
            this.m_matrix_dirty = true;
        };
        Camera.prototype.CanRender = function () {
            return this.GetGameObject().IsActiveInHierarchy() && this.IsEnable();
        };
        Camera.prototype.IsCulling = function (obj) {
            return (this.m_culling_mask & (1 << obj.GetLayer())) == 0;
        };
        Camera.prototype.GetPostTargetFront = function () {
            console.error("GetPostTargetFront not implemment");
            return null;
        };
        Camera.prototype.GetPostTargetBack = function () {
            console.error("GetPostTargetBack not implemment");
            return null;
        };
        Camera.prototype.SetFrameBuffer = function (frame_buffer) {
            this.m_matrix_dirty = true;
            this.m_frame_buffer = frame_buffer;
        };
        Camera.prototype.DecideTarget = function () {
            var effects = this.GetGameObject().GetComponents("ImageEffect");
            if (effects.length == 0) {
                this.m_target_rendering = this.m_frame_buffer;
            }
            else {
                this.m_target_rendering = this.GetPostTargetFront();
            }
        };
        Camera.prototype.Prepare = function () {
            this.DecideTarget();
            if (this.m_render_pass == null) {
                if (this.m_target_rendering != null) {
                    this.m_render_pass = RenderPass_1.RenderPass.Create(this.m_target_rendering.color_texture, this.m_target_rendering.depth_texture, this.m_clear_flags, true, this.m_rect);
                }
                else {
                    this.m_render_pass = RenderPass_1.RenderPass.Create(null, null, this.m_clear_flags, true, this.m_rect);
                }
            }
            this.m_render_pass.Bind();
            Renderer_1.Renderer.PrepareAllPass();
            this.m_render_pass.Unbind();
        };
        Camera.prototype.Render = function () {
            this.m_render_pass.Begin(this.m_clear_color);
            Renderer_1.Renderer.RenderAllPass();
            this.GetGameObject().OnPostRender();
            this.m_render_pass.End();
            this.PostProcess();
        };
        Camera.prototype.PostProcess = function () {
        };
        Camera.prototype.GetTargetWidth = function () {
            var width = 0;
            if (this.m_frame_buffer != null) {
                width = this.m_frame_buffer.color_texture.GetWidth();
            }
            else {
                width = Graphics_1.Graphics.GetDisplay().GetWidth();
            }
            return width;
        };
        Camera.prototype.GetTargetHeight = function () {
            var height = 0;
            if (this.m_frame_buffer != null) {
                height = this.m_frame_buffer.color_texture.GetHeight();
            }
            else {
                height = Graphics_1.Graphics.GetDisplay().GetHeight();
            }
            return height;
        };
        Camera.prototype.UpdateMatrix = function () {
            this.m_matrix_dirty = false;
            var width = this.GetTargetWidth();
            var height = this.GetTargetHeight();
            var transform = this.GetTransform();
            this.m_view_matrix = Matrix4x4_1.Matrix4x4.LookTo(transform.GetPosition(), transform.GetForward(), transform.GetUp());
            if (!this.m_orthographic) {
                this.m_projection_matrix.Set(Matrix4x4_1.Matrix4x4.Perspective(this.m_field_of_view, width / height, this.m_near_clip, this.m_far_clip));
            }
            else {
                var ortho_size = this.m_orthographic_size;
                var rect = this.m_rect;
                var top_1 = ortho_size;
                var bottom = -ortho_size;
                var plane_h = ortho_size * 2;
                var plane_w = plane_h * (width * rect.width) / (height * rect.height);
                this.m_projection_matrix.Set(Matrix4x4_1.Matrix4x4.Ortho(-plane_w / 2, plane_w / 2, bottom, top_1, this.m_near_clip, this.m_far_clip));
            }
            this.m_view_projection_matrix.Set(this.m_projection_matrix.Multiply(this.m_view_matrix));
        };
        Camera.prototype.GetViewMatrix = function () {
            if (this.m_matrix_dirty != null) {
                this.UpdateMatrix();
            }
            return this.m_view_matrix;
        };
        Camera.prototype.GetProjectionMatrix = function () {
            if (this.m_matrix_dirty != null) {
                this.UpdateMatrix();
            }
            return this.m_projection_matrix;
        };
        Camera.prototype.GetViewProjectionMatrix = function () {
            if (this.m_matrix_dirty != null) {
                this.UpdateMatrix();
            }
            return this.m_view_projection_matrix;
        };
        Camera.prototype.GetClearFlags = function () {
            return this.m_clear_flags;
        };
        Camera.prototype.SetClearFlags = function (flag) {
            this.m_clear_flags = flag;
        };
        Camera.prototype.GetClearColor = function () {
            return this.m_clear_color;
        };
        Camera.prototype.SetClearColor = function (color) {
            this.m_clear_color = color;
        };
        Camera.prototype.GetSepth = function () {
            return this.m_depth;
        };
        Camera.prototype.SetDepth = function (depth) {
            this.m_depth = depth;
            Camera.m_cameras.Sort(function (left, right) {
                return left.m_depth < right.m_depth;
            });
        };
        Camera.prototype.GetCullingMask = function () {
            return this.m_culling_mask;
        };
        Camera.prototype.SetCullingMask = function (mask) {
            this.m_culling_mask = mask;
        };
        Camera.prototype.GetOrthographic = function () {
            return this.m_orthographic;
        };
        Camera.prototype.SetOrthographic = function (value) {
            this.m_orthographic = value;
        };
        Camera.prototype.GetOrthographicSize = function () {
            return this.m_orthographic_size;
        };
        Camera.prototype.SetOrthographicSize = function (size) {
            this.m_orthographic_size = size;
        };
        Camera.prototype.GetFieldOfView = function () {
            return this.m_field_of_view;
        };
        Camera.prototype.SetFieldOfView = function (value) {
            this.m_field_of_view = value;
        };
        Camera.prototype.GetNearClip = function () {
            return this.m_near_clip;
        };
        Camera.prototype.SetNearClip = function (clip) {
            this.m_near_clip = clip;
        };
        Camera.prototype.GetFarClip = function () {
            return this.m_far_clip;
        };
        Camera.prototype.SetFarClip = function (clip) {
            this.m_far_clip = clip;
        };
        Camera.prototype.GetRect = function () {
            return this.m_rect;
        };
        Camera.prototype.SetRect = function (rect) {
            this.m_rect = rect;
        };
        Camera.prototype.GetHdr = function () {
            return this.m_hdr;
        };
        Camera.prototype.SetHdr = function (hdr) {
            this.m_hdr = hdr;
        };
        Camera.m_cameras = new List_1.List();
        Camera.m_current_index = -1;
        return Camera;
    }(Component_1.Component));
    exports.Camera = Camera;
    Viry3D_1.Viry3D.Camera = Camera;
});
//# sourceMappingURL=Camera.js.map