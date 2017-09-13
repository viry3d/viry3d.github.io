import { Renderer } from "./Renderer"
import { Component } from "../Component"
import { VertexBuffer } from "../graphics/VertexBuffer"
import { IndexBuffer } from "../graphics/IndexBuffer"
import { Mesh } from "../graphics/Mesh"
import { VRObject } from "../Object"

export class MeshRenderer extends Renderer {
	static ClassName(): string {
		return "MeshRenderer";
	}

	GetTypeName(): string {
		return MeshRenderer.ClassName();
	}

	static RegisterComponent() {
		MeshRenderer.m_class_names = Renderer.m_class_names.slice(0);
		MeshRenderer.m_class_names.push("MeshRenderer");

		Component.Register(MeshRenderer.ClassName(), () => {
			return new MeshRenderer();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return MeshRenderer.m_class_names;
	}

	DeepCopy(source: VRObject) {
		super.DeepCopy(source);

		let src = <MeshRenderer>source;
		this.shared_mesh = src.shared_mesh;
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

	private constructor() {
		super();
	}

	shared_mesh: Mesh;
}