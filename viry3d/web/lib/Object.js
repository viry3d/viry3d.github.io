define(["require", "exports", "./container/Map", "./container/Vector"], function (require, exports, Map_1, Vector_1) {
    "use strict";
    var VRObject = (function () {
        function VRObject() {
            this.m_name = "Object";
            this.m_id = VRObject.m_id++;
        }
        VRObject.GetCache = function (path) {
            var ptr = [null];
            if (VRObject.m_cache.TryGet(path, ptr)) {
                return ptr[0];
            }
            return null;
        };
        VRObject.AddCache = function (path, obj) {
            VRObject.m_cache.Add(path, obj);
        };
        VRObject.IsLoading = function (path) {
            return VRObject.m_load_watcher.Contains(path);
        };
        VRObject.WatchLoad = function (path, finish) {
            VRObject.m_load_watcher.Get(path).Add(finish);
        };
        VRObject.BeginLoad = function (path) {
            VRObject.m_load_watcher.Add(path, new Vector_1.Vector());
        };
        VRObject.EndLoad = function (path) {
            var obj = VRObject.m_cache.Get(path);
            var watches = VRObject.m_load_watcher.Get(path);
            watches.ForEach(function (i) {
                if (i) {
                    i(obj);
                }
                return true;
            });
            VRObject.m_load_watcher.Remove(path);
        };
        VRObject.prototype.DeepCopy = function (source) {
            this.m_name = source.GetName();
        };
        VRObject.prototype.SetName = function (name) {
            this.m_name = name;
        };
        VRObject.prototype.GetName = function () {
            return this.m_name;
        };
        VRObject.prototype.SetId = function (id) {
            this.m_id = id;
        };
        VRObject.prototype.GetId = function () {
            return this.m_id;
        };
        VRObject.m_id = 0;
        VRObject.m_cache = new Map_1.VRMap();
        VRObject.m_load_watcher = new Map_1.VRMap();
        return VRObject;
    }());
    exports.VRObject = VRObject;
});
//# sourceMappingURL=Object.js.map