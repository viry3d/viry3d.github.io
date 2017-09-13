var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./lib/Application", "./lib/GameObject", "./lib/graphics/Color"], function (require, exports, Application_1, GameObject_1, Color_1) {
    "use strict";
    var AppClear = (function (_super) {
        __extends(AppClear, _super);
        function AppClear() {
            _super.call(this);
            this.SetName("Viry3D::AppClear");
            this.SetInitSize(800, 600);
        }
        AppClear.prototype.Start = function () {
            var camera = GameObject_1.GameObject.Create("camera").AddComponent("Camera");
            camera.SetClearColor(new Color_1.Color(0, 0, 1, 1));
        };
        return AppClear;
    }(Application_1.Application));
    exports.AppClear = AppClear;
});
//# sourceMappingURL=AppClear.js.map