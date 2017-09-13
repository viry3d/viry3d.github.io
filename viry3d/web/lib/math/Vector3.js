define(["require", "exports", "./Mathf"], function (require, exports, Mathf_1) {
    "use strict";
    var Vector3 = (function () {
        function Vector3(x, y, z) {
            this.x = x == null ? 0 : x;
            this.y = y == null ? 0 : y;
            this.z = z == null ? 0 : z;
        }
        Vector3.Zero = function () {
            return new Vector3(0, 0, 0);
        };
        Vector3.One = function () {
            return new Vector3(1, 1, 1);
        };
        Vector3.Normalize = function (value) {
            var v = new Vector3();
            v.Set(value);
            v.Normalize();
            return v;
        };
        Vector3.Angle = function (from, to) {
            var mod = from.SqrMagnitude() * to.SqrMagnitude();
            var dot = from.Dot(to) / Math.sqrt(mod);
            dot = Mathf_1.Mathf.Clamp(dot, -1.0, 1.0);
            var deg = Math.acos(dot) * Mathf_1.Mathf.Rad2Deg;
            return deg;
        };
        Vector3.Multiply = function (a, b) {
            return new Vector3(a.x * b, a.y * b, a.z * b);
        };
        Vector3.Add = function (a, b) {
            return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
        };
        Vector3.Lerp = function (from, to, t) {
            return new Vector3(Mathf_1.Mathf.Lerp(from.x, to.x, t), Mathf_1.Mathf.Lerp(from.y, to.y, t), Mathf_1.Mathf.Lerp(from.z, to.z, t));
        };
        Vector3.prototype.Normalize = function () {
            var sqr_magnitude = this.SqrMagnitude();
            if (!Mathf_1.Mathf.FloatEquals(sqr_magnitude, 0)) {
                var sq = Math.sqrt(sqr_magnitude);
                var inv = 1.0 / sq;
                this.x = this.x * inv;
                this.y = this.y * inv;
                this.z = this.z * inv;
            }
        };
        Vector3.prototype.Add = function (v) {
            return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
        };
        Vector3.prototype.Multiply = function (v) {
            return new Vector3(this.x * v, this.y * v, this.z * v);
        };
        Vector3.prototype.Cross = function (v) {
            var _x = this.y * v.z - this.z * v.y;
            var _y = this.z * v.x - this.x * v.z;
            var _z = this.x * v.y - this.y * v.x;
            return new Vector3(_x, _y, _z);
        };
        Vector3.prototype.Dot = function (v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        };
        Vector3.prototype.SqrMagnitude = function () {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        };
        Vector3.prototype.Set = function (v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        };
        Vector3.prototype.toString = function () {
            return "(" + this.x + ", " + this.y + ", " + this.z + ")";
        };
        Vector3.prototype.Equals = function (v) {
            return Mathf_1.Mathf.FloatEquals(this.x, v.x) &&
                Mathf_1.Mathf.FloatEquals(this.y, v.y) &&
                Mathf_1.Mathf.FloatEquals(this.z, v.z);
        };
        return Vector3;
    }());
    exports.Vector3 = Vector3;
});
//# sourceMappingURL=Vector3.js.map