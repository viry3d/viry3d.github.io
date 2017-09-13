import { Component } from "../Component"
import { VRObject } from "../Object"
import { AnimationCurve, Keyframe } from "../animation/AnimationClip"
import { Time } from "../time/Time"

export enum TweenerPlayStyle {
	Once,
	Loop,
	PingPong,
};

export class Tweener extends Component {
	static ClassName(): string {
        return "Tweener";
    }

	GetTypeName(): string {
        return Tweener.ClassName();
	}

	static RegisterComponent() {
		Tweener.m_class_names = Component.m_class_names.slice(0);
		Tweener.m_class_names.push("Tweener");
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return Tweener.m_class_names;
	}

	protected constructor() {
		super();

		this.m_curve = AnimationCurve.DefaultLinear();
		this.m_time_start = Time.GetTime();
	}

	DeepCopy(source: VRObject) {
        super.DeepCopy(source);

        let src = <Tweener>source;
        this.curve = src.curve;
		this.duration = src.duration;
		this.play_style = src.play_style;
		this.m_time_start = src.m_time_start;
		this.m_time = src.m_time;
		this.m_reverse = src.m_reverse;
		this.m_finish = src.m_finish;
    }

	Update() {
		let time = Time.GetTime();
		let t = -1;

		if(time - this.m_time_start >= this.delay && time - this.m_time_start - this.delay <= this.duration) {
			t = (time - this.m_time_start - this.delay) / this.duration;
		} else if(time - this.m_time_start - this.delay > this.duration) {
			if(this.play_style == TweenerPlayStyle.Once) {
				this.m_finish = true;
				if(this.m_time < 1) {
					t = 1;
				}
			} else if(this.play_style == TweenerPlayStyle.Loop) {
				this.m_time_start = time;
				t = 0;
			} else if(this.play_style == TweenerPlayStyle.PingPong) {
				this.m_time_start = time;
				t = 0;
				this.m_reverse = !this.m_reverse;
			}
		}

		if(t >= 0 && t <= 1) {
			this.m_time = t;

			let value: number;

			if(this.m_reverse) {
				value = this.m_curve.Evaluate(1 - t);
			} else {
				value = this.m_curve.Evaluate(t);
			}

			this.OnSetValue(value);
		}

		if(this.m_finish) {
			if(this.on_finish) {
				this.on_finish();
			}
			Component.Destroy(this);
		}
	}

	OnSetValue(value: number) { }

	set curve(frames: number[]) {
		this.m_curve.keys.Clear();
		for(let i = 0; i < frames.length; i+=4) {
			this.m_curve.keys.Add(new Keyframe(frames[i], frames[i + 1], frames[i + 2], frames[i + 3]));
		}
	}

	duration = 1;
	delay = 0;
	play_style = TweenerPlayStyle.Once;
	on_finish: () => void;

	protected m_curve: AnimationCurve;
	protected m_time_start: number;
	protected m_time = 0;
	protected m_reverse = false;
	protected m_finish = false;
}