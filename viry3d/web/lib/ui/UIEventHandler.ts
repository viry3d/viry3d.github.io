import { UICanvasRenderer } from "./UICanvasRenderer"
import { UIView } from "./UIView"
import { Vector2 } from "../math/Vector2"
import { List } from "../container/List"
import { Vector } from "../container/Vector"
import { VRMap } from "../container/Map"
import { Graphics } from "../graphics/Graphics"
import { Input, TouchPhase, Touch } from "../Input"

export class UIPointerEvent {
	position = new Vector2(0, 0);
}

export class UIEventHandler {
	private static HitTest(position: Vector2, views: Vector<UIView>): Vector<UIView> {
		let hit_views = new Vector<UIView>();

		let pos_world = new Vector2();
		pos_world.x = position.x - Graphics.GetDisplay().GetWidth() / 2;
		pos_world.y = position.y - Graphics.GetDisplay().GetHeight() / 2;

		views.ForEach((i) => {
			let mat = i.rect.GetRenderer().GetTransform().GetLocalToWorldMatrix();
			let vertices = i.GetBoundsVertices();
			for(let j = 0; j < vertices.Size(); j++) {
				// from canvas space to world space
				vertices.Set(j, mat.MultiplyPoint3x4(vertices.Get(j)));
			}

			if( pos_world.x > vertices.Get(0).x &&
				pos_world.x < vertices.Get(1).x &&
				pos_world.y > vertices.Get(1).y &&
				pos_world.y < vertices.Get(2).y) {
				hit_views.Add(i);
			}

			return true;
		});

		return hit_views;
	}

	static HandleUIEvent(list: List<any>) {
		let touch_count = Input.GetTouchCount();
		if(touch_count == 0) {
			return;
		}

		let views = new Vector<UIView>();
		list.ForEach((i) => {
			i.FindViews();
			let vs = i.GetViews();

			vs.ForEach((j: UIView) => {
				views.Add(j);
				return true;
			});

			return true;
		});

		for(let i = 0; i < touch_count; i++) {
			let t = Input.GetTouch(i);

			let e = new UIPointerEvent();
			e.position.Set(t.position);

			if(t.phase == TouchPhase.Began) {
				if(!UIEventHandler.m_hit_views.Contains(t.fingerId)) {
					UIEventHandler.m_hit_views.Add(t.fingerId, new Vector<UIView>());
				}
				let pointer_views = UIEventHandler.m_hit_views.Get(t.fingerId);

				let hit_views = UIEventHandler.HitTest(t.position, views);
				for(let j = hit_views.Size() - 1; j >= 0; j--) {
					let event_handler = hit_views.Get(j).event_handler;
					if(event_handler.enable) {
						// send down event to top view in down
						let on_pointer_down = event_handler.on_pointer_down;
						if(on_pointer_down) {
							on_pointer_down(e);
						}

						pointer_views.Add(hit_views.Get(j));
					}
				}
			} else if(t.phase == TouchPhase.Moved) {
				let pointer_views = UIEventHandler.m_hit_views.Get(t.fingerId);
			} else if(t.phase == TouchPhase.Ended || t.phase == TouchPhase.Canceled) {
				let pointer_views = UIEventHandler.m_hit_views.Get(t.fingerId);

				let hit_views = UIEventHandler.HitTest(t.position, views);
				for(let j = hit_views.Size() - 1; j >= 0; j--) {
					let v = hit_views.Get(j);

					if(v.event_handler.enable) {
						// send up event to top view in up
						let on_pointer_up = v.event_handler.on_pointer_up;
						if(on_pointer_up) {
							on_pointer_up(e);
						}

						// send click event to top view in down and in up
						pointer_views.ForEach((k) => {
							if(k == v) {
								let on_pointer_click = v.event_handler.on_pointer_click;
								if(on_pointer_click) {
									on_pointer_click(e);
								}
								return false;
							}

							return true;
						});

						break;
					}
				}

				// send up event to top view in down but not in up
				pointer_views.ForEach((j) => {
					let v = j;
					let not_hit = true;

					for(let k = 0; k < hit_views.Size(); k++) {
						if(v == hit_views.Get(k)) {
							not_hit = false;
							break;
						}
					}

					if(not_hit) {
						if(v.event_handler.enable) {
							let on_pointer_up = v.event_handler.on_pointer_up;
							if(on_pointer_up) {
								on_pointer_up(e);
							}

							return false;
						}
					}

					return true;
				});

				UIEventHandler.m_hit_views.Remove(t.fingerId);
			}
		}
	}

	private static m_hit_views = new VRMap<number, Vector<UIView>>();
	enable = false;
	on_pointer_down: (e: UIPointerEvent) => void;
	on_pointer_up: (e: UIPointerEvent) => void;
	on_pointer_click: (e: UIPointerEvent) => void;
}