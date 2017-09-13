var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Object", "../container/Vector", "./VertexBuffer", "./IndexBuffer", "./XMLShader"], function (require, exports, Object_1, Vector_1, VertexBuffer_1, IndexBuffer_1, XMLShader_1) {
    "use strict";
    var littleEndian = (function () {
        var buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, 256, true);
        // Int16Array uses the platform's endianness.
        return new Int16Array(buffer)[0] === 256;
    })();
    function write_vector2(buffer, v, offset) {
        buffer.setFloat32(offset + 0, v.x, littleEndian);
        buffer.setFloat32(offset + 4, v.y, littleEndian);
        return offset + 8;
    }
    function write_vector3(buffer, v, offset) {
        buffer.setFloat32(offset + 0, v.x, littleEndian);
        buffer.setFloat32(offset + 4, v.y, littleEndian);
        buffer.setFloat32(offset + 8, v.z, littleEndian);
        return offset + 12;
    }
    function write_vector4(buffer, v, offset) {
        buffer.setFloat32(offset + 0, v.x, littleEndian);
        buffer.setFloat32(offset + 4, v.y, littleEndian);
        buffer.setFloat32(offset + 8, v.z, littleEndian);
        buffer.setFloat32(offset + 12, v.w, littleEndian);
        return offset + 16;
    }
    function write_color(buffer, v, offset) {
        buffer.setFloat32(offset + 0, v.r, littleEndian);
        buffer.setFloat32(offset + 4, v.g, littleEndian);
        buffer.setFloat32(offset + 8, v.b, littleEndian);
        buffer.setFloat32(offset + 12, v.a, littleEndian);
        return offset + 16;
    }
    var Submesh = (function () {
        function Submesh() {
        }
        return Submesh;
    }());
    exports.Submesh = Submesh;
    var Mesh = (function (_super) {
        __extends(Mesh, _super);
        function Mesh() {
            _super.call(this);
            this.vertices = new Vector_1.Vector();
            this.uv = new Vector_1.Vector();
            this.colors = new Vector_1.Vector();
            this.uv2 = new Vector_1.Vector();
            this.normals = new Vector_1.Vector();
            this.tangents = new Vector_1.Vector();
            this.bone_weights = new Vector_1.Vector();
            this.bone_indices = new Vector_1.Vector();
            this.triangles = new Vector_1.Vector();
            this.submeshes = new Vector_1.Vector();
            this.bind_poses = new Vector_1.Vector();
            this.m_dynamic = false;
            this.m_vertex_layout_mask = 0;
            this.SetName("Mesh");
        }
        Mesh.Create = function (dynamic) {
            if (dynamic === void 0) { dynamic = false; }
            var mesh = new Mesh();
            mesh.m_dynamic = dynamic;
            return mesh;
        };
        Mesh.FillVertexBuffer = function (param, buffer) {
            var mesh = param;
            var offset = 0;
            var count = mesh.vertices.Size();
            for (var i = 0; i < count; i++) {
                for (var j = 0; j < 8; j++) {
                    var mask = mesh.m_vertex_layout_mask & (0xf << (j * 4));
                    if (mask != 0) {
                        var type = ((mask >> (j * 4)) - 1);
                        switch (type) {
                            case XMLShader_1.VertexAttributeType.Vertex:
                                offset = write_vector3(buffer, mesh.vertices.Get(i), offset);
                                break;
                            case XMLShader_1.VertexAttributeType.Color:
                                offset = write_color(buffer, mesh.colors.Get(i), offset);
                                break;
                            case XMLShader_1.VertexAttributeType.Texcoord:
                                offset = write_vector2(buffer, mesh.uv.Get(i), offset);
                                break;
                            case XMLShader_1.VertexAttributeType.Texcoord2:
                                offset = write_vector2(buffer, mesh.uv2.Get(i), offset);
                                break;
                            case XMLShader_1.VertexAttributeType.Normal:
                                offset = write_vector3(buffer, mesh.normals.Get(i), offset);
                                break;
                            case XMLShader_1.VertexAttributeType.Tangent:
                                offset = write_vector4(buffer, mesh.tangents.Get(i), offset);
                                break;
                            case XMLShader_1.VertexAttributeType.BlendWeight:
                                offset = write_vector4(buffer, mesh.bone_weights.Get(i), offset);
                                break;
                            case XMLShader_1.VertexAttributeType.BlendIndices:
                                offset = write_vector4(buffer, mesh.bone_indices.Get(i), offset);
                                break;
                            default:
                                break;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
        };
        Mesh.FillIndexBuffer = function (param, buffer) {
            var mesh = param;
            new Uint16Array(buffer.buffer).set(mesh.triangles.toArray());
        };
        Mesh.prototype.Update = function (vertex_layout_mask) {
            this.m_vertex_layout_mask = vertex_layout_mask;
            this.UpdateVertexBuffer();
            this.UpdateIndexBuffer();
        };
        Mesh.prototype.UpdateVertexBuffer = function () {
            var buffer_size = this.VertexBufferSize();
            var dynamic = this.m_dynamic;
            if (this.m_vertex_buffer == null || this.m_vertex_buffer.GetSize() != buffer_size) {
                this.m_vertex_buffer = VertexBuffer_1.VertexBuffer.Create(buffer_size, dynamic);
            }
            this.m_vertex_buffer.Fill(this, Mesh.FillVertexBuffer);
        };
        Mesh.prototype.UpdateIndexBuffer = function () {
            var buffer_size = this.IndexBufferSize();
            var dynamic = this.m_dynamic;
            if (this.m_index_buffer == null || this.m_index_buffer.GetSize() != buffer_size) {
                this.m_index_buffer = IndexBuffer_1.IndexBuffer.Create(buffer_size, dynamic);
            }
            this.m_index_buffer.Fill(this, Mesh.FillIndexBuffer);
        };
        Mesh.prototype.VertexBufferSize = function () {
            var attr_sizes = [
                12, 16, 8, 8, 12, 16, 16, 16
            ];
            var stride = 0;
            for (var i = 0; i < 8; i++) {
                var mask = this.m_vertex_layout_mask & (0xf << (i * 4));
                if (mask != 0) {
                    var type = (mask >> (i * 4)) - 1;
                    stride += attr_sizes[type];
                }
                else {
                    break;
                }
            }
            return stride * this.vertices.Size();
        };
        Mesh.prototype.IndexBufferSize = function () {
            var size_of_ushort = 2;
            return this.triangles.Size() * size_of_ushort;
        };
        Mesh.prototype.GetVertexBuffer = function () {
            return this.m_vertex_buffer;
        };
        Mesh.prototype.GetIndexBuffer = function () {
            return this.m_index_buffer;
        };
        Mesh.prototype.GetIndexRange = function (submesh_index, start, count) {
            if (this.submeshes.Empty()) {
                start[0] = 0;
                count[0] = this.triangles.Size();
            }
            else {
                var submesh = this.submeshes.Get(submesh_index);
                start[0] = submesh.start;
                count[0] = submesh.count;
            }
        };
        return Mesh;
    }(Object_1.VRObject));
    exports.Mesh = Mesh;
});
//# sourceMappingURL=Mesh.js.map