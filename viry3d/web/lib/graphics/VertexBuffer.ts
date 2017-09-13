import { BufferGL, BufferType } from "./BufferGL"

export class VertexBuffer extends BufferGL {
	static Create(size: number, dynamic = false): VertexBuffer {
		let buffer = new VertexBuffer();

		buffer.m_size = size;
		buffer.CreateInternal(BufferType.Vertex, dynamic);

		return buffer;
	}

	private constructor() {
		super();
	}
}