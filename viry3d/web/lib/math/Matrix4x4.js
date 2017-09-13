define(["require", "exports", "./Vector3", "./Vector4", "./Mathf"], function (require, exports, Vector3_1, Vector4_1, Mathf_1) {
    "use strict";
    var Matrix4x4 = (function () {
        function Matrix4x4(values) {
            if (values != null && values.length == 16) {
                this.m = new Float32Array(values);
            }
            else {
                this.m = new Float32Array(16);
            }
        }
        Matrix4x4.Identity = function () {
            var values = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ];
            return new Matrix4x4(values);
        };
        Matrix4x4.Translation = function (t) {
            var m = Matrix4x4.Identity();
            m.m03 = t.x;
            m.m13 = t.y;
            m.m23 = t.z;
            return m;
        };
        Matrix4x4.Rotation = function (r) {
            var m = Matrix4x4.Identity();
            m.m00 = 1 - 2 * r.y * r.y - 2 * r.z * r.z;
            m.m10 = 2 * r.x * r.y + 2 * r.w * r.z;
            m.m20 = 2 * r.x * r.z - 2 * r.w * r.y;
            m.m01 = 2 * r.x * r.y - 2 * r.w * r.z;
            m.m11 = 1 - 2 * r.x * r.x - 2 * r.z * r.z;
            m.m21 = 2 * r.y * r.z + 2 * r.w * r.x;
            m.m02 = 2 * r.x * r.z + 2 * r.w * r.y;
            m.m12 = 2 * r.y * r.z - 2 * r.w * r.x;
            m.m22 = 1 - 2 * r.x * r.x - 2 * r.y * r.y;
            return m;
        };
        Matrix4x4.Scaling = function (s) {
            var m = Matrix4x4.Identity();
            m.m00 = s.x;
            m.m11 = s.y;
            m.m22 = s.z;
            return m;
        };
        Matrix4x4.TRS = function (t, r, s) {
            var mt = Matrix4x4.Translation(t);
            var mr = Matrix4x4.Rotation(r);
            var ms = Matrix4x4.Scaling(s);
            return mt.Multiply(mr).Multiply(ms);
        };
        Matrix4x4.LookTo = function (eye_position, to_direction, up_direction) {
            var m = Matrix4x4.Identity();
            var zaxis = new Vector3_1.Vector3(-to_direction.x, -to_direction.y, -to_direction.z);
            zaxis.Normalize();
            var xaxis = zaxis.Cross(up_direction);
            xaxis.Normalize();
            var yaxis = xaxis.Cross(zaxis);
            m.m00 = xaxis.x;
            m.m01 = xaxis.y;
            m.m02 = xaxis.z;
            m.m03 = -xaxis.Dot(eye_position);
            m.m10 = yaxis.x;
            m.m11 = yaxis.y;
            m.m12 = yaxis.z;
            m.m13 = -yaxis.Dot(eye_position);
            m.m20 = zaxis.x;
            m.m21 = zaxis.y;
            m.m22 = zaxis.z;
            m.m23 = -zaxis.Dot(eye_position);
            m.m30 = 0;
            m.m31 = 0;
            m.m32 = 0;
            m.m33 = 1.0;
            return m;
        };
        Matrix4x4.Perspective = function (fov, aspect, near, far) {
            var m = Matrix4x4.Identity();
            var scale_y = 1 / Math.tan(Mathf_1.Mathf.Deg2Rad * fov / 2);
            var scale_x = scale_y / aspect;
            m.m00 = scale_x;
            m.m11 = scale_y;
            m.m22 = (near + far) / (near - far);
            m.m23 = 2 * near * far / (near - far);
            m.m32 = -1.0;
            m.m33 = 0;
            return m;
        };
        Matrix4x4.Ortho = function (left, right, bottom, top, near, far) {
            var m = Matrix4x4.Identity();
            var r_l = 1 / (right - left);
            var t_b = 1 / (top - bottom);
            var n_f = 1 / (near - far);
            m.m00 = 2 * r_l;
            m.m03 = -(right + left) * r_l;
            m.m11 = 2 * t_b;
            m.m13 = -(top + bottom) * t_b;
            //cvv 0~1
            m.m22 = n_f;
            m.m23 = near * n_f;
            return m;
        };
        Matrix4x4.prototype.Multiply = function (mat) {
            var m = Matrix4x4.Identity();
            m.m00 = this.m00 * mat.m00 + this.m01 * mat.m10 + this.m02 * mat.m20 + this.m03 * mat.m30;
            m.m01 = this.m00 * mat.m01 + this.m01 * mat.m11 + this.m02 * mat.m21 + this.m03 * mat.m31;
            m.m02 = this.m00 * mat.m02 + this.m01 * mat.m12 + this.m02 * mat.m22 + this.m03 * mat.m32;
            m.m03 = this.m00 * mat.m03 + this.m01 * mat.m13 + this.m02 * mat.m23 + this.m03 * mat.m33;
            m.m10 = this.m10 * mat.m00 + this.m11 * mat.m10 + this.m12 * mat.m20 + this.m13 * mat.m30;
            m.m11 = this.m10 * mat.m01 + this.m11 * mat.m11 + this.m12 * mat.m21 + this.m13 * mat.m31;
            m.m12 = this.m10 * mat.m02 + this.m11 * mat.m12 + this.m12 * mat.m22 + this.m13 * mat.m32;
            m.m13 = this.m10 * mat.m03 + this.m11 * mat.m13 + this.m12 * mat.m23 + this.m13 * mat.m33;
            m.m20 = this.m20 * mat.m00 + this.m21 * mat.m10 + this.m22 * mat.m20 + this.m23 * mat.m30;
            m.m21 = this.m20 * mat.m01 + this.m21 * mat.m11 + this.m22 * mat.m21 + this.m23 * mat.m31;
            m.m22 = this.m20 * mat.m02 + this.m21 * mat.m12 + this.m22 * mat.m22 + this.m23 * mat.m32;
            m.m23 = this.m20 * mat.m03 + this.m21 * mat.m13 + this.m22 * mat.m23 + this.m23 * mat.m33;
            m.m30 = this.m30 * mat.m00 + this.m31 * mat.m10 + this.m32 * mat.m20 + this.m33 * mat.m30;
            m.m31 = this.m30 * mat.m01 + this.m31 * mat.m11 + this.m32 * mat.m21 + this.m33 * mat.m31;
            m.m32 = this.m30 * mat.m02 + this.m31 * mat.m12 + this.m32 * mat.m22 + this.m33 * mat.m32;
            m.m33 = this.m30 * mat.m03 + this.m31 * mat.m13 + this.m32 * mat.m23 + this.m33 * mat.m33;
            return m;
        };
        Matrix4x4.prototype.MultiplyVector = function (v) {
            var x = v.x;
            var y = v.y;
            var z = v.z;
            var w = v.w;
            var vx = x * this.m00 + y * this.m01 + z * this.m02 + w * this.m03;
            var vy = x * this.m10 + y * this.m11 + z * this.m12 + w * this.m13;
            var vz = x * this.m20 + y * this.m21 + z * this.m22 + w * this.m23;
            var vw = x * this.m30 + y * this.m31 + z * this.m32 + w * this.m33;
            return new Vector4_1.Vector4(vx, vy, vz, vw);
        };
        Matrix4x4.prototype.MultiplyPoint = function (v) {
            var x = v.x;
            var y = v.y;
            var z = v.z;
            var vx = x * this.m00 + y * this.m01 + z * this.m02 + this.m03;
            var vy = x * this.m10 + y * this.m11 + z * this.m12 + this.m13;
            var vz = x * this.m20 + y * this.m21 + z * this.m22 + this.m23;
            var vw = x * this.m30 + y * this.m31 + z * this.m32 + this.m33;
            return new Vector3_1.Vector3(vx / vw, vy / vw, vz / vw);
        };
        Matrix4x4.prototype.MultiplyPoint3x4 = function (v) {
            var x = v.x;
            var y = v.y;
            var z = v.z;
            var vx = x * this.m00 + y * this.m01 + z * this.m02 + this.m03;
            var vy = x * this.m10 + y * this.m11 + z * this.m12 + this.m13;
            var vz = x * this.m20 + y * this.m21 + z * this.m22 + this.m23;
            return new Vector3_1.Vector3(vx, vy, vz);
        };
        Matrix4x4.prototype.MultiplyDirection = function (v) {
            var x = v.x;
            var y = v.y;
            var z = v.z;
            var vx = x * this.m00 + y * this.m01 + z * this.m02;
            var vy = x * this.m10 + y * this.m11 + z * this.m12;
            var vz = x * this.m20 + y * this.m21 + z * this.m22;
            return new Vector3_1.Vector3(vx, vy, vz);
        };
        Matrix4x4.prototype.Inverse = function () {
            var ret = new Matrix4x4();
            ret.Set(this);
            var mat = ret.m;
            var is = new Array(4);
            var js = new Array(4);
            var SWAP = function (i1, i2, arr) {
                var temp = arr[i1];
                arr[i1] = arr[i2];
                arr[i2] = temp;
            };
            for (var i = 0; i < 4; i++) {
                var max = 0.0;
                for (var j = i; j < 4; j++) {
                    for (var k = i; k < 4; k++) {
                        var f = Math.abs(mat[j * 4 + k]);
                        if (f > max) {
                            max = f;
                            is[i] = j;
                            js[i] = k;
                        }
                    }
                }
                if (max < 0.0001) {
                    return ret;
                }
                if (is[i] != i) {
                    var temp = void 0;
                    SWAP(is[i] * 4 + 0, i * 4 + 0, mat);
                    SWAP(is[i] * 4 + 1, i * 4 + 1, mat);
                    SWAP(is[i] * 4 + 2, i * 4 + 2, mat);
                    SWAP(is[i] * 4 + 3, i * 4 + 3, mat);
                }
                if (js[i] != i) {
                    SWAP(0 * 4 + js[i], 0 * 4 + i, mat);
                    SWAP(1 * 4 + js[i], 1 * 4 + i, mat);
                    SWAP(2 * 4 + js[i], 2 * 4 + i, mat);
                    SWAP(3 * 4 + js[i], 3 * 4 + i, mat);
                }
                mat[i * 4 + i] = 1.0 / mat[i * 4 + i];
                var key = mat[i * 4 + i];
                for (var j = 0; j < 4; j++) {
                    if (j != i) {
                        mat[i * 4 + j] *= key;
                    }
                }
                for (var j = 0; j < 4; j++) {
                    if (j != i) {
                        for (var k = 0; k < 4; k++) {
                            if (k != i) {
                                mat[j * 4 + k] -= mat[i * 4 + k] * mat[j * 4 + i];
                            }
                        }
                    }
                }
                for (var j = 0; j < 4; j++) {
                    if (j != i) {
                        mat[j * 4 + i] *= -key;
                    }
                }
            }
            for (var i = 3; i >= 0; i--) {
                if (js[i] != i) {
                    SWAP(js[i] * 4 + 0, i * 4 + 0, mat);
                    SWAP(js[i] * 4 + 1, i * 4 + 1, mat);
                    SWAP(js[i] * 4 + 2, i * 4 + 2, mat);
                    SWAP(js[i] * 4 + 3, i * 4 + 3, mat);
                }
                if (is[i] != i) {
                    SWAP(0 * 4 + is[i], 0 * 4 + i, mat);
                    SWAP(1 * 4 + is[i], 1 * 4 + i, mat);
                    SWAP(2 * 4 + is[i], 2 * 4 + i, mat);
                    SWAP(3 * 4 + is[i], 3 * 4 + i, mat);
                }
            }
            return ret;
        };
        Matrix4x4.prototype.GetRow = function (row) {
            return new Vector4_1.Vector4(this.m[row * 4 + 0], this.m[row * 4 + 1], this.m[row * 4 + 2], this.m[row * 4 + 3]);
        };
        Matrix4x4.prototype.GetColumn = function (row) {
            return new Vector4_1.Vector4(this.m[0 * 4 + row], this.m[1 * 4 + row], this.m[2 * 4 + row], this.m[3 * 4 + row]);
        };
        Matrix4x4.prototype.Set = function (mat) {
            this.m.set(mat.m);
            return this;
        };
        Object.defineProperty(Matrix4x4.prototype, "m00", {
            get: function () { return this.m[0 * 4 + 0]; },
            set: function (v) { this.m[0 * 4 + 0] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m01", {
            get: function () { return this.m[0 * 4 + 1]; },
            set: function (v) { this.m[0 * 4 + 1] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m02", {
            get: function () { return this.m[0 * 4 + 2]; },
            set: function (v) { this.m[0 * 4 + 2] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m03", {
            get: function () { return this.m[0 * 4 + 3]; },
            set: function (v) { this.m[0 * 4 + 3] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m10", {
            get: function () { return this.m[1 * 4 + 0]; },
            set: function (v) { this.m[1 * 4 + 0] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m11", {
            get: function () { return this.m[1 * 4 + 1]; },
            set: function (v) { this.m[1 * 4 + 1] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m12", {
            get: function () { return this.m[1 * 4 + 2]; },
            set: function (v) { this.m[1 * 4 + 2] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m13", {
            get: function () { return this.m[1 * 4 + 3]; },
            set: function (v) { this.m[1 * 4 + 3] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m20", {
            get: function () { return this.m[2 * 4 + 0]; },
            set: function (v) { this.m[2 * 4 + 0] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m21", {
            get: function () { return this.m[2 * 4 + 1]; },
            set: function (v) { this.m[2 * 4 + 1] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m22", {
            get: function () { return this.m[2 * 4 + 2]; },
            set: function (v) { this.m[2 * 4 + 2] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m23", {
            get: function () { return this.m[2 * 4 + 3]; },
            set: function (v) { this.m[2 * 4 + 3] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m30", {
            get: function () { return this.m[3 * 4 + 0]; },
            set: function (v) { this.m[3 * 4 + 0] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m31", {
            get: function () { return this.m[3 * 4 + 1]; },
            set: function (v) { this.m[3 * 4 + 1] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m32", {
            get: function () { return this.m[3 * 4 + 2]; },
            set: function (v) { this.m[3 * 4 + 2] = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix4x4.prototype, "m33", {
            get: function () { return this.m[3 * 4 + 3]; },
            set: function (v) { this.m[3 * 4 + 3] = v; },
            enumerable: true,
            configurable: true
        });
        return Matrix4x4;
    }());
    exports.Matrix4x4 = Matrix4x4;
});
//# sourceMappingURL=Matrix4x4.js.map