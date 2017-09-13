class ListNode<V> {
    constructor(v: V) {
        this.value = v;
        this.previous = null;
        this.next = null;
    }

    value: V;
    previous: ListNode<V>;
    next: ListNode<V>;
}

type SortFunc<V> = (left: V, right: V) => boolean; 

export class List<V> {
    constructor(list?: List<V>) {
        this.m_node_end = new ListNode<V>(null);
        this.m_node_begin = this.m_node_end;
        this.m_size = 0;

        if(list != null) {
            this.AddRangeBefore(this.End(), list.Begin(), list.End());
        }
    }

    AddFirst(v: V) {
        let node = new ListNode<V>(v);

		if(this.m_node_begin == this.m_node_end) {
			this.m_node_begin = node;
			node.next = this.m_node_end;
			this.m_node_end.previous = node;
		} else {
			node.next = this.m_node_begin;
			this.m_node_begin.previous = node;
			this.m_node_begin = node;
		}

		this.m_size++;
    }

    AddLast(v: V) {
		let node = new ListNode<V>(v);

		if(this.m_node_end.previous != null) {
			this.m_node_end.previous.next = node;
			node.previous = this.m_node_end.previous;
		} else {
			this.m_node_begin = node;
		}

		node.next = this.m_node_end;
		this.m_node_end.previous = node;

		this.m_size++;
    }

    First(): V {
        return this.m_node_begin.value;
    }

    Last(): V {
        return this.m_node_end.previous.value;
    }

    RemoveFirst() {
		if(this.m_node_begin != this.m_node_end) {
			this.m_node_begin.next.previous = null;
			this.m_node_begin = this.m_node_begin.next;

			this.m_size--;
		}
    }

    RemoveLast() {
		if(this.m_node_end.previous != null) {
			let node = this.m_node_end.previous;
			if(node.previous != null) {
				node.previous.next = this.m_node_end;
			}
			this.m_node_end.previous = node.previous;

			if(this.m_node_begin == node) {
				this.m_node_begin = this.m_node_end;
			}

			this.m_size--;
		}
    }

    Clear() {
		this.m_node_begin = this.m_node_end;
		this.m_node_end.previous = null;
		this.m_size = 0;
    }

    Size(): number {
		return this.m_size;
    }

    Empty(): boolean {
		return this.m_size == 0;
    }

    RemoveNode(node: ListNode<V>): ListNode<V> {
		if(node.previous != null) {
			node.previous.next = node.next;
		} else {
			this.m_node_begin = node.next;
		}

		node.next.previous = node.previous;

		this.m_size--;

		return node.next;
	}

    Remove(v: V): boolean {
		for(let i = this.m_node_begin; i != this.m_node_end; i = i.next) {
			if(i.value == v) {
				this.RemoveNode(i);
				return true;
			}
		}

		return false;
	}

    RemoveAll(v: V) {
		for(let i = this.m_node_begin; i != this.m_node_end;) {
			if(i.value == v) {
				i = this.RemoveNode(i);
			} else {
				i = i.next;
			}
		}
    }

    Sort(func?: SortFunc<V>) {
		this.m_node_begin = this.QuickSort(this.m_node_begin, this.m_node_end, this.m_size, func);
    }

	private QuickSort(begin: ListNode<V>, end: ListNode<V>, count: number, func: SortFunc<V>): ListNode<V> {
		if(count < 2) {
			return begin;
		}

		let rand = Math.random() * count;
		let pivot = begin;
		for(let i = 1; i < rand; i++) {
			pivot = pivot.next;
		}

		let left_first: ListNode<V> = null;
		let left_last: ListNode<V> = null;
		let left_count = 0;
		let right_last: ListNode<V> = null;
		let right_first: ListNode<V> = null;
		let right_count = 0;

		for(let i = begin; i != end;) {
			if(i == pivot) {
				i = i.next;
				continue;
			}

			let next = i.next;

			let less: boolean;

			if(func != null) {
				less = func(i.value, pivot.value);
			} else {
				less = i.value < pivot.value;
			}

			if(less) {
				i.previous = null;
				i.next = left_first;

				if(left_first != null) {
					left_first.previous = i;
				} else {
					left_last = i;
				}

				left_first = i;
				left_count++;
			} else {
				i.previous = right_last;
				i.next = null;

				if(right_last != null) {
					right_last.next = i;
				} else {
					right_first = i;
				}

				right_last = i;
				right_count++;
			}

			i = next;
		}

		if(left_last != null) {
			left_last.next = pivot;
		}
		pivot.previous = left_last;

		if(right_first != null) {
			right_first.previous = pivot;
		}
		pivot.next = right_first;

		if(right_last != null) {
			right_last.next = end;
		} else {
			pivot.next = end;
		}

		if(left_first != null) {
			left_first = this.QuickSort(left_first, pivot, left_count, func);
		}

		if(right_first != null) {
			right_first = this.QuickSort(right_first, end, right_count, func);
			pivot.next = right_first;
		}

		if(left_first != null) {
			return left_first;
		}

		return pivot;
	}

    AddBefore(pos: ListNode<V>, v: V): ListNode<V> {
		let node = new ListNode<V>(v);

		if(pos.previous != null) {
			pos.previous.next = node;
		} else {
			this.m_node_begin = node;
		}

		node.previous = pos.previous;
		node.next = pos;
		pos.previous = node;

		this.m_size++;

		return node;
    }

    AddAfter(pos: ListNode<V>, v: V): ListNode<V> {
		if(pos != this.m_node_end) {
			let node = new ListNode<V>(v);

			pos.next.previous = node;
			node.next = pos.next;
			node.previous = pos;
			pos.next = node;

			this.m_size++;

			return node;
		}

        return null;
    }

    AddRangeBefore(pos: ListNode<V>, begin: ListNode<V>, end: ListNode<V>): ListNode<V> {
		let first: ListNode<V> = null;

		for(let i = begin; i != end; i = i.next) {
			let node = this.AddBefore(pos, i.value);

			if(first == null) {
				first = node;
			}
		}

		return first;
    }

    Begin(): ListNode<V> {
        return this.m_node_begin;
    }

    End(): ListNode<V> {
        return this.m_node_end;
    }

    ForEach(func: (v: V) => boolean) {
        for(let i = this.Begin(); i != this.End(); i = i.next) {
            if(!func(i.value)) {
                break;
            }
        }
    }

	toString(): string {
		let str = "List[" + this.m_size + "] : { ";

		let iter = this.m_node_begin;
		while(iter != this.m_node_end) {
			str += iter.value;
			iter = iter.next;

			if(iter != this.m_node_end) {
				str += ", ";
			}
		}

		str += " }";

		return str;
	}

    private m_node_begin: ListNode<V>;
    private m_node_end: ListNode<V>;
	private m_size: number;
}