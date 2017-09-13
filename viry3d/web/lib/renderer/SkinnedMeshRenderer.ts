import { Renderer } from "./Renderer"
import { Component } from "../Component"
import { VertexBuffer } from "../graphics/VertexBuffer"
import { IndexBuffer } from "../graphics/IndexBuffer"
import { Mesh } from "../graphics/Mesh"
import { VRObject } from "../Object"
import { Transform } from "../Transform"
import { Vector } from "../container/Vector"
import { Vector4 } from "../math/Vector4"

export class SkinnedMeshRenderer extends Renderer {
	static ClassName(): string {
		return "SkinnedMeshRenderer";
	}

	GetTypeName(): string {
		return SkinnedMeshRenderer.ClassName();
	}

	static RegisterComponent() {
		SkinnedMeshRenderer.m_class_names = Renderer.m_class_names.slice(0);
		SkinnedMeshRenderer.m_class_names.push("SkinnedMeshRenderer");

		Component.Register(SkinnedMeshRenderer.ClassName(), () => {
			return new SkinnedMeshRenderer();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return SkinnedMeshRenderer.m_class_names;
	}

	DeepCopy(source: VRObject) {
		super.DeepCopy(source);

		let src = <SkinnedMeshRenderer>source;
		this.shared_mesh = src.shared_mesh;
		this.bones = new Vector<Transform>();
		src.bones.ForEach((i) => {
			this.bones.Add(i);
			return true;
		});
	}

	GetVertexBuffer(): VertexBuffer {
		if(this.shared_mesh) {
			return this.shared_mesh.GetVertexBuffer();
		} else {
			return null;
		}
	}

	GetIndexBuffer(): IndexBuffer {
		if(this.shared_mesh) {
			return this.shared_mesh.GetIndexBuffer();
		} else {
			return null;
		}
	}

	GetIndexRange(material_index: number, start: number[], count: number[]) {
		if(this.shared_mesh) {
			this.shared_mesh.GetIndexRange(material_index, start, count);
		}
	}

	protected PreRender(material_index: number) {
		super.PreRender(material_index);

		let mat = this.GetSharedMaterials().Get(material_index);
		let bindposes = this.shared_mesh.bind_poses;
		let bones = this.bones;
		let bone_matrix = new Float32Array(bones.Size() * 3 * 4);
		for(let i = 0; i < bones.Size(); i++) {
			let m = bones.Get(i).GetLocalToWorldMatrix().Multiply(bindposes.Get(i));

			for(let j = 0; j < 3; j++) {
				let row = m.GetRow(j);
				bone_matrix[(i * 3 + j) * 4 + 0] = row.x;
				bone_matrix[(i * 3 + j) * 4 + 1] = row.y;
				bone_matrix[(i * 3 + j) * 4 + 2] = row.z;
				bone_matrix[(i * 3 + j) * 4 + 3] = row.w;
			}
		}
		mat.SetVectorArray("_Bones", bone_matrix);
	}

	private constructor() {
		super();
	}

	static readonly BONE_MAX = 80;
	shared_mesh: Mesh;
	bones = new Vector<Transform>();
}