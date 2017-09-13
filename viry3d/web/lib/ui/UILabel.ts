import { UIView } from "./UIView"
import { VRObject } from "../Object"
import { Component } from "../Component"
import { Vector } from "../container/Vector"
import { VRMap } from "../container/Map"
import { Vector2 } from "../math/Vector2"
import { Vector3 } from "../math/Vector3"
import { Color } from "../graphics/Color"
import { Mathf } from "../math/Mathf"
import { Material } from "../graphics/Material"
import { Texture2D, TextureFormat } from "../graphics/Texture2D"
import { TextureWrapMode, TextureFilterMode } from "../graphics/Texture"

const TEXTURE_SIZE_MAX = 2048;
const FONT_SIZE_MAX = 512;
var g_font_texture: Texture2D;
var g_glyphs = new VRMap<string, VRMap<string, VRMap<number, GlyphInfo>>>();
var g_texture_x = 0;
var g_texture_y = 0;
var g_texture_line_h_max = 0;
var g_font_context: CanvasRenderingContext2D;

export enum FontStyle {
	Normal,
	Bold,
	Italic,
	BoldAndItalic
}

export enum TextAlignment {
	UpperLeft,
	UpperCenter,
	UpperRight,
	MiddleLeft,
	MiddleCenter,
	MiddleRight,
	LowerLeft,
	LowerCenter,
	LowerRight
}

class LabelLine {
	width: number;
	height: number;
	vertices = new Vector<Vector2>();
	uv = new Vector<Vector2>();
	colors = new Vector<Color>();
	indices = new Vector<number>();
}

enum TagType {
	Color,
	Shadow,
	Outline,
	Underline,
	Bold,
	Italic
}

class TagInfo {
	tag: string;
	type: TagType;
	value: string;
	begin: number;
	end: number;
}

class GlyphInfo {
	c: string;
	size: number;
	glyph_index: number;
	uv_pixel_x: number;
	uv_pixel_y: number;
	uv_pixel_w: number;
	uv_pixel_h: number;
	bearing_x: number;
	bearing_y: number;
	advance_x: number;
	advance_y: number;
	bold: boolean;
	italic: boolean;
}

function check_tag_begin(p_str: string[], p_char_index: number[], tag_str: string, value_length: number, tag: TagInfo): boolean {
	let match = true;
	let str = p_str[0];
	let char_index = p_char_index[0];

	for(let i = 0; i < tag_str.length; i++) {
		if(tag_str[i] != str[char_index + i]) {
			match = false;
			break;
		}
	}

	if(match) {
		if(value_length > 0) {
			let value = str.substr(char_index + tag_str.length, value_length);

			tag.tag = tag_str.substr(1, tag_str.length - 3);
			tag.value = value;

			str = str.substr(0, char_index) + str.substr(char_index + tag_str.length + value_length + 1);
		} else {
			tag.tag = tag_str.substr(1, tag_str.length - 2);

			str = str.substr(0, char_index) + str.substr(char_index + tag_str.length);
		}

		tag.begin = char_index--;
	}

	p_str[0] = str;
	p_char_index[0] = char_index;

	return match;
}

function check_tag_end(p_str: string[], p_char_index: number[], tag_str: string, tag_find: Vector<TagInfo>, tags: Vector<TagInfo>) {
	let match = true;
	let str = p_str[0];
	let char_index = p_char_index[0];

	for(let i = 0; i < tag_str.length; i++) {
		if(tag_str[i] != str[char_index + i]) {
			match = false;
			break;
		}
	}

	if(match) {
		let tag = tag_str.substr(2, tag_str.length - 3);

		for(let i = tag_find.Size() - 1; i >= 0; i--) {
			let t = tag_find.Get(i);

			if(t.tag == tag) {
				str = str.substr(0, char_index) + str.substr(char_index + tag_str.length);
				t.end = char_index--;
				tags.Add(t);
				tag_find.Remove(i);
				break;
			}
		}
	}

	p_str[0] = str;
	p_char_index[0] = char_index;

	return match;
}

