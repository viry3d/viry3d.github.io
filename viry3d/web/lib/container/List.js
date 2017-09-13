define(["require", "exports"], function (require, exports) {
    "use strict";
    var ListNode = (function () {
        function ListNode(v) {
            this.value = v;
            this.previous = null;
            this.next = null;
        }
        return ListNode;
    }());
    var List = (function () {
        function List(list) {
            this.m_node_end = new ListNode(null);
            this.m_node_begin = this.m_node_end;
            this.m_size = 0;
            if (list != null) {
                this.AddRangeBefore(this.End(), list.Begin(), list.End());
            }
        }
        List.prototype.AddFirst = function (v) {
            var node = new ListNode(v);
            if (this.m_node_begin == this.m_node_end) {
                this.m_node_begin = node;
                node.next = this.m_node_end;
                this.m_node_end.previous = node;
            }
            else {
                node.next = this.m_node_begin;
                this.m_node_begin.previous = node;
                this.m_node_begin = node;
            }
            this.m_size++;
        };
        List.prototype.AddLast = function (v) {
            var node = new ListNode(v);
            if (this.m_node_end.previous != null) {
                this.m_node_end.previous.next = node;
                node.previous = this.m_node_end.previous;
            }
            else {
                this.m_node_begin = node;
            }
            node.next = this.m_node_end;
            this.m_node_end.previous = node;
            this.m_size++;
        };
        List.prototype.First = function () {
            return this.m_node_begin.value;
        };
        List.prototype.Last = function () {
            return this.m_node_end.previous.value;
        };
        List.prototype.RemoveFirst = function () {
            if (this.m_node_begin != this.m_node_end) {
                this.m_node_begin.next.previous = null;
                this.m_node_begin = this.m_node_begin.next;
                this.m_size--;
            }
        };
        List.prototype.RemoveLast = function () {
            if (this.m_node_end.previous != null) {
                var node = this.m_node_end.previous;
                if (node.previous != null) {
                    node.previous.next = this.m_node_end;
                }
                this.m_node_end.previous = node.previous;
                if (this.m_node_begin == node) {
                    this.m_node_begin = this.m_node_end;
                }
                this.m_size--;
            }
        };
        List.prototype.Clear = function () {
            this.m_node_begin = this.m_node_end;
            this.m_node_end.previous = null;
            this.m_size = 0;
        };
        List.prototype.Size = function () {
            return this.m_size;
        };
        List.prototype.Empty = function () {
            return this.m_size == 0;
        };
        List.prototype.RemoveNode = function (node) {
            if (node.previous != null) {
                node.previous.next = node.next;
            }
            else {
                this.m_node_begin = node.next;
            }
            node.next.previous = node.previous;
            this.m_size--;
            return node.next;
        };
        List.prototype.Remove = function (v) {
            for (var i = this.m_node_begin; i != this.m_node_end; i = i.next) {
                if (i.value == v) {
                    this.RemoveNode(i);
                    return true;
                }
            }
            return false;
        };
        List.prototype.RemoveAll = function (v) {
            for (var i = this.m_node_begin; i != this.m_node_end;) {
                if (i.value == v) {
                    i = this.RemoveNode(i);
                }
                else {
                    i = i.next;
                }
            }
        };
        List.prototype.Sort = function (func) {
            this.m_node_begin = this.QuickSort(this.m_node_begin, this.m_node_end, this.m_size, func);
        };
        List.prototype.QuickSort = function (begin, end, count, func) {
            if (count < 2) {
                return begin;
            }
            var rand = Math.random() * count;
            var pivot = begin;
            for (var i = 1; i < rand; i++) {
                pivot = pivot.next;
            }
            var left_first = null;
            var left_last = null;
            var left_count = 0;
            var right_last = null;
            var right_first = null;
            var right_count = 0;
            for (var i = begin; i != end;) {
                if (i == pivot) {
                    i = i.next;
                    continue;
                }
                var next = i.next;
                var less = void 0;
                if (func != null) {
                    less = func(i.value, pivot.value);
                }
                else {
                    less = i.value < pivot.value;
                }
                if (less) {
                    i.previous = null;
                    i.next = left_first;
                    if (left_first != null) {
                        left_first.previous = i;
                    }
                    else {
                        left_last = i;
                    }
                    left_first = i;
                    left_count++;
                }
                else {
                    i.previous = right_last;
                    i.next = null;
                    if (right_last != null) {
                        right_last.next = i;
                    }
                    else {
                        right_first = i;
                    }
                    right_last = i;
                    right_count++;
                }
                i = next;
            }
            if (left_last != null) {
                left_last.next = pivot;
            }
            pivot.previous = left_last;
            if (right_first != null) {
                right_first.previous = pivot;
            }
            pivot.next = right_first;
            if (right_last != null) {
                right_last.next = end;
            }
            else {
                pivot.next = end;
            }
            if (left_first != null) {
                left_first = this.QuickSort(left_first, pivot, left_count, func);
            }
            if (right_first != null) {
                right_first = this.QuickSort(right_first, end, right_count, func);
                pivot.next = right_first;
            }
            if (left_first != null) {
                return left_first;
            }
            return pivot;
        };
        List.prototype.AddBefore = function (pos, v) {
            var node = new ListNode(v);
            if (pos.previous != null) {
                pos.previous.next = node;
            }
            else {
                this.m_node_begin = node;
            }
            node.previous = pos.previous;
            node.next = pos;
            pos.previous = node;
            this.m_size++;
            return node;
        };
        List.prototype.AddAfter = function (pos, v) {
            if (pos != this.m_node_end) {
                var node = new ListNode(v);
                pos.next.previous = node;
                node.next = pos.next;
                node.previous = pos;
                pos.next = node;
                this.m_size++;
                return node;
            }
            return null;
        };
        List.prototype.AddRangeBefore = function (pos, begin, end) {
            var first = null;
            for (var i = begin; i != end; i = i.next) {
                var node = this.AddBefore(pos, i.value);
                if (first == null) {
                    first = node;
                }
            }
            return first;
        };
        List.prototype.Begin = function () {
            return this.m_node_begin;
        };
        List.prototype.End = function () {
            return this.m_node_end;
        };
        List.prototype.ForEach = function (func) {
            for (var i = this.Begin(); i != this.End(); i = i.next) {
                if (!func(i.value)) {
                    break;
                }
            }
        };
        List.prototype.toString = function () {
            var str = "List[" + this.m_size + "] : { ";
            var iter = this.m_node_begin;
            while (iter != this.m_node_end) {
                str += iter.value;
                iter = iter.next;
                if (iter != this.m_node_end) {
                    str += ", ";
                }
            }
            str += " }";
            return str;
        };
        return List;
    }());
    exports.List = List;
});
//# sourceMappingURL=List.js.map