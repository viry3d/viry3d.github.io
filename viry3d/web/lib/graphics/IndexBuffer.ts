import { BufferGL, BufferType } from "./BufferGL"

export enum IndexType {
	UnsignedShort,
	UnsignedInt
}

export class IndexBuffer extends BufferGL {
	static Create(size: number, dynamic = false): IndexBuffer {
		let buffer = new IndexBuffer();

		buffer.m_size = size;
		buffer.CreateInternal(BufferType.Index, dynamic);

		return buffer;
	}

	private constructor() {
		super();
	}
}