function parse_rich_tags(p_str: string[]): Vector<TagInfo> {
	let tags = new Vector<TagInfo>();
	let tag_find = new Vector<TagInfo>();

	for(let i = 0; i < p_str[0].length; i++) {
		let tag = new TagInfo();
		let p_i = [i];

		if(check_tag_begin(p_str, p_i, "<color=#", 8, tag)) {
			tag.type = TagType.Color;
			tag_find.Add(tag);
		} else if(check_tag_end(p_str, p_i, "</color>", tag_find, tags)) {
		} else if(check_tag_begin(p_str, p_i, "<shadow>", 0, tag)) {
			tag.type = TagType.Shadow;
			tag.value = "000000ff";
			tag_find.Add(tag);
		} else if(check_tag_begin(p_str, p_i, "<shadow=#", 8, tag)) {
			tag.type = TagType.Shadow;
			tag_find.Add(tag);
		} else if(check_tag_end(p_str, p_i, "</shadow>", tag_find, tags)) {
		} else if(check_tag_begin(p_str, p_i, "<outline>", 0, tag)) {
			tag.type = TagType.Outline;
			tag.value = "000000ff";
			tag_find.Add(tag);
		} else if(check_tag_begin(p_str, p_i, "<outline=#", 8, tag)) {
			tag.type = TagType.Outline;
			tag_find.Add(tag);
		} else if(check_tag_end(p_str, p_i, "</outline>", tag_find, tags)) {
		} else if(check_tag_begin(p_str, p_i, "<underline>", 0, tag)) {
			tag.type = TagType.Underline;
			tag_find.Add(tag);
		} else if(check_tag_end(p_str, p_i, "</underline>", tag_find, tags)) {
		} else if(check_tag_begin(p_str, p_i, "<bold>", 0, tag)) {
			tag.type = TagType.Bold;
			tag_find.Add(tag);
		} else if(check_tag_end(p_str, p_i, "</bold>", tag_find, tags)) {
		} else if(check_tag_begin(p_str, p_i, "<italic>", 0, tag)) {
			tag.type = TagType.Italic;
			tag_find.Add(tag);
		} else if(check_tag_end(p_str, p_i, "</italic>", tag_find, tags)) {
		}

		i = p_i[0];
	}

	return tags;
}

function string_to_color(str: string): Color {
	str = str.toLowerCase();

	let uint = new Uint32Array(1);
	uint[0] = parseInt(str, 16);
	let uint8 = new Uint8Array(uint.buffer);
	
	let r = uint8[3];
	let g = uint8[2];
	let b = uint8[1];
	let a = uint8[0];

	let div = 1.0 / 255;
	return new Color(r * div, g * div, b * div, a * div);
}

function get_char_image(font: string, c: string, size: number, bold: boolean, italic: boolean, width: number[]): Uint8Array {
	if(g_font_context == null) {
		let canvas = document.createElement("canvas");
		canvas.width = FONT_SIZE_MAX;
		canvas.height = FONT_SIZE_MAX;
		g_font_context = canvas.getContext("2d");
	}
	
	if(size > FONT_SIZE_MAX) {
		console.error("font size over than max");
		return null;
	}

	let style = italic ? "italic" : "normal";
	let weight = bold ? "bold" : "normal";

	font += ', "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';

	g_font_context.font = style + " normal " + weight + " " + size + "px" + " " + font;
	g_font_context.textBaseline = "bottom";
	let w = g_font_context.measureText(c).width;
	w = Math.ceil(w);
	let h = size;
	g_font_context.fillStyle = "rgba(0, 0, 0, 1)";
	g_font_context.fillRect(0, 0, w, h);
	g_font_context.fillStyle = "rgba(255, 255, 255, 1)";
	g_font_context.fillText(c, 0, h);

	width[0] = w;

	let image = new Uint8Array(w * h);

	let data = g_font_context.getImageData(0, 0, w, h);
	for(let y = 0; y < h; y++) {
		for(let x = 0; x < w; x++) {
			image[y * w + x] = data.data[y * w * 4 + x * 4];
		}
	}

	return image;
}

