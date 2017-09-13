var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Component"], function (require, exports, Component_1) {
    "use strict";
    var ImageEffect = (function (_super) {
        __extends(ImageEffect, _super);
        function ImageEffect() {
            _super.apply(this, arguments);
        }
        ImageEffect.ClassName = function () {
            return "ImageEffect";
        };
        ImageEffect.prototype.GetTypeName = function () {
            return ImageEffect.ClassName();
        };
        ImageEffect.RegisterComponent = function () {
            ImageEffect.m_class_names = Component_1.Component.m_class_names.slice(0);
            ImageEffect.m_class_names.push("ImageEffect");
        };
        ImageEffect.prototype.GetClassNames = function () {
            return ImageEffect.m_class_names;
        };
        ImageEffect.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
        };
        return ImageEffect;
    }(Component_1.Component));
    exports.ImageEffect = ImageEffect;
});
//# sourceMappingURL=ImageEffect.js.map