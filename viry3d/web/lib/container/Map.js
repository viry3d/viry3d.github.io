define(["require", "exports"], function (require, exports) {
    "use strict";
    var VRMap = (function () {
        function VRMap(map) {
            this.m_map = new Object();
            this.m_keys = new Array();
            if (map != null) {
                this.Copy(map);
            }
        }
        VRMap.prototype.Copy = function (map) {
            this.Clear();
            for (var _i = 0, _a = map.m_keys; _i < _a.length; _i++) {
                var k = _a[_i];
                this.m_keys.push(k);
                this.m_map[k] = map.m_map[k];
            }
        };
        VRMap.prototype.Add = function (k, v) {
            if (!this.Contains(k)) {
                this.m_keys.push(k.toString());
                this.m_map[k.toString()] = v;
                return true;
            }
            return false;
        };
        VRMap.prototype.Set = function (k, v) {
            this.m_map[k.toString()] = v;
        };
        VRMap.prototype.Contains = function (k) {
            return this.m_map.hasOwnProperty(k.toString());
        };
        VRMap.prototype.Remove = function (k) {
            if (this.Contains(k)) {
                var index = this.m_keys.indexOf(k.toString());
                this.m_keys.splice(index, 1);
                delete this.m_map[k.toString()];
                return true;
            }
            return false;
        };
        VRMap.prototype.TryGet = function (k, v) {
            var value = this.m_map[k.toString()];
            if (value != null) {
                v[0] = value;
                return true;
            }
            return false;
        };
        VRMap.prototype.Get = function (k) {
            return this.m_map[k.toString()];
        };
        VRMap.prototype.Size = function () {
            return this.m_keys.length;
        };
        VRMap.prototype.Empty = function () {
            return this.Size() == 0;
        };
        VRMap.prototype.Clear = function () {
            for (var _i = 0, _a = this.m_keys; _i < _a.length; _i++) {
                var k = _a[_i];
                delete this.m_map[k];
            }
            this.m_keys.splice(0, this.m_keys.length);
        };
        VRMap.prototype.ForEach = function (func) {
            for (var _i = 0, _a = this.m_keys; _i < _a.length; _i++) {
                var k = _a[_i];
                if (!func(k, this.m_map[k])) {
                    break;
                }
            }
        };
        VRMap.prototype.Keys = function () {
            return this.m_keys;
        };
        return VRMap;
    }());
    exports.VRMap = VRMap;
});
//# sourceMappingURL=Map.js.map