var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Object", "./container/List", "./Viry3D", "./Transform", "./Component", "./Layer", "./World"], function (require, exports, Object_1, List_1, Viry3D_1, Transform_1, Component_1, Layer_1, World_1) {
    "use strict";
    var GameObject = (function (_super) {
        __extends(GameObject, _super);
        function GameObject(name) {
            _super.call(this);
            _super.prototype.SetName.call(this, name);
            this.m_layer = Layer_1.Layer.Default;
            this.m_components = new List_1.List();
            this.m_components_new = new List_1.List();
            this.m_active_in_hierarchy = true;
            this.m_active_self = true;
            this.m_deleted = false;
        }
        GameObject.Create = function (name) {
            var obj = new GameObject(name);
            World_1.World.AddGameObject(obj);
            var transform = Component_1.Component.Create(Transform_1.Transform.ClassName());
            transform.AttachGameObject(obj);
            obj.m_transform = transform;
            obj.AddComponentInternal(transform);
            return obj;
        };
        GameObject.Destroy = function (obj) {
            if (!obj.IsDeleted()) {
                obj.SetActive(false);
                obj.Delete();
            }
        };
        GameObject.Instantiate = function (source) {
            var clone = GameObject.Create(source.GetName());
            clone.DeepCopy(source);
            return clone;
        };
        GameObject.prototype.CopyComponent = function (com) {
            if (com instanceof Transform_1.Transform) {
                this.m_transform.DeepCopy(com);
            }
            else {
                var clone = Component_1.Component.Create(com.GetTypeName());
                if (clone != null) {
                    this.AddComponentInternal(clone);
                    clone.DeepCopy(com);
                }
            }
        };
        GameObject.prototype.DeepCopy = function (source) {
            var _this = this;
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            src.m_components.ForEach(function (i) {
                _this.CopyComponent(i);
                return true;
            });
            src.m_components_new.ForEach(function (i) {
                _this.CopyComponent(i);
                return true;
            });
            this.m_layer = src.m_layer;
            this.m_active_in_hierarchy = src.m_active_in_hierarchy;
            this.m_active_self = src.m_active_self;
            this.m_deleted = src.m_deleted;
        };
        GameObject.prototype.SetName = function (name) {
            if (this.GetName() != name) {
                _super.prototype.SetName.call(this, name);
                for (var i = this.m_components.Begin(); i != this.m_components.End(); i = i.next) {
                    i.value.SetName(name);
                }
                for (var i = this.m_components_new.Begin(); i != this.m_components_new.End(); i = i.next) {
                    i.value.SetName(name);
                }
            }
        };
        GameObject.prototype.Delete = function () {
            this.m_deleted = true;
            this.m_components.ForEach(function (i) {
                if (!i.IsDeleted()) {
                    Component_1.Component.Destroy(i);
                }
                return true;
            });
            this.m_components_new.ForEach(function (i) {
                if (!i.IsDeleted()) {
                    Component_1.Component.Destroy(i);
                }
                return true;
            });
            var child_count = this.m_transform.GetChildCount();
            for (var i = 0; i < child_count; i++) {
                this.m_transform.GetChild(i).GetGameObject().Delete();
            }
        };
        GameObject.prototype.Start = function () {
            var _this = this;
            var starts = new List_1.List(this.m_components);
            do {
                starts.ForEach(function (i) {
                    if (!_this.IsActiveInHierarchy()) {
                        return false;
                    }
                    if (i.IsEnable() && !i.IsStarted()) {
                        i.SetStarted();
                        i.Start();
                    }
                    return true;
                });
                starts.Clear();
                starts.AddRangeBefore(starts.End(), this.m_components_new.Begin(), this.m_components_new.End());
                this.m_components.AddRangeBefore(this.m_components.End(), this.m_components_new.Begin(), this.m_components_new.End());
                this.m_components_new.Clear();
            } while (!starts.Empty());
        };
        GameObject.prototype.Update = function () {
            var _this = this;
            this.m_components.ForEach(function (i) {
                if (!_this.IsActiveInHierarchy()) {
                    return false;
                }
                if (i.IsEnable()) {
                    i.Update();
                }
                return true;
            });
        };
        GameObject.prototype.LateUpdate = function () {
            var _this = this;
            this.m_components.ForEach(function (i) {
                if (!_this.IsActiveInHierarchy()) {
                    return false;
                }
                if (i.IsEnable()) {
                    i.LateUpdate();
                }
                return true;
            });
            //delete component
            var it = this.m_components.Begin();
            while (it != this.m_components.End()) {
                if (it.value.IsDeleted()) {
                    it = this.m_components.RemoveNode(it);
                }
                else {
                    it = it.next;
                }
            }
        };
        GameObject.prototype.AddComponentInternal = function (com) {
            this.m_components_new.AddLast(com);
            com.AttachTransform(this.m_transform);
            com.AttachGameObject(this.m_transform.GetGameObject());
            com.SetName(this.GetName());
            com.Awake();
        };
        GameObject.prototype.SetActive = function (active) {
            this.m_active_self = active;
            var t = this.m_transform;
            if ((this.m_active_in_hierarchy != active) &&
                (t.IsRoot() || t.GetParent().GetGameObject().IsActiveInHierarchy())) {
                this.SetActiveInHierarchy(active);
                if (!t.IsRoot()) {
                    t.GetParent().NotifyParentHierarchyChange();
                }
                t.NotifyChildHierarchyChange();
            }
        };
        GameObject.prototype.SetActiveInHierarchy = function (active) {
            var _this = this;
            if (this.m_active_in_hierarchy != active) {
                this.m_active_in_hierarchy = active;
                this.m_components.ForEach(function (i) {
                    if (i.IsEnable()) {
                        if (_this.m_active_in_hierarchy) {
                            i.OnEnable();
                        }
                        else {
                            i.OnDisable();
                        }
                    }
                    return true;
                });
                var child_count = this.m_transform.GetChildCount();
                for (var i = 0; i < child_count; i++) {
                    var child = this.m_transform.GetChild(i);
                    if (child.GetGameObject().IsActiveSelf()) {
                        child.GetGameObject().SetActiveInHierarchy(active);
                    }
                }
            }
        };
        GameObject.prototype.SetLayerRecursively = function (layer) {
            this.SetLayer(layer);
            var child_count = this.m_transform.GetChildCount();
            for (var i = 0; i < child_count; i++) {
                var child = this.m_transform.GetChild(i);
                child.GetGameObject().SetLayerRecursively(layer);
            }
        };
        GameObject.prototype.GetLayer = function () {
            return this.m_layer;
        };
        GameObject.prototype.SetLayer = function (layer) {
            this.m_layer = layer;
        };
        GameObject.prototype.OnTranformChanged = function () {
            this.m_components.ForEach(function (i) {
                i.OnTranformChanged();
                return true;
            });
            this.m_components_new.ForEach(function (i) {
                i.OnTranformChanged();
                return true;
            });
        };
        GameObject.prototype.OnTranformHierarchyChanged = function () {
            this.m_components.ForEach(function (i) {
                i.OnTranformHierarchyChanged();
                return true;
            });
            this.m_components_new.ForEach(function (i) {
                i.OnTranformHierarchyChanged();
                return true;
            });
        };
        GameObject.prototype.OnPostRender = function () {
            this.m_components.ForEach(function (i) {
                i.OnPostRender();
                return true;
            });
            this.m_components_new.ForEach(function (i) {
                i.OnPostRender();
                return true;
            });
        };
        GameObject.prototype.GetTransform = function () {
            return this.m_transform;
        };
        GameObject.prototype.IsActiveSelf = function () {
            return this.m_active_self;
        };
        GameObject.prototype.IsActiveInHierarchy = function () {
            return this.m_active_in_hierarchy;
        };
        GameObject.prototype.IsDeleted = function () {
            return this.m_deleted;
        };
        GameObject.prototype.AddComponent = function (type) {
            if (this.m_deleted) {
                return null;
            }
            var com = Component_1.Component.Create(type);
            this.AddComponentInternal(com);
            return com;
        };
        GameObject.prototype.GetComponent = function (type) {
            var com = null;
            this.m_components.ForEach(function (i) {
                if (i.IsInstanceOf(type) && !i.IsDeleted()) {
                    com = i;
                    return false;
                }
                return true;
            });
            if (com != null) {
                return com;
            }
            this.m_components_new.ForEach(function (i) {
                if (i.IsInstanceOf(type) && !i.IsDeleted()) {
                    com = i;
                    return false;
                }
                return true;
            });
            return com;
        };
        GameObject.prototype.GetComponents = function (type) {
            var coms = new Array();
            this.m_components.ForEach(function (i) {
                if (i.IsInstanceOf(type) && !i.IsDeleted()) {
                    coms.push(i);
                }
                return true;
            });
            this.m_components_new.ForEach(function (i) {
                if (i.IsInstanceOf(type) && !i.IsDeleted()) {
                    coms.push(i);
                }
                return true;
            });
            return coms;
        };
        GameObject.prototype.GetComponentsInChildren = function (type) {
            var coms = new Array();
            this.m_components.ForEach(function (i) {
                if (i.IsInstanceOf(type) && !i.IsDeleted()) {
                    coms.push(i);
                }
                return true;
            });
            this.m_components_new.ForEach(function (i) {
                if (i.IsInstanceOf(type) && !i.IsDeleted()) {
                    coms.push(i);
                }
                return true;
            });
            var transform = this.GetTransform();
            var child_count = transform.GetChildCount();
            for (var i = 0; i < child_count; i++) {
                var child = transform.GetChild(i);
                var child_coms = child.GetGameObject().GetComponentsInChildren(type);
                for (var j = 0; j < child_coms.length; j++) {
                    coms.push(child_coms[j]);
                }
            }
            return coms;
        };
        GameObject.prototype.GetComponentInParent = function (type) {
            var com = null;
            var parent = this.GetTransform().GetParent();
            while (parent != null) {
                com = parent.GetGameObject().GetComponent(type);
                if (com != null) {
                    break;
                }
                else {
                    parent = parent.GetParent();
                }
            }
            return com;
        };
        GameObject.prototype.toString = function () {
            var str = "GameObject {\n";
            var coms = this.GetComponents("Component");
            for (var i = 0; i < coms.length;) {
                if (coms[i] instanceof Transform_1.Transform) {
                    coms.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            var str_coms = coms.toString();
            str_coms = str_coms.replace(new RegExp("\n", "gm"), "\n    ");
            str += "    name: " + this.GetName() + ",\n";
            str += "    components: " + str_coms + "\n";
            str += "}";
            return str;
        };
        return GameObject;
    }(Object_1.VRObject));
    exports.GameObject = GameObject;
    Viry3D_1.Viry3D.GameObject = GameObject;
});
//# sourceMappingURL=GameObject.js.map