function get_glyph(font: string, c: string, size: number, bold: boolean, italic: boolean): GlyphInfo {
	if(g_font_texture == null) {
		let buffer = new Uint8Array(TEXTURE_SIZE_MAX * TEXTURE_SIZE_MAX);
		for(let i = 0; i < buffer.length; i++) {
			buffer[i] = 0;
		}
		g_font_texture = Texture2D.Create(TEXTURE_SIZE_MAX, TEXTURE_SIZE_MAX, TextureFormat.Alpha8, TextureWrapMode.Clamp, TextureFilterMode.Point, false, buffer);
	}

	let size_key = size | (bold ? (1 << 24) : 0) | (italic ? (1 << 16) : 0);

	let p_font_glyphs = [<VRMap<string, VRMap<number, GlyphInfo>>>null];
	if(!g_glyphs.TryGet(font, p_font_glyphs)) {
		p_font_glyphs[0] = new VRMap<string, VRMap<number, GlyphInfo>>();
		g_glyphs.Add(font, p_font_glyphs[0]);
	}
	
	let p_size_glyphs = [<VRMap<number, GlyphInfo>>null];
	if(!p_font_glyphs[0].TryGet(c, p_size_glyphs)) {
		p_size_glyphs[0] = new VRMap<number, GlyphInfo>();
		p_font_glyphs[0].Add(c, p_size_glyphs[0]);
	}

	let p_glyph = [<GlyphInfo>null];
	if(!p_size_glyphs[0].TryGet(size_key, p_glyph)) {
		p_glyph[0] = new GlyphInfo();
		p_size_glyphs[0].Add(size_key, p_glyph[0]);
	} else {
		return p_glyph[0];
	}

	let info = p_glyph[0];
	info.c = c;
	info.size = size;
	info.bold = bold;
	info.italic = italic;

	info.glyph_index = 0;
	info.bearing_x = 0;
	info.bearing_y = size * 0.9;
	info.advance_y = 0;

	let w = [0];
	let char_pixels = get_char_image(font, c, size, bold, italic, w);
	info.uv_pixel_w = w[0];
	info.uv_pixel_h = size;
	info.advance_x = info.uv_pixel_w;

	if(g_texture_y + info.uv_pixel_h <= TEXTURE_SIZE_MAX) {
		let colors = <Uint8Array>g_font_texture.GetColors();

		//insert one white pixel for underline
		if(g_texture_x == 0 && g_texture_y == 0) {
			let buffer = new Uint8Array(1);
			buffer[0] = 0xff;
			colors[0] = 0xff;
			g_font_texture.UpdateTexture(0, 0, 1, 1, buffer);
			g_texture_x += 1;
		}

		if(g_texture_x + info.uv_pixel_w > TEXTURE_SIZE_MAX) {
			g_texture_y += g_texture_line_h_max;
			g_texture_x = 0;
			g_texture_line_h_max = 0;
		}

		if(g_texture_line_h_max < info.uv_pixel_h) {
			g_texture_line_h_max = info.uv_pixel_h;
		}

		for(let i = 0; i < info.uv_pixel_h; i++) {
			for(let j = 0; j < info.uv_pixel_w; j++) {
				colors[TEXTURE_SIZE_MAX * (g_texture_y + i) + g_texture_x + j] = char_pixels[info.uv_pixel_w * i + j];
			}
		}

		if(info.uv_pixel_w > 0 && info.uv_pixel_h > 0) {
			g_font_texture.UpdateTexture(g_texture_x, g_texture_y, info.uv_pixel_w, info.uv_pixel_h, char_pixels);
		}

		info.uv_pixel_x = g_texture_x;
		info.uv_pixel_y = g_texture_y;

		g_texture_x += info.uv_pixel_w;
	} else {
		console.error("font texture size over than 2048");
	}

	return info;
}

export class UILabel extends UIView {
	static ClassName(): string {
		return "UILabel";
	}

	GetTypeName(): string {
		return UILabel.ClassName();
	}

