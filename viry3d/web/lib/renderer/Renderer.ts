import { Component } from "../Component"
import { VRObject } from "../Object"
import { List } from "../container/List"
import { Vector } from "../container/Vector"
import { Material } from "../graphics/Material"
import { VertexBuffer } from "../graphics/VertexBuffer"
import { IndexBuffer, IndexType } from "../graphics/IndexBuffer"
import { Graphics } from "../graphics/Graphics"
import { Viry3D } from "../Viry3D"
import { UIEventHandler } from "../ui/UIEventHandler"

class MaterialPass {
	queue: number;
	shader_pass_count: number;
	renderer: Renderer;
	material_index: number;
	shader_id: number;
	material_id: number;
}

export class Renderer extends Component {
	static ClassName(): string {
		return "Renderer";
	}

	GetTypeName(): string {
		return Renderer.ClassName();
	}

	static RegisterComponent() {
		Renderer.m_class_names = Component.m_class_names.slice(0);
		Renderer.m_class_names.push("Renderer");
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return Renderer.m_class_names;
	}

	static GetRenderers(): List<Renderer> {
		return Renderer.m_renderers;
	}

	static HandleUIEvent() {
		let canvas_list = new List<Renderer>();
		Renderer.m_renderers.ForEach((i) => {
			let skip = false;
			if( !i.GetGameObject().IsActiveInHierarchy() ||
				!i.IsEnable()) {
				skip = true;
			}

			if(!skip) {
				if(i instanceof Viry3D.UICanvasRenderer) {
					canvas_list.AddLast(i);
				}
			}

			return true;
		});

		canvas_list.Sort((left, right) => {
			return (<any>left).sorting_order < (<any>right).sorting_order;
		});

		UIEventHandler.HandleUIEvent(canvas_list);
	}

	static PrepareAllPass() {
		Renderer.m_renderers.ForEach((i) => {
			let skip = false;
			if(!i.GetGameObject().IsActiveInHierarchy() ||
				!i.IsEnable() ||
				(<any>Viry3D.Camera).Current().IsCulling(i.GetGameObject())) {
				skip = true;
			}

			if(!skip) {
				let mats = i.GetSharedMaterials();

				for(let j = 0; j < mats.Size(); j++) {
					let mat = mats.Get(j);
					let shader = mat.GetShader();
					let pass_count = shader.GetPassCount();

					for(let k = 0; k < pass_count; k++) {
						shader.PreparePass(k);
					}
				}
			}

			return true;
		});

		let mat_passes = new List<MaterialPass>();

		Renderer.m_renderers.ForEach((i) => {
			let skip = false;
			if(!i.GetGameObject().IsActiveInHierarchy() ||
				!i.IsEnable() ||
				(<any>Viry3D.Camera).Current().IsCulling(i.GetGameObject())) {
				skip = true;
			}

			if(!skip) {
				let mats = i.GetSharedMaterials();

				for(let j = 0; j < mats.Size(); j++) {
					let mat = mats.Get(j);
					let shader = mat.GetShader();
					let pass_count = shader.GetPassCount();

					console.assert(pass_count >= 1);

					let pass = new MaterialPass();
					pass.queue = shader.GetQueue();
					pass.shader_pass_count = pass_count;
					pass.renderer = i;
					pass.material_index = j;
					pass.shader_id = shader.GetId();
					pass.material_id = mat.GetId();

					mat_passes.AddLast(pass);
				}
			}
			
			return true;
		});

		mat_passes.Sort((a: MaterialPass, b: MaterialPass) => {
			if(a.queue == b.queue) {
				if(a.shader_pass_count == 1 && b.shader_pass_count == 1) {
					if(a.shader_id == b.shader_id) {
						return a.material_id < b.material_id;
					} else {
						return a.shader_id < b.shader_id;
					}
				} else {
					return a.shader_pass_count < b.shader_pass_count;
				}
			} else {
				return a.queue < b.queue;
			}
		});

		let cam_index = (<any>Viry3D.Camera).CurrentIndex();
		if(this.m_passes.Size() < cam_index + 1) {
			this.m_passes.Resize(cam_index + 1);

			this.m_passes.Set(cam_index, new List<List<MaterialPass>>());
		}

		let passes = this.m_passes.Get(cam_index);
		passes.Clear();

		let pass = new List<MaterialPass>();
		mat_passes.ForEach((i) => {
			if(pass.Empty()) {
				pass.AddLast(i);
			} else {
				let last = pass.Last();
				if(i.queue == last.queue &&
					i.shader_pass_count == 1 && last.shader_pass_count == 1 &&
					i.shader_id == last.shader_id) {
					pass.AddLast(i);
				} else {
					passes.AddLast(pass);

					pass = new List<MaterialPass>();
					pass.AddLast(i);
				}
			}

			return true;
		});

		if(!pass.Empty()) {
			passes.AddLast(pass);
		}

		/*
		passes.ForEach((i) => {
			Renderer.PreparePass(i);
			return true;
		});
		*/
	}

