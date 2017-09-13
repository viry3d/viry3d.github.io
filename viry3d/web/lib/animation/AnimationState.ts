import { AnimationClip, AnimationWrapMode } from "./AnimationClip"

enum AnimationBlendMode {
	Blend = 0,
	Additive = 1,
}

export enum AnimationFadeMode {
	None,
	In,
	Out,
}

class AnimationFade {
	Clear() {
		this.mode = AnimationFadeMode.None;
		this.length = 0.0;
		this.weight = 0.0;
	}

	mode = AnimationFadeMode.None;
	length = 0.0;
	weight = 0.0;
};

export class AnimationState {
	constructor(clip: AnimationClip) {
		this.name = clip.GetName();
		this.clip = clip;
		this.length = clip.length;
		this.normalized_speed = 1.0 / clip.length; 
	}

	name = "";
	clip: AnimationClip;
	blend_mode = AnimationBlendMode.Blend;
	enabled = false;
	layer = 0;
	length = 0.0;
	normalized_speed = 0.0;
	normalized_time = 0.0;
	speed = 1.0;
	time = 0.0;
	weight = 1.0;
	wrap_mode = AnimationWrapMode.Default;
	time_last = 0.0;
	play_dir = 1;
	fade = new AnimationFade();
}