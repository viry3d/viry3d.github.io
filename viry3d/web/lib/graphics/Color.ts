import { Mathf } from "../math/Mathf"

export class Color {
	static Lerp(from: Color, to: Color, t: number): Color {
		return new Color(
			Mathf.Lerp(from.r, to.r, t),
			Mathf.Lerp(from.g, to.g, t),
			Mathf.Lerp(from.b, to.b, t),
			Mathf.Lerp(from.a, to.a, t));
	}

	constructor(r = 1, g = 1, b = 1, a = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	Set(v: Color): Color {
		this.r = v.r;
		this.g = v.g;
		this.b = v.b;
		this.a = v.a;
		return this;
	}

	Equals(v: Color): boolean {
		return Mathf.FloatEquals(this.r, v.r) &&
			Mathf.FloatEquals(this.g, v.g) &&
			Mathf.FloatEquals(this.b, v.b) &&
			Mathf.FloatEquals(this.a, v.a);
	}

	get r(): number { return this.array[0]; }
	get g(): number { return this.array[1]; }
	get b(): number { return this.array[2]; }
	get a(): number { return this.array[3]; }

	set r(v: number) { this.array[0] = v; }
	set g(v: number) { this.array[1] = v; }
	set b(v: number) { this.array[2] = v; }
	set a(v: number) { this.array[3] = v; }

	array = new Float32Array(4);
}