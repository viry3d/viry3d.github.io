import { Vector2 } from "./math/Vector2"
import { Vector } from "./container/Vector"
import { List } from "./container/List"
import { Time } from "./time/Time"
import { Application, Platform } from "./Application"
import { AudioSource } from "./audio/AudioSource"

export enum TouchPhase {
    Began,          //A finger touched the screen.
    Moved,          //A finger moved on the screen.
    Stationary,     //A finger is touching the screen but hasn't moved.
    Ended,          //A finger was lifted from the screen. This is the final phase of a touch.
    Canceled,       //The system cancelled tracking for the touch.
}
    
export class Touch {
	deltaPosition: Vector2;
	time: number;
	deltaTime: number;
	fingerId: number;
	phase: TouchPhase;
	position: Vector2;
	tapCount: number;
}

export class Input {
	static BindTouchEventListener(ele: HTMLCanvasElement) {
		let platform = Application.Platform();
		if(platform == Platform.Android || platform == Platform.iOS) {
			let touch_begin = (touches: TouchList, time: number) => {
				for(let i = 0; i < touches.length; i++) {
					let touch = touches[i];
					let x = touch.pageX;
					let y = ele.height - touch.pageY - 1;

					let t = new Touch();
					t.deltaPosition = new Vector2(0, 0);
					t.deltaTime = 0;
					t.time = time / 1000.0;
					t.fingerId = touch.identifier;
					t.phase = TouchPhase.Began;
					t.tapCount = touches.length;
					t.position = new Vector2(x, y);

					if(!Input.g_input_touches.Empty()) {
						Input.g_input_touch_buffer.AddLast(t);
					} else {
						Input.g_input_touches.Add(t);
					}
				}
			};
			let touch_update = (touches: TouchList, time: number, phase: TouchPhase) => {
				for(let i = 0; i < touches.length; i++) {
					let touch = touches[i];
					let x = touch.pageX;
					let y = ele.height - touch.pageY - 1;

					let t = new Touch();
					t.deltaPosition = new Vector2(0, 0);
					t.deltaTime = 0;
					t.time = time / 1000.0;
					t.fingerId = touch.identifier;
					t.phase = phase;
					t.tapCount = touches.length;
					t.position = new Vector2(x, y);

					if(!Input.g_input_touches.Empty()) {
						Input.g_input_touch_buffer.AddLast(t);
					} else {
						Input.g_input_touches.Add(t);
					}
				}
			};

			//touch
			ele.addEventListener("touchstart", function (e) {
				e.preventDefault();
				touch_begin(e.changedTouches, e.timeStamp);
			});
			ele.addEventListener("touchmove", function (e) {
				e.preventDefault();
				touch_update(e.changedTouches, e.timeStamp, TouchPhase.Moved);
			});
			ele.addEventListener("touchend", function (e) {
				e.preventDefault();
				touch_update(e.changedTouches, e.timeStamp, TouchPhase.Ended);
			});
			ele.addEventListener("touchcancel", function (e) {
				e.preventDefault();
				touch_update(e.changedTouches, e.timeStamp, TouchPhase.Canceled);
			});
		} else {
			let mouse_begin = (e: MouseEvent) => {
				let x = e.pageX;
				let y = ele.height - e.pageY - 1;

				let t = new Touch();
				t.deltaPosition = new Vector2(0, 0);
				t.deltaTime = 0;
				t.time = Time.GetRealTimeSinceStartup();
				t.fingerId = 0;
				t.phase = TouchPhase.Began;
				t.tapCount = 1;
				t.position = new Vector2(x, y);

				if(!Input.g_input_touches.Empty()) {
					Input.g_input_touch_buffer.AddLast(t);
				} else {
					Input.g_input_touches.Add(t);
				}
			};
			let mouse_update = (e: MouseEvent, phase: TouchPhase) => {
				let x = e.pageX;
				let y = ele.height - e.pageY - 1;

				let t = new Touch();
				t.deltaPosition = new Vector2(0, 0);
				t.deltaTime = 0;
				t.time = Time.GetRealTimeSinceStartup();
				t.fingerId = 0;
				t.phase = phase;
				t.tapCount = 1;
				t.position = new Vector2(x, y);

				if(!Input.g_input_touches.Empty()) {
					Input.g_input_touch_buffer.AddLast(t);
				} else {
					Input.g_input_touches.Add(t);
				}
			};

			//mouse
			ele.addEventListener("mousedown", function (e) {
				mouse_begin(e);

				Input.g_input_down = true;
			});
			ele.addEventListener("mousemove", function (e) {
				if(Input.g_input_down) {
					mouse_update(e, TouchPhase.Moved);
				}
			});
			ele.addEventListener("mouseup", function (e) {
				mouse_update(e, TouchPhase.Ended);

				Input.g_input_down = false;
			});
		}

		if(platform == Platform.iOS) {
			ele.addEventListener("touchstart", function (e) {
				e.preventDefault();
				AudioSource.TryUnlock();
			});
		}
	}

	static GetTouchCount(): number {
		return Input.g_input_touches.Size();
	}

	static GetTouch(index: number): Touch {
		if(index >= 0 && index < Input.g_input_touches.Size()) {
			return Input.g_input_touches.Get(index);
        }
        
		return null;
	}

	static Update() {
		Input.g_input_touches.Clear();
		if(!Input.g_input_touch_buffer.Empty()) {
			Input.g_input_touches.Add(Input.g_input_touch_buffer.First());
			Input.g_input_touch_buffer.RemoveFirst();
		}
	}

	static g_input_down = false;
	static g_input_touches = new Vector<Touch>();
	static g_input_touch_buffer = new List<Touch>();
}