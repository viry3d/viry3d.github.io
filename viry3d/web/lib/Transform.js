var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Component", "./string/String", "./container/Vector", "./math/Vector3", "./math/Quaternion", "./math/Matrix4x4", "./math/Mathf", "./Viry3D"], function (require, exports, Component_1, String_1, Vector_1, Vector3_1, Quaternion_1, Matrix4x4_1, Mathf_1, Viry3D_1) {
    "use strict";
    var Transform = (function (_super) {
        __extends(Transform, _super);
        function Transform() {
            _super.call(this);
            this.m_parent = null;
            this.m_children = new Vector_1.Vector();
            this.m_local_position = Vector3_1.Vector3.Zero();
            this.m_local_rotation = Quaternion_1.Quaternion.Identity();
            this.m_local_scale = Vector3_1.Vector3.One();
            this.m_changed = true;
            this.m_position = Vector3_1.Vector3.Zero();
            this.m_rotation = Quaternion_1.Quaternion.Identity();
            this.m_scale = Vector3_1.Vector3.One();
            this.m_local_to_world_matrix = Matrix4x4_1.Matrix4x4.Identity();
            this.m_world_to_local_matrix = Matrix4x4_1.Matrix4x4.Identity();
            this.m_change_notifying = false;
        }
        Transform.ClassName = function () {
            return "Transform";
        };
        Transform.prototype.GetTypeName = function () {
            return Transform.ClassName();
        };
        Transform.RegisterComponent = function () {
            Transform.m_class_names = Component_1.Component.m_class_names.slice(0);
            Transform.m_class_names.push("Transform");
            Component_1.Component.Register(Transform.ClassName(), function () {
                return new Transform();
            });
        };
        Transform.prototype.GetClassNames = function () {
            return Transform.m_class_names;
        };
        Transform.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.m_changed = true;
            this.m_position.Set(src.GetPosition());
            this.m_rotation.Set(src.GetRotation());
            this.m_scale.Set(src.GetScale());
            this.SetLocalPosition(this.m_position);
            this.SetLocalRotation(this.m_rotation);
            this.SetLocalScale(this.m_scale);
            for (var i = 0; i < src.m_children.Size(); i++) {
                var src_child = src.m_children.Get(i);
                var child = Viry3D_1.Viry3D.GameObject.Instantiate(src_child.GetGameObject());
                child.GetTransform().SetParent(this);
            }
        };
        Transform.prototype.RemoveChild = function (child) {
            for (var i = 0; i < this.m_children.Size(); i++) {
                if (this.m_children.Get(i) == child) {
                    this.m_children.Remove(i);
                    break;
                }
            }
        };
        Transform.prototype.AddChild = function (child) {
            this.m_children.Add(child);
        };
        Transform.prototype.PathInParent = function (parent) {
            var path = this.GetName();
            var t = this.GetParent();
            while (t != null && t != parent) {
                path = t.GetName() + "/" + path;
                t = t.GetParent();
            }
            if (t == null) {
                path = "";
            }
            return path;
        };
        Transform.prototype.SetParent = function (parent) {
            var obj = this.GetGameObject();
            this.ApplyChange();
            if (this.m_parent != null) {
                var p = this.m_parent;
                p.RemoveChild(this.m_transform);
                p.NotifyParentHierarchyChange();
                this.m_parent = null;
                //	become root
                if (parent == null) {
                    this.m_local_position.Set(this.m_position);
                    this.m_local_rotation.Set(this.m_rotation);
                    this.m_local_scale.Set(this.m_scale);
                    this.Changed();
                    this.NotifyChildHierarchyChange();
                    obj.SetActiveInHierarchy(obj.IsActiveSelf());
                }
            }
            this.m_parent = parent;
            if (this.m_parent != null) {
                var p = this.m_parent;
                p.AddChild(this.m_transform);
                p.NotifyParentHierarchyChange();
                //become child
                {
                    this.m_local_position.Set(p.InverseTransformPoint(this.m_position));
                    this.m_local_rotation.Set(Quaternion_1.Quaternion.Inverse(p.GetRotation()).Multiply(this.m_rotation));
                    var parent_scale = p.GetScale();
                    var x = this.m_scale.x / parent_scale.x;
                    var y = this.m_scale.y / parent_scale.y;
                    var z = this.m_scale.z / parent_scale.z;
                    this.m_local_scale.Set(new Vector3_1.Vector3(x, y, z));
                    this.Changed();
                    this.NotifyChildHierarchyChange();
                    obj.SetActiveInHierarchy(p.GetGameObject().IsActiveInHierarchy() && obj.IsActiveSelf());
                }
            }
        };
        Transform.prototype.GetChildCount = function () {
            return this.m_children.Size();
        };
        Transform.prototype.GetChild = function (index) {
            return this.m_children.Get(index);
        };
        Transform.prototype.Find = function (path) {
            var find = null;
            var path_str = new String_1.VRString(path);
            var names = path_str.Split("/");
            this.m_children.ForEach(function (i) {
                var child = i;
                var name = names.Get(0);
                if (child.GetName() == name.toString()) {
                    if (names.Size() > 1) {
                        find = child.Find(path_str.Substring(name.Size() + 1).toString());
                    }
                    else {
                        find = child;
                    }
                    return false;
                }
                return true;
            });
            return find;
        };
        Transform.prototype.NotifyChange = function () {
            this.m_change_notifying = true;
            this.GetGameObject().OnTranformChanged();
            this.m_children.ForEach(function (i) {
                i.NotifyChange();
                return true;
            });
            this.m_change_notifying = false;
        };
        Transform.prototype.NotifyParentHierarchyChange = function () {
            this.m_change_notifying = true;
            this.GetGameObject().OnTranformHierarchyChanged();
            var p = this.m_parent;
            while (p != null) {
                p.NotifyParentHierarchyChange();
                p = p.GetParent();
            }
            this.m_change_notifying = false;
        };
        Transform.prototype.NotifyChildHierarchyChange = function () {
            this.m_change_notifying = true;
            this.GetGameObject().OnTranformHierarchyChanged();
            this.m_children.ForEach(function (i) {
                i.NotifyChildHierarchyChange();
                return true;
            });
            this.m_change_notifying = false;
        };
        Transform.prototype.SetLocalPosition = function (pos) {
            if (!this.m_local_position.Equals(pos)) {
                this.m_local_position.Set(pos);
                this.Changed();
                this.NotifyChange();
            }
        };
        Transform.prototype.GetLocalPosition = function () {
            return new Vector3_1.Vector3().Set(this.m_local_position);
        };
        Transform.prototype.SetLocalRotationEuler = function (euler) {
            this.SetLocalRotation(Quaternion_1.Quaternion.Euler(euler.x, euler.y, euler.z));
        };
        Transform.prototype.SetLocalRotation = function (rot) {
            var r = new Quaternion_1.Quaternion();
            r.Set(rot);
            r.Normalize();
            if (!this.m_local_rotation.Equals(r)) {
                this.m_local_rotation.Set(r);
                this.Changed();
                this.NotifyChange();
            }
        };
        Transform.prototype.GetLocalRotation = function () {
            return new Quaternion_1.Quaternion().Set(this.m_local_rotation);
        };
        Transform.prototype.SetLocalScale = function (sca) {
            if (!this.m_local_scale.Equals(sca)) {
                this.m_local_scale.Set(sca);
                this.Changed();
                this.NotifyChange();
            }
        };
        Transform.prototype.GetLocalScale = function () {
            return new Vector3_1.Vector3().Set(this.m_local_scale);
        };
        Transform.prototype.SetPosition = function (pos) {
            if (!this.m_changed && this.m_position.Equals(pos)) {
                return;
            }
            if (this.IsRoot()) {
                this.SetLocalPosition(pos);
            }
            else {
                var local = this.m_parent.InverseTransformPoint(pos);
                this.SetLocalPosition(local);
            }
        };
        Transform.prototype.GetPosition = function () {
            this.ApplyChange();
            return new Vector3_1.Vector3().Set(this.m_position);
        };
        Transform.prototype.SetRotationEuler = function (euler) {
            this.SetRotation(Quaternion_1.Quaternion.Euler(euler.x, euler.y, euler.z));
        };
        Transform.prototype.SetRotation = function (rot) {
            if (!this.m_changed && this.m_rotation.Equals(rot)) {
                return;
            }
            if (this.IsRoot()) {
                this.SetLocalRotation(rot);
            }
            else {
                var local = Quaternion_1.Quaternion.Inverse(this.m_parent.GetRotation()).Multiply(rot);
                this.SetLocalRotation(local);
            }
        };
        Transform.prototype.GetRotation = function () {
            this.ApplyChange();
            return new Quaternion_1.Quaternion().Set(this.m_rotation);
        };
        Transform.prototype.SetScale = function (sca) {
            if (!this.m_changed && this.m_scale.Equals(sca)) {
                return;
            }
            if (this.IsRoot()) {
                this.SetLocalScale(sca);
            }
            else {
                var parent_scale = this.m_parent.GetScale();
                var x = sca.x / parent_scale.x;
                var y = sca.y / parent_scale.y;
                var z = sca.z / parent_scale.z;
                this.SetLocalScale(new Vector3_1.Vector3(x, y, z));
            }
        };
        Transform.prototype.GetScale = function () {
            this.ApplyChange();
            return new Vector3_1.Vector3().Set(this.m_scale);
        };
        Transform.prototype.SetLocalPositionDirect = function (v) {
            this.m_local_position.Set(v);
        };
        Transform.prototype.SetLocalRotationDirect = function (v) {
            this.m_local_rotation.Set(v);
        };
        Transform.prototype.SetLocalScaleDirect = function (v) {
            this.m_local_scale.Set(v);
        };
        Transform.prototype.Changed = function () {
            this.m_changed = true;
            this.m_children.ForEach(function (i) {
                i.Changed();
                return true;
            });
        };
        Transform.prototype.ApplyChange = function () {
            if (this.m_changed) {
                this.m_changed = false;
                if (this.IsRoot()) {
                    this.m_position.Set(this.m_local_position);
                    this.m_rotation.Set(this.m_local_rotation);
                    this.m_scale.Set(this.m_local_scale);
                }
                else {
                    var parent_1 = this.m_parent;
                    this.m_position = parent_1.TransformPoint(this.m_local_position);
                    this.m_rotation = parent_1.GetRotation().Multiply(this.m_local_rotation);
                    var ps = parent_1.GetScale();
                    var x = this.m_local_scale.x * ps.x;
                    var y = this.m_local_scale.y * ps.y;
                    var z = this.m_local_scale.z * ps.z;
                    this.m_scale.Set(new Vector3_1.Vector3(x, y, z));
                }
                this.m_local_to_world_matrix = Matrix4x4_1.Matrix4x4.TRS(this.m_position, this.m_rotation, this.m_scale);
            }
        };
        Transform.prototype.TransformPoint = function (point) {
            return this.GetLocalToWorldMatrix().MultiplyPoint3x4(point);
        };
        Transform.prototype.TransformDirection = function (dir) {
            return this.GetLocalToWorldMatrix().MultiplyDirection(dir);
        };
        Transform.prototype.InverseTransformPoint = function (point) {
            return this.GetWorldToLocalMatrix().MultiplyPoint3x4(point);
        };
        Transform.prototype.InverseTransformDirection = function (dir) {
            return this.GetWorldToLocalMatrix().MultiplyDirection(dir);
        };
        Transform.prototype.GetLocalToWorldMatrix = function () {
            this.ApplyChange();
            return new Matrix4x4_1.Matrix4x4().Set(this.m_local_to_world_matrix);
        };
        Transform.prototype.GetWorldToLocalMatrix = function () {
            this.m_world_to_local_matrix.Set(this.GetLocalToWorldMatrix().Inverse());
            return new Matrix4x4_1.Matrix4x4().Set(this.m_world_to_local_matrix);
        };
        Transform.prototype.GetRight = function () {
            return this.GetRotation().MultiplyDirection(new Vector3_1.Vector3(1, 0, 0));
        };
        Transform.prototype.GetUp = function () {
            return this.GetRotation().MultiplyDirection(new Vector3_1.Vector3(0, 1, 0));
        };
        Transform.prototype.GetForward = function () {
            return this.GetRotation().MultiplyDirection(new Vector3_1.Vector3(0, 0, 1));
        };
        Transform.prototype.SetForward = function (forward) {
            var origin = new Vector3_1.Vector3(0, 0, 1);
            var fn = Vector3_1.Vector3.Normalize(forward);
            if (fn != origin) {
                if (!Mathf_1.Mathf.FloatEquals(fn.SqrMagnitude(), 0)) {
                    var deg = Vector3_1.Vector3.Angle(origin, fn);
                    var axis = origin.Cross(fn);
                    if (axis.Equals(Vector3_1.Vector3.Zero())) {
                        this.SetRotation(Quaternion_1.Quaternion.AngleAxis(deg, this.GetUp()));
                    }
                    else {
                        this.SetRotation(Quaternion_1.Quaternion.AngleAxis(deg, axis));
                    }
                }
            }
            else {
                this.SetRotation(Quaternion_1.Quaternion.Identity());
            }
        };
        Transform.prototype.IsRoot = function () {
            return this.m_parent == null;
        };
        Transform.prototype.GetParent = function () {
            return this.m_parent;
        };
        Transform.prototype.toString = function () {
            var str = "Transform {\n";
            var str_obj = this.m_gameobject.toString();
            str_obj = str_obj.replace(new RegExp("\n", "gm"), "\n    ");
            var parent = "null";
            if (this.m_parent != null) {
                parent = this.m_parent.GetName().toString();
            }
            var str_children = this.m_children.toString();
            str_children = str_children.replace(new RegExp("\n", "gm"), "\n    ");
            str += "    gameobject: " + str_obj + ",\n";
            str += "    parent: " + parent + ",\n";
            str += "    children: " + str_children + "\n";
            str += "}";
            return str;
        };
        return Transform;
    }(Component_1.Component));
    exports.Transform = Transform;
});
//# sourceMappingURL=Transform.js.map