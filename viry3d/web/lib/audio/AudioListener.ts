import { Component } from "../Component"
import { VRObject } from "../Object"

export class AudioListener extends Component {
	static ClassName(): string {
		return "AudioListener";
	}

	GetTypeName(): string {
		return AudioListener.ClassName();
	}

	static RegisterComponent() {
		AudioListener.m_class_names = Component.m_class_names.slice(0);
		AudioListener.m_class_names.push("AudioListener");

		Component.Register(AudioListener.ClassName(), () => {
			return new AudioListener();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return AudioListener.m_class_names;
	}

	protected constructor() {
		super();
	}

	DeepCopy(source: VRObject) {
        super.DeepCopy(source);
    }
}