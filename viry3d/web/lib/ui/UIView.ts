import { UIRect } from "./UIRect"
import { UICanvasRenderer } from "./UICanvasRenderer"
import { UIEventHandler } from "./UIEventHandler"
import { Component } from "../Component"
import { VRObject } from "../Object"
import { Transform } from "../Transform"
import { Color } from "../graphics/Color"
import { Vector2 } from "../math/Vector2"
import { Vector3 } from "../math/Vector3"
import { Matrix4x4 } from "../math/Matrix4x4"
import { Vector } from "../container/Vector"
import { Material } from "../graphics/Material"

export class UIViewRect extends UIRect {
	SetAnchors(min: Vector2, max: Vector2) {
		super.SetAnchors(min, max);

		if(this.m_dirty) {
			this.MarkRendererDirty();
		}
	}

	SetOffsets(min: Vector2, max: Vector2) {
		super.SetOffsets(min, max);

		if(this.m_dirty) {
			this.MarkRendererDirty();
		}
	}

	SetPivot(v: Vector2) {
		super.SetPivot(v);

		if(this.m_dirty) {
			this.MarkRendererDirty();
		}
	}

	MarkRendererDirty() {
		if(this.m_renderer) {
			this.m_renderer.MarkDirty();
			this.m_renderer == null;
		}
	}

	SetRenderer(v: UICanvasRenderer) {
		this.m_renderer = v;
	}

	GetRenderer(): UICanvasRenderer {
		return this.m_renderer;
	}

	constructor(transform: Transform) {
		super(transform);
	}

	private m_renderer: UICanvasRenderer;
}

export class UIView extends Component {
	static ClassName(): string {
		return "UIView";
	}

	GetTypeName(): string {
		return UIView.ClassName();
	}

	static RegisterComponent() {
		UIView.m_class_names = Component.m_class_names.slice(0);
		UIView.m_class_names.push("UIView");

		Component.Register(UIView.ClassName(), () => {
			return new UIView();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return UIView.m_class_names;
	}

	DeepCopy(source: VRObject) {
		super.DeepCopy(source);

		let src = <UIView>source;
		this.m_color.Set(src.m_color);
		this.rect.SetAnchors(src.rect.anchor_min, src.rect.anchor_max);
		this.rect.SetOffsets(src.rect.offset_min, src.rect.offset_max);
		this.rect.SetPivot(src.rect.pivot);
		this.rect.SetDirty(true);
	}

	SetColor(v: Color) {
		if(!this.m_color.Equals(v)) {
			this.m_color.Set(v);
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	protected GetVertexMatrix(): Matrix4x4 {
		let local_position = this.rect.transform.GetLocalPosition();
		let local_rotation = this.rect.transform.GetLocalRotation();
		let local_scale = this.rect.transform.GetLocalScale();

		let mat_local = Matrix4x4.TRS(local_position, local_rotation, local_scale);
		let mat_parent_to_world = this.rect.transform.GetParent().GetLocalToWorldMatrix();
		let mat_world_to_canvas = this.rect.GetRenderer().GetTransform().GetWorldToLocalMatrix();
		let mat = mat_world_to_canvas.Multiply(mat_parent_to_world).Multiply(mat_local);
		
		return mat;
	}

	GetBoundsVertices(): Vector<Vector3> {
		let vertices = new Vector<Vector3>();

		let size = this.rect.GetSize();
		let min = new Vector2(-this.rect.pivot.x * size.x, -this.rect.pivot.y * size.y);
		let max = new Vector2((1 - this.rect.pivot.x) * size.x, (1 - this.rect.pivot.y) * size.y);
		vertices.Add(new Vector3(min.x, min.y, 0));
		vertices.Add(new Vector3(max.x, min.y, 0));
		vertices.Add(new Vector3(max.x, max.y, 0));
		vertices.Add(new Vector3(min.x, max.y, 0));

		let mat = this.GetVertexMatrix();
		for(let i = 0; i < 4; i++) {
			let v = vertices.Get(i);
			v.x = Math.floor(v.x);
			v.y = Math.floor(v.y);

			vertices.Set(i, mat.MultiplyPoint3x4(v));
		}

		return vertices;
	}

	FillVertices(vertices: Vector<Vector3>, uv: Vector<Vector2>, colors: Vector<Color>, indices: Vector<number>) {
		let vertex_array = this.GetBoundsVertices();
		vertices.AddRange(vertex_array.toArray());

		uv.Add(new Vector2(0, 1));
		uv.Add(new Vector2(1, 1));
		uv.Add(new Vector2(1, 0));
		uv.Add(new Vector2(0, 0));

		colors.Add(this.m_color);
		colors.Add(this.m_color);
		colors.Add(this.m_color);
		colors.Add(this.m_color);

		let index_begin = vertices.Size() - 4;
		indices.Add(index_begin + 0);
		indices.Add(index_begin + 1);
		indices.Add(index_begin + 2);
		indices.Add(index_begin + 0);
		indices.Add(index_begin + 2);
		indices.Add(index_begin + 3);
	}

	FillMaterial(mat: Material) { }

	protected constructor() {
		super();
	}

	Awake() {
		this.rect = new UIViewRect(this.GetTransform());
	}

	OnTranformChanged() {
		this.rect.SetDirty(true);
		this.rect.MarkRendererDirty();
	}

	rect: UIViewRect;
	event_handler = new UIEventHandler();
	protected m_color = new Color(1, 1, 1, 1);
}