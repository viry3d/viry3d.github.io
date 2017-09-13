define(["require", "exports", "./Mathf", "./Vector3"], function (require, exports, Mathf_1, Vector3_1) {
    "use strict";
    var Quaternion = (function () {
        function Quaternion(x, y, z, w) {
            this.x = x == null ? 0 : x;
            this.y = y == null ? 0 : y;
            this.z = z == null ? 0 : z;
            this.w = w == null ? 0 : w;
        }
        Quaternion.Identity = function () {
            return new Quaternion(0, 0, 0, 1);
        };
        Quaternion.Inverse = function (q) {
            return new Quaternion(-q.x, -q.y, -q.z, q.w);
        };
        Quaternion.AngleAxis = function (angle, axis) {
            var v = Vector3_1.Vector3.Normalize(axis);
            var cosv = Math.cos(Mathf_1.Mathf.Deg2Rad * angle * 0.5);
            var sinv = Math.sin(Mathf_1.Mathf.Deg2Rad * angle * 0.5);
            var x = v.x * sinv;
            var y = v.y * sinv;
            var z = v.z * sinv;
            var w = cosv;
            return new Quaternion(x, y, z, w);
        };
        Quaternion.Euler = function (x, y, z) {
            var around_x = Quaternion.AngleAxis(x, new Vector3_1.Vector3(1, 0, 0));
            var around_y = Quaternion.AngleAxis(y, new Vector3_1.Vector3(0, 1, 0));
            var around_z = Quaternion.AngleAxis(z, new Vector3_1.Vector3(0, 0, 1));
            return around_y.Multiply(around_x).Multiply(around_z);
        };
        Quaternion.Multiply = function (a, b) {
            return new Quaternion(a.x * b, a.y * b, a.z * b, a.w * b);
        };
        Quaternion.prototype.Set = function (v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            this.w = v.w;
            return this;
        };
        Quaternion.prototype.Normalize = function () {
            var sqr_magnitude = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
            if (!Mathf_1.Mathf.FloatEquals(sqr_magnitude, 0)) {
                var sq = Math.sqrt(sqr_magnitude);
                var inv = 1.0 / sq;
                this.x = this.x * inv;
                this.y = this.y * inv;
                this.z = this.z * inv;
                this.w = this.w * inv;
            }
        };
        Quaternion.prototype.Multiply = function (q) {
            var _x = this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y;
            var _y = this.w * q.y + this.y * q.w + this.z * q.x - this.x * q.z;
            var _z = this.w * q.z + this.z * q.w + this.x * q.y - this.y * q.x;
            var _w = this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z;
            return new Quaternion(_x, _y, _z, _w);
        };
        Quaternion.prototype.MultiplyDirection = function (v) {
            var p = this.Multiply(new Quaternion(v.x, v.y, v.z, 0)).Multiply(Quaternion.Inverse(this));
            return new Vector3_1.Vector3(p.x, p.y, p.z);
        };
        Quaternion.prototype.Dot = function (v) {
            return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
        };
        Quaternion.prototype.Equals = function (v) {
            return Mathf_1.Mathf.FloatEquals(this.x, v.x) &&
                Mathf_1.Mathf.FloatEquals(this.y, v.y) &&
                Mathf_1.Mathf.FloatEquals(this.z, v.z) &&
                Mathf_1.Mathf.FloatEquals(this.w, v.w);
        };
        return Quaternion;
    }());
    exports.Quaternion = Quaternion;
});
//# sourceMappingURL=Quaternion.js.map