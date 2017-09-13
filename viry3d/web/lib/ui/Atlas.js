var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Object", "../container/Map"], function (require, exports, Object_1, Map_1) {
    "use strict";
    var Atlas = (function (_super) {
        __extends(Atlas, _super);
        function Atlas() {
            _super.call(this);
            this.m_sprites = new Map_1.VRMap();
        }
        Atlas.Create = function () {
            return new Atlas();
        };
        Atlas.prototype.AddSprite = function (name, sprite) {
            this.m_sprites.Add(name, sprite);
        };
        Atlas.prototype.RemoveSprite = function (name) {
            this.m_sprites.Remove(name);
        };
        Atlas.prototype.GetSprite = function (name) {
            return this.m_sprites.Get(name);
        };
        return Atlas;
    }(Object_1.VRObject));
    exports.Atlas = Atlas;
});
//# sourceMappingURL=Atlas.js.map