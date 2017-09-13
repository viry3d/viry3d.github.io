define(["require", "exports", "./Display", "./Camera"], function (require, exports, Display_1, Camera_1) {
    "use strict";
    var Graphics = (function () {
        function Graphics() {
        }
        Graphics.Init = function (width, height, fps) {
            Graphics.m_display = new Display_1.Display();
            Graphics.m_display.Init(width, height, fps);
        };
        Graphics.Deinit = function () {
            Graphics.m_display.Deinit();
            Graphics.m_display = null;
        };
        Graphics.Render = function () {
            Camera_1.Camera.PrepareAll();
            Camera_1.Camera.RenderAll();
        };
        Graphics.OnResize = function (width, height) {
            Graphics.m_display.OnResize(width, height);
            Camera_1.Camera.OnResize(width, height);
        };
        Graphics.GetDisplay = function () {
            return Graphics.m_display;
        };
        return Graphics;
    }());
    exports.Graphics = Graphics;
});
//# sourceMappingURL=Graphics.js.map