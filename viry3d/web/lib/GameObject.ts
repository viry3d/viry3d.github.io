import { VRObject } from "./Object"
import { List } from "./container/List"
import { Vector } from "./container/Vector"
import { Viry3D } from "./Viry3D"
import { Transform } from "./Transform"
import { Component } from "./Component"
import { Layer } from "./Layer"
import { World } from "./World"

export class GameObject extends VRObject {
	static Create(name: string): GameObject {
		let obj = new GameObject(name);

		World.AddGameObject(obj);

        let transform = <Transform>Component.Create(Transform.ClassName());
		transform.AttachGameObject(obj);
		obj.m_transform = transform;
		obj.AddComponentInternal(transform);

		return obj;
	}

	static Destroy(obj: GameObject) {
		if(!obj.IsDeleted()) {
			obj.SetActive(false);
			obj.Delete();
		}
    }

    static Instantiate(source: GameObject): GameObject {
        let clone = GameObject.Create(source.GetName());

        clone.DeepCopy(source);

        return clone;
    }

    private CopyComponent(com: Component) {
        if(com instanceof Transform) {
            this.m_transform.DeepCopy(com);
        } else {
			let clone = Component.Create(com.GetTypeName());
            if(clone != null) {
                this.AddComponentInternal(clone);
                clone.DeepCopy(com);
            }
        }
	}

    protected DeepCopy(source: VRObject) {
        super.DeepCopy(source);

        let src = <GameObject>source;

        src.m_components.ForEach((i: Component) => {
            this.CopyComponent(i);
            return true;
        });

        src.m_components_new.ForEach((i: Component) => {
            this.CopyComponent(i);
            return true;
        });

        this.m_layer = src.m_layer;
        this.m_active_in_hierarchy = src.m_active_in_hierarchy;
        this.m_active_self = src.m_active_self;
        this.m_deleted = src.m_deleted;
	}

	SetName(name: string) {
		if(this.GetName() != name) {
			super.SetName(name);

			for(let i = this.m_components.Begin(); i != this.m_components.End(); i = i.next) {
				i.value.SetName(name);
			}

			for(let i = this.m_components_new.Begin(); i != this.m_components_new.End(); i = i.next) {
				i.value.SetName(name);
			}
		}
	}

	private constructor(name: string) {
		super();
		super.SetName(name);
		this.m_layer = Layer.Default;
		this.m_components = new List<Component>();
		this.m_components_new = new List<Component>();
		this.m_active_in_hierarchy = true;
		this.m_active_self = true;
		this.m_deleted = false;
    }

    private Delete() {
        this.m_deleted = true;

		this.m_components.ForEach((i: Component) => {
			if(!i.IsDeleted()) {
				Component.Destroy(i);
			}
			return true;
		});

		this.m_components_new.ForEach((i: Component) => {
			if(!i.IsDeleted()) {
				Component.Destroy(i);
			}
			return true;
		});

        let child_count = this.m_transform.GetChildCount();
        for(let i = 0; i < child_count; i++) {
            this.m_transform.GetChild(i).GetGameObject().Delete();
        }
    }

    Start() {
		let starts = new List<Component>(this.m_components);

        do {
			starts.ForEach((i: Component) => {
                if(!this.IsActiveInHierarchy()) {
                    return false;
                }

                if(i.IsEnable() && !i.IsStarted()) {
                    i.SetStarted();
                    i.Start();
                }

                return true;
            });
			starts.Clear();

			starts.AddRangeBefore(starts.End(), this.m_components_new.Begin(), this.m_components_new.End());
            this.m_components.AddRangeBefore(this.m_components.End(), this.m_components_new.Begin(), this.m_components_new.End());
            this.m_components_new.Clear();
		} while(!starts.Empty());
    }

    Update() {
        this.m_components.ForEach((i: Component) => {
            if(!this.IsActiveInHierarchy()) {
                return false;
            }

            if(i.IsEnable()) {
                i.Update();
            }

            return true;
        });
    }

    LateUpdate() {
        this.m_components.ForEach((i: Component) => {
            if(!this.IsActiveInHierarchy()) {
                return false;
            }

            if(i.IsEnable()) {
                i.LateUpdate();
            }

            return true;
        });

        //delete component
        let it = this.m_components.Begin();
        while(it != this.m_components.End()) {
            if(it.value.IsDeleted()) {
                it = this.m_components.RemoveNode(it);
            } else {
                it = it.next;
            }
        }
    }

    private AddComponentInternal(com: Component) {
        this.m_components_new.AddLast(com);

        com.AttachTransform(this.m_transform);
        com.AttachGameObject(this.m_transform.GetGameObject());
        com.SetName(this.GetName());
        com.Awake();
	}

	SetActive(active: boolean) {
        this.m_active_self = active;

		let t = this.m_transform;
        if((this.m_active_in_hierarchy != active) &&
            (t.IsRoot() || t.GetParent().GetGameObject().IsActiveInHierarchy())) {
			this.SetActiveInHierarchy(active);

			if(!t.IsRoot()) {
				t.GetParent().NotifyParentHierarchyChange();
			}
			t.NotifyChildHierarchyChange();
        }
    }

