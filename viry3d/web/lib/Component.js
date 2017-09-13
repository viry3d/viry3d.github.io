var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Object", "./container/Map"], function (require, exports, Object_1, Map_1) {
    "use strict";
    var Component = (function (_super) {
        __extends(Component, _super);
        function Component() {
            _super.call(this);
            this.m_deleted = false;
            this.m_started = false;
            this.m_enable = true;
        }
        Component.ClassName = function () {
            return "Component";
        };
        Component.prototype.GetTypeName = function () {
            return Component.ClassName();
        };
        Component.prototype.GetClassNames = function () {
            return Component.m_class_names;
        };
        Component.prototype.IsInstanceOf = function (name) {
            var names = this.GetClassNames();
            for (var i = 0; i < names.length; i++) {
                if (names[i] == name) {
                    return true;
                }
            }
            return false;
        };
        Component.Create = function (class_name) {
            var ptr = [null];
            if (Component.m_class_map.TryGet(class_name, ptr)) {
                return ptr[0]();
            }
            console.error("can not find component type " + class_name);
            return null;
        };
        Component.Destroy = function (com) {
            com.Delete();
        };
        Component.Register = function (class_name, class_gen) {
            console.log("Component.Register: " + class_name);
            Component.m_class_map.Add(class_name, class_gen);
        };
        Component.prototype.Delete = function () {
            if (!this.m_deleted) {
                this.m_deleted = true;
                this.Enable(false);
                this.OnDestroy();
            }
        };
        Component.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.m_deleted = src.m_deleted;
            this.m_started = false;
            this.m_enable = src.m_enable;
        };
        Component.prototype.SetName = function (name) {
            if (this.GetName() != name) {
                _super.prototype.SetName.call(this, name);
                this.GetGameObject().SetName(name);
            }
        };
        Component.prototype.Enable = function (enable) {
            if (this.m_enable != enable) {
                this.m_enable = enable;
                var active = this.GetGameObject().IsActiveInHierarchy();
                if (active) {
                    if (this.m_enable) {
                        this.OnEnable();
                    }
                    else {
                        this.OnDisable();
                    }
                }
            }
        };
        Component.prototype.AttachGameObject = function (obj) {
            this.m_gameobject = obj;
        };
        Component.prototype.AttachTransform = function (obj) {
            this.m_transform = obj;
        };
        Component.prototype.GetGameObject = function () {
            return this.m_gameobject;
        };
        Component.prototype.GetTransform = function () {
            return this.m_transform;
        };
        Component.prototype.IsEnable = function () {
            return this.m_enable;
        };
        Component.prototype.IsStarted = function () {
            return this.m_started;
        };
        Component.prototype.IsDeleted = function () {
            return this.m_deleted;
        };
        Component.prototype.SetStarted = function () {
            this.m_started = true;
        };
        Component.prototype.toString = function () {
            return this.GetTypeName();
        };
        Component.prototype.Awake = function () { };
        Component.prototype.Start = function () { };
        Component.prototype.Update = function () { };
        Component.prototype.LateUpdate = function () { };
        Component.prototype.OnEnable = function () { };
        Component.prototype.OnDisable = function () { };
        Component.prototype.OnDestroy = function () { };
        Component.prototype.OnTranformChanged = function () { };
        Component.prototype.OnTranformHierarchyChanged = function () { };
        Component.prototype.OnPostRender = function () { };
        Component.m_class_names = ["Component"];
        Component.m_class_map = new Map_1.VRMap();
        return Component;
    }(Object_1.VRObject));
    exports.Component = Component;
});
//# sourceMappingURL=Component.js.map