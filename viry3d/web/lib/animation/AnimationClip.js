var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Object", "../container/Map", "../container/Vector", "../math/Mathf"], function (require, exports, Object_1, Map_1, Vector_1, Mathf_1) {
    "use strict";
    (function (AnimationWrapMode) {
        AnimationWrapMode[AnimationWrapMode["Default"] = 0] = "Default";
        AnimationWrapMode[AnimationWrapMode["Once"] = 1] = "Once";
        AnimationWrapMode[AnimationWrapMode["Clamp"] = 1] = "Clamp";
        AnimationWrapMode[AnimationWrapMode["Loop"] = 2] = "Loop";
        AnimationWrapMode[AnimationWrapMode["PingPong"] = 4] = "PingPong";
        AnimationWrapMode[AnimationWrapMode["ClampForever"] = 8] = "ClampForever";
    })(exports.AnimationWrapMode || (exports.AnimationWrapMode = {}));
    var AnimationWrapMode = exports.AnimationWrapMode;
    (function (CurveProperty) {
        CurveProperty[CurveProperty["LocalPosX"] = 0] = "LocalPosX";
        CurveProperty[CurveProperty["LocalPosY"] = 1] = "LocalPosY";
        CurveProperty[CurveProperty["LocalPosZ"] = 2] = "LocalPosZ";
        CurveProperty[CurveProperty["LocalRotX"] = 3] = "LocalRotX";
        CurveProperty[CurveProperty["LocalRotY"] = 4] = "LocalRotY";
        CurveProperty[CurveProperty["LocalRotZ"] = 5] = "LocalRotZ";
        CurveProperty[CurveProperty["LocalRotW"] = 6] = "LocalRotW";
        CurveProperty[CurveProperty["LocalScaX"] = 7] = "LocalScaX";
        CurveProperty[CurveProperty["LocalScaY"] = 8] = "LocalScaY";
        CurveProperty[CurveProperty["LocalScaZ"] = 9] = "LocalScaZ";
        CurveProperty[CurveProperty["Count"] = 10] = "Count";
    })(exports.CurveProperty || (exports.CurveProperty = {}));
    var CurveProperty = exports.CurveProperty;
    var Keyframe = (function () {
        function Keyframe(time, value, in_tangent, out_tangent) {
            this.in_tangent = 0.0;
            this.out_tangent = 0.0;
            this.tangent_mode = 0;
            this.time = 0.0;
            this.value = 0.0;
            this.time = time;
            this.value = value;
            this.in_tangent = in_tangent;
            this.out_tangent = out_tangent;
        }
        return Keyframe;
    }());
    exports.Keyframe = Keyframe;
    var AnimationCurve = (function () {
        function AnimationCurve() {
            this.keys = new Vector_1.Vector();
        }
        AnimationCurve.DefaultLinear = function () {
            var c = new AnimationCurve();
            c.keys.Add(new Keyframe(0, 0, 1, 1));
            c.keys.Add(new Keyframe(1, 1, 1, 1));
            return c;
        };
        AnimationCurve.Eval = function (time, k0, k1) {
            var dt = k1.time - k0.time;
            if (Math.abs(dt) < Mathf_1.Mathf.Epsilon) {
                return k0.value;
            }
            var t = (time - k0.time) / dt;
            var t2 = t * t;
            var t3 = t2 * t;
            var _t = 1 - t;
            var _t2 = _t * _t;
            var _t3 = _t2 * _t;
            var c = 1 / 3.0;
            var c0 = dt * c * k0.out_tangent + k0.value;
            var c1 = -dt * c * k1.in_tangent + k1.value;
            var value = k0.value * _t3 + 3 * c0 * t * _t2 + 3 * c1 * t2 * _t + k1.value * t3;
            return value;
        };
        AnimationCurve.prototype.Evaluate = function (time) {
            if (this.keys.Empty()) {
                return 0;
            }
            var back = this.keys.Get(this.keys.Size() - 1);
            if (time >= back.time) {
                return back.value;
            }
            for (var i = 0; i < this.keys.Size(); i++) {
                var frame = this.keys.Get(i);
                if (time < frame.time) {
                    if (i == 0) {
                        return frame.value;
                    }
                    else {
                        return AnimationCurve.Eval(time, this.keys.Get(i - 1), frame);
                    }
                }
            }
            return 0;
        };
        return AnimationCurve;
    }());
    exports.AnimationCurve = AnimationCurve;
    var CurveBinding = (function () {
        function CurveBinding() {
            this.path = "";
            this.curves = new Vector_1.Vector();
        }
        return CurveBinding;
    }());
    exports.CurveBinding = CurveBinding;
    var AnimationClip = (function (_super) {
        __extends(AnimationClip, _super);
        function AnimationClip() {
            _super.call(this);
            this.frame_rate = 0.0;
            this.length = 0.0;
            this.wrap_mode = AnimationWrapMode.Default;
            this.curves = new Map_1.VRMap();
        }
        return AnimationClip;
    }(Object_1.VRObject));
    exports.AnimationClip = AnimationClip;
});
//# sourceMappingURL=AnimationClip.js.map