var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./lib/Application", "./lib/GameObject", "./lib/Resource", "./lib/math/Mathf", "./lib/math/Vector3", "./lib/math/Quaternion", "./lib/time/Time", "./lib/graphics/Graphics"], function (require, exports, Application_1, GameObject_1, Resource_1, Mathf_1, Vector3_1, Quaternion_1, Time_1, Graphics_1) {
    "use strict";
    var AppWatch = (function (_super) {
        __extends(AppWatch, _super);
        function AppWatch() {
            _super.call(this);
            this.SetName("Viry3D::AppWatch");
            this.SetInitSize(720, 772);
            this.SetInitFPS(5);
        }
        AppWatch.prototype.Start = function () {
            var _this = this;
            var camera = GameObject_1.GameObject.Create("camera").AddComponent("Camera");
            camera.SetOrthographic(true);
            camera.SetOrthographicSize(camera.GetTargetHeight() / 2.0);
            camera.SetNearClip(-1);
            camera.SetFarClip(1);
            var scale_w = camera.GetTargetWidth() / 720.0;
            var scale_h = camera.GetTargetHeight() / 772.0;
            var scale_ui = Mathf_1.Mathf.Min(scale_w, scale_h);
            var bundle_path = "";
            if (Graphics_1.Graphics.GetDisplay().SupportDXT()) {
                bundle_path = "app_watch_dxt.viry";
            }
            else if (Graphics_1.Graphics.GetDisplay().SupportETC1()) {
                bundle_path = "app_watch_etc1.viry";
            }
            else {
                alert("not support compressed texture");
            }
            Resource_1.Resource.LoadAssetBundleAsync(bundle_path, function (bundle) {
                Resource_1.Resource.SetGlobalAssetBundle(bundle);
                var ui = bundle.LoadGameObject("Assets/AppWatch/ui.prefab");
                ui.GetTransform().SetScale(Vector3_1.Vector3.Multiply(Vector3_1.Vector3.One(), scale_ui));
                _this.hour = ui.GetTransform().Find("hour/sprite");
                _this.minute = ui.GetTransform().Find("minute/sprite");
                _this.second = ui.GetTransform().Find("second/sprite");
                _this.day_week = ui.GetTransform().Find("day_week/label").GetGameObject().GetComponent("UILabel");
                _this.fps = ui.GetTransform().Find("fps/label").GetGameObject().GetComponent("UILabel");
                _this.fps.Enable(false);
                _this.ui = ui;
            }, null);
        };
        AppWatch.prototype.Update = function () {
            if (!this.ui) {
                return;
            }
            var date = Time_1.Time.GetDate();
            var hour_degree = 360 * (((date.hour % 12) * 60 + date.minute) * 60 + date.second) / (12.0 * 60 * 60);
            var minute_degree = 360 * (date.minute * 60 + date.second) / (60.0 * 60);
            var second_degree = 360 * date.second / 60.0;
            this.hour.SetLocalRotation(Quaternion_1.Quaternion.Euler(0, 0, -hour_degree));
            this.minute.SetLocalRotation(Quaternion_1.Quaternion.Euler(0, 0, -minute_degree));
            this.second.SetLocalRotation(Quaternion_1.Quaternion.Euler(0, 0, -second_degree));
            var week_days = ["��", "һ", "��", "��", "��", "��", "��"];
            var day_week_str = "<color=#ff0000ff>" + date.day + "</color>  " + "��" + week_days[date.week_day];
            this.day_week.SetText(day_week_str);
            this.fps.SetText("FPS:" + Time_1.Time.GetFPS());
        };
        return AppWatch;
    }(Application_1.Application));
    exports.AppWatch = AppWatch;
});
//# sourceMappingURL=AppWatch.js.map