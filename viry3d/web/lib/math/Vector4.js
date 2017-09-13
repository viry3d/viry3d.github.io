define(["require", "exports", "./Mathf"], function (require, exports, Mathf_1) {
    "use strict";
    var Vector4 = (function () {
        function Vector4(x, y, z, w) {
            this.array = new Float32Array(4);
            this.x = x == null ? 0 : x;
            this.y = y == null ? 0 : y;
            this.z = z == null ? 0 : z;
            this.w = w == null ? 0 : w;
        }
        Vector4.prototype.Set = function (v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            this.w = v.w;
            return this;
        };
        Vector4.prototype.toString = function () {
            return "(" + this.x + ", " + this.y + ", " + this.z + ", " + this.w + ")";
        };
        Vector4.prototype.Equals = function (v) {
            return Mathf_1.Mathf.FloatEquals(this.x, v.x) &&
                Mathf_1.Mathf.FloatEquals(this.y, v.y) &&
                Mathf_1.Mathf.FloatEquals(this.z, v.z) &&
                Mathf_1.Mathf.FloatEquals(this.w, v.w);
        };
        Object.defineProperty(Vector4.prototype, "x", {
            get: function () { return this.array[0]; },
            set: function (v) { this.array[0] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector4.prototype, "y", {
            get: function () { return this.array[1]; },
            set: function (v) { this.array[1] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector4.prototype, "z", {
            get: function () { return this.array[2]; },
            set: function (v) { this.array[2] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector4.prototype, "w", {
            get: function () { return this.array[3]; },
            set: function (v) { this.array[3] = v; },
            enumerable: true,
            configurable: true
        });
        return Vector4;
    }());
    exports.Vector4 = Vector4;
});
//# sourceMappingURL=Vector4.js.map