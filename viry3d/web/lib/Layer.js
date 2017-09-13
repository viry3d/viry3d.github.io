define(["require", "exports"], function (require, exports) {
    "use strict";
    (function (Layer) {
        Layer[Layer["Default"] = 0] = "Default";
        Layer[Layer["TransparentFX"] = 1] = "TransparentFX";
        Layer[Layer["IgnoreRaycast"] = 2] = "IgnoreRaycast";
        Layer[Layer["Highlighting"] = 3] = "Highlighting";
        Layer[Layer["Water"] = 4] = "Water";
        Layer[Layer["UI"] = 5] = "UI";
        Layer[Layer["Scene"] = 6] = "Scene";
        Layer[Layer["Terrain"] = 7] = "Terrain";
        Layer[Layer["Character"] = 8] = "Character";
        Layer[Layer["Editor"] = 31] = "Editor";
    })(exports.Layer || (exports.Layer = {}));
    var Layer = exports.Layer;
});
//# sourceMappingURL=Layer.js.map