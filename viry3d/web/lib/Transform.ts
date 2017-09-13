import { Component } from "./Component"
import { VRObject } from "./Object"
import { VRString } from "./string/String"
import { Vector } from "./container/Vector"
import { Vector3 } from "./math/Vector3"
import { Quaternion } from "./math/Quaternion"
import { Matrix4x4 } from "./math/Matrix4x4"
import { Mathf } from "./math/Mathf"
import { Viry3D } from "./Viry3D"

export class Transform extends Component {
	static ClassName(): string {
        return "Transform";
    }

	GetTypeName(): string {
        return Transform.ClassName();
	}

	static RegisterComponent() {
		Transform.m_class_names = Component.m_class_names.slice(0);
		Transform.m_class_names.push("Transform");

        Component.Register(Transform.ClassName(), () => {
			return new Transform();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return Transform.m_class_names;
	}

	private constructor() {
        super();

        this.m_parent = null;
        this.m_children = new Vector<Transform>();
        this.m_local_position = Vector3.Zero();
        this.m_local_rotation = Quaternion.Identity();
        this.m_local_scale = Vector3.One();
        this.m_changed = true;
        this.m_position = Vector3.Zero();
        this.m_rotation = Quaternion.Identity();
        this.m_scale = Vector3.One();
        this.m_local_to_world_matrix = Matrix4x4.Identity();
        this.m_world_to_local_matrix = Matrix4x4.Identity();
        this.m_change_notifying = false;
    }

    DeepCopy(source: VRObject) {
        super.DeepCopy(source);

		let src = <Transform>source;

		this.m_changed = true;
		this.m_position.Set(src.GetPosition());
		this.m_rotation.Set(src.GetRotation());
		this.m_scale.Set(src.GetScale());
		this.SetLocalPosition(this.m_position);
		this.SetLocalRotation(this.m_rotation);
		this.SetLocalScale(this.m_scale);

		for(let i = 0; i < src.m_children.Size(); i++) {
			let src_child = src.m_children.Get(i);
			let child = (<any>Viry3D.GameObject).Instantiate(src_child.GetGameObject());

			child.GetTransform().SetParent(this);
		}
    }

	RemoveChild(child: Transform) {
		for(let i = 0; i < this.m_children.Size(); i++) {
			if(this.m_children.Get(i) == child) {
				this.m_children.Remove(i);
				break;
			}
		}
	}

	AddChild(child: Transform) {
		this.m_children.Add(child);
	}

	PathInParent(parent: Transform): string {
		let path = this.GetName();

		let t = this.GetParent();
		while(t != null && t != parent) {
			path = t.GetName() + "/" + path;
			t = t.GetParent();
		}

		if(t == null) {
			path = "";
		}

		return path;
	}

    SetParent(parent: Transform) {
		let obj = this.GetGameObject();

		this.ApplyChange();

		if(this.m_parent != null) {
			let p = this.m_parent;
			p.RemoveChild(this.m_transform);
			p.NotifyParentHierarchyChange();
			this.m_parent = null;

			//	become root
			if(parent == null) {
				this.m_local_position.Set(this.m_position);
				this.m_local_rotation.Set(this.m_rotation);
				this.m_local_scale.Set(this.m_scale);
				this.Changed();
				this.NotifyChildHierarchyChange();

				obj.SetActiveInHierarchy(obj.IsActiveSelf());
			}
		}

		this.m_parent = parent;

		if(this.m_parent != null) {
			let p = this.m_parent;
			p.AddChild(this.m_transform);
			p.NotifyParentHierarchyChange();

			//become child
			{
				this.m_local_position.Set(p.InverseTransformPoint(this.m_position));
				this.m_local_rotation.Set(Quaternion.Inverse(p.GetRotation()).Multiply(this.m_rotation));
				let parent_scale = p.GetScale();
				let x = this.m_scale.x / parent_scale.x;
				let y = this.m_scale.y / parent_scale.y;
				let z = this.m_scale.z / parent_scale.z;
				this.m_local_scale.Set(new Vector3(x, y, z));
				this.Changed();
				this.NotifyChildHierarchyChange();

				obj.SetActiveInHierarchy(p.GetGameObject().IsActiveInHierarchy() && obj.IsActiveSelf());
			}
		}
    }

    GetChildCount(): number {
        return this.m_children.Size();
    }

    GetChild(index: number): Transform {
        return this.m_children.Get(index);
    }

	Find(path: string): Transform {
		let find: Transform = null;

		let path_str = new VRString(path);
		let names = path_str.Split("/");

		this.m_children.ForEach((i: Transform) => {
			let child = i;
			let name = names.Get(0);

			if(child.GetName() == name.toString()) {
				if(names.Size() > 1) {
					find = child.Find(path_str.Substring(name.Size() + 1).toString());
				} else {
					find = child;
				}

				return false;
			}

			return true;
		});

		return find;
	}

	NotifyChange() {
		this.m_change_notifying = true;

		this.GetGameObject().OnTranformChanged();

		this.m_children.ForEach((i: Transform) => {
			i.NotifyChange();
			return true;
		});

		this.m_change_notifying = false;
	}

	NotifyParentHierarchyChange() {
		this.m_change_notifying = true;

		this.GetGameObject().OnTranformHierarchyChanged();

		let p = this.m_parent;
		while(p != null) {
			p.NotifyParentHierarchyChange();
			p = p.GetParent();
		}

		this.m_change_notifying = false;
	}

	NotifyChildHierarchyChange() {
		this.m_change_notifying = true;

		this.GetGameObject().OnTranformHierarchyChanged();

		this.m_children.ForEach((i: Transform) => {
			i.NotifyChildHierarchyChange();
			return true;
		});

		this.m_change_notifying = false;
	}

	SetLocalPosition(pos: Vector3) {
		if(!this.m_local_position.Equals(pos)) {
			this.m_local_position.Set(pos);
			this.Changed();
			this.NotifyChange();
		}
	}

	GetLocalPosition(): Vector3 {
		return new Vector3().Set(this.m_local_position);
	}

	SetLocalRotationEuler(euler: Vector3) {
		this.SetLocalRotation(Quaternion.Euler(euler.x, euler.y, euler.z));
	}

	SetLocalRotation(rot: Quaternion) {
		let r = new Quaternion();
		r.Set(rot);
		r.Normalize();

		if(!this.m_local_rotation.Equals(r)) {
			this.m_local_rotation.Set(r);
			this.Changed();
			this.NotifyChange();
		}
	}

	GetLocalRotation(): Quaternion {
		return new Quaternion().Set(this.m_local_rotation);
	}

	SetLocalScale(sca: Vector3) {
		if(!this.m_local_scale.Equals(sca)) {
			this.m_local_scale.Set(sca);
			this.Changed();
			this.NotifyChange();
		}
	}

	GetLocalScale(): Vector3 {
		return new Vector3().Set(this.m_local_scale);
	}

	SetPosition(pos: Vector3) {
		if(!this.m_changed && this.m_position.Equals(pos)) {
			return;
		}

		if(this.IsRoot()) {
			this.SetLocalPosition(pos);
		} else {
			let local = this.m_parent.InverseTransformPoint(pos);
			this.SetLocalPosition(local);
		}
	}

	GetPosition(): Vector3 {
		this.ApplyChange();

		return new Vector3().Set(this.m_position);
	}

	SetRotationEuler(euler: Vector3) {
		this.SetRotation(Quaternion.Euler(euler.x, euler.y, euler.z));
	}

	SetRotation(rot: Quaternion) {
		if(!this.m_changed && this.m_rotation.Equals(rot)) {
			return;
		}

		if(this.IsRoot()) {
			this.SetLocalRotation(rot);
		} else {
			let local = Quaternion.Inverse(this.m_parent.GetRotation()).Multiply(rot);
			this.SetLocalRotation(local);
		}
	}

	GetRotation(): Quaternion {
		this.ApplyChange();

		return new Quaternion().Set(this.m_rotation);
	}

	SetScale(sca: Vector3) {
		if(!this.m_changed && this.m_scale.Equals(sca)) {
			return;
		}

		if(this.IsRoot()) {
			this.SetLocalScale(sca);
		} else {
			let parent_scale = this.m_parent.GetScale();
			let x = sca.x / parent_scale.x;
			let y = sca.y / parent_scale.y;
			let z = sca.z / parent_scale.z;
			this.SetLocalScale(new Vector3(x, y, z));
		}
	}

	GetScale(): Vector3 {
		this.ApplyChange();

		return new Vector3().Set(this.m_scale);
	}

	SetLocalPositionDirect(v: Vector3) {
		this.m_local_position.Set(v);
	}

	SetLocalRotationDirect(v: Quaternion) {
		this.m_local_rotation.Set(v);
	}

	SetLocalScaleDirect(v: Vector3) {
		this.m_local_scale.Set(v);
	}

	Changed() {
		this.m_changed = true;
		this.m_children.ForEach((i: Transform) => {
			i.Changed();
			return true;
		});
	}

	ApplyChange() {
		if(this.m_changed) {
			this.m_changed = false;

			if(this.IsRoot()) {
				this.m_position.Set(this.m_local_position);
				this.m_rotation.Set(this.m_local_rotation);
				this.m_scale.Set(this.m_local_scale);
			} else {
				let parent = this.m_parent;

				this.m_position = parent.TransformPoint(this.m_local_position);
				this.m_rotation = parent.GetRotation().Multiply(this.m_local_rotation);

				let ps = parent.GetScale();
				let x = this.m_local_scale.x * ps.x;
				let y = this.m_local_scale.y * ps.y;
				let z = this.m_local_scale.z * ps.z;
				this.m_scale.Set(new Vector3(x, y, z));
			}

			this.m_local_to_world_matrix = Matrix4x4.TRS(this.m_position, this.m_rotation, this.m_scale);
		}
	}

	TransformPoint(point: Vector3): Vector3 {
		return this.GetLocalToWorldMatrix().MultiplyPoint3x4(point);
	}

	TransformDirection(dir: Vector3): Vector3 {
		return this.GetLocalToWorldMatrix().MultiplyDirection(dir);
	}

	InverseTransformPoint(point: Vector3): Vector3 {
		return this.GetWorldToLocalMatrix().MultiplyPoint3x4(point);
	}

	InverseTransformDirection(dir: Vector3): Vector3 {
		return this.GetWorldToLocalMatrix().MultiplyDirection(dir);
	}

	GetLocalToWorldMatrix(): Matrix4x4 {
		this.ApplyChange();

		return new Matrix4x4().Set(this.m_local_to_world_matrix);
	}

	GetWorldToLocalMatrix(): Matrix4x4 {
		this.m_world_to_local_matrix.Set(this.GetLocalToWorldMatrix().Inverse());

		return new Matrix4x4().Set(this.m_world_to_local_matrix);
	}

	GetRight(): Vector3 {
		return this.GetRotation().MultiplyDirection(new Vector3(1, 0, 0));
	}

	GetUp(): Vector3 {
		return this.GetRotation().MultiplyDirection(new Vector3(0, 1, 0));
	}

	GetForward(): Vector3 {
		return this.GetRotation().MultiplyDirection(new Vector3(0, 0, 1));
	}

	SetForward(forward: Vector3) {
		let origin = new Vector3(0, 0, 1);
		let fn = Vector3.Normalize(forward);

		if(fn != origin) {
			if(!Mathf.FloatEquals(fn.SqrMagnitude(), 0)) {
				let deg = Vector3.Angle(origin, fn);
				let axis = origin.Cross(fn);

				if(axis.Equals(Vector3.Zero())) {
					this.SetRotation(Quaternion.AngleAxis(deg, this.GetUp()));
				} else {
					this.SetRotation(Quaternion.AngleAxis(deg, axis));
				}
			}
		} else {
			this.SetRotation(Quaternion.Identity());
		}
	}

	IsRoot(): boolean {
		return this.m_parent == null;
	}

	GetParent(): Transform {
		return this.m_parent;
	}

	toString(): string {
		let str = "Transform {\n";

		let str_obj = this.m_gameobject.toString();
		str_obj = str_obj.replace(new RegExp("\n", "gm"), "\n    ");

		let parent = "null"
		if(this.m_parent != null) {
			parent = this.m_parent.GetName().toString();
		}

		let str_children = this.m_children.toString();
		str_children = str_children.replace(new RegExp("\n", "gm"), "\n    ");

		str += "    gameobject: " + str_obj + ",\n";
		str += "    parent: " + parent + ",\n";
		str += "    children: " + str_children + "\n";

		str += "}";

		return str;
	}

    private m_parent: Transform;
    private m_children: Vector<Transform>;
    private m_local_position: Vector3;
    private m_local_rotation: Quaternion;
    private m_local_scale: Vector3;
    private m_changed: boolean;
    private m_position: Vector3;
    private m_rotation: Quaternion;
    private m_scale: Vector3;
    private m_local_to_world_matrix: Matrix4x4;
    private m_world_to_local_matrix: Matrix4x4;
    private m_change_notifying: boolean;
}