	static RegisterComponent() {
		UILabel.m_class_names = UIView.m_class_names.slice(0);
		UILabel.m_class_names.push("UILabel");

		Component.Register(UILabel.ClassName(), () => {
			return new UILabel();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return UILabel.m_class_names;
	}

	DeepCopy(source: VRObject) {
		super.DeepCopy(source);

		let src = <UILabel>source;
		this.m_font = src.m_font;
		this.m_font_style = src.m_font_style;
		this.m_font_size = src.m_font_size;
		this.m_text = src.m_text;
		this.m_line_space = src.m_line_space;
		this.m_rich = src.m_rich;
		this.m_alignment = src.m_alignment;
	}

	SetFont(font: string) {
		if(this.m_font != font) {
			this.m_font = font;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetFontStyle(font_style: FontStyle) {
		if(this.m_font_style != font_style) {
			this.m_font_style = font_style;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetFontSize(font_size: number) {
		if(this.m_font_size != font_size) {
			this.m_font_size = font_size;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetText(text: string) {
		if(this.m_text != text) {
			this.m_text = text;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetLineSpace(line_space: number) {
		if(this.m_line_space != line_space) {
			this.m_line_space = line_space;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetRich(rich: boolean) {
		if(this.m_rich != rich) {
			this.m_rich = rich;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetAlignment(alignment: TextAlignment) {
		if(this.m_alignment != alignment) {
			this.m_alignment = alignment;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	ProcessText(actual_width: number[], actual_height: number[]): Vector<LabelLine> {
		let lines = new Vector<LabelLine>();

		let chars = this.m_text;
		let p_chars = [chars];

		let tags = new Vector<TagInfo>();
		if(this.m_rich) {
			tags = parse_rich_tags(p_chars);
			chars = p_chars[0];
		}

		let label_size = this.rect.GetSize();
		let v_size = 1.0 / TEXTURE_SIZE_MAX;
		let vertex_count = 0;
		let pen_x = 0;
		let pen_y = 0;
		let x_max = 0;
		let y_min = 0;
		let y_max = -65536;
		let line_x_max = 0;
		let line_y_min = 0;
		let line = new LabelLine();

		for(let i = 0; i < chars.length; i++) {
			let c = chars[i];

			let font_size = this.m_font_size;
			let color = this.m_color;
			let bold = this.m_font_style == FontStyle.Bold || this.m_font_style == FontStyle.BoldAndItalic;
			let italic = this.m_font_style == FontStyle.Italic || this.m_font_style == FontStyle.BoldAndItalic;
			let color_shadow: Color;
			let color_outline: Color;
			let underline = false;

			if(c == '\n') {
				line.width = line_x_max;
				line.height = pen_y - line_y_min;
				line_x_max = 0;
				line_y_min = 0;
				pen_x = 0;
				pen_y += -(font_size + this.m_line_space);

				lines.Add(line);
				line = new LabelLine();

				continue;
			}

			if(this.m_rich) {
				tags.ForEach((j) => {
					if(i >= j.begin && i < j.end) {
						switch(j.type) {
							case TagType.Color:
								color = string_to_color(j.value);
								break;
							case TagType.Bold:
								bold = true;
								break;
							case TagType.Italic:
								italic = true;
								break;
							case TagType.Shadow:
								color_shadow = string_to_color(j.value);
								break;
							case TagType.Outline:
								color_outline = string_to_color(j.value);
								break;
							case TagType.Underline:
								underline = true;
								break;
						}
					}

					return true;
				});
			}

			let info = get_glyph(this.m_font, c, font_size, bold, italic);

			//	limit width
			if(pen_x + info.bearing_x + info.uv_pixel_w > label_size.x) {
				pen_x = 0;
				pen_y += -(font_size + this.m_line_space);
			}

			let base_info = get_glyph(this.m_font, 'A', font_size, bold, italic);
			let base_y0 = base_info.bearing_y;
			let base_y1 = base_info.bearing_y - base_info.uv_pixel_h;
			let baseline = Mathf.RoundToInt(base_y0 + (font_size - base_y0 + base_y1) * 0.5);

			let x0 = pen_x + info.bearing_x;
			let y0 = pen_y + info.bearing_y - baseline;
			let x1 = x0 + info.uv_pixel_w;
			let y1 = y0 - info.uv_pixel_h;

			if(x_max < x1) {
				x_max = x1;
			}
			if(y_min > y1) {
				y_min = y1;
			}
			if(y_max < y0) {
				y_max = y0;
			}

			if(line_x_max < x1) {
				line_x_max = x1;
			}
			if(line_y_min > y1) {
				line_y_min = y1;
			}

			let char_space = 0;
			pen_x += info.advance_x + char_space;

			let uv_x0 = info.uv_pixel_x;
			let uv_y0 = info.uv_pixel_y;
			let uv_x1 = uv_x0 + info.uv_pixel_w;
			let uv_y1 = uv_y0 + info.uv_pixel_h;

			if(color_shadow) {
				let offset = new Vector2(1, -1);

				line.vertices.Add(new Vector2(x0, y0).Add(offset));
				line.vertices.Add(new Vector2(x0, y1).Add(offset));
				line.vertices.Add(new Vector2(x1, y1).Add(offset));
				line.vertices.Add(new Vector2(x1, y0).Add(offset));
				line.uv.Add(new Vector2(uv_x0 * v_size, uv_y0 * v_size));
				line.uv.Add(new Vector2(uv_x0 * v_size, uv_y1 * v_size));
				line.uv.Add(new Vector2(uv_x1 * v_size, uv_y1 * v_size));
				line.uv.Add(new Vector2(uv_x1 * v_size, uv_y0 * v_size));
				line.colors.Add(color_shadow);
				line.colors.Add(color_shadow);
				line.colors.Add(color_shadow);
				line.colors.Add(color_shadow);
				line.indices.Add(vertex_count + 0);
				line.indices.Add(vertex_count + 1);
				line.indices.Add(vertex_count + 2);
				line.indices.Add(vertex_count + 0);
				line.indices.Add(vertex_count + 2);
				line.indices.Add(vertex_count + 3);

				vertex_count += 4;
			}

			if(color_outline) {
				let offsets = new Array<Vector2>(4);
				offsets[0] = new Vector2(-1, 1);
				offsets[1] = new Vector2(-1, -1);
				offsets[2] = new Vector2(1, -1);
				offsets[3] = new Vector2(1, 1);

				for(let j = 0; j < 4; j++) {
					line.vertices.Add(new Vector2(x0, y0).Add(offsets[j]));
					line.vertices.Add(new Vector2(x0, y1).Add(offsets[j]));
					line.vertices.Add(new Vector2(x1, y1).Add(offsets[j]));
					line.vertices.Add(new Vector2(x1, y0).Add(offsets[j]));
					line.uv.Add(new Vector2(uv_x0 * v_size, uv_y0 * v_size));
					line.uv.Add(new Vector2(uv_x0 * v_size, uv_y1 * v_size));
					line.uv.Add(new Vector2(uv_x1 * v_size, uv_y1 * v_size));
					line.uv.Add(new Vector2(uv_x1 * v_size, uv_y0 * v_size));
					line.colors.Add(color_outline);
					line.colors.Add(color_outline);
					line.colors.Add(color_outline);
					line.colors.Add(color_outline);
					line.indices.Add(vertex_count + 0);
					line.indices.Add(vertex_count + 1);
					line.indices.Add(vertex_count + 2);
					line.indices.Add(vertex_count + 0);
					line.indices.Add(vertex_count + 2);
					line.indices.Add(vertex_count + 3);

					vertex_count += 4;
				}
			}

			line.vertices.Add(new Vector2(x0, y0));
			line.vertices.Add(new Vector2(x0, y1));
			line.vertices.Add(new Vector2(x1, y1));
			line.vertices.Add(new Vector2(x1, y0));
			line.uv.Add(new Vector2(uv_x0 * v_size, uv_y0 * v_size));
			line.uv.Add(new Vector2(uv_x0 * v_size, uv_y1 * v_size));
			line.uv.Add(new Vector2(uv_x1 * v_size, uv_y1 * v_size));
			line.uv.Add(new Vector2(uv_x1 * v_size, uv_y0 * v_size));
			line.colors.Add(color);
			line.colors.Add(color);
			line.colors.Add(color);
			line.colors.Add(color);
			line.indices.Add(vertex_count + 0);
			line.indices.Add(vertex_count + 1);
			line.indices.Add(vertex_count + 2);
			line.indices.Add(vertex_count + 0);
			line.indices.Add(vertex_count + 2);
			line.indices.Add(vertex_count + 3);

			vertex_count += 4;

			if(underline) {
				let ux0 = pen_x - (info.advance_x + char_space);
				let uy0 = pen_y - baseline - 2;
				let ux1 = ux0 + info.advance_x + char_space;
				let uy1 = uy0 - 1;

				line.vertices.Add(new Vector2(ux0, uy0));
				line.vertices.Add(new Vector2(ux0, uy1));
				line.vertices.Add(new Vector2(ux1, uy1));
				line.vertices.Add(new Vector2(ux1, uy0));
				line.uv.Add(new Vector2(0 * v_size, 0 * v_size));
				line.uv.Add(new Vector2(0 * v_size, 1 * v_size));
				line.uv.Add(new Vector2(1 * v_size, 1 * v_size));
				line.uv.Add(new Vector2(1 * v_size, 0 * v_size));
				line.colors.Add(color);
				line.colors.Add(color);
				line.colors.Add(color);
				line.colors.Add(color);
				line.indices.Add(vertex_count + 0);
				line.indices.Add(vertex_count + 1);
				line.indices.Add(vertex_count + 2);
				line.indices.Add(vertex_count + 0);
				line.indices.Add(vertex_count + 2);
				line.indices.Add(vertex_count + 3);

				vertex_count += 4;
			}
		}

		//	最后一行
		if(!line.vertices.Empty()) {
			line.width = line_x_max;
			line.height = pen_y - line_y_min;

			lines.Add(line);
		}

		actual_width[0] = x_max;
		actual_height[0] = -y_min;

		return lines;
	}

	FillVertices(vertices: Vector<Vector3>, uv: Vector<Vector2>, colors: Vector<Color>, indices: Vector<number>) {
		if(!this.m_font) {
			return;
		}

		let size = this.rect.GetSize();
		let min = new Vector2(-this.rect.pivot.x * size.x, -this.rect.pivot.y * size.y);
		let max = new Vector2((1 - this.rect.pivot.x) * size.x, (1 - this.rect.pivot.y) * size.y);

		let actual_width = [0];
		let actual_height = [0];
		let lines = this.ProcessText(actual_width, actual_height);

		let mat = this.GetVertexMatrix();
		let index_begin = vertices.Size();

		for(let i = 0; i < lines.Size(); i++) {
			let line = lines.Get(i);

			for(let j = 0; j < line.vertices.Size(); j++) {
				let v = line.vertices.Get(j);

				switch(this.m_alignment) {
					case TextAlignment.UpperLeft:
					case TextAlignment.MiddleLeft:
					case TextAlignment.LowerLeft:
						v.x += min.x;
						break;
					case TextAlignment.UpperCenter:
					case TextAlignment.MiddleCenter:
					case TextAlignment.LowerCenter:
						v.x += min.x + (size.x - line.width) / 2;
						break;
					case TextAlignment.UpperRight:
					case TextAlignment.MiddleRight:
					case TextAlignment.LowerRight:
						v.x += min.x + (size.x - line.width);
						break;
				}

				switch(this.m_alignment) {
					case TextAlignment.UpperLeft:
					case TextAlignment.UpperCenter:
					case TextAlignment.UpperRight:
						v.y += max.y;
						break;
					case TextAlignment.MiddleLeft:
					case TextAlignment.MiddleCenter:
					case TextAlignment.MiddleRight:
						v.y += max.y - (size.y - actual_height[0]) / 2;
						break;
					case TextAlignment.LowerLeft:
					case TextAlignment.LowerCenter:
					case TextAlignment.LowerRight:
						v.y += max.y - (size.y - actual_height[0]);
						break;
				}

				v.x = Math.floor(v.x);
				v.y = Math.floor(v.y);

				vertices.Add(mat.MultiplyPoint3x4(new Vector3(v.x, v.y, 0)));
			}

			if(!line.vertices.Empty()) {
				uv.AddRange(line.uv.toArray());
				colors.AddRange(line.colors.toArray());
			}

			for(let j = 0; j < line.indices.Size(); j++) {
				indices.Add(line.indices.Get(j) + index_begin);
			}
		}
	}

	FillMaterial(mat: Material) {
		if(this.m_font) {
			mat.SetMainTexture(g_font_texture);
		}
	}

	private constructor() {
		super();
	}

	private m_font: string;
	private m_font_style = FontStyle.Normal;
	private m_font_size = 20;
	private m_text = "";
	private m_line_space = 1;
	private m_rich = false;
	private m_alignment = TextAlignment.UpperLeft;
}