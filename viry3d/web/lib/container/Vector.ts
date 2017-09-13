export class Vector<V> {
	constructor(size?: number) {
		if(size != null) {
			this.m_array = new Array<V>(size);
		} else {
			this.m_array = new Array<V>();
		}
	}

	Add(v: V) {
		this.m_array.push(v);
	}

	AddRange(vs: V[]) {
		this.m_array = this.m_array.concat(vs);
	}

	Clear() {
		this.m_array.splice(0, this.m_array.length);
	}

	Size(): number {
		return this.m_array.length;
	}

	Empty(): boolean {
		return this.m_array.length == 0;
	}

	Resize(size: number) {
		if(size > this.m_array.length) {
			let append = new Array<V>(size - this.m_array.length);
			this.m_array = this.m_array.concat(append);
		} else if(size < this.m_array.length) {
			this.m_array.splice(size);
		}
	}

	Remove(index: number, count?: number) {
		if(count != null) {
			this.m_array.splice(index, count);
		} else {
			this.m_array.splice(index, 1);
		}
	}

	Get(index: number): V {
		return this.m_array[index];
	}

	Set(index: number, v: V) {
		this.m_array[index] = v;
	}

	ForEach(func: (v: V) => boolean) {
		for(let i = 0; i < this.Size(); i++) {
			if(!func(this.Get(i))) {
				break;
			}
		}
	}

	toArray(): Array<V> {
		return this.m_array;
	}

	toString(): string {
		let str = "Vector[" + this.m_array.length + "] : { \n";

		for(let i = 0; i < this.m_array.length; i++) {
			let str_ele = this.m_array[i].toString();
			str_ele = str_ele.replace(new RegExp("\n", "gm"), "\n    ");

			str += "    " + str_ele;
			
			if(i != this.m_array.length - 1) {
				str += ", ";
			}

			str += "\n";
		}

		str += "}";

		return str;
	}

	private m_array: Array<V>;
}