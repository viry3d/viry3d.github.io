var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Object", "../math/Matrix4x4", "../math/Vector4", "../container/Map", "./Color", "./Texture2D", "./Graphics"], function (require, exports, Object_1, Matrix4x4_1, Vector4_1, Map_1, Color_1, Texture2D_1, Graphics_1) {
    "use strict";
    var MAIN_TEX_NAME = "_MainTex";
    var MAIN_TEX_TILLING_OFFSET_NAME = "_MainTex_ST";
    var MAIN_COLOR_NAME = "_Color";
    var Material = (function (_super) {
        __extends(Material, _super);
        function Material() {
            _super.call(this);
            this.m_matrices = new Map_1.VRMap();
            this.m_vectors = new Map_1.VRMap();
            this.m_vector_arrays = new Map_1.VRMap();
            this.m_colors = new Map_1.VRMap();
            this.m_textures = new Map_1.VRMap();
            this.SetMainColor(new Color_1.Color(1, 1, 1, 1));
            this.SetMainTextureTillingOffset(new Vector4_1.Vector4(1, 1, 0, 0));
        }
        Material.Create = function (shader) {
            var mat = new Material();
            mat.SetName(shader.GetName());
            mat.m_shader = shader;
            return mat;
        };
        Material.prototype.SetMatrix = function (name, v) {
            if (!this.m_matrices.Add(name, v)) {
                this.m_matrices.Set(name, v);
            }
        };
        Material.prototype.GetMatrix = function (name) {
            return this.m_matrices.Get(name);
        };
        Material.prototype.SetVector = function (name, v) {
            if (!this.m_vectors.Add(name, v)) {
                this.m_vectors.Set(name, v);
            }
        };
        Material.prototype.GetVector = function (name) {
            return this.m_vectors.Get(name);
        };
        Material.prototype.SetMainColor = function (v) {
            this.SetColor(MAIN_COLOR_NAME, v);
        };
        Material.prototype.GetMainColor = function () {
            return this.GetColor(MAIN_COLOR_NAME);
        };
        Material.prototype.SetColor = function (name, v) {
            if (!this.m_colors.Add(name, v)) {
                this.m_colors.Set(name, v);
            }
        };
        Material.prototype.GetColor = function (name) {
            return this.m_colors.Get(name);
        };
        Material.prototype.SetVectorArray = function (name, v) {
            if (!this.m_vector_arrays.Add(name, v)) {
                this.m_vector_arrays.Set(name, v);
            }
        };
        Material.prototype.GetVectorArray = function (name) {
            return this.m_vector_arrays.Get(name);
        };
        Material.prototype.SetMainTexture = function (v) {
            this.SetTexture(MAIN_TEX_NAME, v);
        };
        Material.prototype.HasMainTexture = function () {
            return this.m_textures.Contains(MAIN_TEX_NAME);
        };
        Material.prototype.GetMainTexture = function () {
            return this.GetTexture(MAIN_TEX_NAME);
        };
        Material.prototype.SetTexture = function (name, v) {
            if (!this.m_textures.Add(name, v)) {
                this.m_textures.Set(name, v);
            }
        };
        Material.prototype.GetTexture = function (name) {
            return this.m_textures.Get(name);
        };
        Material.prototype.SetMainTextureTillingOffset = function (v) {
            this.SetVector(MAIN_TEX_TILLING_OFFSET_NAME, v);
        };
        Material.prototype.GetMainTextureTillingOffset = function () {
            return this.GetVector(MAIN_TEX_TILLING_OFFSET_NAME);
        };
        Material.prototype.UpdateUniforms = function (pass_index) { };
        Material.prototype.UseProgram = function (pass_index) {
            var _this = this;
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            var shader = this.GetShader();
            var textures = this.m_textures;
            var xml = shader.GetXML();
            var xml_vs = xml.GetVertexShader(pass_index);
            var xml_ps = xml.GetPixelShader(pass_index);
            for (var i = 0; i < xml_ps.samplers.Size(); i++) {
                var sampler = xml_ps.samplers.Get(i);
                gl.activeTexture(gl.TEXTURE0 + i);
                var find = [null];
                if (textures.TryGet(sampler.name, find)) {
                    if (sampler.type == "2D") {
                        gl.bindTexture(gl.TEXTURE_2D, find[0].GetTexture());
                    }
                }
                else {
                    if (sampler.type == "2D") {
                        var texture = Texture2D_1.Texture2D.GetDefaultTexture2D();
                        gl.bindTexture(gl.TEXTURE_2D, texture.GetTexture());
                    }
                }
                gl.uniform1i(sampler.location, i);
            }
            this.m_matrices.ForEach(function (k, v) {
                xml_vs.uniforms.ForEach(function (i) {
                    if (i.name == k) {
                        gl.uniformMatrix4fv(i.location, false, v.m);
                        return false;
                    }
                    return true;
                });
                xml_ps.uniforms.ForEach(function (i) {
                    if (i.name == k) {
                        gl.uniformMatrix4fv(i.location, false, v.m);
                        return false;
                    }
                    return true;
                });
                return true;
            });
            this.m_vectors.ForEach(function (k, v) {
                _this.SetUniform4fv(k, xml_vs, xml_ps, v.array);
                return true;
            });
            this.m_vector_arrays.ForEach(function (k, v) {
                _this.SetUniform4fv(k, xml_vs, xml_ps, v);
                return true;
            });
            this.m_colors.ForEach(function (k, v) {
                _this.SetUniform4fv(k, xml_vs, xml_ps, v.array);
                return true;
            });
        };
        Material.prototype.SetUniform4fv = function (name, xml_vs, xml_ps, v) {
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            xml_vs.uniforms.ForEach(function (i) {
                if (i.name == name) {
                    gl.uniform4fv(i.location, v);
                    return false;
                }
                return true;
            });
            xml_ps.uniforms.ForEach(function (i) {
                if (i.name == name) {
                    gl.uniform4fv(i.location, v);
                    return false;
                }
                return true;
            });
        };
        Material.prototype.GetShader = function () {
            return this.m_shader;
        };
        Material.prototype.SetShader = function (shader) {
            this.m_shader = shader;
        };
        Material.prototype.DeepCopy = function (source) {
            var _this = this;
            _super.prototype.DeepCopy.call(this, source);
            var src = (source);
            this.m_matrices.Clear();
            this.m_vectors.Clear();
            this.m_vector_arrays.Clear();
            this.m_colors.Clear();
            src.m_matrices.ForEach(function (k, v) {
                var mat = new Matrix4x4_1.Matrix4x4();
                mat.Set(v);
                _this.m_matrices.Add(k, mat);
                return true;
            });
            src.m_vectors.ForEach(function (k, v) {
                var vec = new Vector4_1.Vector4();
                vec.Set(v);
                _this.m_vectors.Add(k, vec);
                return true;
            });
            src.m_colors.ForEach(function (k, v) {
                var col = new Color_1.Color();
                col.Set(v);
                _this.m_colors.Add(k, col);
                return true;
            });
            src.m_vector_arrays.ForEach(function (k, v) {
                var arr = new Float32Array(v.length);
                arr.set(v);
                _this.m_vector_arrays.Add(k, arr);
                return true;
            });
            this.m_textures.Copy(src.m_textures);
        };
        return Material;
    }(Object_1.VRObject));
    exports.Material = Material;
});
//# sourceMappingURL=Material.js.map