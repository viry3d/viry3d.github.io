import { VRObject } from "./Object"
import { VRMap } from "./container/Map"

type ClassGen = () => Component;

export class Component extends VRObject {
    static ClassName(): string {
        return "Component";
    }

    GetTypeName(): string {
        return Component.ClassName();
	}

	protected static m_class_names = ["Component"];
	GetClassNames(): string[] {
		return Component.m_class_names;
	}

	IsInstanceOf(name: string): boolean {
		let names = this.GetClassNames();
		for(let i = 0; i < names.length; i++) {
			if(names[i] == name) {
				return true;
			}
		}

		return false;
	}

	static Create(class_name: string): Component {
		let ptr = [<ClassGen>null];
        if(Component.m_class_map.TryGet(class_name, ptr)) {
			return ptr[0]();
		}

		console.error("can not find component type " + class_name);

		return null;
	}

    static Destroy(com: Component) {
        com.Delete();
    }

	protected static Register(class_name: string, class_gen: ClassGen) {
		console.log("Component.Register: " + class_name);

        Component.m_class_map.Add(class_name, class_gen);
	}

	protected constructor() {
        super();

        this.m_deleted = false;
        this.m_started = false;
        this.m_enable = true;
    }

    private Delete() {
        if(!this.m_deleted) {
            this.m_deleted = true;
            this.Enable(false);
			this.OnDestroy();
        }
    }

    DeepCopy(source: VRObject) {
        super.DeepCopy(source);

        let src = <Component>source;
        this.m_deleted = src.m_deleted;
        this.m_started = false;
        this.m_enable = src.m_enable;
    }

    SetName(name: string) {
        if(this.GetName() != name) {
            super.SetName(name);
            this.GetGameObject().SetName(name);
        }
    }

    Enable(enable: boolean) {
        if(this.m_enable != enable) {
            this.m_enable = enable;

            let active: boolean = this.GetGameObject().IsActiveInHierarchy();
            if(active) {
                if(this.m_enable) {
                    this.OnEnable();
                } else {
                    this.OnDisable();
                }
            }
        }
    }

	AttachGameObject(obj: any) {
		this.m_gameobject = obj;
    }

    AttachTransform(obj: any) {
        this.m_transform = obj;
    }

    GetGameObject(): any {
        return this.m_gameobject;
    }

    GetTransform(): any {
        return this.m_transform;
    }

    IsEnable(): boolean {
        return this.m_enable;
    }

    IsStarted(): boolean {
        return this.m_started;
    }

    IsDeleted(): boolean {
        return this.m_deleted;
    }

    SetStarted() {
        this.m_started = true;
    }

	toString(): string {
		return this.GetTypeName();
	}

    Awake() { }
    Start() { }
    Update() { }
    LateUpdate() { }
    OnEnable() { }
    OnDisable() { }
	OnDestroy() { }
    OnTranformChanged() { }
    OnTranformHierarchyChanged() { }
    OnPostRender() { }

    private static m_class_map = new VRMap<string, ClassGen>();
    protected m_gameobject: any;
    protected m_transform: any;
    private m_deleted: boolean;
    private m_started: boolean;
    private m_enable: boolean;
}