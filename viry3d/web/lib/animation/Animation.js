var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Component", "./AnimationState", "./AnimationClip", "../container/Map", "../container/Vector", "../container/List", "../time/Time", "../math/Vector3", "../math/Quaternion"], function (require, exports, Component_1, AnimationState_1, AnimationClip_1, Map_1, Vector_1, List_1, Time_1, Vector3_1, Quaternion_1) {
    "use strict";
    (function (PlayMode) {
        PlayMode[PlayMode["StopSameLayer"] = 0] = "StopSameLayer";
        PlayMode[PlayMode["StopAll"] = 4] = "StopAll";
    })(exports.PlayMode || (exports.PlayMode = {}));
    var PlayMode = exports.PlayMode;
    var Blend = (function () {
        function Blend() {
            this.weight = 0.0;
        }
        Blend.Less = function (a, b) {
            return a.state.layer < b.state.layer;
        };
        return Blend;
    }());
    var StateCmdType;
    (function (StateCmdType) {
        StateCmdType[StateCmdType["Play"] = 0] = "Play";
        StateCmdType[StateCmdType["CrossFade"] = 1] = "CrossFade";
        StateCmdType[StateCmdType["Stop"] = 2] = "Stop";
        StateCmdType[StateCmdType["UpdateState"] = 3] = "UpdateState";
    })(StateCmdType || (StateCmdType = {}));
    var StateCmd = (function () {
        function StateCmd() {
            this.fade_length = 0.0;
        }
        return StateCmd;
    }());
    var Animation = (function (_super) {
        __extends(Animation, _super);
        function Animation() {
            _super.call(this);
            this.state_count = 0;
            this.m_states = new Map_1.VRMap();
            this.m_state_cmds = new List_1.List();
            this.m_blends = new List_1.List();
            this.m_bones = new Map_1.VRMap();
        }
        Animation.ClassName = function () {
            return "Animation";
        };
        Animation.prototype.GetTypeName = function () {
            return Animation.ClassName();
        };
        Animation.RegisterComponent = function () {
            Animation.m_class_names = Component_1.Component.m_class_names.slice(0);
            Animation.m_class_names.push("Animation");
            Component_1.Component.Register(Animation.ClassName(), function () {
                return new Animation();
            });
        };
        Animation.prototype.GetClassNames = function () {
            return Animation.m_class_names;
        };
        Animation.prototype.DeepCopy = function (source) {
            var _this = this;
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.state_count = src.state_count;
            src.m_states.ForEach(function (k, v) {
                _this.m_states.Add(k, new AnimationState_1.AnimationState(v.clip));
                return true;
            });
            var transform = this.GetTransform();
            var src_transform = src.GetTransform();
            var rs = this.GetGameObject().GetComponentsInChildren("SkinnedMeshRenderer");
            for (var i = 0; i < rs.length; i++) {
                var r = rs[i];
                var bones = r.bones;
                for (var j = 0; j < bones.Size(); j++) {
                    var path = bones.Get(j).PathInParent(src_transform);
                    bones.Set(j, transform.Find(path));
                }
            }
            this.Stop();
        };
        Animation.prototype.GetAnimationStates = function () {
            return this.m_states;
        };
        Animation.prototype.GetAnimationState = function (clip) {
            if (!this.m_state_cmds.Empty()) {
                var i = this.m_state_cmds.End();
                do {
                    i = i.previous;
                    if (i.value.type == StateCmdType.UpdateState) {
                        return i.value.state;
                    }
                } while (i != this.m_state_cmds.Begin());
            }
            var p_state = [null];
            if (this.m_states.TryGet(clip, p_state)) {
                return p_state[0];
            }
            return null;
        };
        Animation.prototype.UpdateAnimationState = function (clip, state) {
            var cmd = new StateCmd();
            cmd.type = StateCmdType.UpdateState;
            cmd.clip = clip;
            cmd.state = state;
            this.m_state_cmds.AddLast(cmd);
        };
        Animation.prototype.Play = function (clip, mode) {
            if (mode === void 0) { mode = PlayMode.StopSameLayer; }
            var cmd = new StateCmd();
            cmd.type = StateCmdType.Play;
            cmd.clip = clip;
            cmd.mode = mode;
            this.m_state_cmds.AddLast(cmd);
        };
        Animation.prototype.CrossFade = function (clip, fade_length, mode) {
            if (mode === void 0) { mode = PlayMode.StopSameLayer; }
            var cmd = new StateCmd();
            cmd.type = StateCmdType.CrossFade;
            cmd.clip = clip;
            cmd.fade_length = fade_length;
            cmd.mode = mode;
            this.m_state_cmds.AddLast(cmd);
        };
        Animation.prototype.Stop = function () {
            var cmd = new StateCmd();
            cmd.type = StateCmdType.Stop;
            this.m_state_cmds.AddLast(cmd);
        };
        Animation.prototype.Update = function () {
            if (this.state_count != this.m_states.Size()) {
                return;
            }
            else {
                if (this.m_bones.Empty()) {
                    this.FindBones();
                }
            }
            this.ExecuteStateCommands();
            this.UpdateAnimation();
        };
        Animation.prototype.ExecuteStateCommands = function () {
            var _this = this;
            this.m_state_cmds.ForEach(function (i) {
                switch (i.type) {
                    case StateCmdType.Play:
                        _this.PlayCmd(i.clip, i.mode);
                        break;
                    case StateCmdType.CrossFade:
                        _this.CrossFadeCmd(i.clip, i.fade_length, i.mode);
                        break;
                    case StateCmdType.Stop:
                        _this.StopCmd();
                        break;
                    case StateCmdType.UpdateState:
                        _this.m_states.Set(i.clip, i.state);
                        break;
                }
                return true;
            });
            this.m_state_cmds.Clear();
        };
        Animation.prototype.PlayCmd = function (clip, mode) {
            var _this = this;
            var state = [null];
            if (!this.m_states.TryGet(clip, state)) {
                return;
            }
            this.m_states.ForEach(function (k, s) {
                if (mode == PlayMode.StopAll && state[0] != s && s.enabled) {
                    _this.StopInternal(s);
                }
                else if (mode == PlayMode.StopSameLayer && s.layer == state[0].layer && state[0] != s && s.enabled) {
                    _this.StopInternal(s);
                }
                else if (state[0] == s && !s.enabled) {
                    _this.PlayInternal(s);
                }
                return true;
            });
        };
        Animation.prototype.CrossFadeCmd = function (clip, fade_length, mode) {
            var _this = this;
            var state = [null];
            if (!this.m_states.TryGet(clip, state)) {
                return;
            }
            this.m_states.ForEach(function (k, s) {
                if (mode == PlayMode.StopAll && state[0] != s && s.enabled) {
                    if (s.fade.mode == AnimationState_1.AnimationFadeMode.None) {
                        s.fade.mode = AnimationState_1.AnimationFadeMode.Out;
                        s.fade.length = fade_length;
                        s.fade.weight = s.weight;
                    }
                    else if (s.fade.mode == AnimationState_1.AnimationFadeMode.In) {
                        s.fade.mode = AnimationState_1.AnimationFadeMode.Out;
                        s.fade.length = fade_length;
                    }
                }
                else if (mode == PlayMode.StopSameLayer && s.layer == state[0].layer && state[0] != s && s.enabled) {
                    if (s.fade.mode == AnimationState_1.AnimationFadeMode.None) {
                        s.fade.mode = AnimationState_1.AnimationFadeMode.Out;
                        s.fade.length = fade_length;
                        s.fade.weight = s.weight;
                    }
                    else if (s.fade.mode == AnimationState_1.AnimationFadeMode.In) {
                        s.fade.mode = AnimationState_1.AnimationFadeMode.Out;
                        s.fade.length = fade_length;
                    }
                }
                else if (state[0] == s) {
                    if (!s.enabled) {
                        _this.PlayInternal(s);
                        s.fade.mode = AnimationState_1.AnimationFadeMode.In;
                        s.fade.length = fade_length;
                        s.fade.weight = 0;
                    }
                    else {
                        if (s.fade.mode == AnimationState_1.AnimationFadeMode.Out) {
                            s.fade.mode = AnimationState_1.AnimationFadeMode.In;
                            s.fade.length = fade_length;
                        }
                    }
                }
                return true;
            });
        };
        Animation.prototype.StopCmd = function () {
            var _this = this;
            this.m_states.ForEach(function (k, s) {
                _this.StopInternal(s);
                return true;
            });
        };
        Animation.prototype.PlayInternal = function (state) {
            state.time_last = Time_1.Time.GetTime();
            state.enabled = true;
        };
        Animation.prototype.StopInternal = function (state) {
            state.enabled = false;
            state.time = 0;
            state.fade.Clear();
        };
        Animation.prototype.UpdateAnimation = function () {
            this.m_blends.Clear();
            for (var _i = 0, _a = this.m_states.Keys(); _i < _a.length; _i++) {
                var k = _a[_i];
                var v = this.m_states.Get(k);
                var state = v;
                var c = state.clip;
                if (!state.enabled) {
                    continue;
                }
                var now = Time_1.Time.GetTime();
                var time_delta = now - state.time_last;
                state.time += time_delta * state.play_dir;
                state.time_last = now;
                if (state.fade.mode == AnimationState_1.AnimationFadeMode.In) {
                    state.fade.weight += time_delta * (state.weight - 0) / state.fade.length;
                    if (state.fade.weight >= state.weight) {
                        state.fade.Clear();
                    }
                }
                else if (state.fade.mode == AnimationState_1.AnimationFadeMode.Out) {
                    state.fade.weight += time_delta * (0 - state.weight) / state.fade.length;
                    if (state.fade.weight <= 0) {
                        this.StopInternal(state);
                    }
                }
                if ((state.play_dir == 1 && state.time > state.length) ||
                    (state.play_dir == -1 && state.time < 0)) {
                    var wrap_mode = state.wrap_mode;
                    if (wrap_mode == AnimationClip_1.AnimationWrapMode.Default) {
                        wrap_mode = c.wrap_mode;
                    }
                    switch (wrap_mode) {
                        case AnimationClip_1.AnimationWrapMode.Default:
                        case AnimationClip_1.AnimationWrapMode.Once:
                            this.StopInternal(state);
                            continue;
                        case AnimationClip_1.AnimationWrapMode.Loop:
                            state.time = 0;
                            break;
                        case AnimationClip_1.AnimationWrapMode.PingPong:
                            if (state.play_dir == 1) {
                                state.play_dir = -1;
                                state.time = state.length;
                            }
                            else {
                                state.play_dir = 1;
                                state.time = 0;
                            }
                            break;
                        case AnimationClip_1.AnimationWrapMode.ClampForever:
                            state.time = state.length;
                            break;
                    }
                }
                if (state.enabled) {
                    var blend = new Blend();
                    blend.state = state;
                    this.m_blends.AddLast(blend);
                }
            }
            this.UpdateBlend();
            this.UpdateBones();
        };
        Animation.prototype.UpdateBlend = function () {
            var full_weight = 1.0;
            var remain_weight = 1.0;
            var layer = 0x7fffffff;
            //compute weights
            this.m_blends.Sort(Blend.Less);
            for (var iter = this.m_blends.Begin(); iter != this.m_blends.End(); iter = iter.next) {
                var i = iter.value;
                if (remain_weight <= 0) {
                    i.weight = 0;
                    continue;
                }
                if (i.state.layer < layer) {
                    full_weight = remain_weight;
                }
                layer = i.state.layer;
                var weight = void 0;
                if (i.state.fade.mode != AnimationState_1.AnimationFadeMode.None) {
                    weight = full_weight * i.state.fade.weight;
                }
                else {
                    weight = full_weight * i.state.weight;
                }
                {
                    iter = iter.next;
                    if (iter == this.m_blends.End()) {
                        weight = remain_weight;
                    }
                    iter = iter.previous;
                }
                if (remain_weight - weight < 0) {
                    weight = remain_weight;
                }
                remain_weight -= weight;
                i.weight = weight;
            }
        };
        Animation.prototype.FindBones = function () {
            var _this = this;
            this.m_bones.Clear();
            this.m_states.ForEach(function (ki, vi) {
                var curves = vi.clip.curves;
                curves.ForEach(function (kj, vj) {
                    var path = kj;
                    _this.m_bones.Add(path, null);
                    return true;
                });
                return true;
            });
            var transform = this.GetTransform();
            this.m_bones.ForEach(function (k, v) {
                var path = k;
                _this.m_bones.Set(k, transform.Find(path));
                return true;
            });
        };
        Animation.prototype.UpdateBones = function () {
            var _this = this;
            this.m_bones.ForEach(function (k, v) {
                var poss = new Vector_1.Vector();
                var rots = new Vector_1.Vector();
                var scas = new Vector_1.Vector();
                var weights = new Vector_1.Vector();
                var change_mask = 0;
                var no_effect_weight = 0;
                for (var j = _this.m_blends.Begin(); j != _this.m_blends.End(); j = j.next) {
                    var state = j.value.state;
                    var weight = j.value.weight;
                    var p_binding = [null];
                    if (state.clip.curves.TryGet(k, p_binding)) {
                        var pos = new Vector3_1.Vector3(0, 0, 0);
                        var rot = new Quaternion_1.Quaternion(0, 0, 0, 1);
                        var sca = new Vector3_1.Vector3(1, 1, 1);
                        var cb = p_binding[0];
                        for (var k_1 = 0; k_1 < cb.curves.Size(); k_1++) {
                            var curve = cb.curves.Get(k_1);
                            if (!curve.keys.Empty()) {
                                var value = curve.Evaluate(state.time);
                                change_mask |= 1 << k_1;
                                var p = k_1;
                                switch (p) {
                                    case AnimationClip_1.CurveProperty.LocalPosX:
                                        pos.x = value;
                                        break;
                                    case AnimationClip_1.CurveProperty.LocalPosY:
                                        pos.y = value;
                                        break;
                                    case AnimationClip_1.CurveProperty.LocalPosZ:
                                        pos.z = value;
                                        break;
                                    case AnimationClip_1.CurveProperty.LocalRotX:
                                        rot.x = value;
                                        break;
                                    case AnimationClip_1.CurveProperty.LocalRotY:
                                        rot.y = value;
                                        break;
                                    case AnimationClip_1.CurveProperty.LocalRotZ:
                                        rot.z = value;
                                        break;
                                    case AnimationClip_1.CurveProperty.LocalRotW:
                                        rot.w = value;
                                        break;
                                    case AnimationClip_1.CurveProperty.LocalScaX:
                                        sca.x = value;
                                        break;
                                    case AnimationClip_1.CurveProperty.LocalScaY:
                                        sca.y = value;
                                        break;
                                    case AnimationClip_1.CurveProperty.LocalScaZ:
                                        sca.z = value;
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                        poss.Add(pos);
                        rots.Add(rot);
                        scas.Add(sca);
                        weights.Add(weight);
                    }
                    else {
                        no_effect_weight += weight;
                    }
                }
                var in_effect_count = weights.Size();
                for (var j = 0; j < in_effect_count; j++) {
                    var per_add = no_effect_weight / in_effect_count;
                    weights.Set(j, weights.Get(j) + per_add);
                }
                var pos_final = new Vector3_1.Vector3(0, 0, 0);
                var rot_final = new Quaternion_1.Quaternion(0, 0, 0, 0);
                var sca_final = new Vector3_1.Vector3(0, 0, 0);
                for (var j = 0; j < in_effect_count; j++) {
                    pos_final = Vector3_1.Vector3.Add(pos_final, Vector3_1.Vector3.Multiply(poss.Get(j), weights.Get(j)));
                    if (j > 0 && rots.Get(j).Dot(rots.Get(0)) < 0) {
                        rots.Set(j, Quaternion_1.Quaternion.Multiply(rots.Get(j), -1));
                    }
                    rot_final.x += rots.Get(j).x * weights.Get(j);
                    rot_final.y += rots.Get(j).y * weights.Get(j);
                    rot_final.z += rots.Get(j).z * weights.Get(j);
                    rot_final.w += rots.Get(j).w * weights.Get(j);
                    sca_final = Vector3_1.Vector3.Add(sca_final, Vector3_1.Vector3.Multiply(scas.Get(j), weights.Get(j)));
                }
                if (in_effect_count > 0) {
                    var bone = v;
                    if ((change_mask & ((1 << 0) | (1 << 1) | (1 << 2))) != 0) {
                        bone.SetLocalPositionDirect(pos_final);
                    }
                    if ((change_mask & ((1 << 3) | (1 << 4) | (1 << 5) | (1 << 6))) != 0) {
                        rot_final.Normalize();
                        bone.SetLocalRotationDirect(rot_final);
                    }
                    if ((change_mask & ((1 << 7) | (1 << 8) | (1 << 9))) != 0) {
                        bone.SetLocalScaleDirect(sca_final);
                    }
                }
                return true;
            });
            this.GetTransform().Changed();
        };
        return Animation;
    }(Component_1.Component));
    exports.Animation = Animation;
});
//# sourceMappingURL=Animation.js.map