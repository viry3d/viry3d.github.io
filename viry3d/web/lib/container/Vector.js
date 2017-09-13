define(["require", "exports"], function (require, exports) {
    "use strict";
    var Vector = (function () {
        function Vector(size) {
            if (size != null) {
                this.m_array = new Array(size);
            }
            else {
                this.m_array = new Array();
            }
        }
        Vector.prototype.Add = function (v) {
            this.m_array.push(v);
        };
        Vector.prototype.AddRange = function (vs) {
            this.m_array = this.m_array.concat(vs);
        };
        Vector.prototype.Clear = function () {
            this.m_array.splice(0, this.m_array.length);
        };
        Vector.prototype.Size = function () {
            return this.m_array.length;
        };
        Vector.prototype.Empty = function () {
            return this.m_array.length == 0;
        };
        Vector.prototype.Resize = function (size) {
            if (size > this.m_array.length) {
                var append = new Array(size - this.m_array.length);
                this.m_array = this.m_array.concat(append);
            }
            else if (size < this.m_array.length) {
                this.m_array.splice(size);
            }
        };
        Vector.prototype.Remove = function (index, count) {
            if (count != null) {
                this.m_array.splice(index, count);
            }
            else {
                this.m_array.splice(index, 1);
            }
        };
        Vector.prototype.Get = function (index) {
            return this.m_array[index];
        };
        Vector.prototype.Set = function (index, v) {
            this.m_array[index] = v;
        };
        Vector.prototype.ForEach = function (func) {
            for (var i = 0; i < this.Size(); i++) {
                if (!func(this.Get(i))) {
                    break;
                }
            }
        };
        Vector.prototype.toArray = function () {
            return this.m_array;
        };
        Vector.prototype.toString = function () {
            var str = "Vector[" + this.m_array.length + "] : { \n";
            for (var i = 0; i < this.m_array.length; i++) {
                var str_ele = this.m_array[i].toString();
                str_ele = str_ele.replace(new RegExp("\n", "gm"), "\n    ");
                str += "    " + str_ele;
                if (i != this.m_array.length - 1) {
                    str += ", ";
                }
                str += "\n";
            }
            str += "}";
            return str;
        };
        return Vector;
    }());
    exports.Vector = Vector;
});
//# sourceMappingURL=Vector.js.map