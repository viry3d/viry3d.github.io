var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Object", "../math/Vector4", "../math/Rect"], function (require, exports, Object_1, Vector4_1, Rect_1) {
    "use strict";
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite() {
            _super.call(this);
            this.rect = new Rect_1.Rect(0, 0, 1, 1);
            this.border = new Vector4_1.Vector4(0, 0, 0, 0);
        }
        Sprite.Create = function (rect, border) {
            var s = new Sprite();
            s.rect.Set(rect);
            s.border.Set(border);
            return s;
        };
        return Sprite;
    }(Object_1.VRObject));
    exports.Sprite = Sprite;
});
//# sourceMappingURL=Sprite.js.map