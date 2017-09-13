import { VRMap } from "./container/Map"
import { Vector } from "./container/Vector"

type WatchFinish = ((obj: VRObject) => void);

export class VRObject {
	static GetCache(path: string): VRObject {
		let ptr = [<VRObject>null];
		if(VRObject.m_cache.TryGet(path, ptr)) {
			return ptr[0];
		}

        return null;
    }

	static AddCache(path: string, obj: VRObject) {
		VRObject.m_cache.Add(path, obj);
	}

	static IsLoading(path: string) {
		return VRObject.m_load_watcher.Contains(path);
	}

	static WatchLoad(path: string, finish: WatchFinish) {
		VRObject.m_load_watcher.Get(path).Add(finish);
	}

	static BeginLoad(path: string) {
		VRObject.m_load_watcher.Add(path, new Vector<WatchFinish>());
	}

	static EndLoad(path: string) {
		let obj = VRObject.m_cache.Get(path);

		let watches = VRObject.m_load_watcher.Get(path);
		watches.ForEach((i) => {
			if(i) {
				i(obj);
			}
			return true;
		});
		VRObject.m_load_watcher.Remove(path);
	}

    protected constructor() {
		this.m_name = "Object";
		this.m_id = VRObject.m_id++;
    }

	protected DeepCopy(source: VRObject) {
		this.m_name = source.GetName();
    }

	SetName(name: string) {
        this.m_name = name;
    }

	GetName(): string {
        return this.m_name;
    }

    protected SetId(id: number) {
        this.m_id = id;
    }

    GetId(): number {
        return this.m_id;
    }

    private static m_id = 0;
	private static m_cache = new VRMap<string, VRObject>();
	private static m_load_watcher = new VRMap<string, Vector<WatchFinish>>();
	protected m_name: string;
    protected m_id: number;
}