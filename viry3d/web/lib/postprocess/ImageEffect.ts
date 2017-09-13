import { Component } from "../Component"
import { VRObject } from "../Object"

export class ImageEffect extends Component {
	static ClassName(): string {
		return "ImageEffect";
	}

	GetTypeName(): string {
		return ImageEffect.ClassName();
	}

	static RegisterComponent() {
		ImageEffect.m_class_names = Component.m_class_names.slice(0);
		ImageEffect.m_class_names.push("ImageEffect");
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return ImageEffect.m_class_names;
	}

	DeepCopy(source: VRObject) {
        super.DeepCopy(source);
    }
}