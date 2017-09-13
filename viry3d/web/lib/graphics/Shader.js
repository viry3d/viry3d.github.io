var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Object", "../string/String", "../container/Map", "../container/Vector", "../io/File", "./XMLShader", "./Graphics", "./RenderPass"], function (require, exports, Object_1, String_1, Map_1, Vector_1, File_1, XMLShader_1, Graphics_1, RenderPass_1) {
    "use strict";
    var GLRenderState = (function () {
        function GLRenderState() {
            this.offset_enable = false; //	GL_POLYGON_OFFSET_FILL
            this.offset_factor = 0.0; //	glPolygonOffset
            this.offset_units = 0.0;
            this.cull_enable = false; //	GL_CULL_FACE
            this.cull_face = 0; //	glCullFace
            this.color_mask_r = false; //	glColorMask
            this.color_mask_g = false;
            this.color_mask_b = false;
            this.color_mask_a = false;
            this.blend_enable = false; //	GL_BLEND
            this.blend_src_c = 0; //	glBlendFuncSeparate
            this.blend_dst_c = 0;
            this.blend_src_a = 0;
            this.blend_dst_a = 0;
            this.depth_mask = false; //	glDepthMask
            this.depth_func = 0; //	glDepthFunc	
            this.stencil_enable = false; //	GL_STENCIL_TEST
            this.stencil_func = 0; //	glStencilFunc
            this.stencil_ref = 0;
            this.stencil_read_mask = 0;
            this.stencil_write_mask = 0; //	glStencilMask
            this.stencil_op_fail = 0; //	glStencilOp
            this.stencil_op_zfail = 0;
            this.stencil_op_pass = 0;
        }
        return GLRenderState;
    }());
    ;
    var g_shader_header = "#define VR_GLES 1\n";
    function combine_shader_src(includes, src) {
        var source = g_shader_header;
        includes.ForEach(function (i) {
            source += i.src + "\n";
            return true;
        });
        source += src;
        return source;
    }
    function create_shader(type, src) {
        var gl = Graphics_1.Graphics.GetDisplay().GetGL();
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            var log = gl.getShaderInfoLog(shader);
            console.log(log);
            gl.deleteShader(shader);
            shader = null;
        }
        return shader;
    }
    function create_program(vs, ps) {
        var gl = Graphics_1.Graphics.GetDisplay().GetGL();
        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, ps);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            var log = gl.getProgramInfoLog(program);
            console.log(log);
            gl.deleteProgram(program);
            program = null;
        }
        return program;
    }
    function prepare_pipeline(pass, xml, shader_pass) {
        var gl = Graphics_1.Graphics.GetDisplay().GetGL();
        var program = shader_pass.program;
        xml.vss.ForEach(function (i) {
            if (i.name == pass.vs) {
                i.uniforms.ForEach(function (j) {
                    j.location = gl.getUniformLocation(program, j.name);
                    return true;
                });
                i.attrs.ForEach(function (j) {
                    j.location = gl.getAttribLocation(program, j.name);
                    return true;
                });
                return false;
            }
            return true;
        });
        xml.pss.ForEach(function (i) {
            if (i.name == pass.ps) {
                i.uniforms.ForEach(function (j) {
                    j.location = gl.getUniformLocation(program, j.name);
                    return true;
                });
                i.samplers.ForEach(function (j) {
                    j.location = gl.getUniformLocation(program, j.name);
                    return true;
                });
                return false;
            }
            return true;
        });
        var prs = null;
        xml.rss.ForEach(function (i) {
            if (i.name == pass.rs) {
                prs = i;
                return false;
            }
            return true;
        });
        var state = shader_pass.render_state;
        state.offset_enable = prs.Offset.enable;
        if (prs.Offset.enable) {
            state.offset_factor = prs.Offset.factor;
            state.offset_units = prs.Offset.units;
        }
        if (prs.Cull == "Off") {
            state.cull_enable = false;
        }
        else {
            state.cull_enable = true;
            if (prs.Cull == "Back") {
                state.cull_face = gl.BACK;
            }
            else if (prs.Cull == "Front") {
                state.cull_face = gl.FRONT;
            }
        }
        {
            state.color_mask_r = false;
            state.color_mask_g = false;
            state.color_mask_b = false;
            state.color_mask_a = false;
            var mask = new String_1.VRString(prs.ColorMask);
            if (mask.Contains("R")) {
                state.color_mask_r = true;
            }
            if (mask.Contains("G")) {
                state.color_mask_g = true;
            }
            if (mask.Contains("B")) {
                state.color_mask_b = true;
            }
            if (mask.Contains("A")) {
                state.color_mask_a = true;
            }
        }
        state.blend_enable = prs.Blend.enable;
        if (prs.Blend.enable) {
            var strs = [
                "One",
                "Zero",
                "SrcColor",
                "SrcAlpha",
                "DstColor",
                "DstAlpha",
                "OneMinusSrcColor",
                "OneMinusSrcAlpha",
                "OneMinusDstColor",
                "OneMinusDstAlpha"
            ];
            var values = [
                gl.ONE,
                gl.ZERO,
                gl.SRC_COLOR,
                gl.SRC_ALPHA,
                gl.DST_COLOR,
                gl.DST_ALPHA,
                gl.ONE_MINUS_SRC_COLOR,
                gl.ONE_MINUS_SRC_ALPHA,
                gl.ONE_MINUS_DST_COLOR,
                gl.ONE_MINUS_DST_ALPHA
            ];
            var count = values.length;
            for (var i = 0; i < count; i++) {
                if (prs.Blend.src == strs[i]) {
                    state.blend_src_c = values[i];
                }
                if (prs.Blend.dst == strs[i]) {
                    state.blend_dst_c = values[i];
                }
                if (prs.Blend.src_a == strs[i]) {
                    state.blend_src_a = values[i];
                }
                if (prs.Blend.dst_a == strs[i]) {
                    state.blend_dst_a = values[i];
                }
            }
        }
        state.depth_mask = prs.ZWrite == "On" ? true : false;
        {
            var strs = [
                "Less",
                "Greater",
                "LEqual",
                "GEqual",
                "Equal",
                "NotEqual",
                "Always"
            ];
            var values = [
                gl.LESS,
                gl.GREATER,
                gl.LEQUAL,
                gl.GEQUAL,
                gl.EQUAL,
                gl.NOTEQUAL,
                gl.ALWAYS
            ];
            var count = values.length;
            for (var i = 0; i < count; i++) {
                if (prs.ZTest == strs[i]) {
                    state.depth_func = values[i];
                    break;
                }
            }
        }
        state.stencil_enable = prs.Stencil.enable;
        if (prs.Stencil.enable) {
            state.stencil_ref = prs.Stencil.RefValue;
            state.stencil_read_mask = prs.Stencil.ReadMask;
            state.stencil_write_mask = prs.Stencil.WriteMask;
            {
                var strs = [
                    "Less",
                    "Greater",
                    "LEqual",
                    "GEqual",
                    "Equal",
                    "NotEqual",
                    "Always",
                    "Never"
                ];
                var values = [
                    gl.LESS,
                    gl.GREATER,
                    gl.LEQUAL,
                    gl.GEQUAL,
                    gl.EQUAL,
                    gl.NOTEQUAL,
                    gl.ALWAYS,
                    gl.NEVER
                ];
                var count = values.length;
                for (var i = 0; i < count; i++) {
                    if (prs.Stencil.Comp == strs[i]) {
                        state.stencil_func = values[i];
                        break;
                    }
                }
            }
            {
                var strs = [
                    "Keep",
                    "Zero",
                    "Replace",
                    "IncrSat",
                    "DecrSat",
                    "Invert",
                    "IncrWrap",
                    "DecrWrap"
                ];
                var values = [
                    gl.KEEP,
                    gl.ZERO,
                    gl.REPLACE,
                    gl.INCR,
                    gl.DECR,
                    gl.INVERT,
                    gl.INCR_WRAP,
                    gl.DECR_WRAP,
                ];
                var count = values.length;
                for (var i = 0; i < count; i++) {
                    if (prs.Stencil.Pass == strs[i]) {
                        state.stencil_op_pass = values[i];
                    }
                    if (prs.Stencil.Fail == strs[i]) {
                        state.stencil_op_fail = values[i];
                    }
                    if (prs.Stencil.ZFail == strs[i]) {
                        state.stencil_op_zfail = values[i];
                    }
                }
            }
        }
    }
    var ShaderPass = (function () {
        function ShaderPass() {
            this.render_state = new GLRenderState();
        }
        return ShaderPass;
    }());
    exports.ShaderPass = ShaderPass;
    var Shader = (function (_super) {
        __extends(Shader, _super);
        function Shader(name) {
            _super.call(this);
            this.m_xml = new XMLShader_1.XMLShader();
            this.m_vertex_shaders = new Map_1.VRMap();
            this.m_pixel_shaders = new Map_1.VRMap();
            this.m_passes = new Vector_1.Vector();
            this.SetName(name);
        }
        Shader.Find = function (name, finish, bundle) {
            var shader_path = "Assets/shader/" + name + ".shader.xml";
            if (Object_1.VRObject.IsLoading(shader_path)) {
                Object_1.VRObject.WatchLoad(shader_path, function (obj) {
                    if (finish) {
                        finish(obj);
                    }
                });
                return null;
            }
            var find = Object_1.VRObject.GetCache(shader_path);
            if (find) {
                if (bundle == null) {
                    finish(find);
                }
                else {
                    return find;
                }
            }
            else {
                if (bundle == null) {
                    Object_1.VRObject.BeginLoad(shader_path);
                    File_1.File.ReadXml(shader_path, function (xml) {
                        if (xml != null) {
                            var shader_1 = new Shader(name);
                            shader_1.m_xml.Load(xml);
                            var includes_1 = new Vector_1.Vector();
                            shader_1.m_xml.vss.ForEach(function (i) {
                                includes_1.AddRange(i.includes.toArray());
                                return true;
                            });
                            shader_1.m_xml.pss.ForEach(function (i) {
                                includes_1.AddRange(i.includes.toArray());
                                return true;
                            });
                            // check includes
                            var check_includes_1 = function () {
                                var done = true;
                                includes_1.ForEach(function (i) {
                                    if (i.src == null) {
                                        done = false;
                                        return false;
                                    }
                                    return true;
                                });
                                if (done) {
                                    shader_1.Compile();
                                    Object_1.VRObject.AddCache(shader_path, shader_1);
                                    Object_1.VRObject.EndLoad(shader_path);
                                    finish(shader_1);
                                }
                            };
                            // load includes
                            includes_1.ForEach(function (i) {
                                File_1.File.ReadAllText("Assets/shader/Include/" + i.name, function (text) {
                                    i.src = text;
                                    check_includes_1();
                                });
                                return true;
                            });
                        }
                    });
                }
                else {
                    var ms = bundle.GetAssetData(shader_path);
                    var xml_str = ms.ReadString(ms.GetSize());
                    var xml = new DOMParser().parseFromString(xml_str, "text/xml");
                    if (xml != null) {
                        var shader = new Shader(name);
                        shader.m_xml.Load(xml);
                        var includes_2 = new Vector_1.Vector();
                        shader.m_xml.vss.ForEach(function (i) {
                            includes_2.AddRange(i.includes.toArray());
                            return true;
                        });
                        shader.m_xml.pss.ForEach(function (i) {
                            includes_2.AddRange(i.includes.toArray());
                            return true;
                        });
                        includes_2.ForEach(function (i) {
                            var ms_include = bundle.GetAssetData("Assets/shader/Include/" + i.name);
                            i.src = ms_include.ReadString(ms_include.GetSize());
                            return true;
                        });
                        shader.Compile();
                        Object_1.VRObject.AddCache(shader_path, shader);
                        return shader;
                    }
                }
            }
            return null;
        };
        Shader.prototype.Compile = function () {
            this.CreateShaders();
            this.CreatePasses();
        };
        Shader.prototype.CreateShaders = function () {
            var _this = this;
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            var xml = this.m_xml;
            xml.vss.ForEach(function (i) {
                var source = combine_shader_src(i.includes, i.src);
                var shader = create_shader(gl.VERTEX_SHADER, source);
                _this.m_vertex_shaders.Add(i.name, shader);
                return true;
            });
            xml.pss.ForEach(function (i) {
                var source = combine_shader_src(i.includes, i.src);
                var shader = create_shader(gl.FRAGMENT_SHADER, source);
                _this.m_pixel_shaders.Add(i.name, shader);
                return true;
            });
        };
        Shader.prototype.CreatePasses = function () {
            var _this = this;
            var xml = this.m_xml;
            xml.passes.ForEach(function (i) {
                var pass = new ShaderPass();
                pass.name = i.name;
                pass.program = create_program(_this.m_vertex_shaders.Get(i.vs), _this.m_pixel_shaders.Get(i.ps));
                prepare_pipeline(i, xml, pass);
                _this.m_passes.Add(pass);
                return true;
            });
        };
        Shader.prototype.PreparePass = function (pass_index) { };
        Shader.prototype.BeginPass = function (pass_index) {
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            var rs = this.m_passes.Get(pass_index).render_state;
            if (rs.offset_enable) {
                gl.enable(gl.POLYGON_OFFSET_FILL);
                gl.polygonOffset(rs.offset_factor, rs.offset_units);
            }
            else {
                gl.disable(gl.POLYGON_OFFSET_FILL);
            }
            if (rs.cull_enable) {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(rs.cull_face);
            }
            else {
                gl.disable(gl.CULL_FACE);
            }
            gl.colorMask(rs.color_mask_r, rs.color_mask_g, rs.color_mask_b, rs.color_mask_a);
            if (rs.blend_enable) {
                gl.enable(gl.BLEND);
                gl.blendFuncSeparate(rs.blend_src_c, rs.blend_dst_c, rs.blend_src_a, rs.blend_dst_a);
            }
            else {
                gl.disable(gl.BLEND);
            }
            gl.depthMask(rs.depth_mask);
            gl.depthFunc(rs.depth_func);
            if (rs.stencil_enable) {
                gl.enable(gl.STENCIL_TEST);
                gl.stencilFunc(rs.stencil_func, rs.stencil_ref, rs.stencil_read_mask);
                gl.stencilMask(rs.stencil_write_mask);
                gl.stencilOp(rs.stencil_op_fail, rs.stencil_op_zfail, rs.stencil_op_pass);
            }
            else {
                gl.disable(gl.STENCIL_TEST);
            }
            var width = RenderPass_1.RenderPass.GetRenderPassBinding().GetFrameBufferWidth();
            var height = RenderPass_1.RenderPass.GetRenderPassBinding().GetFrameBufferHeight();
            var rect = RenderPass_1.RenderPass.GetRenderPassBinding().GetRect();
            var viewport_x = rect.x * width;
            var viewport_y = rect.y * height;
            var viewport_width = rect.width * width;
            var viewport_height = rect.height * height;
            gl.viewport(viewport_x, viewport_y, viewport_width, viewport_height);
            gl.useProgram(this.m_passes.Get(pass_index).program);
        };
        Shader.prototype.EndPass = function (pass_index) { };
        Shader.prototype.BindMaterial = function (pass_index, material) {
            material.UseProgram(pass_index);
        };
        Shader.prototype.PushWorldMatrix = function (pass_index, matrix) {
            var gl = Graphics_1.Graphics.GetDisplay().GetGL();
            var xml_vs = this.m_xml.GetVertexShader(pass_index);
            xml_vs.uniforms.ForEach(function (i) {
                if (i.name == "_World") {
                    gl.uniformMatrix4fv(i.location, false, matrix.m);
                    return false;
                }
                return true;
            });
        };
        Shader.prototype.GetPassCount = function () {
            return this.m_xml.passes.Size();
        };
        Shader.prototype.GetVertexLayoutMask = function () {
            return this.m_xml.vss.Get(0).vertex_layout_mask;
        };
        Shader.prototype.GetQueue = function () {
            return this.m_xml.queue;
        };
        Shader.prototype.GetXML = function () {
            return this.m_xml;
        };
        return Shader;
    }(Object_1.VRObject));
    exports.Shader = Shader;
});
//# sourceMappingURL=Shader.js.map