define(["require", "exports", "../math/Vector2", "../container/Vector", "../container/Map", "../graphics/Graphics", "../Input"], function (require, exports, Vector2_1, Vector_1, Map_1, Graphics_1, Input_1) {
    "use strict";
    var UIPointerEvent = (function () {
        function UIPointerEvent() {
            this.position = new Vector2_1.Vector2(0, 0);
        }
        return UIPointerEvent;
    }());
    exports.UIPointerEvent = UIPointerEvent;
    var UIEventHandler = (function () {
        function UIEventHandler() {
            this.enable = false;
        }
        UIEventHandler.HitTest = function (position, views) {
            var hit_views = new Vector_1.Vector();
            var pos_world = new Vector2_1.Vector2();
            pos_world.x = position.x - Graphics_1.Graphics.GetDisplay().GetWidth() / 2;
            pos_world.y = position.y - Graphics_1.Graphics.GetDisplay().GetHeight() / 2;
            views.ForEach(function (i) {
                var mat = i.rect.GetRenderer().GetTransform().GetLocalToWorldMatrix();
                var vertices = i.GetBoundsVertices();
                for (var j = 0; j < vertices.Size(); j++) {
                    // from canvas space to world space
                    vertices.Set(j, mat.MultiplyPoint3x4(vertices.Get(j)));
                }
                if (pos_world.x > vertices.Get(0).x &&
                    pos_world.x < vertices.Get(1).x &&
                    pos_world.y > vertices.Get(1).y &&
                    pos_world.y < vertices.Get(2).y) {
                    hit_views.Add(i);
                }
                return true;
            });
            return hit_views;
        };
        UIEventHandler.HandleUIEvent = function (list) {
            var touch_count = Input_1.Input.GetTouchCount();
            if (touch_count == 0) {
                return;
            }
            var views = new Vector_1.Vector();
            list.ForEach(function (i) {
                i.FindViews();
                var vs = i.GetViews();
                vs.ForEach(function (j) {
                    views.Add(j);
                    return true;
                });
                return true;
            });
            var _loop_1 = function(i) {
                var t = Input_1.Input.GetTouch(i);
                var e = new UIPointerEvent();
                e.position.Set(t.position);
                if (t.phase == Input_1.TouchPhase.Began) {
                    if (!UIEventHandler.m_hit_views.Contains(t.fingerId)) {
                        UIEventHandler.m_hit_views.Add(t.fingerId, new Vector_1.Vector());
                    }
                    var pointer_views = UIEventHandler.m_hit_views.Get(t.fingerId);
                    var hit_views = UIEventHandler.HitTest(t.position, views);
                    for (var j = hit_views.Size() - 1; j >= 0; j--) {
                        var event_handler = hit_views.Get(j).event_handler;
                        if (event_handler.enable) {
                            // send down event to top view in down
                            var on_pointer_down = event_handler.on_pointer_down;
                            if (on_pointer_down) {
                                on_pointer_down(e);
                            }
                            pointer_views.Add(hit_views.Get(j));
                        }
                    }
                }
                else if (t.phase == Input_1.TouchPhase.Moved) {
                    var pointer_views = UIEventHandler.m_hit_views.Get(t.fingerId);
                }
                else if (t.phase == Input_1.TouchPhase.Ended || t.phase == Input_1.TouchPhase.Canceled) {
                    var pointer_views = UIEventHandler.m_hit_views.Get(t.fingerId);
                    var hit_views_1 = UIEventHandler.HitTest(t.position, views);
                    var _loop_2 = function(j) {
                        var v = hit_views_1.Get(j);
                        if (v.event_handler.enable) {
                            // send up event to top view in up
                            var on_pointer_up = v.event_handler.on_pointer_up;
                            if (on_pointer_up) {
                                on_pointer_up(e);
                            }
                            // send click event to top view in down and in up
                            pointer_views.ForEach(function (k) {
                                if (k == v) {
                                    var on_pointer_click = v.event_handler.on_pointer_click;
                                    if (on_pointer_click) {
                                        on_pointer_click(e);
                                    }
                                    return false;
                                }
                                return true;
                            });
                            return "break";
                        }
                    };
                    for (var j = hit_views_1.Size() - 1; j >= 0; j--) {
                        var state_1 = _loop_2(j);
                        if (state_1 === "break") break;
                    }
                    // send up event to top view in down but not in up
                    pointer_views.ForEach(function (j) {
                        var v = j;
                        var not_hit = true;
                        for (var k = 0; k < hit_views_1.Size(); k++) {
                            if (v == hit_views_1.Get(k)) {
                                not_hit = false;
                                break;
                            }
                        }
                        if (not_hit) {
                            if (v.event_handler.enable) {
                                var on_pointer_up = v.event_handler.on_pointer_up;
                                if (on_pointer_up) {
                                    on_pointer_up(e);
                                }
                                return false;
                            }
                        }
                        return true;
                    });
                    UIEventHandler.m_hit_views.Remove(t.fingerId);
                }
            };
            for (var i = 0; i < touch_count; i++) {
                _loop_1(i);
            }
        };
        UIEventHandler.m_hit_views = new Map_1.VRMap();
        return UIEventHandler;
    }());
    exports.UIEventHandler = UIEventHandler;
});
//# sourceMappingURL=UIEventHandler.js.map