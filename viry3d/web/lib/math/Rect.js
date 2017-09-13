define(["require", "exports"], function (require, exports) {
    "use strict";
    var Rect = (function () {
        function Rect(x, y, w, h) {
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
        }
        Rect.prototype.Set = function (v) {
            this.x = v.x;
            this.y = v.y;
            this.width = v.width;
            this.height = v.height;
        };
        return Rect;
    }());
    exports.Rect = Rect;
});
//# sourceMappingURL=Rect.js.map