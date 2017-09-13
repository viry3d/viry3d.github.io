import { Renderer } from "../renderer/Renderer"
import { Component } from "../Component"
import { VRObject } from "../Object"
import { Viry3D } from "../Viry3D"
import { UIRect } from "./UIRect"
import { Vector2 } from "../math/Vector2"
import { Vector3 } from "../math/Vector3"
import { Mesh } from "../graphics/Mesh"
import { VertexBuffer } from "../graphics/VertexBuffer"
import { IndexBuffer } from "../graphics/IndexBuffer"
import { UIView } from "./UIView"
import { Vector } from "../container/Vector"
import { List } from "../container/List"
import { Transform } from "../Transform"
import { Material } from "../graphics/Material"
import { Color } from "../graphics/Color"
import { Shader } from "../graphics/Shader"

enum RenderType {
	BaseView,
	Sprite,
	Text
}

export class UICanvasRenderer extends Renderer {
	static ClassName(): string {
		return "UICanvasRenderer";
	}

	GetTypeName(): string {
		return UICanvasRenderer.ClassName();
	}

	static RegisterComponent() {
		UICanvasRenderer.m_class_names = Renderer.m_class_names.slice(0);
		UICanvasRenderer.m_class_names.push("UICanvasRenderer");

		Component.Register(UICanvasRenderer.ClassName(), () => {
			return new UICanvasRenderer();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return UICanvasRenderer.m_class_names;
	}

	DeepCopy(source: VRObject) {
		super.DeepCopy(source);

		let src = <UICanvasRenderer>source;
		this.sorting_order = src.sorting_order;
	}

	MarkDirty() {
		this.rect.SetDirty(true);
	}

	Awake() {
		this.rect = new UIRect(this.GetTransform());
	}

	LateUpdate() {
		this.UpdateViews();
	}

	OnTranformHierarchyChanged() {
		this.MarkDirty();
	}

	GetVertexBuffer(): VertexBuffer {
		let buffer: VertexBuffer;

		if(this.m_mesh) {
			buffer = this.m_mesh.GetVertexBuffer();
		}

		return buffer;
	}

	GetIndexBuffer(): IndexBuffer {
		let buffer: VertexBuffer;

		if(this.m_mesh) {
			buffer = this.m_mesh.GetIndexBuffer();
		}

		return buffer;
	}

	GetIndexRange(material_index: number, start: number[], count: number[]) {
		if(this.m_mesh) {
			this.m_mesh.GetIndexRange(material_index, start, count);
		}
	}

	GetViews(): Vector<UIView> {
		return this.m_views;
	}

	FindViews() {
		this.m_views = new Vector<UIView>();
		let to_find = new List<Transform>();

		to_find.AddFirst(this.rect.transform);

		while(!to_find.Empty()) {
			let t = to_find.First();
			to_find.RemoveFirst();

			let view = t.GetGameObject().GetComponent("UIView");
			if(	view &&
				view.IsEnable() &&
				t.GetGameObject().IsActiveSelf()) {
				let type_name = view.GetTypeName();
				if(type_name == "UISprite") {
					if(this.m_type == RenderType.BaseView || this.m_type == RenderType.Sprite) {
						this.m_type = RenderType.Sprite;
						this.m_views.Add(view);
					}
				} else if(type_name == "UILabel") {
					if(this.m_type == RenderType.BaseView || this.m_type == RenderType.Text) {
						this.m_type = RenderType.Text;
						this.m_views.Add(view);
					}
				} else if(type_name == "UIView") {
					// do not render empty view
				} else {
					console.error("unknown view type");
				}
			}

			let child_count = t.GetChildCount();
			for(let i = child_count - 1; i >= 0; i--) {
				let child = t.GetChild(i);
				let canvas = child.GetGameObject().GetComponent("UICanvasRenderer");
				if(!canvas && child.GetGameObject().IsActiveSelf()) {
					to_find.AddFirst(child);
				}
			}
		}

		for(let i = 0; i < this.m_views.Size(); i++) {
			this.m_views.Get(i).rect.SetRenderer(this);
		}
	}

	private UpdateViews() {
		if(!this.rect.dirty) {
			return;
		}

		this.rect.SetDirty(false);

		this.FindViews();
		
		if(!this.m_views.Empty()) {
			let mat = this.GetSharedMaterial();
			if(!mat) {
				let asset_bundle = Viry3D.Resource.GetGlobalAssetBundle();

				if(this.m_type == RenderType.BaseView || this.m_type == RenderType.Sprite) {
					if(asset_bundle != null) {
						let shader = Shader.Find("UI/Sprite", null, asset_bundle);
						mat = Material.Create(shader);
						this.SetSharedMaterial(mat);
					} else {
						console.error("asset bundle is null");
					}
				} else if(this.m_type == RenderType.Text) {
					if(asset_bundle != null) {
						let shader = Shader.Find("UI/Text", null, asset_bundle);
						mat = Material.Create(shader);
						this.SetSharedMaterial(mat);
					} else {
						console.error("asset bundle is null");
					}
				}
			}

			let vertices = new Vector<Vector3>();
			let uv = new Vector<Vector2>();
			let colors = new Vector<Color>();
			let indices = new Vector <number>();

			for(let i = 0; i < this.m_views.Size(); i++) {
				this.m_views.Get(i).rect.SetRenderer(<UICanvasRenderer>this);
				this.m_views.Get(i).FillVertices(vertices, uv, colors, indices);
				this.m_views.Get(i).FillMaterial(mat);
			}

			if(!vertices.Empty()) {
				if(!this.m_mesh) {
					this.m_mesh = Mesh.Create(true);
				}
				this.m_mesh.vertices = vertices;
				this.m_mesh.uv = uv;
				this.m_mesh.colors = colors;
				this.m_mesh.triangles = indices;
				this.m_mesh.Update(mat.GetShader().GetVertexLayoutMask());
			}
		}
	}

	private constructor() {
		super();
	}

	rect: UIRect;
	sorting_order = 0;
	private m_type = RenderType.BaseView;
	private m_mesh: Mesh;
	private m_views: Vector<UIView>;
}

Viry3D.UICanvasRenderer = UICanvasRenderer;