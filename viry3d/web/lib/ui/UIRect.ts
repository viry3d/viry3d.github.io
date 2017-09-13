import { Vector2 } from "../math/Vector2"
import { Vector3 } from "../math/Vector3"
import { Transform } from "../Transform"

export class UIRect {
	SetAnchors(min: Vector2, max: Vector2) {
		if(!this.m_anchor_min.Equals(min) || !this.m_anchor_max.Equals(max)) {
			this.m_anchor_min.Set(min);
			this.m_anchor_max.Set(max);
			this.m_dirty = true;
		}
	}

	SetOffsets(min: Vector2, max: Vector2) {
		if(!this.m_offset_min.Equals(min) || !this.m_offset_max.Equals(max)) {
			this.m_offset_min.Set(min);
			this.m_offset_max.Set(max);
			this.m_dirty = true;
		}
	}

	SetPivot(v: Vector2) {
		if(!this.m_pivot.Equals(v)) {
			this.m_pivot.Set(v);
			this.m_dirty = true;
		}
	}

	SetDirty(v: boolean) {
		this.m_dirty = v;
	}

	GetSize(): Vector2 {
		return this.m_offset_max.Subtract(this.m_offset_min);
	}

	SetSize(size: Vector2) {
		if(!this.GetSize().Equals(size)) {
			let parent = this.GetParentRect();
			if(parent) {
				let pos = this.m_transform.GetLocalPosition();
				let min_x = pos.x - this.m_pivot.x * size.x;
				let min_y = pos.y - this.m_pivot.y * size.y;
				let max_x = pos.x + (1.0 - this.m_pivot.x) * size.x;
				let max_y = pos.y + (1.0 - this.m_pivot.y) * size.y;

				let parent_size = parent.GetSize();
				let parent_x = parent.m_pivot.x * parent_size.x;
				let parent_y = parent.m_pivot.y * parent_size.y;

				this.m_offset_min.x = min_x + parent_x - this.m_anchor_min.x * parent_size.x;
				this.m_offset_min.y = min_y + parent_y - this.m_anchor_min.y * parent_size.y;
				this.m_offset_max.x = max_x + parent_x - this.m_anchor_max.x * parent_size.x;
				this.m_offset_max.y = max_y + parent_y - this.m_anchor_max.y * parent_size.y;
			} else {
				this.m_offset_min = new Vector2(size.x * -this.m_pivot.x, size.y * -this.m_pivot.y);
				this.m_offset_max = new Vector2(size.x * (1.0 - this.m_pivot.x), size.y * (1.0 - this.m_pivot.y));
			}

			this.m_dirty = true;
		}
	}

	GetParentRect(): UIRect {
		let rect: UIRect = null;

		let parent = this.m_transform.GetParent();
		if(parent) {
			let r = parent.GetGameObject().GetComponent("UIRect");

			if(r) {
				rect = r;
			}
		}

		return rect;
	}

	OnAnchor() {
		let parent = this.GetParentRect();
		if(parent) {
			let parent_size = parent.GetSize();
			let min_x = this.m_anchor_min.x * parent_size.x + this.m_offset_min.x;
			let min_y = this.m_anchor_min.y * parent_size.y + this.m_offset_min.y;
			let max_x = this.m_anchor_max.x * parent_size.x + this.m_offset_max.x;
			let max_y = this.m_anchor_max.y * parent_size.y + this.m_offset_max.y;

			let x = min_x + this.m_pivot.x * (max_x - min_x);
			let y = min_y + this.m_pivot.y * (max_y - min_y);
			let parent_x = parent_size.x * parent.m_pivot.x;
			let parent_y = parent_size.y * parent.m_pivot.y;

			let pos = new Vector3(x - parent_x, y - parent_y, 0);
			pos.x = Math.floor(pos.x);
			pos.y = Math.floor(pos.y);

			this.m_transform.SetLocalPosition(pos);
		}
	}

	constructor(transform: Transform) {
		this.m_transform = transform;
	}

	get anchor_min(): Vector2 {
		return this.m_anchor_min;
	}

	get anchor_max(): Vector2 {
		return this.m_anchor_max;
	}

	get offset_min(): Vector2 {
		return this.m_offset_min;
	}

	get offset_max(): Vector2 {
		return this.m_offset_max;
	}

	get pivot(): Vector2 {
		return this.m_pivot;
	}

	get dirty(): boolean {
		return this.m_dirty;
	}

	get transform(): Transform {
		return this.m_transform;
	}

	protected m_anchor_min = new Vector2(0.5, 0.5);
	protected m_anchor_max = new Vector2(0.5, 0.5);
	protected m_offset_min = new Vector2(-50, -50);
	protected m_offset_max = new Vector2(50, 50);
	protected m_pivot = new Vector2(0.5, 0.5);
	protected m_dirty = true;
	protected m_transform: Transform;
}