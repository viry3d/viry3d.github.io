var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Texture"], function (require, exports, Texture_1) {
    "use strict";
    var RenderTexture = (function (_super) {
        __extends(RenderTexture, _super);
        function RenderTexture() {
            _super.apply(this, arguments);
        }
        return RenderTexture;
    }(Texture_1.Texture));
    exports.RenderTexture = RenderTexture;
});
//# sourceMappingURL=RenderTexture.js.map