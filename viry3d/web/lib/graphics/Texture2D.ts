import { Texture, TextureWrapMode, TextureFilterMode } from "./Texture"
import { Graphics } from "./Graphics"

export enum TextureFormat {
	Alpha8,
	ARGB4444,
	RGB24,
	RGBA32,
	ARGB32,
	RGB565,
	DXT1,
	DXT5,
	RGBA4444,
	PVRTC_RGB2,
	PVRTC_RGBA2,
	PVRTC_RGB4,
	PVRTC_RGBA4,
	ETC_RGB4,
	ATC_RGB4,
	ATC_RGBA8,
	BGRA32,
	ATF_RGB_DXT1,
	ATF_RGBA_JPG,
	ATF_RGB_JPG,

	ETC_RGB4_X2,
	PVRTC_RGB4_X2,
}

export class Texture2D extends Texture {
	static LoadFromFile(file: string, finish: (texture: Texture2D) => void, format = TextureFormat.RGBA32, wrap_mode = TextureWrapMode.Clamp, filter_mode = TextureFilterMode.Bilinear, mipmap = false) {
		let img = new Image();
		img.src = file;

		img.onload = function() {
			let texture = Texture2D.Create(img.width, img.height, format, wrap_mode, filter_mode, mipmap, img);
			finish(texture);
		}
		img.onerror = function() {
			finish(null);

			console.error("Texture2D.LoadFromFile onerror");
		}
	}

	static Create(
		width: number,
		height: number,
		format: TextureFormat,
		wrap_mode: TextureWrapMode,
		filter_mode: TextureFilterMode,
		mipmap: boolean,
		colors: any): Texture2D {
		let gl = Graphics.GetDisplay().GetGL();

		let texture = new Texture2D();
		texture.width = width;
		texture.height = height;
		texture.format = format;
		texture.wrap_mode = wrap_mode;
		texture.filter_mode = filter_mode;
		texture.mipmap = mipmap;
		texture.m_colors = colors;

		let type = 0;
		let bpp = 0;
		let gl_internal_format = 0;
		let gl_format = 0;
		let ext: any = null;
		if(format == TextureFormat.RGBA32) {
			gl_internal_format = gl.RGBA;
			gl_format = gl.RGBA;
			type = gl.UNSIGNED_BYTE;
			bpp = 32;
		} else if(format == TextureFormat.RGB24) {
			gl_internal_format = gl.RGB;
			gl_format = gl.RGB;
			type = gl.UNSIGNED_BYTE;
			bpp = 24;
		} else if(format == TextureFormat.Alpha8) {
			gl_internal_format = gl.LUMINANCE;
			gl_format = gl.LUMINANCE;
			type = gl.UNSIGNED_BYTE;
			bpp = 8;
		} else if(format == TextureFormat.DXT1) {
			ext = (
				gl.getExtension("WEBGL_compressed_texture_s3tc") ||
				gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
				gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc")
			);

			gl_internal_format = ext.COMPRESSED_RGB_S3TC_DXT1_EXT;
			bpp = 4;
		} else if(format == TextureFormat.DXT5) {
			ext = (
				gl.getExtension("WEBGL_compressed_texture_s3tc") ||
				gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
				gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc")
			);

			gl_internal_format = ext.COMPRESSED_RGBA_S3TC_DXT5_EXT;
			bpp = 8;
		} else if(format == TextureFormat.ETC_RGB4 ||
			format == TextureFormat.ETC_RGB4_X2) {
			ext = gl.getExtension("WEBGL_compressed_texture_etc1");

			gl_internal_format = ext.COMPRESSED_RGB_ETC1_WEBGL;
			bpp = 4;
		} else if(format == TextureFormat.PVRTC_RGB4 ||
			format == TextureFormat.PVRTC_RGB4_X2) {
			ext = (
				gl.getExtension("WEBGL_compressed_texture_pvrtc") ||
				gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc")
			);

			gl_internal_format = ext.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
			bpp = 4;
		} else {
			console.error("texture format not implement");
		}

		texture.CreateTexture2D(texture.width, texture.height, gl_internal_format, gl_format, type, texture.m_colors, texture.mipmap, ext, bpp);
		texture.UpdateSampler(gl_internal_format, texture.wrap_mode, texture.filter_mode, texture.mipmap);

		return texture;
	}

	static GetDefaultTexture2D(): Texture2D {
		if(Texture2D.m_default == null) {
			let colors = new Uint8Array(16);
			for(let i = 0; i < colors.length; i++) {
				colors[i] = 255;
			}
			Texture2D.m_default = Texture2D.Create(2, 2, TextureFormat.RGBA32, TextureWrapMode.Clamp, TextureFilterMode.Point, false, colors);
		}

		return Texture2D.m_default;
	}

	GetColors(): any {
		return this.m_colors;
	}

	UpdateTexture(x: number, y: number, w: number, h: number, colors: Uint8Array) {
		this.UpdateTexture2D(x, y, w, h, colors);
	}

	private constructor() {
		super();

		this.SetName("Texture2D");
	}

	width = 0;
	height = 0;
	format: TextureFormat;
	wrap_mode = TextureWrapMode.Clamp;
	filter_mode = TextureFilterMode.Bilinear;
	mipmap = false;
	pvr_alpha: Texture2D;
	private static m_default: Texture2D;
	private m_colors: any;
}