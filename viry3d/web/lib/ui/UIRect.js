define(["require", "exports", "../math/Vector2", "../math/Vector3"], function (require, exports, Vector2_1, Vector3_1) {
    "use strict";
    var UIRect = (function () {
        function UIRect(transform) {
            this.m_anchor_min = new Vector2_1.Vector2(0.5, 0.5);
            this.m_anchor_max = new Vector2_1.Vector2(0.5, 0.5);
            this.m_offset_min = new Vector2_1.Vector2(-50, -50);
            this.m_offset_max = new Vector2_1.Vector2(50, 50);
            this.m_pivot = new Vector2_1.Vector2(0.5, 0.5);
            this.m_dirty = true;
            this.m_transform = transform;
        }
        UIRect.prototype.SetAnchors = function (min, max) {
            if (!this.m_anchor_min.Equals(min) || !this.m_anchor_max.Equals(max)) {
                this.m_anchor_min.Set(min);
                this.m_anchor_max.Set(max);
                this.m_dirty = true;
            }
        };
        UIRect.prototype.SetOffsets = function (min, max) {
            if (!this.m_offset_min.Equals(min) || !this.m_offset_max.Equals(max)) {
                this.m_offset_min.Set(min);
                this.m_offset_max.Set(max);
                this.m_dirty = true;
            }
        };
        UIRect.prototype.SetPivot = function (v) {
            if (!this.m_pivot.Equals(v)) {
                this.m_pivot.Set(v);
                this.m_dirty = true;
            }
        };
        UIRect.prototype.SetDirty = function (v) {
            this.m_dirty = v;
        };
        UIRect.prototype.GetSize = function () {
            return this.m_offset_max.Subtract(this.m_offset_min);
        };
        UIRect.prototype.SetSize = function (size) {
            if (!this.GetSize().Equals(size)) {
                var parent_1 = this.GetParentRect();
                if (parent_1) {
                    var pos = this.m_transform.GetLocalPosition();
                    var min_x = pos.x - this.m_pivot.x * size.x;
                    var min_y = pos.y - this.m_pivot.y * size.y;
                    var max_x = pos.x + (1.0 - this.m_pivot.x) * size.x;
                    var max_y = pos.y + (1.0 - this.m_pivot.y) * size.y;
                    var parent_size = parent_1.GetSize();
                    var parent_x = parent_1.m_pivot.x * parent_size.x;
                    var parent_y = parent_1.m_pivot.y * parent_size.y;
                    this.m_offset_min.x = min_x + parent_x - this.m_anchor_min.x * parent_size.x;
                    this.m_offset_min.y = min_y + parent_y - this.m_anchor_min.y * parent_size.y;
                    this.m_offset_max.x = max_x + parent_x - this.m_anchor_max.x * parent_size.x;
                    this.m_offset_max.y = max_y + parent_y - this.m_anchor_max.y * parent_size.y;
                }
                else {
                    this.m_offset_min = new Vector2_1.Vector2(size.x * -this.m_pivot.x, size.y * -this.m_pivot.y);
                    this.m_offset_max = new Vector2_1.Vector2(size.x * (1.0 - this.m_pivot.x), size.y * (1.0 - this.m_pivot.y));
                }
                this.m_dirty = true;
            }
        };
        UIRect.prototype.GetParentRect = function () {
            var rect = null;
            var parent = this.m_transform.GetParent();
            if (parent) {
                var r = parent.GetGameObject().GetComponent("UIRect");
                if (r) {
                    rect = r;
                }
            }
            return rect;
        };
        UIRect.prototype.OnAnchor = function () {
            var parent = this.GetParentRect();
            if (parent) {
                var parent_size = parent.GetSize();
                var min_x = this.m_anchor_min.x * parent_size.x + this.m_offset_min.x;
                var min_y = this.m_anchor_min.y * parent_size.y + this.m_offset_min.y;
                var max_x = this.m_anchor_max.x * parent_size.x + this.m_offset_max.x;
                var max_y = this.m_anchor_max.y * parent_size.y + this.m_offset_max.y;
                var x = min_x + this.m_pivot.x * (max_x - min_x);
                var y = min_y + this.m_pivot.y * (max_y - min_y);
                var parent_x = parent_size.x * parent.m_pivot.x;
                var parent_y = parent_size.y * parent.m_pivot.y;
                var pos = new Vector3_1.Vector3(x - parent_x, y - parent_y, 0);
                pos.x = Math.floor(pos.x);
                pos.y = Math.floor(pos.y);
                this.m_transform.SetLocalPosition(pos);
            }
        };
        Object.defineProperty(UIRect.prototype, "anchor_min", {
            get: function () {
                return this.m_anchor_min;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIRect.prototype, "anchor_max", {
            get: function () {
                return this.m_anchor_max;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIRect.prototype, "offset_min", {
            get: function () {
                return this.m_offset_min;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIRect.prototype, "offset_max", {
            get: function () {
                return this.m_offset_max;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIRect.prototype, "pivot", {
            get: function () {
                return this.m_pivot;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIRect.prototype, "dirty", {
            get: function () {
                return this.m_dirty;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIRect.prototype, "transform", {
            get: function () {
                return this.m_transform;
            },
            enumerable: true,
            configurable: true
        });
        return UIRect;
    }());
    exports.UIRect = UIRect;
});
//# sourceMappingURL=UIRect.js.map