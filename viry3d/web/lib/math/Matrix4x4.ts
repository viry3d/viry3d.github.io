import { Vector3 } from "./Vector3"
import { Quaternion } from "./Quaternion"
import { Vector4 } from "./Vector4"
import { Mathf } from "./Mathf"

export class Matrix4x4 {
    static Identity(): Matrix4x4 {
        let values = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
        return new Matrix4x4(values);
    }

	static Translation(t: Vector3): Matrix4x4 {
		let m = Matrix4x4.Identity();

		m.m03 = t.x;
		m.m13 = t.y;
		m.m23 = t.z;

		return m;
	}

	static Rotation(r: Quaternion): Matrix4x4 {
		let m = Matrix4x4.Identity();

		m.m00 = 1 - 2 * r.y * r.y - 2 * r.z * r.z;
		m.m10 = 2 * r.x * r.y + 2 * r.w * r.z;
		m.m20 = 2 * r.x * r.z - 2 * r.w * r.y;

		m.m01 = 2 * r.x * r.y - 2 * r.w * r.z;
		m.m11 = 1 - 2 * r.x * r.x - 2 * r.z * r.z;
		m.m21 = 2 * r.y * r.z + 2 * r.w * r.x;

		m.m02 = 2 * r.x * r.z + 2 * r.w * r.y;
		m.m12 = 2 * r.y * r.z - 2 * r.w * r.x;
		m.m22 = 1 - 2 * r.x * r.x - 2 * r.y * r.y;

		return m;
	}

	static Scaling(s: Vector3): Matrix4x4 {
		let m = Matrix4x4.Identity();

		m.m00 = s.x;
		m.m11 = s.y;
		m.m22 = s.z;

		return m;
	}

	static TRS(t: Vector3, r: Quaternion, s: Vector3): Matrix4x4 {
		let mt = Matrix4x4.Translation(t);
		let mr = Matrix4x4.Rotation(r);
		let ms = Matrix4x4.Scaling(s);

		return mt.Multiply(mr).Multiply(ms);
	}

	static LookTo(eye_position: Vector3, to_direction: Vector3, up_direction: Vector3): Matrix4x4 {
		let m = Matrix4x4.Identity();

		let zaxis = new Vector3(-to_direction.x, -to_direction.y, -to_direction.z);
		zaxis.Normalize();

		let xaxis = zaxis.Cross(up_direction);
		xaxis.Normalize();

		let yaxis = xaxis.Cross(zaxis);

		m.m00 = xaxis.x; m.m01 = xaxis.y; m.m02 = xaxis.z; m.m03 = -xaxis.Dot(eye_position);
		m.m10 = yaxis.x; m.m11 = yaxis.y; m.m12 = yaxis.z; m.m13 = -yaxis.Dot(eye_position);
		m.m20 = zaxis.x; m.m21 = zaxis.y; m.m22 = zaxis.z; m.m23 = -zaxis.Dot(eye_position);
		m.m30 = 0; m.m31 = 0; m.m32 = 0; m.m33 = 1.0;

		return m;
	}

	static Perspective(fov: number, aspect: number, near: number, far: number): Matrix4x4 {
		let m = Matrix4x4.Identity();

		let scale_y = 1 / Math.tan(Mathf.Deg2Rad * fov / 2);
		let scale_x = scale_y / aspect;

		m.m00 = scale_x;
		m.m11 = scale_y;
		m.m22 = (near + far) / (near - far);
		m.m23 = 2 * near * far / (near - far);
		m.m32 = -1.0;
		m.m33 = 0;

		return m;
	}

	static Ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4x4 {
		let m = Matrix4x4.Identity();

		let r_l = 1 / (right - left);
		let t_b = 1 / (top - bottom);
		let n_f = 1 / (near - far);

		m.m00 = 2 * r_l;
		m.m03 = -(right + left) * r_l;
		m.m11 = 2 * t_b;
		m.m13 = -(top + bottom) * t_b;

		//cvv 0~1
		m.m22 = n_f;
		m.m23 = near * n_f;

		return m;
	}

    constructor(values?: Array<number>) {
        if(values != null && values.length == 16) {
            this.m = new Float32Array(values);
        } else {
            this.m = new Float32Array(16);
        }
    }

