import { VRObject } from "../Object"
import { Vector4 } from "../math/Vector4"
import { Rect } from "../math/Rect"

export class Sprite extends VRObject {
	static Create(rect: Rect, border: Vector4): Sprite {
		let s = new Sprite();
		s.rect.Set(rect);
		s.border.Set(border);
		return s;
	}

	private constructor() {
		super();
	}

	rect = new Rect(0, 0, 1, 1);
	border = new Vector4(0, 0, 0, 0);
}