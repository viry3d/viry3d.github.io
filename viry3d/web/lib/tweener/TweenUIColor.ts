import { Tweener } from "./Tweener"
import { VRObject } from "../Object"
import { Component } from "../Component"
import { Color } from "../graphics/Color"
import { UIView } from "../ui/UIView"

export class TweenUIColor extends Tweener {
	static ClassName(): string {
        return "TweenUIColor";
    }

	GetTypeName(): string {
        return TweenUIColor.ClassName();
	}

	static RegisterComponent() {
		TweenUIColor.m_class_names = Tweener.m_class_names.slice(0);
		TweenUIColor.m_class_names.push("TweenUIColor");

		Component.Register(TweenUIColor.ClassName(), () => {
			return new TweenUIColor();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return TweenUIColor.m_class_names;
	}

	protected constructor() {
		super();
	}

	DeepCopy(source: VRObject) {
        super.DeepCopy(source);

        let src = <TweenUIColor>source;
        this.from = src.from;
		this.to = src.to;
	}

	OnSetValue(value: number) {
		let color = Color.Lerp(this.from, this.to, value);
		
		let views = <UIView[]>this.GetGameObject().GetComponentsInChildren("UIView");
		for(let i = 0; i < views.length; i++) {
			views[i].SetColor(color);
		}
	}

	from = new Color(1, 1, 1, 1);
	to = new Color(1, 1, 1, 1);
}