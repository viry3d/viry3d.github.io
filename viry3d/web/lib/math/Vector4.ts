import { Mathf } from "./Mathf"

export class Vector4 {
	constructor(x?: number, y?: number, z?: number, w?: number) {
		this.x = x == null ? 0 : x;
		this.y = y == null ? 0 : y;
		this.z = z == null ? 0 : z;
		this.w = w == null ? 0 : w;
	}

	Set(v: Vector4): Vector4 {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = v.w;
		return this;
	}

	toString(): string {
		return "(" + this.x + ", " + this.y + ", " + this.z + ", " + this.w + ")";
	}

	Equals(v: Vector4): boolean {
		return Mathf.FloatEquals(this.x, v.x) &&
			Mathf.FloatEquals(this.y, v.y) &&
			Mathf.FloatEquals(this.z, v.z) &&
			Mathf.FloatEquals(this.w, v.w);
	}

	get x(): number { return this.array[0]; }
	get y(): number { return this.array[1]; }
	get z(): number { return this.array[2]; }
	get w(): number { return this.array[3]; }

	set x(v: number) { this.array[0] = v; }
	set y(v: number) { this.array[1] = v; }
	set z(v: number) { this.array[2] = v; }
	set w(v: number) { this.array[3] = v; }

	array = new Float32Array(4);
}