    SetActiveInHierarchy(active: boolean) {
        if(this.m_active_in_hierarchy != active) {
            this.m_active_in_hierarchy = active;

            this.m_components.ForEach((i: Component) => {
                if(i.IsEnable()) {
                    if(this.m_active_in_hierarchy) {
                        i.OnEnable();
                    } else {
                        i.OnDisable();
                    }
                }

                return true;
            });

            let child_count = this.m_transform.GetChildCount();
            for(let i = 0; i < child_count; i++) {
                let child = this.m_transform.GetChild(i);
                if(child.GetGameObject().IsActiveSelf()) {
                    child.GetGameObject().SetActiveInHierarchy(active);
                }
            }
        }
    }

    SetLayerRecursively(layer: number) {
        this.SetLayer(layer);

        let child_count = this.m_transform.GetChildCount();
        for(let i = 0; i < child_count; i++) {
            let child = this.m_transform.GetChild(i);
            child.GetGameObject().SetLayerRecursively(layer);
        }
    }

    GetLayer(): number {
        return this.m_layer;
    }

    SetLayer(layer: number) {
        this.m_layer = layer;
    }

    OnTranformChanged() {
        this.m_components.ForEach((i: Component) => {
            i.OnTranformChanged();
            return true;
        });

        this.m_components_new.ForEach((i: Component) => {
            i.OnTranformChanged();
            return true;
        });
    }

    OnTranformHierarchyChanged() {
        this.m_components.ForEach((i: Component) => {
            i.OnTranformHierarchyChanged();
            return true;
        });

        this.m_components_new.ForEach((i: Component) => {
            i.OnTranformHierarchyChanged();
            return true;
        });
    }

    OnPostRender() {
        this.m_components.ForEach((i: Component) => {
            i.OnPostRender();
            return true;
        });

        this.m_components_new.ForEach((i: Component) => {
            i.OnPostRender();
            return true;
        });
    }

    GetTransform(): Transform {
        return this.m_transform;
    }

    IsActiveSelf(): boolean {
        return this.m_active_self;
    }

    IsActiveInHierarchy(): boolean {
        return this.m_active_in_hierarchy;
    }

	IsDeleted(): boolean {
		return this.m_deleted;
	}

	AddComponent(type: string): Component {
		if(this.m_deleted) {
			return null;
		}

		let com = Component.Create(type);
		this.AddComponentInternal(com);

		return com;
	}

	GetComponent(type: string): Component {
		let com: Component = null;

		this.m_components.ForEach((i: Component) => {
			if(i.IsInstanceOf(type) && !i.IsDeleted()) {
				com = i;
				return false;
			}
			return true;
		});

		if(com != null) {
			return com;
		}

		this.m_components_new.ForEach((i: Component) => {
			if(i.IsInstanceOf(type) && !i.IsDeleted()) {
				com = i;
				return false;
			}
			return true;
		});

		return com;
	}

	GetComponents(type: string): Component[] {
		let coms = new Array<Component>();

		this.m_components.ForEach((i: Component) => {
			if(i.IsInstanceOf(type) && !i.IsDeleted()) {
				coms.push(i);
			}
			return true;
		});

		this.m_components_new.ForEach((i: Component) => {
			if(i.IsInstanceOf(type) && !i.IsDeleted()) {
				coms.push(i);
			}
			return true;
		});

		return coms;
	}

	GetComponentsInChildren(type: string): Component[] {
		let coms = new Array<Component>();

		this.m_components.ForEach((i: Component) => {
			if(i.IsInstanceOf(type) && !i.IsDeleted()) {
				coms.push(i);
			}
			return true;
		});

		this.m_components_new.ForEach((i: Component) => {
			if(i.IsInstanceOf(type) && !i.IsDeleted()) {
				coms.push(i);
			}
			return true;
		});

		let transform = this.GetTransform();
		let child_count = transform.GetChildCount();
		for(let i = 0; i < child_count; i++) {
			let child = transform.GetChild(i);
			let child_coms = <Component[]>child.GetGameObject().GetComponentsInChildren(type);
			for(let j = 0; j < child_coms.length; j++) {
				coms.push(child_coms[j]);
			}
		}

		return coms;
	}

	GetComponentInParent(type: string): Component {
		let com: Component = null;

		let parent = this.GetTransform().GetParent();

		while(parent != null) {
			com = parent.GetGameObject().GetComponent(type);

			if(com != null) {
				break;
			} else {
				parent = parent.GetParent();
			}
		}

		return com;
	}

	toString(): string {
		let str = "GameObject {\n";

		let coms = this.GetComponents("Component");
		for(let i = 0; i < coms.length;) {
			if(coms[i] instanceof Transform) {
				coms.splice(i, 1);
			} else {
				i++;
			}
		}

		let str_coms = coms.toString();
		str_coms = str_coms.replace(new RegExp("\n", "gm"), "\n    ");

		str += "    name: " + this.GetName() + ",\n";
		str += "    components: " + str_coms + "\n";

		str += "}";

		return str;
	}

	private m_layer: number;
	private m_components: List<Component>;
	private m_components_new: List<Component>;
	private m_active_in_hierarchy: boolean;
	private m_active_self: boolean;
	private m_deleted: boolean;
	private m_transform: Transform;
}

Viry3D.GameObject = GameObject;