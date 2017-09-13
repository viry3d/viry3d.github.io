define(["require", "exports", "./Mathf"], function (require, exports, Mathf_1) {
    "use strict";
    var Vector2 = (function () {
        function Vector2(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        Vector2.prototype.Set = function (v) {
            this.x = v.x;
            this.y = v.y;
        };
        Vector2.prototype.Add = function (v) {
            return new Vector2(this.x + v.x, this.y + v.y);
        };
        Vector2.prototype.Subtract = function (v) {
            return new Vector2(this.x - v.x, this.y - v.y);
        };
        Vector2.prototype.toString = function () {
            return "(" + this.x + ", " + this.y + ")";
        };
        Vector2.prototype.Equals = function (v) {
            return Mathf_1.Mathf.FloatEquals(this.x, v.x) &&
                Mathf_1.Mathf.FloatEquals(this.y, v.y);
        };
        return Vector2;
    }());
    exports.Vector2 = Vector2;
});
//# sourceMappingURL=Vector2.js.map