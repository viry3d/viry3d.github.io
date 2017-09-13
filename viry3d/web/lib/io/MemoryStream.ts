function utf8_array_to_string(array: Uint8Array): string {
	let out = "";
	let len = array.length;
	let i = 0;
	let char2 = 0;
	let char3 = 0;

	while(i < len) {
		let c = array[i++];
		switch(c >> 4) {
			case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
				// 0xxxxxxx
				out += String.fromCharCode(c);
				break;
			case 12: case 13:
				// 110x xxxx   10xx xxxx
				char2 = array[i++];
				out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
				break;
			case 14:
				// 1110 xxxx  10xx xxxx  10xx xxxx
				char2 = array[i++];
				char3 = array[i++];
				out += String.fromCharCode(((c & 0x0F) << 12) |
					((char2 & 0x3F) << 6) |
					((char3 & 0x3F) << 0));
				break;
		}
	}

	return out;
}

export class MemoryStream {
	constructor(buffer: ArrayBuffer, little_endian: boolean) {
		this.m_buffer = new DataView(buffer);
		this.m_size = buffer.byteLength;
		this.m_little_endian = little_endian;
	}

	ReadUint16(): number {
		let v = this.m_buffer.getUint16(this.m_position, this.m_little_endian);
		this.m_position += 2;
		return v;
	}

	ReadInt(): number {
		let v = this.m_buffer.getInt32(this.m_position, this.m_little_endian);
		this.m_position += 4;
		return v;
	}

	ReadUInt(): number {
		let v = this.m_buffer.getUint32(this.m_position, this.m_little_endian);
		this.m_position += 4;
		return v;
	}

	ReadFloat(): number {
		let v = this.m_buffer.getFloat32(this.m_position, this.m_little_endian);
		this.m_position += 4;
		return v;
	}

	ReadBool(): boolean {
		let v = this.m_buffer.getUint8(this.m_position);
		this.m_position += 1;
		return v != 0;
	}

	ReadByte(): number {
		let v = this.m_buffer.getUint8(this.m_position);
		this.m_position += 1;
		return v;
	}

	ReadBytes(size: number): Uint8Array {
		let v = new Uint8Array(this.m_buffer.buffer, this.m_position, size);
		this.m_position += size;
		return v;
	}

	ReadString(size: number): string {
		let v = utf8_array_to_string(new Uint8Array(this.m_buffer.buffer, this.m_position, size));
		this.m_position += size;
		return v;
	}

	SubStream(offset: number, size: number): MemoryStream {
		let stream = new MemoryStream(this.m_buffer.buffer, this.m_little_endian);
		stream.m_position = offset;
		stream.m_size = size;
		return stream;
	}

	GetSize(): number {
		return this.m_size;
	}

	GetSlice(): ArrayBuffer {
		return this.m_buffer.buffer.slice(this.m_position, this.m_position + this.m_size);
	}

	private m_buffer: DataView;
	private m_position = 0;
	private m_size = 0;
	private m_little_endian: boolean;
}