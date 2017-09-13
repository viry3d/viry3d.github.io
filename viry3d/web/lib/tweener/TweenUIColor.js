var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Tweener", "../Component", "../graphics/Color"], function (require, exports, Tweener_1, Component_1, Color_1) {
    "use strict";
    var TweenUIColor = (function (_super) {
        __extends(TweenUIColor, _super);
        function TweenUIColor() {
            _super.call(this);
            this.from = new Color_1.Color(1, 1, 1, 1);
            this.to = new Color_1.Color(1, 1, 1, 1);
        }
        TweenUIColor.ClassName = function () {
            return "TweenUIColor";
        };
        TweenUIColor.prototype.GetTypeName = function () {
            return TweenUIColor.ClassName();
        };
        TweenUIColor.RegisterComponent = function () {
            TweenUIColor.m_class_names = Tweener_1.Tweener.m_class_names.slice(0);
            TweenUIColor.m_class_names.push("TweenUIColor");
            Component_1.Component.Register(TweenUIColor.ClassName(), function () {
                return new TweenUIColor();
            });
        };
        TweenUIColor.prototype.GetClassNames = function () {
            return TweenUIColor.m_class_names;
        };
        TweenUIColor.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.from = src.from;
            this.to = src.to;
        };
        TweenUIColor.prototype.OnSetValue = function (value) {
            var color = Color_1.Color.Lerp(this.from, this.to, value);
            var views = this.GetGameObject().GetComponentsInChildren("UIView");
            for (var i = 0; i < views.length; i++) {
                views[i].SetColor(color);
            }
        };
        return TweenUIColor;
    }(Tweener_1.Tweener));
    exports.TweenUIColor = TweenUIColor;
});
//# sourceMappingURL=TweenUIColor.js.map