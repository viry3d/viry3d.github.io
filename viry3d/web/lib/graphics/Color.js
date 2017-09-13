define(["require", "exports", "../math/Mathf"], function (require, exports, Mathf_1) {
    "use strict";
    var Color = (function () {
        function Color(r, g, b, a) {
            if (r === void 0) { r = 1; }
            if (g === void 0) { g = 1; }
            if (b === void 0) { b = 1; }
            if (a === void 0) { a = 1; }
            this.array = new Float32Array(4);
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        Color.Lerp = function (from, to, t) {
            return new Color(Mathf_1.Mathf.Lerp(from.r, to.r, t), Mathf_1.Mathf.Lerp(from.g, to.g, t), Mathf_1.Mathf.Lerp(from.b, to.b, t), Mathf_1.Mathf.Lerp(from.a, to.a, t));
        };
        Color.prototype.Set = function (v) {
            this.r = v.r;
            this.g = v.g;
            this.b = v.b;
            this.a = v.a;
            return this;
        };
        Color.prototype.Equals = function (v) {
            return Mathf_1.Mathf.FloatEquals(this.r, v.r) &&
                Mathf_1.Mathf.FloatEquals(this.g, v.g) &&
                Mathf_1.Mathf.FloatEquals(this.b, v.b) &&
                Mathf_1.Mathf.FloatEquals(this.a, v.a);
        };
        Object.defineProperty(Color.prototype, "r", {
            get: function () { return this.array[0]; },
            set: function (v) { this.array[0] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "g", {
            get: function () { return this.array[1]; },
            set: function (v) { this.array[1] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "b", {
            get: function () { return this.array[2]; },
            set: function (v) { this.array[2] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "a", {
            get: function () { return this.array[3]; },
            set: function (v) { this.array[3] = v; },
            enumerable: true,
            configurable: true
        });
        return Color;
    }());
    exports.Color = Color;
});
//# sourceMappingURL=Color.js.map