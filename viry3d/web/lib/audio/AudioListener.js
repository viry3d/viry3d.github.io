var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Component"], function (require, exports, Component_1) {
    "use strict";
    var AudioListener = (function (_super) {
        __extends(AudioListener, _super);
        function AudioListener() {
            _super.call(this);
        }
        AudioListener.ClassName = function () {
            return "AudioListener";
        };
        AudioListener.prototype.GetTypeName = function () {
            return AudioListener.ClassName();
        };
        AudioListener.RegisterComponent = function () {
            AudioListener.m_class_names = Component_1.Component.m_class_names.slice(0);
            AudioListener.m_class_names.push("AudioListener");
            Component_1.Component.Register(AudioListener.ClassName(), function () {
                return new AudioListener();
            });
        };
        AudioListener.prototype.GetClassNames = function () {
            return AudioListener.m_class_names;
        };
        AudioListener.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
        };
        return AudioListener;
    }(Component_1.Component));
    exports.AudioListener = AudioListener;
});
//# sourceMappingURL=AudioListener.js.map