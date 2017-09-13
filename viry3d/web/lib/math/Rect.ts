export class Rect {
	constructor(x: number, y: number, w: number, h: number) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}

	Set(v: Rect) {
		this.x = v.x;
		this.y = v.y;
		this.width = v.width;
		this.height = v.height;
	}

	x: number;
	y: number;
	width: number;
	height: number;
}