define(["require", "exports", "./Object", "./GameObject", "./graphics/Texture2D", "./graphics/Material", "./graphics/Shader", "./graphics/Mesh", "./graphics/Color", "./io/File", "./container/Map", "./container/Vector", "./io/MemoryStream", "./math/Vector2", "./math/Vector3", "./math/Vector4", "./math/Matrix4x4", "./math/Quaternion", "./renderer/SkinnedMeshRenderer", "./animation/AnimationState", "./animation/AnimationClip", "./graphics/Graphics", "./ui/UILabel", "./ui/Atlas", "./ui/Sprite", "./math/Rect", "./Viry3D"], function (require, exports, Object_1, GameObject_1, Texture2D_1, Material_1, Shader_1, Mesh_1, Color_1, File_1, Map_1, Vector_1, MemoryStream_1, Vector2_1, Vector3_1, Vector4_1, Matrix4x4_1, Quaternion_1, SkinnedMeshRenderer_1, AnimationState_1, AnimationClip_1, Graphics_1, UILabel_1, Atlas_1, Sprite_1, Rect_1, Viry3D_1) {
    "use strict";
    var ImageFormat;
    (function (ImageFormat) {
        ImageFormat[ImageFormat["RGB24"] = 0] = "RGB24";
        ImageFormat[ImageFormat["RGBA32"] = 1] = "RGBA32";
        ImageFormat[ImageFormat["A8"] = 2] = "A8";
        ImageFormat[ImageFormat["DXT1"] = 3] = "DXT1";
        ImageFormat[ImageFormat["DXT5"] = 4] = "DXT5";
        ImageFormat[ImageFormat["ETC1"] = 5] = "ETC1";
        ImageFormat[ImageFormat["ETC1_X2"] = 6] = "ETC1_X2";
        ImageFormat[ImageFormat["PVRTC1_4"] = 7] = "PVRTC1_4";
        ImageFormat[ImageFormat["PVRTC1_4_X2"] = 8] = "PVRTC1_4_X2";
    })(ImageFormat || (ImageFormat = {}));
    function read_string(ms) {
        var size = ms.ReadInt();
        return ms.ReadString(size);
    }
    function read_vector2(ms) {
        return new Vector2_1.Vector2(ms.ReadFloat(), ms.ReadFloat());
    }
    function read_vector3(ms) {
        return new Vector3_1.Vector3(ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat());
    }
    function read_vector4(ms) {
        return new Vector4_1.Vector4(ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat());
    }
    function read_color(ms) {
        return new Color_1.Color(ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat());
    }
    function read_quaternion(ms) {
        return new Quaternion_1.Quaternion(ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat());
    }
    function read_matrix(ms) {
        var array = Array(16);
        for (var i = 0; i < 16; i++) {
            array[i] = ms.ReadFloat();
        }
        return new Matrix4x4_1.Matrix4x4(array);
    }
    function read_texture(path, finish, bundle) {
        if (Object_1.VRObject.IsLoading(path)) {
            Object_1.VRObject.WatchLoad(path, function (obj) {
                if (finish) {
                    finish(obj);
                }
            });
            return null;
        }
        var cache = Object_1.VRObject.GetCache(path);
        if (cache) {
            if (bundle == null) {
                if (finish) {
                    finish(cache);
                }
            }
            else {
                return cache;
            }
        }
        else {
            if (bundle == null) {
                Object_1.VRObject.BeginLoad(path);
            }
            var do_read_1 = function (ms) {
                var texture_name = read_string(ms);
                var width = ms.ReadInt();
                var height = ms.ReadInt();
                var wrap_mode = ms.ReadInt();
                var filter_mode = ms.ReadInt();
                var texture_type = read_string(ms);
                if (texture_type == "Texture2D") {
                    var mipmap_count = ms.ReadInt();
                    var png_path = read_string(ms);
                    var mipmap = mipmap_count > 1;
                    if (bundle == null) {
                        Texture2D_1.Texture2D.LoadFromFile(png_path, function (texture) {
                            if (texture) {
                                Object_1.VRObject.AddCache(path, texture);
                            }
                            Object_1.VRObject.EndLoad(path);
                            if (finish) {
                                finish(texture);
                            }
                        }, Texture2D_1.TextureFormat.RGBA32, wrap_mode, filter_mode, mipmap);
                    }
                    else {
                        var ms_img = bundle.GetAssetData(png_path);
                        width = ms_img.ReadInt();
                        height = ms_img.ReadInt();
                        var format = ms_img.ReadByte();
                        var texture = void 0;
                        if (format == ImageFormat.RGB24) {
                            texture = Texture2D_1.Texture2D.Create(width, height, Texture2D_1.TextureFormat.RGB24, wrap_mode, filter_mode, mipmap, ms_img.ReadBytes(width * height * 3));
                        }
                        else if (format == ImageFormat.RGBA32) {
                            texture = Texture2D_1.Texture2D.Create(width, height, Texture2D_1.TextureFormat.RGBA32, wrap_mode, filter_mode, mipmap, ms_img.ReadBytes(width * height * 4));
                        }
                        else if (format == ImageFormat.DXT1 || format == ImageFormat.DXT5) {
                            var magic = ms_img.ReadUInt();
                            if (magic == 0x20534444) {
                                var header_size = ms_img.ReadInt();
                                var flags = ms_img.ReadInt();
                                height = ms_img.ReadInt();
                                width = ms_img.ReadInt();
                                var size_0 = ms_img.ReadInt();
                                var depth = ms_img.ReadInt();
                                mipmap_count = ms_img.ReadInt();
                                ms_img.ReadBytes(96);
                                var w = width;
                                var h = height;
                                var dxt_size = 0;
                                var bpp = 0;
                                var tex_format = void 0;
                                if (format == ImageFormat.DXT1) {
                                    bpp = 4;
                                    tex_format = Texture2D_1.TextureFormat.DXT1;
                                }
                                else if (format == ImageFormat.DXT5) {
                                    bpp = 8;
                                    tex_format = Texture2D_1.TextureFormat.DXT5;
                                }
                                for (var i = 0; i < mipmap_count; i++) {
                                    var pitch = Math.max(1, ((w + 3) / 4)) * (bpp * 2);
                                    var size = w * h * bpp / 8;
                                    if (size < pitch) {
                                        size = pitch;
                                    }
                                    dxt_size += size;
                                    w >>= 1;
                                    h >>= 1;
                                }
                                var dxt = ms_img.ReadBytes(dxt_size);
                                texture = Texture2D_1.Texture2D.Create(width, height, tex_format, wrap_mode, filter_mode, mipmap, dxt);
                            }
                        }
                        else if (format == ImageFormat.ETC1 || format == ImageFormat.ETC1_X2) {
                            var magic0 = ms_img.ReadUInt();
                            var magic1 = ms_img.ReadUInt();
                            var magic2 = ms_img.ReadUInt();
                            if (magic0 == 0x58544bab &&
                                magic1 == 0xbb313120 &&
                                magic2 == 0x0a1a0a0d) {
                                var endianess = ms_img.ReadUInt();
                                var glType = ms_img.ReadUInt();
                                var glTypeSize = ms_img.ReadUInt();
                                var glFormat = ms_img.ReadUInt();
                                var glInternalFormat = ms_img.ReadUInt();
                                var glBaseInternalFormat = ms_img.ReadUInt();
                                var pixelWidth = ms_img.ReadUInt();
                                var pixelHeight = ms_img.ReadUInt();
                                var pixelDepth = ms_img.ReadUInt();
                                var numberOfArrayElements = ms_img.ReadUInt();
                                var numberOfFaces = ms_img.ReadUInt();
                                var numberOfMipmapLevels = ms_img.ReadUInt();
                                var bytesOfKeyValueData = ms_img.ReadUInt();
                                if (bytesOfKeyValueData > 0) {
                                    ms_img.ReadBytes(bytesOfKeyValueData);
                                }
                                mipmap_count = numberOfMipmapLevels;
                                width = pixelWidth;
                                height = pixelHeight;
                                var w = width;
                                var h = height;
                                var etc1_size = 0;
                                for (var j = 0; j < mipmap_count; j++) {
                                    var w_pad = w;
                                    var h_pad = h;
                                    if (w_pad % 4 != 0 || w_pad == 0)
                                        w_pad += 4 - w_pad % 4;
                                    if (h_pad % 4 != 0 || h_pad == 0)
                                        h_pad += 4 - h_pad % 4;
                                    var size = w_pad * h_pad / 2;
                                    etc1_size += 4 + size;
                                    w >>= 1;
                                    h >>= 1;
                                }
                                var etc1 = ms_img.ReadBytes(etc1_size);
                                var fmt = format == ImageFormat.ETC1 ? Texture2D_1.TextureFormat.ETC_RGB4 : Texture2D_1.TextureFormat.ETC_RGB4_X2;
                                texture = Texture2D_1.Texture2D.Create(width, height, fmt, wrap_mode, filter_mode, mipmap, etc1);
                            }
                        }
                        else if (format == ImageFormat.PVRTC1_4 || format == ImageFormat.PVRTC1_4_X2) {
                            var version = ms_img.ReadUInt();
                            var flag = ms_img.ReadUInt();
                            var format_0 = ms_img.ReadUInt();
                            var format_1 = ms_img.ReadUInt();
                            if (version == 0x03525650 &&
                                format_0 == 2) {
                                var color_space = ms_img.ReadUInt();
                                var channel_type = ms_img.ReadUInt();
                                height = ms_img.ReadUInt();
                                width = ms_img.ReadUInt();
                                var depth = ms_img.ReadUInt();
                                var array_count = ms_img.ReadUInt();
                                var face_count = ms_img.ReadUInt();
                                mipmap_count = ms_img.ReadUInt();
                                var meta_size = ms_img.ReadUInt();
                                var cc = ms_img.ReadUInt();
                                var key = ms_img.ReadUInt();
                                var data_size = ms_img.ReadUInt();
                                ms_img.ReadBytes(meta_size - 12);
                                var w = width;
                                var h = height;
                                var pvr_size = 0;
                                for (var j = 0; j < mipmap_count; j++) {
                                    pvr_size += w * h / 2;
                                    w >>= 1;
                                    h >>= 1;
                                }
                                var pvr_rgb = ms_img.ReadBytes(pvr_size);
                                var fmt = format == ImageFormat.PVRTC1_4 ? Texture2D_1.TextureFormat.PVRTC_RGB4 : Texture2D_1.TextureFormat.PVRTC_RGB4_X2;
                                texture = Texture2D_1.Texture2D.Create(width, height, fmt, wrap_mode, filter_mode, mipmap, pvr_rgb);
                                if (format == ImageFormat.PVRTC1_4_X2) {
                                    ms_img.ReadBytes(4 * 12);
                                    meta_size = ms_img.ReadUInt();
                                    ms_img.ReadBytes(meta_size);
                                    var pvr_alpha = ms_img.ReadBytes(pvr_size);
                                    texture.pvr_alpha = Texture2D_1.Texture2D.Create(width, height, fmt, wrap_mode, filter_mode, mipmap, pvr_alpha);
                                }
                            }
                        }
                        if (texture) {
                            Object_1.VRObject.AddCache(path, texture);
                        }
                        return texture;
                    }
                }
                return null;
            };
            if (bundle == null) {
                File_1.File.ReadAllBytes(path, function (bytes) {
                    var ms = new MemoryStream_1.MemoryStream(bytes, true);
                    do_read_1(ms);
                });
            }
            else {
                return do_read_1(bundle.GetAssetData(path));
            }
        }
        return null;
    }
    function read_mesh(path, finish, bundle) {
        if (Object_1.VRObject.IsLoading(path)) {
            Object_1.VRObject.WatchLoad(path, function (obj) {
                if (finish) {
                    finish(obj);
                }
            });
            return null;
        }
        var cache = Object_1.VRObject.GetCache(path);
        if (cache) {
            if (bundle == null) {
                if (finish) {
                    finish(cache);
                }
            }
            else {
                return cache;
            }
        }
        else {
            if (bundle == null) {
                Object_1.VRObject.BeginLoad(path);
            }
            var do_read_2 = function (ms) {
                var mesh = Mesh_1.Mesh.Create();
                Object_1.VRObject.AddCache(path, mesh);
                if (bundle == null) {
                    Object_1.VRObject.EndLoad(path);
                }
                var mesh_name = read_string(ms);
                mesh.SetName(mesh_name);
                var vertex_count = ms.ReadInt();
                if (vertex_count > 0) {
                    mesh.vertices.Resize(vertex_count);
                    for (var i = 0; i < vertex_count; i++) {
                        mesh.vertices.Set(i, read_vector3(ms));
                    }
                }
                var uv_count = ms.ReadInt();
                if (uv_count > 0) {
                    mesh.uv.Resize(uv_count);
                    for (var i = 0; i < uv_count; i++) {
                        mesh.uv.Set(i, read_vector2(ms));
                    }
                }
                var color_count = ms.ReadInt();
                if (color_count > 0) {
                    mesh.colors.Resize(color_count);
                    for (var i = 0; i < color_count; i++) {
                        mesh.colors.Set(i, read_color(ms));
                    }
                }
                var uv2_count = ms.ReadInt();
                if (uv2_count > 0) {
                    mesh.uv2.Resize(uv2_count);
                    for (var i = 0; i < uv2_count; i++) {
                        mesh.uv2.Set(i, read_vector2(ms));
                    }
                }
                var normal_count = ms.ReadInt();
                if (normal_count > 0) {
                    mesh.normals.Resize(normal_count);
                    for (var i = 0; i < normal_count; i++) {
                        mesh.normals.Set(i, read_vector3(ms));
                    }
                }
                var tangent_count = ms.ReadInt();
                if (tangent_count > 0) {
                    mesh.tangents.Resize(tangent_count);
                    for (var i = 0; i < tangent_count; i++) {
                        mesh.tangents.Set(i, read_vector4(ms));
                    }
                }
                var bone_weight_count = ms.ReadInt();
                if (bone_weight_count > 0) {
                    mesh.bone_weights.Resize(bone_weight_count);
                    for (var i = 0; i < bone_weight_count; i++) {
                        mesh.bone_weights.Set(i, read_vector4(ms));
                    }
                }
                var bone_index_count = ms.ReadInt();
                if (bone_index_count > 0) {
                    mesh.bone_indices.Resize(bone_index_count);
                    for (var i = 0; i < bone_index_count; i++) {
                        mesh.bone_indices.Set(i, read_vector4(ms));
                    }
                }
                var bind_pose_count = ms.ReadInt();
                if (bind_pose_count > 0) {
                    mesh.bind_poses.Resize(bind_pose_count);
                    for (var i = 0; i < bind_pose_count; i++) {
                        mesh.bind_poses.Set(i, read_matrix(ms));
                    }
                }
                var index_count = ms.ReadInt();
                if (index_count > 0) {
                    mesh.triangles.Resize(index_count);
                    for (var i = 0; i < index_count; i++) {
                        mesh.triangles.Set(i, ms.ReadUint16());
                    }
                }
                var submesh_count = ms.ReadInt();
                if (submesh_count > 0) {
                    mesh.submeshes.Resize(submesh_count);
                    for (var i = 0; i < submesh_count; i++) {
                        var submesh = new Mesh_1.Submesh();
                        submesh.start = ms.ReadInt();
                        submesh.count = ms.ReadInt();
                        mesh.submeshes.Set(i, submesh);
                    }
                }
                if (bundle == null) {
                    if (finish) {
                        finish(mesh);
                    }
                }
                else {
                    return mesh;
                }
                return null;
            };
            if (bundle == null) {
                File_1.File.ReadAllBytes(path, function (bytes) {
                    var ms = new MemoryStream_1.MemoryStream(bytes, true);
                    do_read_2(ms);
                });
            }
            else {
                return do_read_2(bundle.GetAssetData(path));
            }
        }
        return null;
    }
    function read_material(path, finish, bundle) {
        if (Object_1.VRObject.IsLoading(path)) {
            Object_1.VRObject.WatchLoad(path, function (obj) {
                if (finish) {
                    finish(obj);
                }
            });
            return null;
        }
        var cache = Object_1.VRObject.GetCache(path);
        if (cache) {
            if (bundle == null) {
                if (finish) {
                    finish(cache);
                }
            }
            else {
                return cache;
            }
        }
        else {
            if (bundle == null) {
                Object_1.VRObject.BeginLoad(path);
            }
            var do_read_3 = function (ms) {
                var mat_name = read_string(ms);
                var shader_name = read_string(ms);
                var on_shader_find = function (shader) {
                    var mat = Material_1.Material.Create(shader);
                    mat.SetName(mat_name);
                    var property_count = ms.ReadInt();
                    var wait_count = 0;
                    var wait_for = property_count;
                    var check_finish = function () {
                        if (wait_count == wait_for) {
                            Object_1.VRObject.AddCache(path, mat);
                            Object_1.VRObject.EndLoad(path);
                            if (finish) {
                                finish(mat);
                            }
                        }
                    };
                    var _loop_1 = function(i) {
                        var property_name = read_string(ms);
                        var property_type = read_string(ms);
                        if (property_type == "Color") {
                            if (bundle == null) {
                                wait_count++;
                                check_finish();
                            }
                        }
                        else if (property_type == "Vector") {
                            if (bundle == null) {
                                wait_count++;
                                check_finish();
                            }
                        }
                        else if (property_type == "Float" || property_type == "Range") {
                            if (bundle == null) {
                                wait_count++;
                                check_finish();
                            }
                        }
                        else if (property_type == "TexEnv") {
                            var tex_path = read_string(ms);
                            if (tex_path.length > 0) {
                                if (bundle == null) {
                                    read_texture(tex_path, function (texture) {
                                        if (texture) {
                                            mat.SetTexture(property_name, texture);
                                        }
                                        wait_count++;
                                        check_finish();
                                    }, null);
                                }
                                else {
                                    var texture = read_texture(tex_path, null, bundle);
                                    if (texture) {
                                        mat.SetTexture(property_name, texture);
                                        if (texture instanceof Texture2D_1.Texture2D) {
                                            if (texture.format == Texture2D_1.TextureFormat.ETC_RGB4_X2) {
                                                mat.SetMainTextureTillingOffset(new Vector4_1.Vector4(1, 0.5, 0, 0));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    for (var i = 0; i < property_count; i++) {
                        _loop_1(i);
                    }
                    if (bundle != null) {
                        Object_1.VRObject.AddCache(path, mat);
                        return mat;
                    }
                    return null;
                };
                if (bundle == null) {
                    Shader_1.Shader.Find(shader_name, function (shader) {
                        on_shader_find(shader);
                    }, null);
                }
                else {
                    return on_shader_find(Shader_1.Shader.Find(shader_name, null, bundle));
                }
                return null;
            };
            if (bundle == null) {
                File_1.File.ReadAllBytes(path, function (bytes) {
                    var ms = new MemoryStream_1.MemoryStream(bytes, true);
                    do_read_3(ms);
                });
            }
            else {
                return do_read_3(bundle.GetAssetData(path));
            }
        }
        return null;
    }
    function read_animation_clip(path, finish, bundle) {
        if (Object_1.VRObject.IsLoading(path)) {
            Object_1.VRObject.WatchLoad(path, function (obj) {
                if (finish) {
                    finish(obj);
                }
            });
            return;
        }
        var cache = Object_1.VRObject.GetCache(path);
        if (cache) {
            if (bundle == null) {
                if (finish) {
                    finish(cache);
                }
            }
            else {
                return cache;
            }
        }
        else {
            if (bundle == null) {
                Object_1.VRObject.BeginLoad(path);
            }
            var do_read_4 = function (ms) {
                var clip = new AnimationClip_1.AnimationClip();
                var name = read_string(ms);
                clip.SetName(name);
                clip.frame_rate = ms.ReadFloat();
                clip.length = ms.ReadFloat();
                clip.wrap_mode = ms.ReadInt();
                var curve_count = ms.ReadInt();
                var property_names = [
                    "m_LocalPosition.x",
                    "m_LocalPosition.y",
                    "m_LocalPosition.z",
                    "m_LocalRotation.x",
                    "m_LocalRotation.y",
                    "m_LocalRotation.z",
                    "m_LocalRotation.w",
                    "m_LocalScale.x",
                    "m_LocalScale.y",
                    "m_LocalScale.z",
                ];
                for (var i = 0; i < curve_count; i++) {
                    var path_1 = read_string(ms);
                    var property = read_string(ms);
                    ms.ReadInt(); //	pre_wrap_mode
                    ms.ReadInt(); //	post_wrap_mode
                    var frame_count = ms.ReadInt();
                    var property_index = -1;
                    for (var j = 0; j < AnimationClip_1.CurveProperty.Count; j++) {
                        if (property == property_names[j]) {
                            property_index = j;
                            break;
                        }
                    }
                    var curve = null;
                    if (property_index >= 0) {
                        var p_binding = [null];
                        if (!clip.curves.TryGet(path_1, p_binding)) {
                            var binding = new AnimationClip_1.CurveBinding();
                            binding.path = path_1;
                            binding.curves.Resize(AnimationClip_1.CurveProperty.Count);
                            for (var j = 0; j < binding.curves.Size(); j++) {
                                binding.curves.Set(j, new AnimationClip_1.AnimationCurve());
                            }
                            clip.curves.Add(path_1, binding);
                            p_binding[0] = binding;
                        }
                        curve = p_binding[0].curves.Get(property_index);
                    }
                    for (var j = 0; j < frame_count; j++) {
                        var time = ms.ReadFloat();
                        var value = ms.ReadFloat();
                        var in_tangent = ms.ReadFloat();
                        var out_tangent = ms.ReadFloat();
                        ms.ReadInt(); //	tangent_mode
                        if (curve) {
                            curve.keys.Add(new AnimationClip_1.Keyframe(time, value, in_tangent, out_tangent));
                        }
                    }
                }
                Object_1.VRObject.AddCache(path, clip);
                if (bundle == null) {
                    Object_1.VRObject.EndLoad(path);
                    if (finish) {
                        finish(clip);
                    }
                }
                else {
                    return clip;
                }
                return null;
            };
            if (bundle == null) {
                File_1.File.ReadAllBytes(path, function (bytes) {
                    var ms = new MemoryStream_1.MemoryStream(bytes, true);
                    do_read_4(ms);
                });
            }
            else {
                return do_read_4(bundle.GetAssetData(path));
            }
        }
        return null;
    }
    function read_mesh_renderer(ms, renderer, bundle) {
        var mesh_path = read_string(ms);
        var mat_count = ms.ReadInt();
        var wait_count = 0;
        var wait_for = 1 + mat_count;
        var check_finish = function (r) {
            var mesh = r.shared_mesh;
            var mats = r.GetSharedMaterials();
            if (wait_count == wait_for) {
                if (mesh != null && !mats.Empty()) {
                    mesh.Update(mats.Get(0).GetShader().GetVertexLayoutMask());
                }
            }
        };
        if (mesh_path.length > 0) {
            if (bundle == null) {
                read_mesh(mesh_path, function (mesh) {
                    renderer.shared_mesh = mesh;
                    wait_count++;
                    check_finish(renderer);
                }, null);
            }
            else {
                renderer.shared_mesh = read_mesh(mesh_path, null, bundle);
            }
        }
        if (mat_count > 0) {
            var mats_1 = new Vector_1.Vector();
            for (var i = 0; i < mat_count; i++) {
                var mat_path = read_string(ms);
                if (mat_path.length > 0) {
                    if (bundle == null) {
                        read_material(mat_path, function (mat) {
                            mats_1.Add(mat);
                            renderer.SetSharedMaterials(mats_1);
                            wait_count++;
                            check_finish(renderer);
                        }, null);
                    }
                    else {
                        var mat = read_material(mat_path, null, bundle);
                        mats_1.Add(mat);
                    }
                }
            }
            if (bundle != null) {
                renderer.SetSharedMaterials(mats_1);
            }
        }
        if (bundle != null) {
            var mesh = renderer.shared_mesh;
            var mats = renderer.GetSharedMaterials();
            mesh.Update(mats.Get(0).GetShader().GetVertexLayoutMask());
        }
    }
    function read_skinned_mesh_renderer(ms, renderer, transform_instances, bundle) {
        var mesh_path = read_string(ms);
        var mat_count = ms.ReadInt();
        var wait_count = 0;
        var wait_for = 1 + mat_count;
        var check_finish = function (r) {
            var mesh = r.shared_mesh;
            var mats = r.GetSharedMaterials();
            if (wait_count == wait_for) {
                if (mesh != null && !mats.Empty()) {
                    mesh.Update(mats.Get(0).GetShader().GetVertexLayoutMask());
                }
            }
        };
        if (mesh_path.length > 0) {
            if (bundle == null) {
                read_mesh(mesh_path, function (mesh) {
                    renderer.shared_mesh = mesh;
                    wait_count++;
                    check_finish(renderer);
                }, null);
            }
            else {
                renderer.shared_mesh = read_mesh(mesh_path, null, bundle);
            }
        }
        if (mat_count > 0) {
            var mats_2 = new Vector_1.Vector();
            for (var i = 0; i < mat_count; i++) {
                var mat_path = read_string(ms);
                if (mat_path.length > 0) {
                    if (bundle == null) {
                        read_material(mat_path, function (mat) {
                            //let mat_instance = Material.Create(mat.GetShader());
                            //mat_instance.DeepCopy(mat);
                            mats_2.Add(mat);
                            renderer.SetSharedMaterials(mats_2);
                            wait_count++;
                            check_finish(renderer);
                        }, null);
                    }
                    else {
                        var mat = read_material(mat_path, null, bundle);
                        mats_2.Add(mat);
                    }
                }
            }
            if (bundle != null) {
                renderer.SetSharedMaterials(mats_2);
            }
        }
        if (bundle != null) {
            var mesh = renderer.shared_mesh;
            var mats = renderer.GetSharedMaterials();
            mesh.Update(mats.Get(0).GetShader().GetVertexLayoutMask());
        }
        var bone_count = ms.ReadInt();
        if (bone_count > 0) {
            var bones = new Vector_1.Vector(bone_count);
            for (var i = 0; i < bone_count; i++) {
                var bone_id = ms.ReadInt();
                bones.Set(i, transform_instances.Get(bone_id.toString()));
            }
            renderer.bones = bones;
            if (bone_count > SkinnedMeshRenderer_1.SkinnedMeshRenderer.BONE_MAX) {
                renderer.Enable(false);
                console.log("bone count " + bone_count + " over than " + SkinnedMeshRenderer_1.SkinnedMeshRenderer.BONE_MAX);
            }
        }
    }
    function read_animation(ms, animation, bundle) {
        var defaul_clip = read_string(ms);
        var clip_count = ms.ReadInt();
        animation.state_count = clip_count;
        var states = animation.GetAnimationStates();
        for (var i = 0; i < clip_count; i++) {
            var clip_path = read_string(ms);
            if (clip_path.length > 0) {
                if (bundle == null) {
                    read_animation_clip(clip_path, function (clip) {
                        if (clip) {
                            states.Add(clip.GetName(), new AnimationState_1.AnimationState(clip));
                        }
                    }, null);
                }
                else {
                    var clip = read_animation_clip(clip_path, null, bundle);
                    states.Add(clip.GetName(), new AnimationState_1.AnimationState(clip));
                }
            }
        }
    }
    function read_rect(ms, rect) {
        var anchor_min = read_vector2(ms);
        var anchor_max = read_vector2(ms);
        var offset_min = read_vector2(ms);
        var offset_max = read_vector2(ms);
        var pivot = read_vector2(ms);
        rect.SetAnchors(anchor_min, anchor_max);
        rect.SetOffsets(offset_min, offset_max);
        rect.SetPivot(pivot);
    }
    function read_canvas(ms, canvas) {
        var sorting_order = ms.ReadInt();
        canvas.sorting_order = sorting_order;
    }
    function read_label(ms, view) {
        var color = read_color(ms);
        var text = read_string(ms);
        var font_name = read_string(ms);
        var font_style = read_string(ms);
        var font_size = ms.ReadInt();
        var line_space = ms.ReadFloat();
        var rich = ms.ReadBool();
        var alignment = read_string(ms);
        if (font_name.length > 0) {
            view.SetFont(font_name);
            if (font_style == "Normal") {
                view.SetFontStyle(UILabel_1.FontStyle.Normal);
            }
            else if (font_style == "Bold") {
                view.SetFontStyle(UILabel_1.FontStyle.Bold);
            }
            else if (font_style == "Italic") {
                view.SetFontStyle(UILabel_1.FontStyle.Italic);
            }
            else if (font_style == "BoldAndItalic") {
                view.SetFontStyle(UILabel_1.FontStyle.BoldAndItalic);
            }
            view.SetFontSize(font_size);
        }
        view.SetColor(color);
        view.SetText(text);
        view.SetLineSpace(line_space);
        view.SetRich(rich);
        if (alignment == "UpperLeft") {
            view.SetAlignment(UILabel_1.TextAlignment.UpperLeft);
        }
        else if (alignment == "UpperCenter") {
            view.SetAlignment(UILabel_1.TextAlignment.UpperCenter);
        }
        else if (alignment == "UpperRight") {
            view.SetAlignment(UILabel_1.TextAlignment.UpperRight);
        }
        else if (alignment == "MiddleLeft") {
            view.SetAlignment(UILabel_1.TextAlignment.MiddleLeft);
        }
        else if (alignment == "MiddleCenter") {
            view.SetAlignment(UILabel_1.TextAlignment.MiddleCenter);
        }
        else if (alignment == "MiddleRight") {
            view.SetAlignment(UILabel_1.TextAlignment.MiddleRight);
        }
        else if (alignment == "LowerLeft") {
            view.SetAlignment(UILabel_1.TextAlignment.LowerLeft);
        }
        else if (alignment == "LowerCenter") {
            view.SetAlignment(UILabel_1.TextAlignment.LowerCenter);
        }
        else if (alignment == "LowerRight") {
            view.SetAlignment(UILabel_1.TextAlignment.LowerRight);
        }
    }
    function read_image(ms, view, bundle) {
        var color = read_color(ms);
        var sprite_type = ms.ReadInt();
        var fill_method = ms.ReadInt();
        var fill_origin = ms.ReadInt();
        var fill_amount = ms.ReadFloat();
        var fill_clock_wise = ms.ReadBool();
        var sprite_name = read_string(ms);
        if (sprite_name.length > 0) {
            var atlas_path = read_string(ms);
            if (bundle == null) {
                read_atlas(atlas_path, function (atlas) {
                    view.SetAtlas(atlas);
                    view.SetSpriteName(sprite_name);
                }, null);
            }
            else {
                var atlas = read_atlas(atlas_path, null, bundle);
                view.SetAtlas(atlas);
                view.SetSpriteName(sprite_name);
            }
        }
        view.SetColor(color);
        view.SetSpriteType(sprite_type);
        view.SetFillMethod(fill_method);
        view.SetFillOrigin(fill_origin);
        view.SetFillAmount(fill_amount);
        view.SetFillClockWise(fill_clock_wise);
    }
    function read_atlas(path, finish, bundle) {
        if (Object_1.VRObject.IsLoading(path)) {
            Object_1.VRObject.WatchLoad(path, function (obj) {
                if (finish) {
                    finish(obj);
                }
            });
            return null;
        }
        var cache = Object_1.VRObject.GetCache(path);
        if (cache) {
            if (bundle == null) {
                if (finish) {
                    finish(cache);
                }
            }
            else {
                return cache;
            }
        }
        else {
            if (bundle == null) {
                Object_1.VRObject.BeginLoad(path);
            }
            var do_read_5 = function (ms) {
                var atlas = Atlas_1.Atlas.Create();
                var texture_path = read_string(ms);
                var sprite_count = ms.ReadInt();
                for (var i = 0; i < sprite_count; i++) {
                    var name_1 = read_string(ms);
                    var x = ms.ReadFloat();
                    var y = ms.ReadFloat();
                    var w = ms.ReadFloat();
                    var h = ms.ReadFloat();
                    read_vector2(ms); //pivot
                    ms.ReadFloat(); //pixel per unit
                    var border = read_vector4(ms);
                    var sprite = Sprite_1.Sprite.Create(new Rect_1.Rect(x, y, w, h), border);
                    sprite.SetName(name_1);
                    atlas.AddSprite(name_1, sprite);
                }
                if (texture_path.length > 0) {
                    if (bundle == null) {
                        read_texture(texture_path, function (texture) {
                            atlas.texture = texture;
                            Object_1.VRObject.AddCache(path, atlas);
                            Object_1.VRObject.EndLoad(path);
                        }, null);
                    }
                    else {
                        atlas.texture = read_texture(texture_path, null, bundle);
                        Object_1.VRObject.AddCache(path, atlas);
                        return atlas;
                    }
                }
                return null;
            };
            if (bundle == null) {
                File_1.File.ReadAllBytes(path, function (bytes) {
                    var ms = new MemoryStream_1.MemoryStream(bytes, true);
                    do_read_5(ms);
                });
            }
            else {
                return do_read_5(bundle.GetAssetData(path));
            }
        }
        return null;
    }
    function read_transform(ms, parent, transform_instances, bundle) {
        if (bundle === void 0) { bundle = null; }
        var name = read_string(ms);
        var active = ms.ReadBool();
        var obj = GameObject_1.GameObject.Create(name);
        obj.SetActive(active);
        var transform = obj.GetTransform();
        if (parent) {
            transform.SetParent(parent);
        }
        var local_position = read_vector3(ms);
        var local_rotation = read_quaternion(ms);
        var local_scale = read_vector3(ms);
        var instance_id = ms.ReadInt();
        transform_instances.Add(instance_id.toString(), transform);
        transform.SetLocalPosition(local_position);
        transform.SetLocalRotation(local_rotation);
        transform.SetLocalScale(local_scale);
        var com_count = ms.ReadInt();
        for (var i = 0; i < com_count; i++) {
            var component_name = read_string(ms);
            if (component_name == "MeshRenderer") {
                var com = obj.AddComponent("MeshRenderer");
                read_mesh_renderer(ms, com, bundle);
            }
            else if (component_name == "Animation") {
                var com = obj.AddComponent("Animation");
                read_animation(ms, com, bundle);
            }
            else if (component_name == "SkinnedMeshRenderer") {
                var com = obj.AddComponent("SkinnedMeshRenderer");
                read_skinned_mesh_renderer(ms, com, transform_instances, bundle);
            }
            else if (component_name == "Canvas") {
                var com = obj.AddComponent("UICanvasRenderer");
                read_rect(ms, com.rect);
                var screen_w = Graphics_1.Graphics.GetDisplay().GetWidth();
                var screen_h = Graphics_1.Graphics.GetDisplay().GetHeight();
                com.rect.SetSize(new Vector2_1.Vector2(screen_w, screen_h));
                com.rect.OnAnchor();
                read_canvas(ms, com);
            }
            else if (component_name == "Text") {
                var com = obj.AddComponent("UILabel");
                read_rect(ms, com.rect);
                com.rect.OnAnchor();
                read_label(ms, com);
            }
            else if (component_name == "Image") {
                var com = obj.AddComponent("UISprite");
                read_rect(ms, com.rect);
                com.rect.OnAnchor();
                read_image(ms, com, bundle);
            }
            else if (component_name == "RectTransform") {
                var com = obj.AddComponent("UIView");
                read_rect(ms, com.rect);
            }
            else {
                console.log("no read component", component_name);
            }
        }
        var child_count = ms.ReadInt();
        for (var i = 0; i < child_count; i++) {
            read_transform(ms, transform, transform_instances, bundle);
        }
        return transform;
    }
    var AssetInfo = (function () {
        function AssetInfo() {
            this.name = "";
            this.offset = 0;
            this.size = 0;
        }
        return AssetInfo;
    }());
    var AssetBundle = (function () {
        function AssetBundle() {
            this.asset_count = 0;
            this.assets = new Map_1.VRMap();
        }
        AssetBundle.prototype.LoadGameObject = function (path) {
            var obj;
            var cache = Object_1.VRObject.GetCache(path);
            if (cache) {
                obj = cache;
            }
            else {
                var ms = this.GetAssetData(path);
                obj = read_transform(ms, null, new Map_1.VRMap(), this).GetGameObject();
                if (obj) {
                    Object_1.VRObject.AddCache(path, obj);
                }
            }
            return obj;
        };
        AssetBundle.prototype.GetAssetData = function (path) {
            var info = [null];
            if (this.assets.TryGet(path, info)) {
                var offset = info[0].offset;
                var size = info[0].size;
                return this.ms.SubStream(offset, size);
            }
            return null;
        };
        return AssetBundle;
    }());
    var Resource = (function () {
        function Resource() {
        }
        Resource.LoadTextureAsync = function (path, finish) {
            read_texture(path, finish, null);
        };
        Resource.LoadGameObjectAsync = function (path, finish) {
            if (Object_1.VRObject.IsLoading(path)) {
                Object_1.VRObject.WatchLoad(path, function (obj) {
                    if (finish) {
                        finish(obj);
                    }
                });
                return;
            }
            var cache = Object_1.VRObject.GetCache(path);
            if (cache) {
                if (finish) {
                    finish(cache);
                }
            }
            else {
                Object_1.VRObject.BeginLoad(path);
                File_1.File.ReadAllBytes(path, function (bytes) {
                    var ms = new MemoryStream_1.MemoryStream(bytes, true);
                    var obj = read_transform(ms, null, new Map_1.VRMap()).GetGameObject();
                    if (obj) {
                        Object_1.VRObject.AddCache(path, obj);
                    }
                    Object_1.VRObject.EndLoad(path);
                    if (finish) {
                        finish(obj);
                    }
                });
            }
        };
        Resource.LoadAssetBundleAsync = function (path, finish, progress) {
            File_1.File.ReadAllBytes(path, function (bytes) {
                var ms = new MemoryStream_1.MemoryStream(bytes, true);
                var bundle = new AssetBundle();
                bundle.ms = ms;
                bundle.asset_count = ms.ReadInt();
                for (var i = 0; i < bundle.asset_count; i++) {
                    var asset = new AssetInfo();
                    asset.name = read_string(ms);
                    asset.offset = ms.ReadInt();
                    asset.size = ms.ReadInt();
                    bundle.assets.Add(asset.name, asset);
                }
                finish(bundle);
            }, progress);
        };
        Resource.SetGlobalAssetBundle = function (bunlde) {
            Resource.m_bunlde = bunlde;
        };
        Resource.GetGlobalAssetBundle = function () {
            return Resource.m_bunlde;
        };
        return Resource;
    }());
    exports.Resource = Resource;
    Viry3D_1.Viry3D.Resource = Resource;
});
//# sourceMappingURL=Resource.js.map