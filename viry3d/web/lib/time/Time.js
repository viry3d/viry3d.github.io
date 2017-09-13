define(["require", "exports"], function (require, exports) {
    "use strict";
    var VRDate = (function () {
        function VRDate() {
            this.year = 0;
            this.month = 0;
            this.day = 0;
            this.hour = 0;
            this.minute = 0;
            this.second = 0;
            this.milli_second = 0;
            this.week_day = 0;
        }
        return VRDate;
    }());
    exports.VRDate = VRDate;
    var Time = (function () {
        function Time() {
        }
        Time.GetTime = function () {
            return Time.m_time;
        };
        Time.GetDeltaTime = function () {
            return Time.m_time_delta;
        };
        Time.GetRealTimeSinceStartup = function () {
            if (Time.m_time_startup == 0) {
                Time.m_time_startup = Time.GetTimeMS();
            }
            var time = Time.GetTimeMS() - Time.m_time_startup;
            return time / 1000.0;
        };
        Time.GetDate = function () {
            var date = new VRDate();
            var d = new Date(Date.now());
            date.year = d.getFullYear();
            date.month = d.getMonth() + 1;
            date.day = d.getDate();
            date.hour = d.getHours();
            date.minute = d.getMinutes();
            date.second = d.getSeconds();
            date.milli_second = d.getMilliseconds();
            date.week_day = d.getDay();
            return date;
        };
        Time.GetFPS = function () {
            return Time.m_fps;
        };
        Time.Update = function () {
            var time = Time.GetRealTimeSinceStartup();
            Time.m_time_delta = time - Time.m_time;
            Time.m_time = time;
            if (Time.m_time_record < 0) {
                Time.m_time_record = Time.GetRealTimeSinceStartup();
                Time.m_frame_record = Time.m_frame_count;
            }
            var frame = Time.m_frame_count;
            if (time - Time.m_time_record >= 1) {
                Time.m_fps = frame - Time.m_frame_record;
                Time.m_time_record = time;
                Time.m_frame_record = frame;
            }
            Time.m_frame_count++;
        };
        Time.GetTimeMS = function () {
            return Date.now();
        };
        Time.m_time_startup = 0;
        Time.m_time_delta = 0;
        Time.m_time_record = -1;
        Time.m_frame_count = 0;
        Time.m_frame_record = 0;
        Time.m_time = 0;
        Time.m_fps = 0;
        Time.m_render_time = 0;
        Time.m_update_time = 0;
        return Time;
    }());
    exports.Time = Time;
});
//# sourceMappingURL=Time.js.map