	Multiply(mat: Matrix4x4): Matrix4x4 {
		let m = Matrix4x4.Identity();

		m.m00 = this.m00 * mat.m00 + this.m01 * mat.m10 + this.m02 * mat.m20 + this.m03 * mat.m30;
		m.m01 = this.m00 * mat.m01 + this.m01 * mat.m11 + this.m02 * mat.m21 + this.m03 * mat.m31;
		m.m02 = this.m00 * mat.m02 + this.m01 * mat.m12 + this.m02 * mat.m22 + this.m03 * mat.m32;
		m.m03 = this.m00 * mat.m03 + this.m01 * mat.m13 + this.m02 * mat.m23 + this.m03 * mat.m33;

		m.m10 = this.m10 * mat.m00 + this.m11 * mat.m10 + this.m12 * mat.m20 + this.m13 * mat.m30;
		m.m11 = this.m10 * mat.m01 + this.m11 * mat.m11 + this.m12 * mat.m21 + this.m13 * mat.m31;
		m.m12 = this.m10 * mat.m02 + this.m11 * mat.m12 + this.m12 * mat.m22 + this.m13 * mat.m32;
		m.m13 = this.m10 * mat.m03 + this.m11 * mat.m13 + this.m12 * mat.m23 + this.m13 * mat.m33;

		m.m20 = this.m20 * mat.m00 + this.m21 * mat.m10 + this.m22 * mat.m20 + this.m23 * mat.m30;
		m.m21 = this.m20 * mat.m01 + this.m21 * mat.m11 + this.m22 * mat.m21 + this.m23 * mat.m31;
		m.m22 = this.m20 * mat.m02 + this.m21 * mat.m12 + this.m22 * mat.m22 + this.m23 * mat.m32;
		m.m23 = this.m20 * mat.m03 + this.m21 * mat.m13 + this.m22 * mat.m23 + this.m23 * mat.m33;

		m.m30 = this.m30 * mat.m00 + this.m31 * mat.m10 + this.m32 * mat.m20 + this.m33 * mat.m30;
		m.m31 = this.m30 * mat.m01 + this.m31 * mat.m11 + this.m32 * mat.m21 + this.m33 * mat.m31;
		m.m32 = this.m30 * mat.m02 + this.m31 * mat.m12 + this.m32 * mat.m22 + this.m33 * mat.m32;
		m.m33 = this.m30 * mat.m03 + this.m31 * mat.m13 + this.m32 * mat.m23 + this.m33 * mat.m33;

		return m;
	}

	MultiplyVector(v: Vector4): Vector4 {
		let x = v.x;
		let y = v.y;
		let z = v.z;
		let w = v.w;

		let vx = x * this.m00 + y * this.m01 + z * this.m02 + w * this.m03;
		let vy = x * this.m10 + y * this.m11 + z * this.m12 + w * this.m13;
		let vz = x * this.m20 + y * this.m21 + z * this.m22 + w * this.m23;
		let vw = x * this.m30 + y * this.m31 + z * this.m32 + w * this.m33;

		return new Vector4(vx, vy, vz, vw);
	}

	MultiplyPoint(v: Vector3): Vector3 {
		let x = v.x;
		let y = v.y;
		let z = v.z;

		let vx = x * this.m00 + y * this.m01 + z * this.m02 + this.m03;
		let vy = x * this.m10 + y * this.m11 + z * this.m12 + this.m13;
		let vz = x * this.m20 + y * this.m21 + z * this.m22 + this.m23;
		let vw = x * this.m30 + y * this.m31 + z * this.m32 + this.m33;

		return new Vector3(vx / vw, vy / vw, vz / vw);
	}

	MultiplyPoint3x4(v: Vector3): Vector3 {
		let x = v.x;
		let y = v.y;
		let z = v.z;

		let vx = x * this.m00 + y * this.m01 + z * this.m02 + this.m03;
		let vy = x * this.m10 + y * this.m11 + z * this.m12 + this.m13;
		let vz = x * this.m20 + y * this.m21 + z * this.m22 + this.m23;

		return new Vector3(vx, vy, vz);
	}

	MultiplyDirection(v: Vector3): Vector3 {
		let x = v.x;
		let y = v.y;
		let z = v.z;

		let vx = x * this.m00 + y * this.m01 + z * this.m02;
		let vy = x * this.m10 + y * this.m11 + z * this.m12;
		let vz = x * this.m20 + y * this.m21 + z * this.m22;

		return new Vector3(vx, vy, vz);
	}

