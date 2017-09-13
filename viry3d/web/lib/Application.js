define(["require", "exports", "./graphics/Graphics", "./World", "./time/Time", "./Input"], function (require, exports, Graphics_1, World_1, Time_1, Input_1) {
    "use strict";
    (function (Platform) {
        Platform[Platform["UnKnown"] = 0] = "UnKnown";
        Platform[Platform["Android"] = 1] = "Android";
        Platform[Platform["iOS"] = 2] = "iOS";
        Platform[Platform["Other"] = 3] = "Other";
    })(exports.Platform || (exports.Platform = {}));
    var Platform = exports.Platform;
    var Application = (function () {
        function Application() {
            Application.m_instance = this;
            this.m_name = "Viry3D::Application";
            this.m_init_width = 1280;
            this.m_init_height = 720;
            this.m_init_fps = -1;
            Time_1.Time.Update();
        }
        Application.Current = function () {
            return Application.m_instance;
        };
        Application.Platform = function () {
            if (Application.m_platform == Platform.UnKnown) {
                var agent = navigator.userAgent;
                if (agent.indexOf("Android") >= 0) {
                    Application.m_platform = Platform.Android;
                }
                else if (agent.indexOf("iPhone") >= 0 || agent.indexOf("iPad") >= 0 || agent.indexOf("iPod") >= 0) {
                    Application.m_platform = Platform.iOS;
                }
                else {
                    Application.m_platform = Platform.Other;
                }
            }
            return Application.m_platform;
        };
        Application.DataPath = function () {
            return "Assets";
        };
        Application.SavePath = function () {
            return "";
        };
        Application.SupportDXT = function () {
            return Graphics_1.Graphics.GetDisplay().SupportDXT();
        };
        Application.SupportETC1 = function () {
            return Graphics_1.Graphics.GetDisplay().SupportETC1();
        };
        Application.SupportPVRTC = function () {
            return Graphics_1.Graphics.GetDisplay().SupportPVRTC();
        };
        Application.prototype.Deinit = function () {
            Graphics_1.Graphics.Deinit();
            Application.m_instance = null;
        };
        Application.prototype.SetInitSize = function (width, height) {
            this.m_init_width = width;
            this.m_init_height = height;
        };
        Application.prototype.SetInitFPS = function (fps) {
            this.m_init_fps = fps;
        };
        Application.prototype.SetName = function (name) {
            this.m_name = name;
        };
        Application.prototype.GetName = function () {
            return this.m_name;
        };
        Application.prototype.OnInit = function () {
            document.title = this.m_name.toString();
            Graphics_1.Graphics.Init(this.m_init_width, this.m_init_height, this.m_init_fps);
            World_1.World.Init();
            this.Start();
        };
        Application.prototype.OnUpdate = function () {
            Time_1.Time.Update();
            this.Update();
            World_1.World.Update();
            Input_1.Input.Update();
        };
        Application.prototype.OnDraw = function () {
            Graphics_1.Graphics.Render();
        };
        Application.prototype.OnResize = function (width, height) {
            Graphics_1.Graphics.OnResize(width, height);
        };
        Application.prototype.Start = function () { };
        Application.prototype.Update = function () { };
        Application.m_platform = Platform.UnKnown;
        return Application;
    }());
    exports.Application = Application;
});
//# sourceMappingURL=Application.js.map