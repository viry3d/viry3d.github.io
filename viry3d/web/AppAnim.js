var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./lib/Application", "./lib/GameObject", "./lib/Resource", "./lib/math/Vector3", "./lib/math/Quaternion", "./lib/animation/AnimationClip", "./lib/graphics/Graphics", "./lib/time/Time"], function (require, exports, Application_1, GameObject_1, Resource_1, Vector3_1, Quaternion_1, AnimationClip_1, Graphics_1, Time_1) {
    "use strict";
    var AppAnim = (function (_super) {
        __extends(AppAnim, _super);
        function AppAnim() {
            _super.call(this);
            this.m_time_done = -1;
            this.SetName("Viry3D::AppAnim");
            this.SetInitSize(800, 600);
        }
        AppAnim.prototype.Start = function () {
            var _this = this;
            Graphics_1.Graphics.GetDisplay().Show(false);
            var canvas = Graphics_1.Graphics.GetDisplay().Get2D();
            canvas.font = "30px Arial";
            canvas.fillStyle = "rgba(0, 0, 0, 1)";
            var text = "Loading...0%";
            var text_w = canvas.measureText(text).width;
            var text_h = 30 * 72 / 96;
            var w = Graphics_1.Graphics.GetDisplay().GetWidth();
            var h = Graphics_1.Graphics.GetDisplay().GetHeight();
            canvas.fillText(text, (w - text_w) / 2, (h - text_h) / 2);
            var camera = GameObject_1.GameObject.Create("camera").AddComponent("Camera");
            camera.GetTransform().SetPosition(new Vector3_1.Vector3(0, 1.2, -2.0));
            camera.GetTransform().SetRotation(Quaternion_1.Quaternion.Euler(10, 0, 0));
            var bundle_path = "";
            if (Graphics_1.Graphics.GetDisplay().SupportDXT()) {
                bundle_path = "app_anim_dxt.viry";
            }
            else if (Graphics_1.Graphics.GetDisplay().SupportETC1()) {
                bundle_path = "app_anim_etc1.viry";
            }
            else if (Graphics_1.Graphics.GetDisplay().SupportPVRTC()) {
                bundle_path = "app_anim_pvrtc.viry";
            }
            else {
                alert("not support compressed texture");
            }
            Resource_1.Resource.LoadAssetBundleAsync(bundle_path, function (bundle) {
                _this.m_obj = bundle.LoadGameObject("Assets/AppAnim/unity_chan_splited.prefab");
                var anim = _this.m_obj.GetComponent("Animation");
                var state = anim.GetAnimationState("WAIT02");
                state.wrap_mode = AnimationClip_1.AnimationWrapMode.Loop;
                anim.UpdateAnimationState("WAIT02", state);
                anim.Play("WAIT02");
                _this.m_time_done = Time_1.Time.GetTime();
                canvas.clearRect(0, 0, w, h);
                text = "Loading...100%";
                text_w = canvas.measureText(text).width;
                canvas.fillText(text, (w - text_w) / 2, (h - text_h) / 2);
            }, function (progress) {
                canvas.clearRect(0, 0, w, h);
                text = "Loading..." + Math.ceil(100 * progress.loaded / progress.total).toString() + "%";
                text_w = canvas.measureText(text).width;
                canvas.fillText(text, (w - text_w) / 2, (h - text_h) / 2);
            });
        };
        AppAnim.prototype.Update = function () {
            if (this.m_time_done > 0 && Time_1.Time.GetTime() - this.m_time_done > 2) {
                this.m_time_done = -1;
                var canvas = Graphics_1.Graphics.GetDisplay().Get2D();
                var w = Graphics_1.Graphics.GetDisplay().GetWidth();
                var h = Graphics_1.Graphics.GetDisplay().GetHeight();
                canvas.clearRect(0, 0, w, h);
                Graphics_1.Graphics.GetDisplay().Show(true);
            }
        };
        return AppAnim;
    }(Application_1.Application));
    exports.AppAnim = AppAnim;
});
//# sourceMappingURL=AppAnim.js.map