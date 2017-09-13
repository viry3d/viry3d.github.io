var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Component", "../animation/AnimationClip", "../time/Time"], function (require, exports, Component_1, AnimationClip_1, Time_1) {
    "use strict";
    (function (TweenerPlayStyle) {
        TweenerPlayStyle[TweenerPlayStyle["Once"] = 0] = "Once";
        TweenerPlayStyle[TweenerPlayStyle["Loop"] = 1] = "Loop";
        TweenerPlayStyle[TweenerPlayStyle["PingPong"] = 2] = "PingPong";
    })(exports.TweenerPlayStyle || (exports.TweenerPlayStyle = {}));
    var TweenerPlayStyle = exports.TweenerPlayStyle;
    ;
    var Tweener = (function (_super) {
        __extends(Tweener, _super);
        function Tweener() {
            _super.call(this);
            this.duration = 1;
            this.delay = 0;
            this.play_style = TweenerPlayStyle.Once;
            this.m_time = 0;
            this.m_reverse = false;
            this.m_finish = false;
            this.m_curve = AnimationClip_1.AnimationCurve.DefaultLinear();
            this.m_time_start = Time_1.Time.GetTime();
        }
        Tweener.ClassName = function () {
            return "Tweener";
        };
        Tweener.prototype.GetTypeName = function () {
            return Tweener.ClassName();
        };
        Tweener.RegisterComponent = function () {
            Tweener.m_class_names = Component_1.Component.m_class_names.slice(0);
            Tweener.m_class_names.push("Tweener");
        };
        Tweener.prototype.GetClassNames = function () {
            return Tweener.m_class_names;
        };
        Tweener.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.curve = src.curve;
            this.duration = src.duration;
            this.play_style = src.play_style;
            this.m_time_start = src.m_time_start;
            this.m_time = src.m_time;
            this.m_reverse = src.m_reverse;
            this.m_finish = src.m_finish;
        };
        Tweener.prototype.Update = function () {
            var time = Time_1.Time.GetTime();
            var t = -1;
            if (time - this.m_time_start >= this.delay && time - this.m_time_start - this.delay <= this.duration) {
                t = (time - this.m_time_start - this.delay) / this.duration;
            }
            else if (time - this.m_time_start - this.delay > this.duration) {
                if (this.play_style == TweenerPlayStyle.Once) {
                    this.m_finish = true;
                    if (this.m_time < 1) {
                        t = 1;
                    }
                }
                else if (this.play_style == TweenerPlayStyle.Loop) {
                    this.m_time_start = time;
                    t = 0;
                }
                else if (this.play_style == TweenerPlayStyle.PingPong) {
                    this.m_time_start = time;
                    t = 0;
                    this.m_reverse = !this.m_reverse;
                }
            }
            if (t >= 0 && t <= 1) {
                this.m_time = t;
                var value = void 0;
                if (this.m_reverse) {
                    value = this.m_curve.Evaluate(1 - t);
                }
                else {
                    value = this.m_curve.Evaluate(t);
                }
                this.OnSetValue(value);
            }
            if (this.m_finish) {
                if (this.on_finish) {
                    this.on_finish();
                }
                Component_1.Component.Destroy(this);
            }
        };
        Tweener.prototype.OnSetValue = function (value) { };
        Object.defineProperty(Tweener.prototype, "curve", {
            set: function (frames) {
                this.m_curve.keys.Clear();
                for (var i = 0; i < frames.length; i += 4) {
                    this.m_curve.keys.Add(new AnimationClip_1.Keyframe(frames[i], frames[i + 1], frames[i + 2], frames[i + 3]));
                }
            },
            enumerable: true,
            configurable: true
        });
        return Tweener;
    }(Component_1.Component));
    exports.Tweener = Tweener;
});
//# sourceMappingURL=Tweener.js.map