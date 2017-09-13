var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Object"], function (require, exports, Object_1) {
    "use strict";
    var Atlas = (function (_super) {
        __extends(Atlas, _super);
        function Atlas() {
            _super.call(this);
        }
        Atlas.Create = function () {
            return new Atlas();
        };
        return Atlas;
    }(Object_1.VRObject));
    exports.Atlas = Atlas;
});
//# sourceMappingURL=UIAtlas.js.map