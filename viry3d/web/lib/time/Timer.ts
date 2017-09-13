import { Component } from "../Component"
import { VRObject } from "../Object"
import { GameObject } from "../GameObject"
import { Time } from "../time/Time"

export class Timer extends Component {
	static ClassName(): string {
        return "Timer";
    }

	GetTypeName(): string {
        return Timer.ClassName();
	}

	static RegisterComponent() {
		Timer.m_class_names = Component.m_class_names.slice(0);
		Timer.m_class_names.push("Timer");

		Component.Register(Timer.ClassName(), () => {
			return new Timer();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return Timer.m_class_names;
	}

	static CreateTimer(duration: number, loop: boolean): Timer {
		let timer = <Timer>GameObject.Create("Timer").AddComponent("Timer");
		timer.m_duration = duration;
		timer.m_loop = loop;

		return timer;
	}

	protected constructor() {
		super();

		this.m_time_start = Time.GetTime();
	}

	DeepCopy(source: VRObject) {
		console.error("can not copy this component");
    }

	Stop() {
		GameObject.Destroy(this.GetGameObject());
	}

	Update() {
		let time = Time.GetTime();

		if(time - this.m_time_start >= this.m_duration) {
			if(this.on_tick) {
				this.m_tick_count++;
				this.on_tick();
			}

			if(this.m_loop) {
				this.m_time_start = time;
			} else {
				this.Stop();
			}
		}
	}

	on_tick: () => void;

	get tick_count() {
		return this.m_tick_count;
	}

	private m_tick_count = 0;
	private m_duration = 1;
	private m_loop = false;
	private m_time_start: number;
}