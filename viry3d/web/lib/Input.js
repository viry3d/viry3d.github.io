define(["require", "exports", "./math/Vector2", "./container/Vector", "./container/List", "./time/Time", "./Application", "./audio/AudioSource"], function (require, exports, Vector2_1, Vector_1, List_1, Time_1, Application_1, AudioSource_1) {
    "use strict";
    (function (TouchPhase) {
        TouchPhase[TouchPhase["Began"] = 0] = "Began";
        TouchPhase[TouchPhase["Moved"] = 1] = "Moved";
        TouchPhase[TouchPhase["Stationary"] = 2] = "Stationary";
        TouchPhase[TouchPhase["Ended"] = 3] = "Ended";
        TouchPhase[TouchPhase["Canceled"] = 4] = "Canceled";
    })(exports.TouchPhase || (exports.TouchPhase = {}));
    var TouchPhase = exports.TouchPhase;
    var Touch = (function () {
        function Touch() {
        }
        return Touch;
    }());
    exports.Touch = Touch;
    var Input = (function () {
        function Input() {
        }
        Input.BindTouchEventListener = function (ele) {
            var platform = Application_1.Application.Platform();
            if (platform == Application_1.Platform.Android || platform == Application_1.Platform.iOS) {
                var touch_begin_1 = function (touches, time) {
                    for (var i = 0; i < touches.length; i++) {
                        var touch = touches[i];
                        var x = touch.pageX;
                        var y = ele.height - touch.pageY - 1;
                        var t = new Touch();
                        t.deltaPosition = new Vector2_1.Vector2(0, 0);
                        t.deltaTime = 0;
                        t.time = time / 1000.0;
                        t.fingerId = touch.identifier;
                        t.phase = TouchPhase.Began;
                        t.tapCount = touches.length;
                        t.position = new Vector2_1.Vector2(x, y);
                        if (!Input.g_input_touches.Empty()) {
                            Input.g_input_touch_buffer.AddLast(t);
                        }
                        else {
                            Input.g_input_touches.Add(t);
                        }
                    }
                };
                var touch_update_1 = function (touches, time, phase) {
                    for (var i = 0; i < touches.length; i++) {
                        var touch = touches[i];
                        var x = touch.pageX;
                        var y = ele.height - touch.pageY - 1;
                        var t = new Touch();
                        t.deltaPosition = new Vector2_1.Vector2(0, 0);
                        t.deltaTime = 0;
                        t.time = time / 1000.0;
                        t.fingerId = touch.identifier;
                        t.phase = phase;
                        t.tapCount = touches.length;
                        t.position = new Vector2_1.Vector2(x, y);
                        if (!Input.g_input_touches.Empty()) {
                            Input.g_input_touch_buffer.AddLast(t);
                        }
                        else {
                            Input.g_input_touches.Add(t);
                        }
                    }
                };
                //touch
                ele.addEventListener("touchstart", function (e) {
                    e.preventDefault();
                    touch_begin_1(e.changedTouches, e.timeStamp);
                });
                ele.addEventListener("touchmove", function (e) {
                    e.preventDefault();
                    touch_update_1(e.changedTouches, e.timeStamp, TouchPhase.Moved);
                });
                ele.addEventListener("touchend", function (e) {
                    e.preventDefault();
                    touch_update_1(e.changedTouches, e.timeStamp, TouchPhase.Ended);
                });
                ele.addEventListener("touchcancel", function (e) {
                    e.preventDefault();
                    touch_update_1(e.changedTouches, e.timeStamp, TouchPhase.Canceled);
                });
            }
            else {
                var mouse_begin_1 = function (e) {
                    var x = e.pageX;
                    var y = ele.height - e.pageY - 1;
                    var t = new Touch();
                    t.deltaPosition = new Vector2_1.Vector2(0, 0);
                    t.deltaTime = 0;
                    t.time = Time_1.Time.GetRealTimeSinceStartup();
                    t.fingerId = 0;
                    t.phase = TouchPhase.Began;
                    t.tapCount = 1;
                    t.position = new Vector2_1.Vector2(x, y);
                    if (!Input.g_input_touches.Empty()) {
                        Input.g_input_touch_buffer.AddLast(t);
                    }
                    else {
                        Input.g_input_touches.Add(t);
                    }
                };
                var mouse_update_1 = function (e, phase) {
                    var x = e.pageX;
                    var y = ele.height - e.pageY - 1;
                    var t = new Touch();
                    t.deltaPosition = new Vector2_1.Vector2(0, 0);
                    t.deltaTime = 0;
                    t.time = Time_1.Time.GetRealTimeSinceStartup();
                    t.fingerId = 0;
                    t.phase = phase;
                    t.tapCount = 1;
                    t.position = new Vector2_1.Vector2(x, y);
                    if (!Input.g_input_touches.Empty()) {
                        Input.g_input_touch_buffer.AddLast(t);
                    }
                    else {
                        Input.g_input_touches.Add(t);
                    }
                };
                //mouse
                ele.addEventListener("mousedown", function (e) {
                    mouse_begin_1(e);
                    Input.g_input_down = true;
                });
                ele.addEventListener("mousemove", function (e) {
                    if (Input.g_input_down) {
                        mouse_update_1(e, TouchPhase.Moved);
                    }
                });
                ele.addEventListener("mouseup", function (e) {
                    mouse_update_1(e, TouchPhase.Ended);
                    Input.g_input_down = false;
                });
            }
            if (platform == Application_1.Platform.iOS) {
                ele.addEventListener("touchstart", function (e) {
                    e.preventDefault();
                    AudioSource_1.AudioSource.TryUnlock();
                });
            }
        };
        Input.GetTouchCount = function () {
            return Input.g_input_touches.Size();
        };
        Input.GetTouch = function (index) {
            if (index >= 0 && index < Input.g_input_touches.Size()) {
                return Input.g_input_touches.Get(index);
            }
            return null;
        };
        Input.Update = function () {
            Input.g_input_touches.Clear();
            if (!Input.g_input_touch_buffer.Empty()) {
                Input.g_input_touches.Add(Input.g_input_touch_buffer.First());
                Input.g_input_touch_buffer.RemoveFirst();
            }
        };
        Input.g_input_down = false;
        Input.g_input_touches = new Vector_1.Vector();
        Input.g_input_touch_buffer = new List_1.List();
        return Input;
    }());
    exports.Input = Input;
});
//# sourceMappingURL=Input.js.map