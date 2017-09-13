import { Mathf } from "./Mathf"
import { Vector3 } from "./Vector3"

export class Quaternion {
    static Identity(): Quaternion {
        return new Quaternion(0, 0, 0, 1);
    }

	static Inverse(q: Quaternion) {
		return new Quaternion(-q.x, -q.y, -q.z, q.w);
	}

	static AngleAxis(angle: number, axis: Vector3): Quaternion {
		let v = Vector3.Normalize(axis);

		let cosv = Math.cos(Mathf.Deg2Rad * angle * 0.5);
		let sinv = Math.sin(Mathf.Deg2Rad * angle * 0.5);

		let x = v.x * sinv;
		let y = v.y * sinv;
		let z = v.z * sinv;
		let w = cosv;

		return new Quaternion(x, y, z, w);
	}

	static Euler(x: number, y: number, z: number): Quaternion {
		let around_x = Quaternion.AngleAxis(x, new Vector3(1, 0, 0));
		let around_y = Quaternion.AngleAxis(y, new Vector3(0, 1, 0));
		let around_z = Quaternion.AngleAxis(z, new Vector3(0, 0, 1));

		return around_y.Multiply(around_x).Multiply(around_z);
	}

	static Multiply(a: Quaternion, b: number): Quaternion {
		return new Quaternion(a.x * b, a.y * b, a.z * b, a.w * b);
	}

    constructor(x?: number, y?: number, z?: number, w?: number) {
		this.x = x == null ? 0 : x;
		this.y = y == null ? 0 : y;
		this.z = z == null ? 0 : z;
		this.w = w == null ? 0 : w;
    }

	Set(v: Quaternion): Quaternion {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = v.w;
		return this;
	}

	Normalize() {
		let sqr_magnitude = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
		if(!Mathf.FloatEquals(sqr_magnitude, 0)) {
			let sq = Math.sqrt(sqr_magnitude);
			let inv = 1.0 / sq;
			this.x = this.x * inv;
			this.y = this.y * inv;
			this.z = this.z * inv;
			this.w = this.w * inv;
		}
	}

	Multiply(q: Quaternion): Quaternion {
		let _x = this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y;
		let _y = this.w * q.y + this.y * q.w + this.z * q.x - this.x * q.z;
		let _z = this.w * q.z + this.z * q.w + this.x * q.y - this.y * q.x;
		let _w = this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z;

		return new Quaternion(_x, _y, _z, _w);
	}

	MultiplyDirection(v: Vector3): Vector3 {
		let p = this.Multiply(new Quaternion(v.x, v.y, v.z, 0)).Multiply(Quaternion.Inverse(this));

		return new Vector3(p.x, p.y, p.z);
	}

	Dot(v: Quaternion): number {
		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	}

	Equals(v: Quaternion): boolean {
		return Mathf.FloatEquals(this.x, v.x) &&
			Mathf.FloatEquals(this.y, v.y) &&
			Mathf.FloatEquals(this.z, v.z) &&
			Mathf.FloatEquals(this.w, v.w);
	}

    x: number;
    y: number;
    z: number;
    w: number;
}