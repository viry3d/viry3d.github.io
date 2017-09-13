var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Tweener", "../Component", "../math/Vector3"], function (require, exports, Tweener_1, Component_1, Vector3_1) {
    "use strict";
    var TweenPosition = (function (_super) {
        __extends(TweenPosition, _super);
        function TweenPosition() {
            _super.call(this);
            this.from = new Vector3_1.Vector3();
            this.to = new Vector3_1.Vector3();
            this.local_space = true;
        }
        TweenPosition.ClassName = function () {
            return "TweenPosition";
        };
        TweenPosition.prototype.GetTypeName = function () {
            return TweenPosition.ClassName();
        };
        TweenPosition.RegisterComponent = function () {
            TweenPosition.m_class_names = Tweener_1.Tweener.m_class_names.slice(0);
            TweenPosition.m_class_names.push("TweenPosition");
            Component_1.Component.Register(TweenPosition.ClassName(), function () {
                return new TweenPosition();
            });
        };
        TweenPosition.prototype.GetClassNames = function () {
            return TweenPosition.m_class_names;
        };
        TweenPosition.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.from = src.from;
            this.to = src.to;
            this.local_space = src.local_space;
        };
        TweenPosition.prototype.OnSetValue = function (value) {
            var pos = Vector3_1.Vector3.Lerp(this.from, this.to, value);
            if (this.local_space) {
                this.GetTransform().SetLocalPosition(pos);
            }
            else {
                this.GetTransform().SetPosition(pos);
            }
        };
        return TweenPosition;
    }(Tweener_1.Tweener));
    exports.TweenPosition = TweenPosition;
});
//# sourceMappingURL=TweenPosition.js.map