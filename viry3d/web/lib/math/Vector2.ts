import { Mathf } from "./Mathf"

export class Vector2 {
	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	Set(v: Vector2) {
		this.x = v.x;
		this.y = v.y;
	}

	Add(v: Vector2): Vector2 {
		return new Vector2(this.x + v.x, this.y + v.y);
	}

	Subtract(v: Vector2): Vector2 {
		return new Vector2(this.x - v.x, this.y - v.y);
	}

	toString(): string {
		return "(" + this.x + ", " + this.y + ")";
	}

	Equals(v: Vector2): boolean {
		return Mathf.FloatEquals(this.x, v.x) &&
			Mathf.FloatEquals(this.y, v.y);
	}

	x: number;
	y: number;
}