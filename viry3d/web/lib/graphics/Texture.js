var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Object", "./Graphics"], function (require, exports, Object_1, Graphics_1) {
    "use strict";
    (function (TextureWrapMode) {
        TextureWrapMode[TextureWrapMode["Repeat"] = 0] = "Repeat";
        TextureWrapMode[TextureWrapMode["Clamp"] = 1] = "Clamp";
    })(exports.TextureWrapMode || (exports.TextureWrapMode = {}));
    var TextureWrapMode = exports.TextureWrapMode;
    (function (TextureFilterMode) {
        TextureFilterMode[TextureFilterMode["Point"] = 0] = "Point";
        TextureFilterMode[TextureFilterMode["Bilinear"] = 1] = "Bilinear";
        TextureFilterMode[TextureFilterMode["Trilinear"] = 2] = "Trilinear";
    })(exports.TextureFilterMode || (exports.TextureFilterMode = {}));
    var TextureFilterMode = exports.TextureFilterMode;
    var Texture = (function (_super) {
        __extends(Texture, _super);
        function Texture() {
            _super.call(this);
            this.m_width = 0;
            this.m_height = 0;
            this.m_wrap_mode = TextureWrapMode.Clamp;
            this.m_filter_mode = TextureFilterMode.Bilinear;
            this.SetName("Texture");
        }
        Texture.prototype.GetWidth = function () {
            return this.m_width;
        };
        Texture.prototype.GetHeight = function () {
            return this.m_height;
        };
        Texture.prototype.GetTexture = function () {
            return this.m_texture;
        };
        Texture.prototype.CreateTexture2D = function (width, height, internal_format, format, type, pixels, mipmap, ext, bpp) {
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            this.m_width = width;
            this.m_height = height;
            this.m_internal_format = internal_format;
            this.m_format = format;
            this.m_type = type;
            this.m_texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.m_texture);
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
            if (pixels instanceof HTMLImageElement ||
                pixels instanceof HTMLCanvasElement ||
                pixels instanceof HTMLVideoElement) {
                gl.texImage2D(gl.TEXTURE_2D, 0, internal_format, format, type, pixels);
            }
            else if (ext != null) {
                var level_count = 1;
                if (mipmap) {
                    var w_1 = Math.max(width, height);
                    while (w_1 > 1) {
                        w_1 >>= 1;
                        level_count++;
                    }
                }
                var w = width;
                var h = height;
                var offset = 0;
                for (var i = 0; i < level_count; i++) {
                    var size = 0;
                    if (internal_format == ext.COMPRESSED_RGB_S3TC_DXT1_EXT ||
                        internal_format == ext.COMPRESSED_RGBA_S3TC_DXT5_EXT) {
                        var pitch = Math.max(1, Math.floor((w + 3) / 4)) * (2 * bpp);
                        size = w * h * bpp / 8;
                        if (size < pitch) {
                            size = pitch;
                        }
                    }
                    else if (internal_format == ext.COMPRESSED_RGB_ETC1_WEBGL) {
                        var w_pad = w;
                        var h_pad = h;
                        if (w_pad % 4 != 0 || w_pad == 0)
                            w_pad += 4 - w_pad % 4;
                        if (h_pad % 4 != 0 || h_pad == 0)
                            h_pad += 4 - h_pad % 4;
                        size = w_pad * h_pad / 2;
                        offset += 4;
                    }
                    else if (internal_format == ext.COMPRESSED_RGB_PVRTC_4BPPV1_IMG) {
                        size = w * h / 2;
                    }
                    var data = new Uint8Array(pixels.buffer, pixels.byteOffset + offset, size);
                    gl.compressedTexImage2D(gl.TEXTURE_2D, i, internal_format, w, h, 0, data);
                    offset += size;
                    w >>= 1;
                    h >>= 1;
                    if (w == 0)
                        w = 1;
                    if (h == 0)
                        h = 1;
                }
            }
            else {
                gl.texImage2D(gl.TEXTURE_2D, 0, internal_format, width, height, 0, format, type, pixels);
            }
            if (mipmap && ext == null) {
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        Texture.prototype.UpdateTexture2D = function (x, y, w, h, colors) {
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            gl.bindTexture(gl.TEXTURE_2D, this.m_texture);
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, w, h, this.m_format, this.m_type, colors);
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        Texture.prototype.UpdateSampler = function (internal_format, wrap_mode, filter_mode, mipmap) {
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            gl.bindTexture(gl.TEXTURE_2D, this.m_texture);
            var filter_min = 0;
            var filter_mag = 0;
            switch (filter_mode) {
                case TextureFilterMode.Point:
                    if (mipmap) {
                        filter_min = gl.NEAREST_MIPMAP_LINEAR;
                    }
                    else {
                        filter_min = gl.NEAREST;
                    }
                    filter_mag = gl.NEAREST;
                    break;
                case TextureFilterMode.Bilinear:
                case TextureFilterMode.Trilinear:
                    if (mipmap) {
                        filter_min = gl.LINEAR_MIPMAP_LINEAR;
                    }
                    else {
                        filter_min = gl.LINEAR;
                    }
                    filter_mag = gl.LINEAR;
                    break;
            }
            var address_mode = 0;
            switch (wrap_mode) {
                case TextureWrapMode.Repeat:
                    address_mode = gl.REPEAT;
                    break;
                case TextureWrapMode.Clamp:
                    address_mode = gl.CLAMP_TO_EDGE;
                    break;
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, address_mode);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, address_mode);
            if (internal_format == gl.DEPTH_COMPONENT ||
                internal_format == gl.DEPTH_STENCIL) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            }
            else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter_mag);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter_min);
            }
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        return Texture;
    }(Object_1.VRObject));
    exports.Texture = Texture;
});
//# sourceMappingURL=Texture.js.map