	static RenderAllPass() {
		let cam_index = (<any>Viry3D.Camera).CurrentIndex();
		let passes = this.m_passes.Get(cam_index);

		let passes_transparent = new List<List<MaterialPass>>();
		let passes_ui = new List<List<MaterialPass>>();

		passes.ForEach((i) => {
			let first = i.First();

			if(first.queue < 3000) {
				Renderer.CommitPass(i);
			} else {
				if(first.renderer instanceof Viry3D.UICanvasRenderer) {
					let renderer_ui = first.renderer;

					i.ForEach((j) => {
						let pass = new List<MaterialPass>();
						pass.AddLast(j);
						passes_ui.AddLast(pass);

						return true;
					});
				} else {
					passes_transparent.AddLast(i);
				}
			}
			return true;
		});

		//	render transparent object
		passes_transparent.ForEach((i) => {
			Renderer.CommitPass(i);
			return true;
		});
		
		//	sort canvas renderers
		passes_ui.Sort((a: List<MaterialPass>, b: List<MaterialPass>) => {
			let renderer_a = <any>a.First().renderer;
			let renderer_b = <any>b.First().renderer;
			return renderer_a.sorting_order < renderer_b.sorting_order;
		});

		//	render ui
		passes_ui.ForEach((i) => {
			Renderer.CommitPass(i);
			return true;	
		});
	}

	private static PreparePass(pass: List<MaterialPass>) {
		let first = pass.First();

		if(first.shader_pass_count == 1) {
			let old_id = -1;
			pass.ForEach((i) => {
				let mat = i.renderer.GetSharedMaterials().Get(i.material_index);
				let mat_id = mat.GetId();

				if(old_id == -1 || old_id != mat_id) {
					i.renderer.PreRender(i.material_index);
					mat.UpdateUniforms(0);
				}

				old_id = mat_id;
				return true;
			});
		} else {
			let mat = first.renderer.GetSharedMaterials().Get(first.material_index);
			first.renderer.PreRender(first.material_index);

			for(let i = 0; i < first.shader_pass_count; i++) {
				mat.UpdateUniforms(i);
			}
		}
	}

	/*
	private static CommitPass_1(pass: List<MaterialPass>) {
		pass.ForEach((i) => {
			let mat = i.renderer.GetSharedMaterials().Get(i.material_index);
			let shader = mat.GetShader();

			i.renderer.PreRender(i.material_index);

			for(let j = 0; j < i.shader_pass_count; j++) {
				shader.BeginPass(j);

				shader.BindMaterial(j, mat);

				let world = i.renderer.GetTransform().GetLocalToWorldMatrix();
				shader.PushWorldMatrix(j, world);

				i.renderer.Render(i.material_index, j);

				shader.EndPass(j);
			}

			return true;
		});
	}
	*/

	private static CommitPass(pass: List<MaterialPass>) {
		let first = pass.First();
		let shader = first.renderer.GetSharedMaterials().Get(first.material_index).GetShader();

		if(first.shader_pass_count == 1) {
			shader.BeginPass(0);

			pass.ForEach((i) => {
				i.renderer.PreRender(i.material_index);

				let mat = i.renderer.GetSharedMaterials().Get(i.material_index);
				shader.BindMaterial(0, mat);

				let world = i.renderer.GetTransform().GetLocalToWorldMatrix();
				shader.PushWorldMatrix(0, world);

				i.renderer.Render(i.material_index, 0);
				return true;
			});

			shader.EndPass(0);
		} else {
			console.assert(pass.Size() == 1);

			first.renderer.PreRender(first.material_index);

			for(let i = 0; i < first.shader_pass_count; i++) {
				shader.BeginPass(i);

				let mat = first.renderer.GetSharedMaterials().Get(first.material_index);
				shader.BindMaterial(i, mat);

				let world = first.renderer.GetTransform().GetLocalToWorldMatrix();
				shader.PushWorldMatrix(i, world);

				first.renderer.Render(first.material_index, i);

				shader.EndPass(i);
			}
		}
	}

	GetSharedMaterials(): Vector<Material> {
		return this.m_shared_materials;
	}

	SetSharedMaterials(mats: Vector<Material>) {
		this.m_shared_materials.Clear();
		mats.ForEach((i) => {
			this.m_shared_materials.Add(i);
			return true;
		});
	}

	GetSharedMaterial(): Material {
		let mat: Material = null;

		let mats = this.GetSharedMaterials();
		if(!mats.Empty()) {
			mat = mats.Get(0);
		}

		return mat;
	}

	SetSharedMaterial(mat: Material) {
		let mats = new Vector<Material>();
		mats.Add(mat);

		this.SetSharedMaterials(mats);
	}

	protected constructor() {
		super();

		this.m_shared_materials = new Vector<Material>();
	}

	DeepCopy(source: VRObject) {
		super.DeepCopy(source);

		let src = <Renderer>source;
		this.SetSharedMaterials(src.GetSharedMaterials());
	}

	GetVertexBuffer(): VertexBuffer {
		return null;
	}

	GetIndexBuffer(): IndexBuffer {
		return null;
	}

	GetIndexRange(material_index: number, start: number[], count: number[]) { }

	protected PreRender(material_index: number) {
		let vp = (<any>Viry3D.Camera).Current().GetViewProjectionMatrix();
		let mat = this.GetSharedMaterials().Get(material_index);
		mat.SetMatrix("_ViewProjection", vp);
	}

	protected Render(material_index: number, pass_index: number) {
		let mat = this.GetSharedMaterials().Get(material_index);
		let shader = mat.GetShader();

		let index_type = IndexType.UnsignedShort;
		
		if(this.GetVertexBuffer()) {
			Graphics.GetDisplay().BindVertexBuffer(this.GetVertexBuffer(), shader, pass_index);
			Graphics.GetDisplay().BindIndexBuffer(this.GetIndexBuffer(), index_type);

			let start = [0];
			let count = [0];
			this.GetIndexRange(material_index, start, count);
			Graphics.GetDisplay().DrawIndexed(start[0], count[0], index_type);
		}
	}

	private static m_renderers = new List<Renderer>();
	private static m_passes = new Vector<List<List<MaterialPass>>>();
	protected m_shared_materials: Vector<Material>;
}