	Inverse(): Matrix4x4 {
		let ret = new Matrix4x4();
		ret.Set(this);

		let mat = ret.m;
		let is = new Array<number>(4);
		let js = new Array<number>(4);

		let SWAP = function(i1: number, i2: number, arr: Float32Array) {
			let temp = arr[i1];
			arr[i1] = arr[i2];
			arr[i2] = temp;
		};

		for(let i = 0; i < 4; i++) {
			let max = 0.0;

			for(let j = i; j < 4; j++) {
				for(let k = i; k < 4; k++) {
					let f = Math.abs(mat[j * 4 + k]);
					if(f > max) {
						max = f;
						is[i] = j;
						js[i] = k;
					}
				}
			}

			if(max < 0.0001) {
				return ret;
			}

			if(is[i] != i) {
				let temp: number;

				SWAP(is[i] * 4 + 0, i * 4 + 0, mat);
				SWAP(is[i] * 4 + 1, i * 4 + 1, mat);
				SWAP(is[i] * 4 + 2, i * 4 + 2, mat);
				SWAP(is[i] * 4 + 3, i * 4 + 3, mat);
			}

			if(js[i] != i) {
				SWAP(0 * 4 + js[i], 0 * 4 + i, mat);
				SWAP(1 * 4 + js[i], 1 * 4 + i, mat);
				SWAP(2 * 4 + js[i], 2 * 4 + i, mat);
				SWAP(3 * 4 + js[i], 3 * 4 + i, mat);
			}

			mat[i * 4 + i] = 1.0 / mat[i * 4 + i];
			let key = mat[i * 4 + i];

			for(let j = 0; j < 4; j++) {
				if(j != i) {
					mat[i * 4 + j] *= key;
				}
			}

			for(let j = 0; j < 4; j++) {
				if(j != i) {
					for(let k = 0; k < 4; k++) {
						if(k != i) {
							mat[j * 4 + k] -= mat[i * 4 + k] * mat[j * 4 + i];
						}
					}
				}
			}

			for(let j = 0; j < 4; j++) {
				if(j != i) {
					mat[j * 4 + i] *= -key;
				}
			}
		}

		for(let i = 3; i >= 0; i--) {
			if(js[i] != i) {
				SWAP(js[i] * 4 + 0, i * 4 + 0, mat);
				SWAP(js[i] * 4 + 1, i * 4 + 1, mat);
				SWAP(js[i] * 4 + 2, i * 4 + 2, mat);
				SWAP(js[i] * 4 + 3, i * 4 + 3, mat);
			}

			if(is[i] != i) {
				SWAP(0 * 4 + is[i], 0 * 4 + i, mat);
				SWAP(1 * 4 + is[i], 1 * 4 + i, mat);
				SWAP(2 * 4 + is[i], 2 * 4 + i, mat);
				SWAP(3 * 4 + is[i], 3 * 4 + i, mat);
			}
		}

		return ret;
	}

	GetRow(row: number): Vector4 {
		return new Vector4(
			this.m[row * 4 + 0],
			this.m[row * 4 + 1],
			this.m[row * 4 + 2],
			this.m[row * 4 + 3]);
	}

	GetColumn(row: number): Vector4 {
		return new Vector4(
			this.m[0 * 4 + row],
			this.m[1 * 4 + row],
			this.m[2 * 4 + row],
			this.m[3 * 4 + row]);
	}

	Set(mat: Matrix4x4): Matrix4x4 {
		this.m.set(mat.m);
		return this;
	}

	get m00(): number { return this.m[0 * 4 + 0]; }
	get m01(): number { return this.m[0 * 4 + 1]; }
	get m02(): number { return this.m[0 * 4 + 2]; }
	get m03(): number { return this.m[0 * 4 + 3]; }
	get m10(): number { return this.m[1 * 4 + 0]; }
	get m11(): number { return this.m[1 * 4 + 1]; }
	get m12(): number { return this.m[1 * 4 + 2]; }
	get m13(): number { return this.m[1 * 4 + 3]; }
	get m20(): number { return this.m[2 * 4 + 0]; }
	get m21(): number { return this.m[2 * 4 + 1]; }
	get m22(): number { return this.m[2 * 4 + 2]; }
	get m23(): number { return this.m[2 * 4 + 3]; }
	get m30(): number { return this.m[3 * 4 + 0]; }
	get m31(): number { return this.m[3 * 4 + 1]; }
	get m32(): number { return this.m[3 * 4 + 2]; }
	get m33(): number { return this.m[3 * 4 + 3]; }

	set m00(v: number) { this.m[0 * 4 + 0] = v; }
	set m01(v: number) { this.m[0 * 4 + 1] = v; }
	set m02(v: number) { this.m[0 * 4 + 2] = v; }
	set m03(v: number) { this.m[0 * 4 + 3] = v; }
	set m10(v: number) { this.m[1 * 4 + 0] = v; }
	set m11(v: number) { this.m[1 * 4 + 1] = v; }
	set m12(v: number) { this.m[1 * 4 + 2] = v; }
	set m13(v: number) { this.m[1 * 4 + 3] = v; }
	set m20(v: number) { this.m[2 * 4 + 0] = v; }
	set m21(v: number) { this.m[2 * 4 + 1] = v; }
	set m22(v: number) { this.m[2 * 4 + 2] = v; }
	set m23(v: number) { this.m[2 * 4 + 3] = v; }
	set m30(v: number) { this.m[3 * 4 + 0] = v; }
	set m31(v: number) { this.m[3 * 4 + 1] = v; }
	set m32(v: number) { this.m[3 * 4 + 2] = v; }
	set m33(v: number) { this.m[3 * 4 + 3] = v; }

	m: Float32Array; 
}