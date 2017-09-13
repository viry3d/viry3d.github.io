define(["require", "exports"], function (require, exports) {
    "use strict";
    var Mathf = (function () {
        function Mathf() {
        }
        Mathf.FloatEquals = function (v1, v2) {
            return Math.abs(v1 - v2) < Mathf.Epsilon;
        };
        Mathf.Max = function (a, b) {
            return a > b ? a : b;
        };
        Mathf.Min = function (a, b) {
            return a < b ? a : b;
        };
        Mathf.Clamp = function (value, min, max) {
            return Mathf.Min(Mathf.Max(value, min), max);
        };
        Mathf.Clamp01 = function (value) {
            return Mathf.Min(Mathf.Max(value, 0), 1);
        };
        Mathf.Round = function (f) {
            var up = Math.ceil(f);
            var down = Math.floor(f);
            if (f - down < 0.5) {
                return down;
            }
            else if (up - f < 0.5) {
                return up;
            }
            else {
                return ((up % 2) == 0 ? up : down);
            }
        };
        Mathf.RoundToInt = function (f) {
            return Mathf.Round(f);
        };
        Mathf.RandomRange = function (min, max) {
            return min + Math.random() * (max - min);
        };
        Mathf.Lerp = function (from, to, t) {
            return from + (to - from) * t;
        };
        Mathf.Epsilon = 0.0000001;
        Mathf.PI = 3.1415926;
        Mathf.Deg2Rad = 0.0174533;
        Mathf.Rad2Deg = 57.2958;
        Mathf.MaxFloatValue = 3.402823466e+38;
        Mathf.MinFloatValue = -Mathf.MaxFloatValue;
        return Mathf;
    }());
    exports.Mathf = Mathf;
});
//# sourceMappingURL=Mathf.js.map