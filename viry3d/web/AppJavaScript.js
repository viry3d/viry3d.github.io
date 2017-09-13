var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./lib/Application", "./lib/GameObject", "./lib/Component", "./lib/Resource", "./lib/math/Mathf", "./lib/math/Vector3", "./lib/graphics/Graphics", "./lib/graphics/Color", "./lib/tweener/Tweener", "./lib/io/File", "./lib/time/Time", "./lib/time/Timer"], function (require, exports, Application_1, GameObject_1, Component_1, Resource_1, Mathf_1, Vector3_1, Graphics_1, Color_1, Tweener_1, File_1, Time_1, Timer_1) {
    "use strict";
    var win = window;
    var AppJavaScript = (function (_super) {
        __extends(AppJavaScript, _super);
        function AppJavaScript() {
            _super.call(this);
            this.started = false;
            this.SetName("Viry3D::AppJavaScript");
            this.SetInitSize(512 * 9 / 16, 512);
            File_1.File.ReadAllText("Assets/AppJavaScript/AppFlappyBird.js", function (text) {
                win.log = console.log;
                win.Application = Application_1.Application;
                win.GameObject = GameObject_1.GameObject;
                win.Component = Component_1.Component;
                win.Resource = Resource_1.Resource;
                win.Mathf = Mathf_1.Mathf;
                win.Graphics = Graphics_1.Graphics;
                win.Vector3 = Vector3_1.Vector3;
                win.Color = Color_1.Color;
                win.TweenerPlayStyle = Tweener_1.TweenerPlayStyle;
                win.File = File_1.File;
                win.Time = Time_1.Time;
                win.Timer = Timer_1.Timer;
                win.eval(text);
                win.app_construct();
            });
        }
        AppJavaScript.prototype.Start = function () { };
        AppJavaScript.prototype.Update = function () {
            if (!this.started && win.app_start) {
                this.started = true;
                win.app_start();
            }
            if (this.started) {
                win.app_update();
            }
        };
        return AppJavaScript;
    }(Application_1.Application));
    exports.AppJavaScript = AppJavaScript;
});
//# sourceMappingURL=AppJavaScript.js.map