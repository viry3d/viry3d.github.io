export class VRMap<K, V> {
	constructor(map?: VRMap<K, V>) {
        this.m_map = new Object();
		this.m_keys = new Array<string>();

		if(map != null) {
			this.Copy(map);
		}
    }
	
	Copy(map: VRMap<K, V>) {
		this.Clear();

		for(let k of map.m_keys) {
			this.m_keys.push(k);
			this.m_map[k] = map.m_map[k];
		}
	}

    Add(k: K, v: V): boolean {
        if(!this.Contains(k)) {
			this.m_keys.push(k.toString());
			this.m_map[k.toString()] = v;

            return true;
        }

        return false;
    }

	Set(k: K, v: V) {
		this.m_map[k.toString()] = v;
	}

    Contains(k: K): boolean {
		return this.m_map.hasOwnProperty(k.toString());
    }

    Remove(k: K): boolean {
		if(this.Contains(k)) {
			let index = this.m_keys.indexOf(k.toString());
			this.m_keys.splice(index, 1);
			delete this.m_map[k.toString()];

			return true;
		}

		return false;
    }

    TryGet(k: K, v: V[]): boolean {
        let value = this.m_map[k.toString()];
        if(value != null) {
            v[0] = value;
			return true;
        }

        return false;
    }

	Get(k: K): V {
		return this.m_map[k.toString()];
	}

	Size(): number {
		return this.m_keys.length;
	}

	Empty(): boolean {
		return this.Size() == 0;
	}

    Clear() {
		for(let k of this.m_keys) {
			delete this.m_map[k];
		}
		this.m_keys.splice(0, this.m_keys.length);
    }

	ForEach(func: (k:string, v: V) => boolean) {
		for(let k of this.m_keys) {
			if(!func(k, this.m_map[k])) {
				break;
			}
		}
	}

	Keys(): string[] {
		return this.m_keys;
	}

    private m_map: any;
	private m_keys: string[];
}