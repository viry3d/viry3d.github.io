define(["require", "exports", "./AnimationClip"], function (require, exports, AnimationClip_1) {
    "use strict";
    var AnimationBlendMode;
    (function (AnimationBlendMode) {
        AnimationBlendMode[AnimationBlendMode["Blend"] = 0] = "Blend";
        AnimationBlendMode[AnimationBlendMode["Additive"] = 1] = "Additive";
    })(AnimationBlendMode || (AnimationBlendMode = {}));
    (function (AnimationFadeMode) {
        AnimationFadeMode[AnimationFadeMode["None"] = 0] = "None";
        AnimationFadeMode[AnimationFadeMode["In"] = 1] = "In";
        AnimationFadeMode[AnimationFadeMode["Out"] = 2] = "Out";
    })(exports.AnimationFadeMode || (exports.AnimationFadeMode = {}));
    var AnimationFadeMode = exports.AnimationFadeMode;
    var AnimationFade = (function () {
        function AnimationFade() {
            this.mode = AnimationFadeMode.None;
            this.length = 0.0;
            this.weight = 0.0;
        }
        AnimationFade.prototype.Clear = function () {
            this.mode = AnimationFadeMode.None;
            this.length = 0.0;
            this.weight = 0.0;
        };
        return AnimationFade;
    }());
    ;
    var AnimationState = (function () {
        function AnimationState(clip) {
            this.name = "";
            this.blend_mode = AnimationBlendMode.Blend;
            this.enabled = false;
            this.layer = 0;
            this.length = 0.0;
            this.normalized_speed = 0.0;
            this.normalized_time = 0.0;
            this.speed = 1.0;
            this.time = 0.0;
            this.weight = 1.0;
            this.wrap_mode = AnimationClip_1.AnimationWrapMode.Default;
            this.time_last = 0.0;
            this.play_dir = 1;
            this.fade = new AnimationFade();
            this.name = clip.GetName();
            this.clip = clip;
            this.length = clip.length;
            this.normalized_speed = 1.0 / clip.length;
        }
        return AnimationState;
    }());
    exports.AnimationState = AnimationState;
});
//# sourceMappingURL=AnimationState.js.map