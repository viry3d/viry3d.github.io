define(["require", "exports", "../container/Vector"], function (require, exports, Vector_1) {
    "use strict";
    var XMLPass = (function () {
        function XMLPass() {
        }
        return XMLPass;
    }());
    exports.XMLPass = XMLPass;
    var XMLUniform = (function () {
        function XMLUniform() {
        }
        return XMLUniform;
    }());
    exports.XMLUniform = XMLUniform;
    (function (VertexAttributeType) {
        VertexAttributeType[VertexAttributeType["None"] = -1] = "None";
        VertexAttributeType[VertexAttributeType["Vertex"] = 0] = "Vertex";
        VertexAttributeType[VertexAttributeType["Color"] = 1] = "Color";
        VertexAttributeType[VertexAttributeType["Texcoord"] = 2] = "Texcoord";
        VertexAttributeType[VertexAttributeType["Texcoord2"] = 3] = "Texcoord2";
        VertexAttributeType[VertexAttributeType["Normal"] = 4] = "Normal";
        VertexAttributeType[VertexAttributeType["Tangent"] = 5] = "Tangent";
        VertexAttributeType[VertexAttributeType["BlendWeight"] = 6] = "BlendWeight";
        VertexAttributeType[VertexAttributeType["BlendIndices"] = 7] = "BlendIndices";
        VertexAttributeType[VertexAttributeType["Count"] = 8] = "Count";
    })(exports.VertexAttributeType || (exports.VertexAttributeType = {}));
    var VertexAttributeType = exports.VertexAttributeType;
    ;
    var VERTEX_ATTR_TYPES = [
        "Vertex",
        "Color",
        "Texcoord",
        "Texcoord2",
        "Normal",
        "Tangent",
        "BlendWeight",
        "BlendIndices"
    ];
    var XMLVertexAttribute = (function () {
        function XMLVertexAttribute() {
        }
        return XMLVertexAttribute;
    }());
    exports.XMLVertexAttribute = XMLVertexAttribute;
    var XMLSampler = (function () {
        function XMLSampler() {
        }
        return XMLSampler;
    }());
    exports.XMLSampler = XMLSampler;
    var XMLInclude = (function () {
        function XMLInclude() {
        }
        return XMLInclude;
    }());
    exports.XMLInclude = XMLInclude;
    var XMLVertexShader = (function () {
        function XMLVertexShader() {
            this.uniforms = new Vector_1.Vector();
            this.attrs = new Vector_1.Vector();
            this.includes = new Vector_1.Vector();
        }
        return XMLVertexShader;
    }());
    exports.XMLVertexShader = XMLVertexShader;
    var XMLPixelShader = (function () {
        function XMLPixelShader() {
            this.uniforms = new Vector_1.Vector();
            this.samplers = new Vector_1.Vector();
            this.includes = new Vector_1.Vector();
        }
        return XMLPixelShader;
    }());
    exports.XMLPixelShader = XMLPixelShader;
    var XMLBlend = (function () {
        function XMLBlend() {
            this.enable = false;
        }
        return XMLBlend;
    }());
    exports.XMLBlend = XMLBlend;
    var XMLOffset = (function () {
        function XMLOffset() {
            this.enable = false;
        }
        return XMLOffset;
    }());
    exports.XMLOffset = XMLOffset;
    var XMLStencil = (function () {
        function XMLStencil() {
            this.enable = false;
            this.RefValue = 0;
            this.ReadMask = 255;
            this.WriteMask = 255;
            this.Comp = "Always";
            this.Pass = "Keep";
            this.Fail = "Keep";
            this.ZFail = "Keep";
        }
        return XMLStencil;
    }());
    exports.XMLStencil = XMLStencil;
    var XMLRenderState = (function () {
        function XMLRenderState() {
            this.Cull = "Back";
            this.ZTest = "LEqual";
            this.ZWrite = "On";
            this.AlphaTest = "Off";
            this.ColorMask = "RGBA";
            this.Blend = new XMLBlend();
            this.Offset = new XMLOffset();
            this.Stencil = new XMLStencil();
        }
        return XMLRenderState;
    }());
    exports.XMLRenderState = XMLRenderState;
    var XMLShader = (function () {
        function XMLShader() {
            this.passes = new Vector_1.Vector();
            this.vss = new Vector_1.Vector();
            this.pss = new Vector_1.Vector();
            this.rss = new Vector_1.Vector();
        }
        XMLShader.prototype.Load = function (xml) {
            var shader_ele = xml.documentElement;
            this.name = shader_ele.getAttribute("name");
            var shader_queue = shader_ele.getAttribute("queue");
            if (shader_queue == "Background") {
                this.queue = 1000;
            }
            else if (shader_queue == "Geometry") {
                this.queue = 2000;
            }
            else if (shader_queue == "AlphaTest") {
                this.queue = 2450;
            }
            else if (shader_queue == "Transparent") {
                this.queue = 3000;
            }
            else if (shader_queue == "Overlay") {
                this.queue = 4000;
            }
            for (var node = shader_ele.firstElementChild; node; node = node.nextElementSibling) {
                var type = node.nodeName;
                var name_1 = node.getAttribute("name");
                if (type == "Pass") {
                    var pass = new XMLPass();
                    pass.name = name_1;
                    pass.vs = node.getAttribute("vs");
                    pass.ps = node.getAttribute("ps");
                    pass.rs = node.getAttribute("rs");
                    this.passes.Add(pass);
                }
                else if (type == "VertexShader") {
                    var vs = new XMLVertexShader();
                    vs.name = name_1;
                    var attr_sizes = [
                        12, 16, 8, 8, 12, 16, 16, 16
                    ];
                    var attr_offset = 0;
                    var layout_mask = 0;
                    var attr_index = 0;
                    for (var vs_node = node.firstElementChild; vs_node; vs_node = vs_node.nextElementSibling) {
                        var vs_type = vs_node.nodeName;
                        if (vs_type == "Uniform") {
                            var uniform = new XMLUniform();
                            uniform.name = vs_node.getAttribute("name");
                            uniform.size = parseInt(vs_node.getAttribute("size"));
                            vs.uniforms.Add(uniform);
                        }
                        else if (vs_type == "VertexAttribute") {
                            var attr = new XMLVertexAttribute();
                            attr.type_name = vs_node.getAttribute("type");
                            attr.name = vs_node.getAttribute("name");
                            for (var i = 0; i < VertexAttributeType.Count; i++) {
                                if (attr.type_name == VERTEX_ATTR_TYPES[i]) {
                                    attr.type = i;
                                    attr.size = attr_sizes[i];
                                    attr_offset += attr.size;
                                    layout_mask |= (i + 1) << (attr_index * 4);
                                    attr_index++;
                                    break;
                                }
                            }
                            vs.attrs.Add(attr);
                        }
                        else if (vs_type == "Include") {
                            var inc = new XMLInclude();
                            inc.name = vs_node.getAttribute("name");
                            inc.src = null;
                            vs.includes.Add(inc);
                        }
                        else if (vs_type == "Source") {
                            vs.src = vs_node.textContent;
                        }
                    }
                    vs.vertex_layout_mask = layout_mask;
                    vs.stride = attr_offset;
                    this.vss.Add(vs);
                }
                else if (type == "PixelShader") {
                    var ps = new XMLPixelShader();
                    ps.name = name_1;
                    for (var ps_node = node.firstElementChild; ps_node; ps_node = ps_node.nextElementSibling) {
                        var ps_type = ps_node.nodeName;
                        if (ps_type == "Uniform") {
                            var uniform = new XMLUniform();
                            uniform.name = ps_node.getAttribute("name");
                            uniform.size = parseInt(ps_node.getAttribute("size"));
                            ps.uniforms.Add(uniform);
                        }
                        else if (ps_type == "Include") {
                            var inc = new XMLInclude();
                            inc.name = ps_node.getAttribute("name");
                            inc.src = null;
                            ps.includes.Add(inc);
                        }
                        else if (ps_type == "Source") {
                            ps.src = ps_node.textContent;
                        }
                        else if (ps_type == "Sampler") {
                            var sampler = new XMLSampler();
                            sampler.name = ps_node.getAttribute("name");
                            sampler.type = ps_node.getAttribute("type");
                            ps.samplers.Add(sampler);
                        }
                    }
                    this.pss.Add(ps);
                }
                else if (type == "RenderState") {
                    var rs = new XMLRenderState();
                    rs.name = name_1;
                    for (var rs_node = node.firstElementChild; rs_node; rs_node = rs_node.nextElementSibling) {
                        var rs_type = rs_node.nodeName;
                        if (rs_type == "Cull") {
                            rs.Cull = rs_node.getAttribute("value");
                        }
                        else if (rs_type == "ZTest") {
                            rs.ZTest = rs_node.getAttribute("value");
                        }
                        else if (rs_type == "ZWrite") {
                            rs.ZWrite = rs_node.getAttribute("value");
                        }
                        else if (rs_type == "AlphaTest") {
                            rs.AlphaTest = rs_node.getAttribute("value");
                        }
                        else if (rs_type == "ColorMask") {
                            rs.ColorMask = rs_node.getAttribute("value");
                        }
                        else if (rs_type == "Blend") {
                            rs.Blend.enable = true;
                            var enable = rs_node.getAttribute("enable");
                            if (enable == "Off") {
                                rs.Blend.enable = false;
                            }
                            if (rs.Blend.enable) {
                                rs.Blend.src = rs_node.getAttribute("src");
                                rs.Blend.dst = rs_node.getAttribute("dst");
                                rs.Blend.src_a = rs_node.getAttribute("src_a");
                                rs.Blend.dst_a = rs_node.getAttribute("dst_a");
                                if (rs.Blend.src_a == null) {
                                    rs.Blend.src_a = rs.Blend.src;
                                }
                                if (rs.Blend.dst_a == null) {
                                    rs.Blend.dst_a = rs.Blend.dst;
                                }
                            }
                        }
                        else if (rs_type == "Offset") {
                            rs.Offset.enable = true;
                            var factor = rs_node.getAttribute("factor");
                            if (factor != null) {
                                rs.Offset.factor = parseFloat(factor);
                            }
                            var units = rs_node.getAttribute("units");
                            if (units != null) {
                                rs.Offset.units = parseFloat(units);
                            }
                        }
                        else if (rs_type == "Stencil") {
                            rs.Stencil.enable = true;
                            var RefValue = rs_node.getAttribute("RefValue");
                            if (RefValue != null) {
                                rs.Stencil.RefValue = parseInt(RefValue);
                            }
                            var ReadMask = rs_node.getAttribute("ReadMask");
                            if (ReadMask != null) {
                                rs.Stencil.ReadMask = parseInt(ReadMask);
                            }
                            var WriteMask = rs_node.getAttribute("WriteMask");
                            if (WriteMask != null) {
                                rs.Stencil.WriteMask = parseInt(WriteMask);
                            }
                            var Comp = rs_node.getAttribute("Comp");
                            if (Comp != null) {
                                rs.Stencil.Comp = Comp;
                            }
                            var Pass = rs_node.getAttribute("Pass");
                            if (Pass != null) {
                                rs.Stencil.Pass = Pass;
                            }
                            var Fail = rs_node.getAttribute("Fail");
                            if (Fail != null) {
                                rs.Stencil.Fail = Fail;
                            }
                            var ZFail = rs_node.getAttribute("ZFail");
                            if (ZFail != null) {
                                rs.Stencil.ZFail = ZFail;
                            }
                        }
                    }
                    this.rss.Add(rs);
                }
            }
        };
        XMLShader.prototype.GetVertexShader = function (pass) {
            var name = this.passes.Get(pass).vs;
            for (var i = 0; i < this.vss.Size(); i++) {
                var vs = this.vss.Get(i);
                if (vs.name == name) {
                    return vs;
                }
            }
            return null;
        };
        XMLShader.prototype.GetPixelShader = function (pass) {
            var name = this.passes.Get(pass).ps;
            for (var i = 0; i < this.pss.Size(); i++) {
                var ps = this.pss.Get(i);
                if (ps.name == name) {
                    return ps;
                }
            }
            return null;
        };
        XMLShader.prototype.GetRenderState = function (pass) {
            var name = this.passes.Get(pass).rs;
            for (var i = 0; i < this.rss.Size(); i++) {
                var rs = this.rss.Get(i);
                if (rs.name == name) {
                    return rs;
                }
            }
            return null;
        };
        return XMLShader;
    }());
    exports.XMLShader = XMLShader;
});
//# sourceMappingURL=XMLShader.js.map