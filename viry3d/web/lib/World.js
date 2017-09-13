define(["require", "exports", "./container/Map", "./container/List", "./renderer/Renderer"], function (require, exports, Map_1, List_1, Renderer_1) {
    "use strict";
    var World = (function () {
        function World() {
        }
        World.Init = function () {
            var win = window;
            win.show_world = function () {
                return World.m_gameobjects;
            };
        };
        World.AddGameObject = function (obj) {
            World.m_gameobjects_new.Add(obj.GetId(), obj);
        };
        World.Update = function () {
            Renderer_1.Renderer.HandleUIEvent();
            //	start
            var starts = new Map_1.VRMap(World.m_gameobjects);
            do {
                starts.ForEach(function (k, v) {
                    var obj = v;
                    if (obj.IsActiveInHierarchy()) {
                        obj.Start();
                    }
                    return true;
                });
                starts.Clear();
                World.m_gameobjects_new.ForEach(function (k, v) {
                    var key = parseInt(k);
                    starts.Add(key, v);
                    World.m_gameobjects.Add(key, v);
                    return true;
                });
                World.m_gameobjects_new.Clear();
            } while (!starts.Empty());
            //	update
            World.m_gameobjects.ForEach(function (k, v) {
                var obj = v;
                if (obj.IsActiveInHierarchy()) {
                    obj.Update();
                }
                return true;
            });
            //	late update
            World.m_gameobjects.ForEach(function (k, v) {
                var obj = v;
                if (obj.IsActiveInHierarchy()) {
                    obj.LateUpdate();
                }
                return true;
            });
            var renderers = Renderer_1.Renderer.GetRenderers();
            renderers.Clear();
            //	delete
            var deletes = new List_1.List();
            World.m_gameobjects.ForEach(function (k, v) {
                var obj = v;
                if (obj.IsDeleted()) {
                    deletes.AddLast(obj);
                }
                else {
                    var rs = obj.GetComponents("Renderer");
                    for (var i = 0; i < rs.length; i++) {
                        renderers.AddLast(rs[i]);
                    }
                }
                return true;
            });
            deletes.ForEach(function (i) {
                World.m_gameobjects.Remove(i.GetId());
                return true;
            });
        };
        World.m_gameobjects_new = new Map_1.VRMap();
        World.m_gameobjects = new Map_1.VRMap();
        return World;
    }());
    exports.World = World;
});
//# sourceMappingURL=World.js.map