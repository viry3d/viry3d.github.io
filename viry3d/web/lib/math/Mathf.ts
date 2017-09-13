export class Mathf {
	static FloatEquals(v1: number, v2: number): boolean {
		return Math.abs(v1 - v2) < Mathf.Epsilon;
	}

	static Max<T>(a: T, b: T): T {
		return a > b ? a : b;
	}

	static Min<T>(a: T, b: T): T {
		return a < b ? a : b;
	}

	static Clamp<T>(value: T, min: T, max: T): T {
		return Mathf.Min(Mathf.Max(value, min), max);
	}

	static Clamp01(value: number): number {
		return Mathf.Min(Mathf.Max(value, 0), 1);
	}

	static Round(f: number): number {
		let up = Math.ceil(f);
		let down = Math.floor(f);

		if(f - down < 0.5) {
			return down;
		} else if(up - f < 0.5) {
			return up;
		} else {
			return ((up % 2) == 0 ? up : down);
		}
	}

	static RoundToInt(f: number): number {
		return Mathf.Round(f);
	}

	static RandomRange(min: number, max: number): number {
		return min + Math.random() * (max - min);
	}

	static Lerp(from: number, to: number, t: number): number {
		return from + (to - from) * t;
	}

	static readonly Epsilon = 0.0000001;
	static readonly PI = 3.1415926;
	static readonly Deg2Rad = 0.0174533;
	static readonly Rad2Deg = 57.2958;
	static readonly MaxFloatValue = 3.402823466e+38;
	static readonly MinFloatValue = -Mathf.MaxFloatValue;
}