import { Mathf } from "./Mathf"

export class Vector3 {
    static Zero(): Vector3 {
        return new Vector3(0, 0, 0);
    }

    static One(): Vector3 {
        return new Vector3(1, 1, 1);
    }

	static Normalize(value: Vector3): Vector3 {
		let v = new Vector3();
		v.Set(value);
		v.Normalize();
		return v;
	}

	static Angle(from: Vector3, to: Vector3): number {
		let mod = from.SqrMagnitude() * to.SqrMagnitude();
		let dot = from.Dot(to) / Math.sqrt(mod);
		dot = Mathf.Clamp(dot, -1.0, 1.0);

		let deg = Math.acos(dot) * Mathf.Rad2Deg;

		return deg;
	}

	static Multiply(a: Vector3, b: number): Vector3 {
		return new Vector3(a.x * b, a.y * b, a.z * b);
	}

	static Add(a: Vector3, b: Vector3): Vector3 {
		return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
	}

	static Lerp(from: Vector3, to: Vector3, t: number): Vector3 {
		return new Vector3(
			Mathf.Lerp(from.x, to.x, t),
			Mathf.Lerp(from.y, to.y, t),
			Mathf.Lerp(from.z, to.z, t));
	}

	constructor(x?: number, y?: number, z?: number) {
		this.x = x == null ? 0 : x;
		this.y = y == null ? 0 : y;
		this.z = z == null ? 0 : z;
	}

	Normalize() {
		let sqr_magnitude = this.SqrMagnitude();
		if(!Mathf.FloatEquals(sqr_magnitude, 0)) {
			let sq = Math.sqrt(sqr_magnitude);

			let inv = 1.0 / sq;
			this.x = this.x * inv;
			this.y = this.y * inv;
			this.z = this.z * inv;
		}
	}

	Add(v: Vector3): Vector3 {
		return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
	}

	Multiply(v: number): Vector3 {
		return new Vector3(this.x * v, this.y * v, this.z * v);
	}

	Cross(v: Vector3): Vector3 {
		let _x = this.y * v.z - this.z * v.y;
		let _y = this.z * v.x - this.x * v.z;
		let _z = this.x * v.y - this.y * v.x;

		return new Vector3(_x, _y, _z);
	}

	Dot(v: Vector3): number {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}

	SqrMagnitude(): number {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	Set(v: Vector3): Vector3 {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		return this;
	}

	toString(): string {
		return "(" + this.x + ", " + this.y + ", " + this.z + ")";
	}

	Equals(v: Vector3): boolean {
		return Mathf.FloatEquals(this.x, v.x) &&
			Mathf.FloatEquals(this.y, v.y) &&
			Mathf.FloatEquals(this.z, v.z);
	}

	x: number;
	y: number;
	z: number;
}