import { Component } from "../Component"
import { VRObject } from "../Object"
import { AnimationState, AnimationFadeMode } from "./AnimationState"
import { AnimationWrapMode, CurveProperty, CurveBinding } from "./AnimationClip"
import { VRMap } from "../container/Map"
import { Vector } from "../container/Vector"
import { List } from "../container/List"
import { Time } from "../time/Time"
import { Transform } from "../Transform"
import { Vector3 } from "../math/Vector3"
import { Quaternion } from "../math/Quaternion"
import { SkinnedMeshRenderer } from "../renderer/SkinnedMeshRenderer"

export enum PlayMode {
	StopSameLayer = 0,
	StopAll = 4,
}

class Blend {
	state: AnimationState;
	weight = 0.0;

	static Less(a: Blend, b: Blend): boolean {
		return a.state.layer < b.state.layer;
	}
}

enum StateCmdType {
	Play,
	CrossFade,
	Stop,
	UpdateState
}

class StateCmd {
	type: StateCmdType;
	clip: string;
	mode: PlayMode;
	fade_length = 0.0;
	state: AnimationState;
}

export class Animation extends Component {
	static ClassName(): string {
		return "Animation";
	}

	GetTypeName(): string {
		return Animation.ClassName();
	}

	static RegisterComponent() {
		Animation.m_class_names = Component.m_class_names.slice(0);
		Animation.m_class_names.push("Animation");

		Component.Register(Animation.ClassName(), () => {
			return new Animation();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return Animation.m_class_names;
	}

	DeepCopy(source: VRObject) {
		super.DeepCopy(source);

		let src = <Animation>source;
		this.state_count = src.state_count;
		src.m_states.ForEach((k, v) => {
			this.m_states.Add(k, new AnimationState(v.clip));
			return true;
		});

		let transform = this.GetTransform();
		let src_transform = src.GetTransform();
		let rs = <Component[]>this.GetGameObject().GetComponentsInChildren("SkinnedMeshRenderer");
		for(let i = 0; i < rs.length; i++) {
			let r = <SkinnedMeshRenderer>rs[i];
			let bones = r.bones;
			for(let j = 0; j < bones.Size(); j++) {
				let path = bones.Get(j).PathInParent(src_transform);
				bones.Set(j, transform.Find(path));
			}
		}

		this.Stop();
	}

	GetAnimationStates(): VRMap<String, AnimationState> {
		return this.m_states;
	}

	GetAnimationState(clip: string): AnimationState {
		if(!this.m_state_cmds.Empty()) {
			let i = this.m_state_cmds.End();
			do {
				i = i.previous;
				if(i.value.type == StateCmdType.UpdateState) {
					return i.value.state;
				}
			} while(i != this.m_state_cmds.Begin());
		}

		let p_state = [<AnimationState>null];
		if(this.m_states.TryGet(clip, p_state)) {
			return p_state[0];
		}

		return null;
	}

	UpdateAnimationState(clip: string, state: AnimationState) {
		let cmd = new StateCmd();
		cmd.type = StateCmdType.UpdateState;
		cmd.clip = clip;
		cmd.state = state;
		this.m_state_cmds.AddLast(cmd);
	}

	Play(clip: string, mode = PlayMode.StopSameLayer) {
		let cmd = new StateCmd();
		cmd.type = StateCmdType.Play;
		cmd.clip = clip;
		cmd.mode = mode;
		this.m_state_cmds.AddLast(cmd);
	}

	CrossFade(clip: string, fade_length: number, mode = PlayMode.StopSameLayer) {
		let cmd = new StateCmd();
		cmd.type = StateCmdType.CrossFade;
		cmd.clip = clip;
		cmd.fade_length = fade_length;
		cmd.mode = mode;
		this.m_state_cmds.AddLast(cmd);
	}

	Stop() {
		let cmd = new StateCmd();
		cmd.type = StateCmdType.Stop;
		this.m_state_cmds.AddLast(cmd);
	}

	Update() {
		if(this.state_count != this.m_states.Size()) {
			return;
		} else {
			if(this.m_bones.Empty()) {
				this.FindBones();
			}
		}

		this.ExecuteStateCommands();
		this.UpdateAnimation();
	}

	private ExecuteStateCommands() {
		this.m_state_cmds.ForEach((i) => {
			switch(i.type) {
				case StateCmdType.Play:
					this.PlayCmd(i.clip, i.mode);
					break;
				case StateCmdType.CrossFade:
					this.CrossFadeCmd(i.clip, i.fade_length, i.mode);
					break;
				case StateCmdType.Stop:
					this.StopCmd();
					break;
				case StateCmdType.UpdateState:
					this.m_states.Set(i.clip, i.state);
					break;
			}
			return true;
		});

		this.m_state_cmds.Clear();
	}

	private PlayCmd(clip: string, mode: PlayMode) {
		let state = [<AnimationState>null];
		if(!this.m_states.TryGet(clip, state)) {
			return;
		}

		this.m_states.ForEach((k, s) => {
			if(mode == PlayMode.StopAll && state[0] != s && s.enabled) {
				this.StopInternal(s);
			} else if(mode == PlayMode.StopSameLayer && s.layer == state[0].layer && state[0] != s && s.enabled) {
				this.StopInternal(s);
			} else if(state[0] == s && !s.enabled) {
				this.PlayInternal(s);
			}

			return true;
		});
	}

	private CrossFadeCmd(clip: string, fade_length: number, mode: PlayMode) {
		let state = [<AnimationState>null];
		if(!this.m_states.TryGet(clip, state)) {
			return;
		}

		this.m_states.ForEach((k, s) => {
			if(mode == PlayMode.StopAll && state[0] != s && s.enabled) {
				if(s.fade.mode == AnimationFadeMode.None) {
					s.fade.mode = AnimationFadeMode.Out;
					s.fade.length = fade_length;
					s.fade.weight = s.weight;
				} else if(s.fade.mode == AnimationFadeMode.In) {
					s.fade.mode = AnimationFadeMode.Out;
					s.fade.length = fade_length;
				}
			} else if(mode == PlayMode.StopSameLayer && s.layer == state[0].layer && state[0] != s && s.enabled) {
				if(s.fade.mode == AnimationFadeMode.None) {
					s.fade.mode = AnimationFadeMode.Out;
					s.fade.length = fade_length;
					s.fade.weight = s.weight;
				} else if(s.fade.mode == AnimationFadeMode.In) {
					s.fade.mode = AnimationFadeMode.Out;
					s.fade.length = fade_length;
				}
			} else if(state[0] == s) {
				if(!s.enabled) {
					this.PlayInternal(s);

					s.fade.mode = AnimationFadeMode.In;
					s.fade.length = fade_length;
					s.fade.weight = 0;
				} else {
					if(s.fade.mode == AnimationFadeMode.Out) {
						s.fade.mode = AnimationFadeMode.In;
						s.fade.length = fade_length;
					}
				}
			}

			return true;
		});
	}

	private StopCmd() {
		this.m_states.ForEach((k, s) => {
			this.StopInternal(s);
			return true;
		});
	}

	private PlayInternal(state: AnimationState) {
		state.time_last = Time.GetTime();
		state.enabled = true;
	}

	private StopInternal(state: AnimationState) {
		state.enabled = false;
		state.time = 0;
		state.fade.Clear();
	}

	private UpdateAnimation() {
		this.m_blends.Clear();

		for(let k of this.m_states.Keys()) {
			let v = this.m_states.Get(k);
			let state = v;
			let c = state.clip;

			if(!state.enabled) {
				continue;
			}

			let now = Time.GetTime();
			let time_delta = now - state.time_last;
			state.time += time_delta * state.play_dir;
			state.time_last = now;

			if(state.fade.mode == AnimationFadeMode.In) {
				state.fade.weight += time_delta * (state.weight - 0) / state.fade.length;
				if(state.fade.weight >= state.weight) {
					state.fade.Clear();
				}
			} else if(state.fade.mode == AnimationFadeMode.Out) {
				state.fade.weight += time_delta * (0 - state.weight) / state.fade.length;
				if(state.fade.weight <= 0) {
					this.StopInternal(state);
				}
			}

			if((state.play_dir == 1 && state.time > state.length) ||
				(state.play_dir == -1 && state.time < 0)) {
				let wrap_mode = state.wrap_mode;
				if(wrap_mode == AnimationWrapMode.Default) {
					wrap_mode = c.wrap_mode;
				}

				switch(wrap_mode) {
					case AnimationWrapMode.Default:
					case AnimationWrapMode.Once:
						this.StopInternal(state);
						continue;

					case AnimationWrapMode.Loop:
						state.time = 0;
						break;

					case AnimationWrapMode.PingPong:
						if(state.play_dir == 1) {
							state.play_dir = -1;
							state.time = state.length;
						} else {
							state.play_dir = 1;
							state.time = 0;
						}
						break;

					case AnimationWrapMode.ClampForever:
						state.time = state.length;
						break;
				}
			}

			if(state.enabled) {
				let blend = new Blend();
				blend.state = state;
				this.m_blends.AddLast(blend);
			}
		}

		this.UpdateBlend();
		this.UpdateBones();
	}

	private UpdateBlend() {
		let full_weight = 1.0;
		let remain_weight = 1.0;
		let layer = 0x7fffffff;

		//compute weights
		this.m_blends.Sort(Blend.Less);
		for(let iter = this.m_blends.Begin(); iter != this.m_blends.End(); iter = iter.next) {
			let i = iter.value;
			if(remain_weight <= 0) {
				i.weight = 0;
				continue;
			}

			if(i.state.layer < layer) {
				full_weight = remain_weight;
			}
			layer = i.state.layer;

			let weight: number;
			if(i.state.fade.mode != AnimationFadeMode.None) {
				weight = full_weight * i.state.fade.weight;
			} else {
				weight = full_weight * i.state.weight;
			}

			{
				iter = iter.next;
				if(iter == this.m_blends.End()) {
					weight = remain_weight;
				}
				iter = iter.previous;
			}

			if(remain_weight - weight < 0) {
				weight = remain_weight;
			}
			remain_weight -= weight;

			i.weight = weight;
		}
	}

	private FindBones() {
		this.m_bones.Clear();
		this.m_states.ForEach((ki, vi) => {
			let curves = vi.clip.curves;

			curves.ForEach((kj, vj) => {
				let path = kj;
				this.m_bones.Add(path, null);

				return true;
			});

			return true;
		});

		let transform = this.GetTransform();
		this.m_bones.ForEach((k, v) => {
			let path = k;
			this.m_bones.Set(k, transform.Find(path));

			return true;
		});
	}

	private UpdateBones() {
		this.m_bones.ForEach((k, v) => {
			let poss = new Vector<Vector3>();
			let rots = new Vector<Quaternion>();
			let scas = new Vector<Vector3>();
			let weights = new Vector<number>();
			let change_mask = 0;
			let no_effect_weight = 0;

			for(let j = this.m_blends.Begin(); j != this.m_blends.End(); j = j.next) {
				let state = j.value.state;
				let weight = j.value.weight;

				let p_binding = [<CurveBinding>null]
				if(state.clip.curves.TryGet(k, p_binding)) {
					let pos = new Vector3(0, 0, 0);
					let rot = new Quaternion(0, 0, 0, 1);
					let sca = new Vector3(1, 1, 1);
					let cb = p_binding[0];

					for(let k = 0; k < cb.curves.Size(); k++) {
						let curve = cb.curves.Get(k);
						if(!curve.keys.Empty()) {
							let value = curve.Evaluate(state.time);

							change_mask |= 1 << k;

							let p = <CurveProperty>k;
							switch(p) {
								case CurveProperty.LocalPosX:
									pos.x = value;
									break;
								case CurveProperty.LocalPosY:
									pos.y = value;
									break;
								case CurveProperty.LocalPosZ:
									pos.z = value;
									break;

								case CurveProperty.LocalRotX:
									rot.x = value;
									break;
								case CurveProperty.LocalRotY:
									rot.y = value;
									break;
								case CurveProperty.LocalRotZ:
									rot.z = value;
									break;
								case CurveProperty.LocalRotW:
									rot.w = value;
									break;

								case CurveProperty.LocalScaX:
									sca.x = value;
									break;
								case CurveProperty.LocalScaY:
									sca.y = value;
									break;
								case CurveProperty.LocalScaZ:
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
				} else {
					no_effect_weight += weight;
				}
			}

			let in_effect_count = weights.Size();
			for(let j = 0; j < in_effect_count; j++) {
				let per_add = no_effect_weight / in_effect_count;
				weights.Set(j, weights.Get(j) + per_add);
			}

			let pos_final = new Vector3(0, 0, 0);
			let rot_final = new Quaternion(0, 0, 0, 0);
			let sca_final = new Vector3(0, 0, 0);

			for(let j = 0; j < in_effect_count; j++) {
				pos_final = Vector3.Add(pos_final, Vector3.Multiply(poss.Get(j), weights.Get(j)));
				
				if(j > 0 && rots.Get(j).Dot(rots.Get(0)) < 0) {
					rots.Set(j, Quaternion.Multiply(rots.Get(j), -1));
				}
				rot_final.x += rots.Get(j).x * weights.Get(j);
				rot_final.y += rots.Get(j).y * weights.Get(j);
				rot_final.z += rots.Get(j).z * weights.Get(j);
				rot_final.w += rots.Get(j).w * weights.Get(j);

				sca_final = Vector3.Add(sca_final, Vector3.Multiply(scas.Get(j), weights.Get(j)));
			}

			if(in_effect_count > 0) {
				let bone = v;

				if((change_mask & ((1 << 0) | (1 << 1) | (1 << 2))) != 0) {
					bone.SetLocalPositionDirect(pos_final);
				}

				if((change_mask & ((1 << 3) | (1 << 4) | (1 << 5) | (1 << 6))) != 0) {
					rot_final.Normalize();
					bone.SetLocalRotationDirect(rot_final);
				}

				if((change_mask & ((1 << 7) | (1 << 8) | (1 << 9))) != 0) {
					bone.SetLocalScaleDirect(sca_final);
				}
			}

			return true;
		});

		this.GetTransform().Changed();
	}

	private constructor() {
		super();
	}

	state_count = 0;
	private m_states = new VRMap<String, AnimationState>();
	private m_state_cmds = new List<StateCmd>();
	private m_blends = new List<Blend>();
	private m_bones = new VRMap<string, Transform>();
}