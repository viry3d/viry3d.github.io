import { Vector } from "../container/Vector"

export class VRString {
	constructor(str: string) {
		this.m_string = str;
	}

	Size(): number {
		return this.m_string.length;
	}

	Empty(): boolean {
		return this.Size() == 0;
	}

	Substring(start: number, count?: number) {
		if(count != null && count < 0) {
			count = this.Size() - start;
		}

		return new VRString(this.m_string.substr(start, count));
	}

	IndexOf(str: string, start?: number): number {
		return this.m_string.indexOf(str, start);
	}

	Split(separator: string, exclude_empty?: boolean): Vector<VRString> {
		let result = new Vector<VRString>();

		let start = 0;
		while(true) {
			let index = this.IndexOf(separator, start);
			if(index >= 0) {
				let str = this.Substring(start, index - start);
				if(!str.Empty() || exclude_empty == null || !exclude_empty) {
					result.Add(str);
				}
				start = index + separator.length;
			} else {
				break;
			}
		}

		let str = this.Substring(start, -1);
		if(!str.Empty() || exclude_empty == null || !exclude_empty) {
			result.Add(str);
		}

		return result;
	}

	Contains(str: string): boolean {
		return this.m_string.indexOf(str) >= 0;
	}
	
	toString(): string {
		return this.m_string.toString();
	}

	Equals(str: VRString): boolean {
		return this.m_string == str.m_string;
	}

	private m_string: String;
}