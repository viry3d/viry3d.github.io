import { VRObject } from "../Object"
import { Vector } from "../container/Vector"
import { Vector2 } from "../math/Vector2"
import { Vector3 } from "../math/Vector3"
import { Vector4 } from "../math/Vector4"
import { Matrix4x4 } from "../math/Matrix4x4"
import { Color } from "./Color"
import { VertexBuffer } from "./VertexBuffer"
import { IndexBuffer } from "./IndexBuffer"
import { VertexAttributeType } from "./XMLShader"

const littleEndian = (function () {
	let buffer = new ArrayBuffer(2);
	new DataView(buffer).setInt16(0, 256, true);
	// Int16Array uses the platform's endianness.
	return new Int16Array(buffer)[0] === 256;
})();

function write_vector2(buffer: DataView, v: Vector2, offset: number): number {
	buffer.setFloat32(offset + 0, v.x, littleEndian);
	buffer.setFloat32(offset + 4, v.y, littleEndian);
	return offset + 8;
}

function write_vector3(buffer: DataView, v: Vector3, offset: number): number {
	buffer.setFloat32(offset + 0, v.x, littleEndian);
	buffer.setFloat32(offset + 4, v.y, littleEndian);
	buffer.setFloat32(offset + 8, v.z, littleEndian);
	return offset + 12;
}

function write_vector4(buffer: DataView, v: Vector4, offset: number): number {
	buffer.setFloat32(offset + 0, v.x, littleEndian);
	buffer.setFloat32(offset + 4, v.y, littleEndian);
	buffer.setFloat32(offset + 8, v.z, littleEndian);
	buffer.setFloat32(offset + 12, v.w, littleEndian);
	return offset + 16;
}

function write_color(buffer: DataView, v: Color, offset: number): number {
	buffer.setFloat32(offset + 0, v.r, littleEndian);
	buffer.setFloat32(offset + 4, v.g, littleEndian);
	buffer.setFloat32(offset + 8, v.b, littleEndian);
	buffer.setFloat32(offset + 12, v.a, littleEndian);
	return offset + 16;
}

export class Submesh {
	start: number;
	count: number;
}

export class Mesh extends VRObject {
	static Create(dynamic: boolean = false): Mesh {
		let mesh = new Mesh();
		mesh.m_dynamic = dynamic;
		return mesh;
	}

	private static FillVertexBuffer(param: any, buffer: DataView) {
		let mesh = <Mesh>param;

		let offset = 0;
		const count = mesh.vertices.Size();
		for(let i = 0; i < count; i++) {
			for(let j = 0; j < 8; j++) {
				let mask = mesh.m_vertex_layout_mask & (0xf << (j * 4));
				if(mask != 0) {
					let type = <VertexAttributeType>((mask >> (j * 4)) - 1);

					switch(type) {
						case VertexAttributeType.Vertex:
							offset = write_vector3(buffer, mesh.vertices.Get(i), offset);
							break;
						case VertexAttributeType.Color:
							offset = write_color(buffer, mesh.colors.Get(i), offset);
							break;
						case VertexAttributeType.Texcoord:
							offset = write_vector2(buffer, mesh.uv.Get(i), offset);
							break;
						case VertexAttributeType.Texcoord2:
							offset = write_vector2(buffer, mesh.uv2.Get(i), offset);
							break;
						case VertexAttributeType.Normal:
							offset = write_vector3(buffer, mesh.normals.Get(i), offset);
							break;
						case VertexAttributeType.Tangent:
							offset = write_vector4(buffer, mesh.tangents.Get(i), offset);
							break;
						case VertexAttributeType.BlendWeight:
							offset = write_vector4(buffer, mesh.bone_weights.Get(i), offset);
							break;
						case VertexAttributeType.BlendIndices:
							offset = write_vector4(buffer, mesh.bone_indices.Get(i), offset);
							break;
						default:
							break;
					}
				} else {
					break;
				}
			}
		}
	}

	private static FillIndexBuffer(param: any, buffer: DataView) {
		let mesh = <Mesh>param;

		new Uint16Array(buffer.buffer).set(mesh.triangles.toArray());
	}

	Update(vertex_layout_mask: number) {
		this.m_vertex_layout_mask = vertex_layout_mask;

		this.UpdateVertexBuffer();
		this.UpdateIndexBuffer();
	}

	UpdateVertexBuffer() {
		let buffer_size = this.VertexBufferSize();
		let dynamic = this.m_dynamic;

		if(this.m_vertex_buffer == null || this.m_vertex_buffer.GetSize() != buffer_size) {
			this.m_vertex_buffer = VertexBuffer.Create(buffer_size, dynamic);
		}
		this.m_vertex_buffer.Fill(this, Mesh.FillVertexBuffer);
	}

	UpdateIndexBuffer() {
		let buffer_size = this.IndexBufferSize();
		let dynamic = this.m_dynamic;

		if(this.m_index_buffer == null || this.m_index_buffer.GetSize() != buffer_size) {
			this.m_index_buffer = IndexBuffer.Create(buffer_size, dynamic);
		}
		this.m_index_buffer.Fill(this, Mesh.FillIndexBuffer);
	}

	VertexBufferSize(): number {
		const attr_sizes = [
			12, 16, 8, 8, 12, 16, 16, 16
		];

		let stride = 0;
		for(let i = 0; i < 8; i++) {
			let mask = this.m_vertex_layout_mask & (0xf << (i * 4));
			if(mask != 0) {
				let type = (mask >> (i * 4)) - 1;
				stride += attr_sizes[type];
			} else {
				break;
			}
		}

		return stride * this.vertices.Size();
	}

	IndexBufferSize(): number {
		const size_of_ushort = 2;
		return this.triangles.Size() * size_of_ushort;
	}

	GetVertexBuffer(): VertexBuffer {
		return this.m_vertex_buffer;
	}

	GetIndexBuffer(): IndexBuffer {
		return this.m_index_buffer;
	}

	GetIndexRange(submesh_index: number, start: number[], count: number[]) {
		if(this.submeshes.Empty()) {
			start[0] = 0;
			count[0] = this.triangles.Size();
		} else {
			let submesh = this.submeshes.Get(submesh_index);

			start[0] = submesh.start;
			count[0] = submesh.count;
		}
	}

	private constructor() {
		super();

		this.SetName("Mesh");
	}

	vertices = new Vector<Vector3>();
	uv = new Vector<Vector2>();
	colors = new Vector<Color>();
	uv2 = new Vector<Vector2>();
	normals = new Vector<Vector3>();
	tangents = new Vector<Vector4>();
	bone_weights = new Vector<Vector4>();
	bone_indices = new Vector<Vector4>();

	triangles = new Vector<number>();
	submeshes = new Vector<Submesh>();
	bind_poses = new Vector<Matrix4x4>();

	private m_dynamic = false;
	private m_vertex_buffer: VertexBuffer;
	private m_index_buffer: IndexBuffer;
	private m_vertex_layout_mask = 0;
}