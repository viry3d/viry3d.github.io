import { Graphics } from "./Graphics"

export enum BufferType {
	None,
	Vertex,
	Index,
	Uniform,
	Image,
};

export type FillFunc = (param: any, buffer: DataView) => void;

export class BufferGL {
	Fill(param: any, fill: FillFunc) {
		let gl = Graphics.GetDisplay().GetGL();

		let buffer = new ArrayBuffer(this.m_size);
		fill(param, new DataView(buffer));

		gl.bindBuffer(this.m_type, this.m_buffer);

		if(this.m_usage == gl.DYNAMIC_DRAW) {
			gl.bufferSubData(this.m_type, 0, buffer);
		} else {
			gl.bufferData(this.m_type, buffer, this.m_usage);
		}

		gl.bindBuffer(this.m_type, null);
	}

	GetBuffer(): WebGLBuffer {
		return this.m_buffer;
	}

	GetSize(): number {
		return this.m_size;
	}

	protected CreateInternal(type: BufferType, dynamic = false) {
		let gl = Graphics.GetDisplay().GetGL();

		switch(type) {
			case BufferType.Vertex:
				this.m_type = gl.ARRAY_BUFFER;
				break;
			case BufferType.Index:
				this.m_type = gl.ELEMENT_ARRAY_BUFFER;
				break;
			default:
				this.m_type = 0;
				this.m_usage = 0;
				break;
		}

		if(dynamic) {
			this.m_usage = gl.DYNAMIC_DRAW;
		} else {
			this.m_usage = gl.STATIC_DRAW;
		}

		this.m_buffer = gl.createBuffer();

		if(this.m_usage == gl.DYNAMIC_DRAW) {
			gl.bindBuffer(this.m_type, this.m_buffer);
			gl.bufferData(this.m_type, this.m_size, this.m_usage);
			gl.bindBuffer(this.m_type, null);
		}
	}

	private m_buffer: WebGLBuffer;
	private m_type = 0;
	private m_usage = 0;
	protected m_size = 0;
}