var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Component", "../GameObject", "../time/Time"], function (require, exports, Component_1, GameObject_1, Time_1) {
    "use strict";
    var Timer = (function (_super) {
        __extends(Timer, _super);
        function Timer() {
            _super.call(this);
            this.m_tick_count = 0;
            this.m_duration = 1;
            this.m_loop = false;
            this.m_time_start = Time_1.Time.GetTime();
        }
        Timer.ClassName = function () {
            return "Timer";
        };
        Timer.prototype.GetTypeName = function () {
            return Timer.ClassName();
        };
        Timer.RegisterComponent = function () {
            Timer.m_class_names = Component_1.Component.m_class_names.slice(0);
            Timer.m_class_names.push("Timer");
            Component_1.Component.Register(Timer.ClassName(), function () {
                return new Timer();
            });
        };
        Timer.prototype.GetClassNames = function () {
            return Timer.m_class_names;
        };
        Timer.CreateTimer = function (duration, loop) {
            var timer = GameObject_1.GameObject.Create("Timer").AddComponent("Timer");
            timer.m_duration = duration;
            timer.m_loop = loop;
            return timer;
        };
        Timer.prototype.DeepCopy = function (source) {
            console.error("can not copy this component");
        };
        Timer.prototype.Stop = function () {
            GameObject_1.GameObject.Destroy(this.GetGameObject());
        };
        Timer.prototype.Update = function () {
            var time = Time_1.Time.GetTime();
            if (time - this.m_time_start >= this.m_duration) {
                if (this.on_tick) {
                    this.m_tick_count++;
                    this.on_tick();
                }
                if (this.m_loop) {
                    this.m_time_start = time;
                }
                else {
                    this.Stop();
                }
            }
        };
        Object.defineProperty(Timer.prototype, "tick_count", {
            get: function () {
                return this.m_tick_count;
            },
            enumerable: true,
            configurable: true
        });
        return Timer;
    }(Component_1.Component));
    exports.Timer = Timer;
});
//# sourceMappingURL=Timer.js.map