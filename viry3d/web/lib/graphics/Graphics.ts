import { Display } from "./Display"
import { Camera } from "./Camera"

export class Graphics {
	static Init(width: number, height: number, fps: number) {
		Graphics.m_display = new Display();
		Graphics.m_display.Init(width, height, fps);
	}

	static Deinit() {
		Graphics.m_display.Deinit();
		Graphics.m_display = null;
	}

	static Render() {
		Camera.PrepareAll();
		Camera.RenderAll();
	}

	static OnResize(width: number, height: number) {
		Graphics.m_display.OnResize(width, height);
		Camera.OnResize(width, height);
	}

	static GetDisplay(): Display {
		return Graphics.m_display;
	}

	static m_display: Display;
}