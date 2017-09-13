var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Texture", "./Graphics"], function (require, exports, Texture_1, Graphics_1) {
    "use strict";
    (function (TextureFormat) {
        TextureFormat[TextureFormat["Alpha8"] = 0] = "Alpha8";
        TextureFormat[TextureFormat["ARGB4444"] = 1] = "ARGB4444";
        TextureFormat[TextureFormat["RGB24"] = 2] = "RGB24";
        TextureFormat[TextureFormat["RGBA32"] = 3] = "RGBA32";
        TextureFormat[TextureFormat["ARGB32"] = 4] = "ARGB32";
        TextureFormat[TextureFormat["RGB565"] = 5] = "RGB565";
        TextureFormat[TextureFormat["DXT1"] = 6] = "DXT1";
        TextureFormat[TextureFormat["DXT5"] = 7] = "DXT5";
        TextureFormat[TextureFormat["RGBA4444"] = 8] = "RGBA4444";
        TextureFormat[TextureFormat["PVRTC_RGB2"] = 9] = "PVRTC_RGB2";
        TextureFormat[TextureFormat["PVRTC_RGBA2"] = 10] = "PVRTC_RGBA2";
        TextureFormat[TextureFormat["PVRTC_RGB4"] = 11] = "PVRTC_RGB4";
        TextureFormat[TextureFormat["PVRTC_RGBA4"] = 12] = "PVRTC_RGBA4";
        TextureFormat[TextureFormat["ETC_RGB4"] = 13] = "ETC_RGB4";
        TextureFormat[TextureFormat["ATC_RGB4"] = 14] = "ATC_RGB4";
        TextureFormat[TextureFormat["ATC_RGBA8"] = 15] = "ATC_RGBA8";
        TextureFormat[TextureFormat["BGRA32"] = 16] = "BGRA32";
        TextureFormat[TextureFormat["ATF_RGB_DXT1"] = 17] = "ATF_RGB_DXT1";
        TextureFormat[TextureFormat["ATF_RGBA_JPG"] = 18] = "ATF_RGBA_JPG";
        TextureFormat[TextureFormat["ATF_RGB_JPG"] = 19] = "ATF_RGB_JPG";
        TextureFormat[TextureFormat["ETC_RGB4_X2"] = 20] = "ETC_RGB4_X2";
        TextureFormat[TextureFormat["PVRTC_RGB4_X2"] = 21] = "PVRTC_RGB4_X2";
    })(exports.TextureFormat || (exports.TextureFormat = {}));
    var TextureFormat = exports.TextureFormat;
    var Texture2D = (function (_super) {
        __extends(Texture2D, _super);
        function Texture2D() {
            _super.call(this);
            this.width = 0;
            this.height = 0;
            this.wrap_mode = Texture_1.TextureWrapMode.Clamp;
            this.filter_mode = Texture_1.TextureFilterMode.Bilinear;
            this.mipmap = false;
            this.SetName("Texture2D");
        }
        Texture2D.LoadFromFile = function (file, finish, format, wrap_mode, filter_mode, mipmap) {
            if (format === void 0) { format = TextureFormat.RGBA32; }
            if (wrap_mode === void 0) { wrap_mode = Texture_1.TextureWrapMode.Clamp; }
            if (filter_mode === void 0) { filter_mode = Texture_1.TextureFilterMode.Bilinear; }
            if (mipmap === void 0) { mipmap = false; }
            var img = new Image();
            img.src = file;
            img.onload = function () {
                var texture = Texture2D.Create(img.width, img.height, format, wrap_mode, filter_mode, mipmap, img);
                finish(texture);
            };
            img.onerror = function () {
                finish(null);
                console.error("Texture2D.LoadFromFile onerror");
            };
        };
        Texture2D.Create = function (width, height, format, wrap_mode, filter_mode, mipmap, colors) {
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            var texture = new Texture2D();
            texture.width = width;
            texture.height = height;
            texture.format = format;
            texture.wrap_mode = wrap_mode;
            texture.filter_mode = filter_mode;
            texture.mipmap = mipmap;
            texture.m_colors = colors;
            var type = 0;
            var bpp = 0;
            var gl_internal_format = 0;
            var gl_format = 0;
            var ext = null;
            if (format == TextureFormat.RGBA32) {
                gl_internal_format = gl.RGBA;
                gl_format = gl.RGBA;
                type = gl.UNSIGNED_BYTE;
                bpp = 32;
            }
            else if (format == TextureFormat.RGB24) {
                gl_internal_format = gl.RGB;
                gl_format = gl.RGB;
                type = gl.UNSIGNED_BYTE;
                bpp = 24;
            }
            else if (format == TextureFormat.Alpha8) {
                gl_internal_format = gl.LUMINANCE;
                gl_format = gl.LUMINANCE;
                type = gl.UNSIGNED_BYTE;
                bpp = 8;
            }
            else if (format == TextureFormat.DXT1) {
                ext = (gl.getExtension("WEBGL_compressed_texture_s3tc") ||
                    gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
                    gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc"));
                gl_internal_format = ext.COMPRESSED_RGB_S3TC_DXT1_EXT;
                bpp = 4;
            }
            else if (format == TextureFormat.DXT5) {
                ext = (gl.getExtension("WEBGL_compressed_texture_s3tc") ||
                    gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
                    gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc"));
                gl_internal_format = ext.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                bpp = 8;
            }
            else if (format == TextureFormat.ETC_RGB4 ||
                format == TextureFormat.ETC_RGB4_X2) {
                ext = gl.getExtension("WEBGL_compressed_texture_etc1");
                gl_internal_format = ext.COMPRESSED_RGB_ETC1_WEBGL;
                bpp = 4;
            }
            else if (format == TextureFormat.PVRTC_RGB4 ||
                format == TextureFormat.PVRTC_RGB4_X2) {
                ext = (gl.getExtension("WEBGL_compressed_texture_pvrtc") ||
                    gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"));
                gl_internal_format = ext.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                bpp = 4;
            }
            else {
                console.error("texture format not implement");
            }
            texture.CreateTexture2D(texture.width, texture.height, gl_internal_format, gl_format, type, texture.m_colors, texture.mipmap, ext, bpp);
            texture.UpdateSampler(gl_internal_format, texture.wrap_mode, texture.filter_mode, texture.mipmap);
            return texture;
        };
        Texture2D.GetDefaultTexture2D = function () {
            if (Texture2D.m_default == null) {
                var colors = new Uint8Array(16);
                for (var i = 0; i < colors.length; i++) {
                    colors[i] = 255;
                }
                Texture2D.m_default = Texture2D.Create(2, 2, TextureFormat.RGBA32, Texture_1.TextureWrapMode.Clamp, Texture_1.TextureFilterMode.Point, false, colors);
            }
            return Texture2D.m_default;
        };
        Texture2D.prototype.GetColors = function () {
            return this.m_colors;
        };
        Texture2D.prototype.UpdateTexture = function (x, y, w, h, colors) {
            this.UpdateTexture2D(x, y, w, h, colors);
        };
        return Texture2D;
    }(Texture_1.Texture));
    exports.Texture2D = Texture2D;
});
//# sourceMappingURL=Texture2D.js.map