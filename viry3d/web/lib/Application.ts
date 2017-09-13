import { Graphics } from "./graphics/Graphics"
import { World } from "./World"
import { Time } from "./time/Time"
import { Input } from "./Input"

export enum Platform {
	UnKnown,
	Android,
	iOS,
	Other,
}

export class Application {
	static Current(): Application {
		return Application.m_instance;
	}

	static Platform(): Platform {
		if(Application.m_platform == Platform.UnKnown) {
			let agent = navigator.userAgent;
			if(agent.indexOf("Android") >= 0) {
				Application.m_platform = Platform.Android;
			} else if(agent.indexOf("iPhone") >= 0 || agent.indexOf("iPad") >= 0 || agent.indexOf("iPod") >= 0) {
				Application.m_platform = Platform.iOS;
			} else {
				Application.m_platform = Platform.Other;
			}
		}

		return Application.m_platform;
	}

	static DataPath(): string {
		return "Assets";
	}

	static SavePath(): string {
		return "";
	}

	static SupportDXT(): boolean {
		return Graphics.GetDisplay().SupportDXT();
	}

	static SupportETC1(): boolean {
		return Graphics.GetDisplay().SupportETC1();
	}

	static SupportPVRTC(): boolean {
		return Graphics.GetDisplay().SupportPVRTC();
	}

	protected constructor() {
		Application.m_instance = this;
		this.m_name = "Viry3D::Application";
		this.m_init_width = 1280;
		this.m_init_height = 720;
		this.m_init_fps = -1;

		Time.Update();
	}

	Deinit() {
		Graphics.Deinit();
		Application.m_instance = null;
	}

	SetInitSize(width: number, height: number) {
		this.m_init_width = width;
		this.m_init_height = height;
	}

	SetInitFPS(fps: number) {
		this.m_init_fps = fps;
	}

	SetName(name: string) {
		this.m_name = name;
	}

	GetName(): string {
		return this.m_name;
	}

	OnInit() {
		document.title = this.m_name.toString();

		Graphics.Init(this.m_init_width, this.m_init_height, this.m_init_fps);
		World.Init();
		this.Start();
	}

	OnUpdate() {
		Time.Update();
		this.Update();
		World.Update();
		Input.Update();
	}

	OnDraw() {
		Graphics.Render();
	}

	OnResize(width: number, height: number) {
		Graphics.OnResize(width, height);
	}

	Start() { }
	Update() { }

	private static m_instance: Application;
	private static m_platform = Platform.UnKnown;
	private m_name: string;
	private m_init_width: number;
	private m_init_height: number;
	private m_init_fps: number;
}