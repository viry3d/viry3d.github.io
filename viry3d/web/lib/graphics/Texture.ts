import { VRObject } from "../Object"
import { Graphics } from "./Graphics"

export enum TextureWrapMode {
	Repeat = 0,
	Clamp = 1,
}

export enum TextureFilterMode {
	Point = 0,
	Bilinear = 1,
	Trilinear = 2,
}

export class Texture extends VRObject {
	GetWidth(): number {
		return this.m_width;
	}

	GetHeight(): number {
		return this.m_height;
	}

	GetTexture(): WebGLTexture {
		return this.m_texture;
	}

	protected constructor() {
		super();

		this.SetName("Texture");
	}

	protected CreateTexture2D(width: number, height: number, internal_format: number, format: number, type: number, pixels: any, mipmap: boolean, ext: any, bpp: number) {
		let gl = Graphics.GetDisplay().GetGL();

		this.m_width = width;
		this.m_height = height;
		this.m_internal_format = internal_format;
		this.m_format = format;
		this.m_type = type;

		this.m_texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.m_texture);

		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

		if(	pixels instanceof HTMLImageElement ||
			pixels instanceof HTMLCanvasElement ||
			pixels instanceof HTMLVideoElement) {
			gl.texImage2D(gl.TEXTURE_2D, 0, internal_format, format, type, pixels);
		} else if(ext != null) {
			let level_count = 1;
			if(mipmap) {
				let w = Math.max(width, height);
				while(w > 1) {
					w >>= 1;
					level_count++;
				}
			}

			let w = width;
			let h = height;
			let offset = 0;
			for(let i = 0; i < level_count; i++) {
				let size = 0;

				if( internal_format == ext.COMPRESSED_RGB_S3TC_DXT1_EXT ||
					internal_format == ext.COMPRESSED_RGBA_S3TC_DXT5_EXT) {
					let pitch = Math.max(1, Math.floor((w + 3) / 4)) * (2 * bpp);
					size = w * h * bpp / 8;
					if(size < pitch) {
						size = pitch;
					}
				} else if(internal_format == ext.COMPRESSED_RGB_ETC1_WEBGL) {
					let w_pad = w;
					let h_pad = h;
					if(w_pad % 4 != 0 || w_pad == 0) w_pad += 4 - w_pad % 4;
					if(h_pad % 4 != 0 || h_pad == 0) h_pad += 4 - h_pad % 4;
					size = w_pad * h_pad / 2;
					offset += 4;
				} else if(internal_format == ext.COMPRESSED_RGB_PVRTC_4BPPV1_IMG) {
					size = w * h / 2;
				}
				
				let data = new Uint8Array((<Uint8Array>pixels).buffer, (<Uint8Array>pixels).byteOffset + offset, size);

				gl.compressedTexImage2D(gl.TEXTURE_2D, i, internal_format, w, h, 0, data);

				offset += size;
				w >>= 1;
				h >>= 1;

				if(w == 0) w = 1;
				if(h == 0) h = 1;
			}
		} else {
			gl.texImage2D(gl.TEXTURE_2D, 0, internal_format, width, height, 0, format, type, pixels);
		}

		if(mipmap && ext == null) {
			gl.generateMipmap(gl.TEXTURE_2D);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	protected UpdateTexture2D(x: number, y: number, w: number, h: number, colors: Uint8Array) {
		let gl = Graphics.GetDisplay().GetGL();

		gl.bindTexture(gl.TEXTURE_2D, this.m_texture);
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, w, h, this.m_format, this.m_type, colors);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	protected UpdateSampler(internal_format: number, wrap_mode: TextureWrapMode, filter_mode: TextureFilterMode, mipmap: boolean) {
		let gl = Graphics.GetDisplay().GetGL();

		gl.bindTexture(gl.TEXTURE_2D, this.m_texture);

		let filter_min = 0;
		let filter_mag = 0;
		switch(filter_mode) {
		case TextureFilterMode.Point:
			if(mipmap) {
				filter_min = gl.NEAREST_MIPMAP_LINEAR;
			} else {
				filter_min = gl.NEAREST;
			}

			filter_mag = gl.NEAREST;
			break;
		case TextureFilterMode.Bilinear:
        case TextureFilterMode.Trilinear:
			if(mipmap) {
				filter_min = gl.LINEAR_MIPMAP_LINEAR;
			} else {
				filter_min = gl.LINEAR;
			}

			filter_mag = gl.LINEAR;
			break;
		}

		let address_mode = 0;
		switch(wrap_mode) {
			case TextureWrapMode.Repeat:
				address_mode = gl.REPEAT;
				break;
			case TextureWrapMode.Clamp:
				address_mode = gl.CLAMP_TO_EDGE;
				break;
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, address_mode);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, address_mode);

		if(	internal_format == gl.DEPTH_COMPONENT ||
			internal_format == gl.DEPTH_STENCIL) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter_mag);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter_min);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	protected m_width = 0;
	protected m_height = 0;
	protected m_wrap_mode = TextureWrapMode.Clamp;
	protected m_filter_mode = TextureFilterMode.Bilinear;
	protected m_texture: WebGLTexture;
	private m_internal_format: number;
	private m_format: number;
	private m_type: number;
}