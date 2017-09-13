import { Component } from "../Component"
import { VRObject } from "../Object"
import { Resource } from "../Resource"

export class AudioSource extends Component {
	static ClassName(): string {
		return "AudioSource";
	}

	GetTypeName(): string {
		return AudioSource.ClassName();
	}

	static RegisterComponent() {
		AudioSource.m_class_names = Component.m_class_names.slice(0);
		AudioSource.m_class_names.push("AudioSource");

		Component.Register(AudioSource.ClassName(), () => {
			return new AudioSource();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return AudioSource.m_class_names;
	}

	protected constructor() {
		super();
	}

	DeepCopy(source: VRObject) {
        super.DeepCopy(source);
	}

	static TryUnlock() {
		if(!AudioSource.m_unlocked) {
			AudioSource.m_unlocked = true;

			let context = AudioSource.m_context;
			var buffer = context.createBuffer(1, 1, 22050);
			var source = context.createBufferSource();
			source.buffer = buffer;
			source.connect(context.destination);
			source.start();
		}
	}

	SetClip(file: string) {
		let ms = Resource.GetGlobalAssetBundle().GetAssetData(file);
		AudioSource.m_context.decodeAudioData(ms.GetSlice(), (buffer: any) => {
			this.m_buffer = buffer;
		});
	}

	Play() {
		if(this.m_source != null) {
			this.m_source.stop();
			this.m_source.disconnect();
			this.m_source = null;
		}

		this.m_source = AudioSource.m_context.createBufferSource();
		this.m_source.buffer = this.m_buffer;
		this.m_source.connect(AudioSource.m_context.destination);
		this.m_source.start();
	}

	private static m_context = <AudioContext>new ((<any>window).AudioContext || (<any>window).webkitAudioContext)();
	private static m_unlocked = false;
	private m_source: AudioBufferSourceNode;
	private m_buffer: AudioBuffer;
}