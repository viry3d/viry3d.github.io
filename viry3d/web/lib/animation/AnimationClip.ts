import { VRObject } from "../Object"
import { VRMap } from "../container/Map"
import { Vector } from "../container/Vector"
import { Mathf } from "../math/Mathf"

export enum AnimationWrapMode {
	Default = 0,
	Once = 1,
	Clamp = 1,
	Loop = 2,
	PingPong = 4,
	ClampForever = 8,
}

export enum CurveProperty {
	LocalPosX,
	LocalPosY,
	LocalPosZ,
	LocalRotX,
	LocalRotY,
	LocalRotZ,
	LocalRotW,
	LocalScaX,
	LocalScaY,
	LocalScaZ,

	Count
}

export class Keyframe {
	constructor(time: number, value: number, in_tangent: number, out_tangent: number) {
		this.time = time;
		this.value = value;
		this.in_tangent = in_tangent;
		this.out_tangent = out_tangent;
	}

	in_tangent = 0.0;
	out_tangent = 0.0;
	tangent_mode = 0;
	time = 0.0;
	value = 0.0;
}

export class AnimationCurve {
	static DefaultLinear(): AnimationCurve {
		let c = new AnimationCurve();
		c.keys.Add(new Keyframe(0, 0, 1, 1));
		c.keys.Add(new Keyframe(1, 1, 1, 1));

		return c;
	}

	private static Eval(time: number, k0: Keyframe, k1: Keyframe): number {
		let dt = k1.time - k0.time;
		if(Math.abs(dt) < Mathf.Epsilon) {
			return k0.value;
		}

		let t = (time - k0.time) / dt;
		let t2 = t * t;
		let t3 = t2 * t;
		let _t = 1 - t;
		let _t2 = _t * _t;
		let _t3 = _t2 * _t;

		let c = 1 / 3.0;
		let c0 = dt * c * k0.out_tangent + k0.value;
		let c1 = -dt * c * k1.in_tangent + k1.value;
		let value = k0.value * _t3 + 3 * c0 * t * _t2 + 3 * c1 * t2 * _t + k1.value * t3;

		return value;
	}
	
	Evaluate(time: number): number {
		if(this.keys.Empty()) {
			return 0;
		}

		let back = this.keys.Get(this.keys.Size() - 1);
		if(time >= back.time) {
			return back.value;
		}

		for(let i = 0; i < this.keys.Size(); i++) {
			let frame = this.keys.Get(i);

			if(time < frame.time) {
				if(i == 0) {
					return frame.value;
				} else {
					return AnimationCurve.Eval(time, this.keys.Get(i - 1), frame);
				}
			}
		}

		return 0;
	}

	keys = new Vector<Keyframe>();
}

export class CurveBinding {
	path = "";
	curves = new Vector<AnimationCurve>();
}

export class AnimationClip extends VRObject {
	constructor() {
		super();
	}

	frame_rate = 0.0;
	length = 0.0;
	wrap_mode = AnimationWrapMode.Default;
	curves = new VRMap<string, CurveBinding>();
}