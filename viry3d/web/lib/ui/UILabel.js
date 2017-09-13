var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./UIView", "../Component", "../container/Vector", "../container/Map", "../math/Vector2", "../math/Vector3", "../graphics/Color", "../math/Mathf", "../graphics/Texture2D", "../graphics/Texture"], function (require, exports, UIView_1, Component_1, Vector_1, Map_1, Vector2_1, Vector3_1, Color_1, Mathf_1, Texture2D_1, Texture_1) {
    "use strict";
    var TEXTURE_SIZE_MAX = 2048;
    var FONT_SIZE_MAX = 512;
    var g_font_texture;
    var g_glyphs = new Map_1.VRMap();
    var g_texture_x = 0;
    var g_texture_y = 0;
    var g_texture_line_h_max = 0;
    var g_font_context;
    (function (FontStyle) {
        FontStyle[FontStyle["Normal"] = 0] = "Normal";
        FontStyle[FontStyle["Bold"] = 1] = "Bold";
        FontStyle[FontStyle["Italic"] = 2] = "Italic";
        FontStyle[FontStyle["BoldAndItalic"] = 3] = "BoldAndItalic";
    })(exports.FontStyle || (exports.FontStyle = {}));
    var FontStyle = exports.FontStyle;
    (function (TextAlignment) {
        TextAlignment[TextAlignment["UpperLeft"] = 0] = "UpperLeft";
        TextAlignment[TextAlignment["UpperCenter"] = 1] = "UpperCenter";
        TextAlignment[TextAlignment["UpperRight"] = 2] = "UpperRight";
        TextAlignment[TextAlignment["MiddleLeft"] = 3] = "MiddleLeft";
        TextAlignment[TextAlignment["MiddleCenter"] = 4] = "MiddleCenter";
        TextAlignment[TextAlignment["MiddleRight"] = 5] = "MiddleRight";
        TextAlignment[TextAlignment["LowerLeft"] = 6] = "LowerLeft";
        TextAlignment[TextAlignment["LowerCenter"] = 7] = "LowerCenter";
        TextAlignment[TextAlignment["LowerRight"] = 8] = "LowerRight";
    })(exports.TextAlignment || (exports.TextAlignment = {}));
    var TextAlignment = exports.TextAlignment;
    var LabelLine = (function () {
        function LabelLine() {
            this.vertices = new Vector_1.Vector();
            this.uv = new Vector_1.Vector();
            this.colors = new Vector_1.Vector();
            this.indices = new Vector_1.Vector();
        }
        return LabelLine;
    }());
    var TagType;
    (function (TagType) {
        TagType[TagType["Color"] = 0] = "Color";
        TagType[TagType["Shadow"] = 1] = "Shadow";
        TagType[TagType["Outline"] = 2] = "Outline";
        TagType[TagType["Underline"] = 3] = "Underline";
        TagType[TagType["Bold"] = 4] = "Bold";
        TagType[TagType["Italic"] = 5] = "Italic";
    })(TagType || (TagType = {}));
    var TagInfo = (function () {
        function TagInfo() {
        }
        return TagInfo;
    }());
    var GlyphInfo = (function () {
        function GlyphInfo() {
        }
        return GlyphInfo;
    }());
    function check_tag_begin(p_str, p_char_index, tag_str, value_length, tag) {
        var match = true;
        var str = p_str[0];
        var char_index = p_char_index[0];
        for (var i = 0; i < tag_str.length; i++) {
            if (tag_str[i] != str[char_index + i]) {
                match = false;
                break;
            }
        }
        if (match) {
            if (value_length > 0) {
                var value = str.substr(char_index + tag_str.length, value_length);
                tag.tag = tag_str.substr(1, tag_str.length - 3);
                tag.value = value;
                str = str.substr(0, char_index) + str.substr(char_index + tag_str.length + value_length + 1);
            }
            else {
                tag.tag = tag_str.substr(1, tag_str.length - 2);
                str = str.substr(0, char_index) + str.substr(char_index + tag_str.length);
            }
            tag.begin = char_index--;
        }
        p_str[0] = str;
        p_char_index[0] = char_index;
        return match;
    }
    function check_tag_end(p_str, p_char_index, tag_str, tag_find, tags) {
        var match = true;
        var str = p_str[0];
        var char_index = p_char_index[0];
        for (var i = 0; i < tag_str.length; i++) {
            if (tag_str[i] != str[char_index + i]) {
                match = false;
                break;
            }
        }
        if (match) {
            var tag = tag_str.substr(2, tag_str.length - 3);
            for (var i = tag_find.Size() - 1; i >= 0; i--) {
                var t = tag_find.Get(i);
                if (t.tag == tag) {
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
    function parse_rich_tags(p_str) {
        var tags = new Vector_1.Vector();
        var tag_find = new Vector_1.Vector();
        for (var i = 0; i < p_str[0].length; i++) {
            var tag = new TagInfo();
            var p_i = [i];
            if (check_tag_begin(p_str, p_i, "<color=#", 8, tag)) {
                tag.type = TagType.Color;
                tag_find.Add(tag);
            }
            else if (check_tag_end(p_str, p_i, "</color>", tag_find, tags)) {
            }
            else if (check_tag_begin(p_str, p_i, "<shadow>", 0, tag)) {
                tag.type = TagType.Shadow;
                tag.value = "000000ff";
                tag_find.Add(tag);
            }
            else if (check_tag_begin(p_str, p_i, "<shadow=#", 8, tag)) {
                tag.type = TagType.Shadow;
                tag_find.Add(tag);
            }
            else if (check_tag_end(p_str, p_i, "</shadow>", tag_find, tags)) {
            }
            else if (check_tag_begin(p_str, p_i, "<outline>", 0, tag)) {
                tag.type = TagType.Outline;
                tag.value = "000000ff";
                tag_find.Add(tag);
            }
            else if (check_tag_begin(p_str, p_i, "<outline=#", 8, tag)) {
                tag.type = TagType.Outline;
                tag_find.Add(tag);
            }
            else if (check_tag_end(p_str, p_i, "</outline>", tag_find, tags)) {
            }
            else if (check_tag_begin(p_str, p_i, "<underline>", 0, tag)) {
                tag.type = TagType.Underline;
                tag_find.Add(tag);
            }
            else if (check_tag_end(p_str, p_i, "</underline>", tag_find, tags)) {
            }
            else if (check_tag_begin(p_str, p_i, "<bold>", 0, tag)) {
                tag.type = TagType.Bold;
                tag_find.Add(tag);
            }
            else if (check_tag_end(p_str, p_i, "</bold>", tag_find, tags)) {
            }
            else if (check_tag_begin(p_str, p_i, "<italic>", 0, tag)) {
                tag.type = TagType.Italic;
                tag_find.Add(tag);
            }
            else if (check_tag_end(p_str, p_i, "</italic>", tag_find, tags)) {
            }
            i = p_i[0];
        }
        return tags;
    }
    function string_to_color(str) {
        str = str.toLowerCase();
        var uint = new Uint32Array(1);
        uint[0] = parseInt(str, 16);
        var uint8 = new Uint8Array(uint.buffer);
        var r = uint8[3];
        var g = uint8[2];
        var b = uint8[1];
        var a = uint8[0];
        var div = 1.0 / 255;
        return new Color_1.Color(r * div, g * div, b * div, a * div);
    }
    function get_char_image(font, c, size, bold, italic, width) {
        if (g_font_context == null) {
            var canvas = document.createElement("canvas");
            canvas.width = FONT_SIZE_MAX;
            canvas.height = FONT_SIZE_MAX;
            g_font_context = canvas.getContext("2d");
        }
        if (size > FONT_SIZE_MAX) {
            console.error("font size over than max");
            return null;
        }
        var style = italic ? "italic" : "normal";
        var weight = bold ? "bold" : "normal";
        font += ', "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
        g_font_context.font = style + " normal " + weight + " " + size + "px" + " " + font;
        g_font_context.textBaseline = "bottom";
        var w = g_font_context.measureText(c).width;
        w = Math.ceil(w);
        var h = size;
        g_font_context.fillStyle = "rgba(0, 0, 0, 1)";
        g_font_context.fillRect(0, 0, w, h);
        g_font_context.fillStyle = "rgba(255, 255, 255, 1)";
        g_font_context.fillText(c, 0, h);
        width[0] = w;
        var image = new Uint8Array(w * h);
        var data = g_font_context.getImageData(0, 0, w, h);
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                image[y * w + x] = data.data[y * w * 4 + x * 4];
            }
        }
        return image;
    }
    function get_glyph(font, c, size, bold, italic) {
        if (g_font_texture == null) {
            var buffer = new Uint8Array(TEXTURE_SIZE_MAX * TEXTURE_SIZE_MAX);
            for (var i = 0; i < buffer.length; i++) {
                buffer[i] = 0;
            }
            g_font_texture = Texture2D_1.Texture2D.Create(TEXTURE_SIZE_MAX, TEXTURE_SIZE_MAX, Texture2D_1.TextureFormat.Alpha8, Texture_1.TextureWrapMode.Clamp, Texture_1.TextureFilterMode.Point, false, buffer);
        }
        var size_key = size | (bold ? (1 << 24) : 0) | (italic ? (1 << 16) : 0);
        var p_font_glyphs = [null];
        if (!g_glyphs.TryGet(font, p_font_glyphs)) {
            p_font_glyphs[0] = new Map_1.VRMap();
            g_glyphs.Add(font, p_font_glyphs[0]);
        }
        var p_size_glyphs = [null];
        if (!p_font_glyphs[0].TryGet(c, p_size_glyphs)) {
            p_size_glyphs[0] = new Map_1.VRMap();
            p_font_glyphs[0].Add(c, p_size_glyphs[0]);
        }
        var p_glyph = [null];
        if (!p_size_glyphs[0].TryGet(size_key, p_glyph)) {
            p_glyph[0] = new GlyphInfo();
            p_size_glyphs[0].Add(size_key, p_glyph[0]);
        }
        else {
            return p_glyph[0];
        }
        var info = p_glyph[0];
        info.c = c;
        info.size = size;
        info.bold = bold;
        info.italic = italic;
        info.glyph_index = 0;
        info.bearing_x = 0;
        info.bearing_y = size * 0.9;
        info.advance_y = 0;
        var w = [0];
        var char_pixels = get_char_image(font, c, size, bold, italic, w);
        info.uv_pixel_w = w[0];
        info.uv_pixel_h = size;
        info.advance_x = info.uv_pixel_w;
        if (g_texture_y + info.uv_pixel_h <= TEXTURE_SIZE_MAX) {
            var colors = g_font_texture.GetColors();
            //insert one white pixel for underline
            if (g_texture_x == 0 && g_texture_y == 0) {
                var buffer = new Uint8Array(1);
                buffer[0] = 0xff;
                colors[0] = 0xff;
                g_font_texture.UpdateTexture(0, 0, 1, 1, buffer);
                g_texture_x += 1;
            }
            if (g_texture_x + info.uv_pixel_w > TEXTURE_SIZE_MAX) {
                g_texture_y += g_texture_line_h_max;
                g_texture_x = 0;
                g_texture_line_h_max = 0;
            }
            if (g_texture_line_h_max < info.uv_pixel_h) {
                g_texture_line_h_max = info.uv_pixel_h;
            }
            for (var i = 0; i < info.uv_pixel_h; i++) {
                for (var j = 0; j < info.uv_pixel_w; j++) {
                    colors[TEXTURE_SIZE_MAX * (g_texture_y + i) + g_texture_x + j] = char_pixels[info.uv_pixel_w * i + j];
                }
            }
            if (info.uv_pixel_w > 0 && info.uv_pixel_h > 0) {
                g_font_texture.UpdateTexture(g_texture_x, g_texture_y, info.uv_pixel_w, info.uv_pixel_h, char_pixels);
            }
            info.uv_pixel_x = g_texture_x;
            info.uv_pixel_y = g_texture_y;
            g_texture_x += info.uv_pixel_w;
        }
        else {
            console.error("font texture size over than 2048");
        }
        return info;
    }
    var UILabel = (function (_super) {
        __extends(UILabel, _super);
        function UILabel() {
            _super.call(this);
            this.m_font_style = FontStyle.Normal;
            this.m_font_size = 20;
            this.m_text = "";
            this.m_line_space = 1;
            this.m_rich = false;
            this.m_alignment = TextAlignment.UpperLeft;
        }
        UILabel.ClassName = function () {
            return "UILabel";
        };
        UILabel.prototype.GetTypeName = function () {
            return UILabel.ClassName();
        };
        UILabel.RegisterComponent = function () {
            UILabel.m_class_names = UIView_1.UIView.m_class_names.slice(0);
            UILabel.m_class_names.push("UILabel");
            Component_1.Component.Register(UILabel.ClassName(), function () {
                return new UILabel();
            });
        };
        UILabel.prototype.GetClassNames = function () {
            return UILabel.m_class_names;
        };
        UILabel.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.m_font = src.m_font;
            this.m_font_style = src.m_font_style;
            this.m_font_size = src.m_font_size;
            this.m_text = src.m_text;
            this.m_line_space = src.m_line_space;
            this.m_rich = src.m_rich;
            this.m_alignment = src.m_alignment;
        };
        UILabel.prototype.SetFont = function (font) {
            if (this.m_font != font) {
                this.m_font = font;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UILabel.prototype.SetFontStyle = function (font_style) {
            if (this.m_font_style != font_style) {
                this.m_font_style = font_style;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UILabel.prototype.SetFontSize = function (font_size) {
            if (this.m_font_size != font_size) {
                this.m_font_size = font_size;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UILabel.prototype.SetText = function (text) {
            if (this.m_text != text) {
                this.m_text = text;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UILabel.prototype.SetLineSpace = function (line_space) {
            if (this.m_line_space != line_space) {
                this.m_line_space = line_space;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UILabel.prototype.SetRich = function (rich) {
            if (this.m_rich != rich) {
                this.m_rich = rich;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UILabel.prototype.SetAlignment = function (alignment) {
            if (this.m_alignment != alignment) {
                this.m_alignment = alignment;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UILabel.prototype.ProcessText = function (actual_width, actual_height) {
            var lines = new Vector_1.Vector();
            var chars = this.m_text;
            var p_chars = [chars];
            var tags = new Vector_1.Vector();
            if (this.m_rich) {
                tags = parse_rich_tags(p_chars);
                chars = p_chars[0];
            }
            var label_size = this.rect.GetSize();
            var v_size = 1.0 / TEXTURE_SIZE_MAX;
            var vertex_count = 0;
            var pen_x = 0;
            var pen_y = 0;
            var x_max = 0;
            var y_min = 0;
            var y_max = -65536;
            var line_x_max = 0;
            var line_y_min = 0;
            var line = new LabelLine();
            var _loop_1 = function(i) {
                var c = chars[i];
                var font_size = this_1.m_font_size;
                var color = this_1.m_color;
                var bold = this_1.m_font_style == FontStyle.Bold || this_1.m_font_style == FontStyle.BoldAndItalic;
                var italic = this_1.m_font_style == FontStyle.Italic || this_1.m_font_style == FontStyle.BoldAndItalic;
                var color_shadow;
                var color_outline;
                var underline = false;
                if (c == '\n') {
                    line.width = line_x_max;
                    line.height = pen_y - line_y_min;
                    line_x_max = 0;
                    line_y_min = 0;
                    pen_x = 0;
                    pen_y += -(font_size + this_1.m_line_space);
                    lines.Add(line);
                    line = new LabelLine();
                    return "continue";
                }
                if (this_1.m_rich) {
                    tags.ForEach(function (j) {
                        if (i >= j.begin && i < j.end) {
                            switch (j.type) {
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
                var info = get_glyph(this_1.m_font, c, font_size, bold, italic);
                //	limit width
                if (pen_x + info.bearing_x + info.uv_pixel_w > label_size.x) {
                    pen_x = 0;
                    pen_y += -(font_size + this_1.m_line_space);
                }
                var base_info = get_glyph(this_1.m_font, 'A', font_size, bold, italic);
                var base_y0 = base_info.bearing_y;
                var base_y1 = base_info.bearing_y - base_info.uv_pixel_h;
                var baseline = Mathf_1.Mathf.RoundToInt(base_y0 + (font_size - base_y0 + base_y1) * 0.5);
                var x0 = pen_x + info.bearing_x;
                var y0 = pen_y + info.bearing_y - baseline;
                var x1 = x0 + info.uv_pixel_w;
                var y1 = y0 - info.uv_pixel_h;
                if (x_max < x1) {
                    x_max = x1;
                }
                if (y_min > y1) {
                    y_min = y1;
                }
                if (y_max < y0) {
                    y_max = y0;
                }
                if (line_x_max < x1) {
                    line_x_max = x1;
                }
                if (line_y_min > y1) {
                    line_y_min = y1;
                }
                var char_space = 0;
                pen_x += info.advance_x + char_space;
                var uv_x0 = info.uv_pixel_x;
                var uv_y0 = info.uv_pixel_y;
                var uv_x1 = uv_x0 + info.uv_pixel_w;
                var uv_y1 = uv_y0 + info.uv_pixel_h;
                if (color_shadow) {
                    var offset = new Vector2_1.Vector2(1, -1);
                    line.vertices.Add(new Vector2_1.Vector2(x0, y0).Add(offset));
                    line.vertices.Add(new Vector2_1.Vector2(x0, y1).Add(offset));
                    line.vertices.Add(new Vector2_1.Vector2(x1, y1).Add(offset));
                    line.vertices.Add(new Vector2_1.Vector2(x1, y0).Add(offset));
                    line.uv.Add(new Vector2_1.Vector2(uv_x0 * v_size, uv_y0 * v_size));
                    line.uv.Add(new Vector2_1.Vector2(uv_x0 * v_size, uv_y1 * v_size));
                    line.uv.Add(new Vector2_1.Vector2(uv_x1 * v_size, uv_y1 * v_size));
                    line.uv.Add(new Vector2_1.Vector2(uv_x1 * v_size, uv_y0 * v_size));
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
                if (color_outline) {
                    var offsets = new Array(4);
                    offsets[0] = new Vector2_1.Vector2(-1, 1);
                    offsets[1] = new Vector2_1.Vector2(-1, -1);
                    offsets[2] = new Vector2_1.Vector2(1, -1);
                    offsets[3] = new Vector2_1.Vector2(1, 1);
                    for (var j = 0; j < 4; j++) {
                        line.vertices.Add(new Vector2_1.Vector2(x0, y0).Add(offsets[j]));
                        line.vertices.Add(new Vector2_1.Vector2(x0, y1).Add(offsets[j]));
                        line.vertices.Add(new Vector2_1.Vector2(x1, y1).Add(offsets[j]));
                        line.vertices.Add(new Vector2_1.Vector2(x1, y0).Add(offsets[j]));
                        line.uv.Add(new Vector2_1.Vector2(uv_x0 * v_size, uv_y0 * v_size));
                        line.uv.Add(new Vector2_1.Vector2(uv_x0 * v_size, uv_y1 * v_size));
                        line.uv.Add(new Vector2_1.Vector2(uv_x1 * v_size, uv_y1 * v_size));
                        line.uv.Add(new Vector2_1.Vector2(uv_x1 * v_size, uv_y0 * v_size));
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
                line.vertices.Add(new Vector2_1.Vector2(x0, y0));
                line.vertices.Add(new Vector2_1.Vector2(x0, y1));
                line.vertices.Add(new Vector2_1.Vector2(x1, y1));
                line.vertices.Add(new Vector2_1.Vector2(x1, y0));
                line.uv.Add(new Vector2_1.Vector2(uv_x0 * v_size, uv_y0 * v_size));
                line.uv.Add(new Vector2_1.Vector2(uv_x0 * v_size, uv_y1 * v_size));
                line.uv.Add(new Vector2_1.Vector2(uv_x1 * v_size, uv_y1 * v_size));
                line.uv.Add(new Vector2_1.Vector2(uv_x1 * v_size, uv_y0 * v_size));
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
                if (underline) {
                    var ux0 = pen_x - (info.advance_x + char_space);
                    var uy0 = pen_y - baseline - 2;
                    var ux1 = ux0 + info.advance_x + char_space;
                    var uy1 = uy0 - 1;
                    line.vertices.Add(new Vector2_1.Vector2(ux0, uy0));
                    line.vertices.Add(new Vector2_1.Vector2(ux0, uy1));
                    line.vertices.Add(new Vector2_1.Vector2(ux1, uy1));
                    line.vertices.Add(new Vector2_1.Vector2(ux1, uy0));
                    line.uv.Add(new Vector2_1.Vector2(0 * v_size, 0 * v_size));
                    line.uv.Add(new Vector2_1.Vector2(0 * v_size, 1 * v_size));
                    line.uv.Add(new Vector2_1.Vector2(1 * v_size, 1 * v_size));
                    line.uv.Add(new Vector2_1.Vector2(1 * v_size, 0 * v_size));
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
            };
            var this_1 = this;
            for (var i = 0; i < chars.length; i++) {
                _loop_1(i);
            }
            //	���һ��
            if (!line.vertices.Empty()) {
                line.width = line_x_max;
                line.height = pen_y - line_y_min;
                lines.Add(line);
            }
            actual_width[0] = x_max;
            actual_height[0] = -y_min;
            return lines;
        };
        UILabel.prototype.FillVertices = function (vertices, uv, colors, indices) {
            if (!this.m_font) {
                return;
            }
            var size = this.rect.GetSize();
            var min = new Vector2_1.Vector2(-this.rect.pivot.x * size.x, -this.rect.pivot.y * size.y);
            var max = new Vector2_1.Vector2((1 - this.rect.pivot.x) * size.x, (1 - this.rect.pivot.y) * size.y);
            var actual_width = [0];
            var actual_height = [0];
            var lines = this.ProcessText(actual_width, actual_height);
            var mat = this.GetVertexMatrix();
            var index_begin = vertices.Size();
            for (var i = 0; i < lines.Size(); i++) {
                var line = lines.Get(i);
                for (var j = 0; j < line.vertices.Size(); j++) {
                    var v = line.vertices.Get(j);
                    switch (this.m_alignment) {
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
                    switch (this.m_alignment) {
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
                    vertices.Add(mat.MultiplyPoint3x4(new Vector3_1.Vector3(v.x, v.y, 0)));
                }
                if (!line.vertices.Empty()) {
                    uv.AddRange(line.uv.toArray());
                    colors.AddRange(line.colors.toArray());
                }
                for (var j = 0; j < line.indices.Size(); j++) {
                    indices.Add(line.indices.Get(j) + index_begin);
                }
            }
        };
        UILabel.prototype.FillMaterial = function (mat) {
            if (this.m_font) {
                mat.SetMainTexture(g_font_texture);
            }
        };
        return UILabel;
    }(UIView_1.UIView));
    exports.UILabel = UILabel;
});
//# sourceMappingURL=UILabel.js.map