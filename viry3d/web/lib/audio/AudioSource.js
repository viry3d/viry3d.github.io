var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Component", "../Resource"], function (require, exports, Component_1, Resource_1) {
    "use strict";
    var AudioSource = (function (_super) {
        __extends(AudioSource, _super);
        function AudioSource() {
            _super.call(this);
        }
        AudioSource.ClassName = function () {
            return "AudioSource";
        };
        AudioSource.prototype.GetTypeName = function () {
            return AudioSource.ClassName();
        };
        AudioSource.RegisterComponent = function () {
            AudioSource.m_class_names = Component_1.Component.m_class_names.slice(0);
            AudioSource.m_class_names.push("AudioSource");
            Component_1.Component.Register(AudioSource.ClassName(), function () {
                return new AudioSource();
            });
        };
        AudioSource.prototype.GetClassNames = function () {
            return AudioSource.m_class_names;
        };
        AudioSource.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
        };
        AudioSource.TryUnlock = function () {
            if (!AudioSource.m_unlocked) {
                AudioSource.m_unlocked = true;
                var context = AudioSource.m_context;
                var buffer = context.createBuffer(1, 1, 22050);
                var source = context.createBufferSource();
                source.buffer = buffer;
                source.connect(context.destination);
                source.start();
            }
        };
        AudioSource.prototype.SetClip = function (file) {
            var _this = this;
            var ms = Resource_1.Resource.GetGlobalAssetBundle().GetAssetData(file);
            AudioSource.m_context.decodeAudioData(ms.GetSlice(), function (buffer) {
                _this.m_buffer = buffer;
            });
        };
        AudioSource.prototype.Play = function () {
            if (this.m_source != null) {
                this.m_source.stop();
                this.m_source.disconnect();
                this.m_source = null;
            }
            this.m_source = AudioSource.m_context.createBufferSource();
            this.m_source.buffer = this.m_buffer;
            this.m_source.connect(AudioSource.m_context.destination);
            this.m_source.start();
        };
        AudioSource.m_context = new (window.AudioContext || window.webkitAudioContext)();
        AudioSource.m_unlocked = false;
        return AudioSource;
    }(Component_1.Component));
    exports.AudioSource = AudioSource;
});
//# sourceMappingURL=AudioSource.js.map