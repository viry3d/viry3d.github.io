import { Tweener } from "./Tweener"
import { VRObject } from "../Object"
import { Component } from "../Component"
import { Vector3 } from "../math/Vector3"

export class TweenPosition extends Tweener {
	static ClassName(): string {
        return "TweenPosition";
    }

	GetTypeName(): string {
        return TweenPosition.ClassName();
	}

	static RegisterComponent() {
		TweenPosition.m_class_names = Tweener.m_class_names.slice(0);
		TweenPosition.m_class_names.push("TweenPosition");

		Component.Register(TweenPosition.ClassName(), () => {
			return new TweenPosition();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return TweenPosition.m_class_names;
	}

	protected constructor() {
		super();
	}

	DeepCopy(source: VRObject) {
        super.DeepCopy(source);

        let src = <TweenPosition>source;
        this.from = src.from;
		this.to = src.to;
		this.local_space = src.local_space;
	}

	OnSetValue(value: number) {
		let pos = Vector3.Lerp(this.from, this.to, value);

		if(this.local_space) {
			this.GetTransform().SetLocalPosition(pos);
		} else {
			this.GetTransform().SetPosition(pos);
		}
	}

	from = new Vector3();
	to = new Vector3();
	local_space = true;
}