import { VRObject } from "./Object"
import { GameObject } from "./GameObject"
import { Transform } from "./Transform"
import { Texture, TextureWrapMode, TextureFilterMode } from "./graphics/Texture"
import { Texture2D, TextureFormat } from "./graphics/Texture2D"
import { Material } from "./graphics/Material"
import { Shader } from "./graphics/Shader"
import { Mesh, Submesh } from "./graphics/Mesh"
import { Color } from "./graphics/Color"
import { File } from "./io/File"
import { VRMap } from "./container/Map"
import { Vector } from "./container/Vector"
import { MemoryStream } from "./io/MemoryStream"
import { Vector2 } from "./math/Vector2"
import { Vector3 } from "./math/Vector3"
import { Vector4 } from "./math/Vector4"
import { Matrix4x4 } from "./math/Matrix4x4"
import { Quaternion } from "./math/Quaternion"
import { MeshRenderer } from "./renderer/MeshRenderer"
import { SkinnedMeshRenderer } from "./renderer/SkinnedMeshRenderer"
import { Animation } from "./animation/Animation"
import { AnimationState } from "./animation/AnimationState"
import { AnimationClip, AnimationWrapMode, CurveProperty, AnimationCurve, CurveBinding, Keyframe } from "./animation/AnimationClip"
import { Graphics } from "./graphics/Graphics"
import { UICanvasRenderer } from "./ui/UICanvasRenderer"
import { UIRect } from "./ui/UIRect"
import { UILabel, FontStyle, TextAlignment } from "./ui/UILabel"
import { UISprite, SpriteType, SpriteFillMethod } from "./ui/UISprite"
import { Atlas } from "./ui/Atlas"
import { Sprite } from "./ui/Sprite"
import { UIView } from "./ui/UIView"
import { Rect } from "./math/Rect"
import { Viry3D } from "./Viry3D"

enum ImageFormat {
	RGB24,
	RGBA32,
	A8,
	DXT1,
	DXT5,
	ETC1,
	ETC1_X2,
	PVRTC1_4,
	PVRTC1_4_X2,
}

function read_string(ms: MemoryStream) {
	let size = ms.ReadInt();
	return ms.ReadString(size);
}

function read_vector2(ms: MemoryStream) {
	return new Vector2(ms.ReadFloat(), ms.ReadFloat());
}

function read_vector3(ms: MemoryStream) {
	return new Vector3(ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat());
}

function read_vector4(ms: MemoryStream) {
	return new Vector4(ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat());
}

function read_color(ms: MemoryStream) {
	return new Color(ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat());
}

function read_quaternion(ms: MemoryStream) {
	return new Quaternion(ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat(), ms.ReadFloat());
}

function read_matrix(ms: MemoryStream) {
	let array = Array<number>(16);
	for(let i = 0; i < 16; i++) {
		array[i] = ms.ReadFloat();
	}
	return new Matrix4x4(array);
}

function read_texture(path: string, finish: (tex: Texture) => void, bundle: AssetBundle): Texture {
	if(VRObject.IsLoading(path)) {
		VRObject.WatchLoad(path, (obj) => {
			if(finish) {
				finish(<Texture>obj);
			}
		});
		return null;
	}

	let cache = VRObject.GetCache(path);
	if(cache) {
		if(bundle == null) {
			if(finish) {
				finish(<Texture>cache);
			}
		} else {
			return <Texture>cache;
		}
	} else {
		if(bundle == null) {
			VRObject.BeginLoad(path);
		}

		let do_read = function(ms: MemoryStream): Texture {
			let texture_name = read_string(ms);
			let width = ms.ReadInt();
			let height = ms.ReadInt();
			let wrap_mode = <TextureWrapMode>ms.ReadInt();
			let filter_mode = <TextureFilterMode>ms.ReadInt();
			let texture_type = read_string(ms);

			if(texture_type == "Texture2D") {
				let mipmap_count = ms.ReadInt();
				let png_path = read_string(ms);
				let mipmap = mipmap_count > 1;

				if(bundle == null) {
					Texture2D.LoadFromFile(png_path, (texture) => {
						if(texture) {
							VRObject.AddCache(path, texture);
						}
						VRObject.EndLoad(path);

						if(finish) {
							finish(texture);
						}
					}, TextureFormat.RGBA32, wrap_mode, filter_mode, mipmap);
				} else {
					let ms_img = bundle.GetAssetData(png_path);
					width = ms_img.ReadInt();
					height = ms_img.ReadInt();
					let format = ms_img.ReadByte();
					
					let texture: Texture2D;
					if(format == ImageFormat.RGB24) {
						texture = Texture2D.Create(width, height, TextureFormat.RGB24, wrap_mode, filter_mode, mipmap, ms_img.ReadBytes(width * height * 3));
					} else if(format == ImageFormat.RGBA32) {
						texture = Texture2D.Create(width, height, TextureFormat.RGBA32, wrap_mode, filter_mode, mipmap, ms_img.ReadBytes(width * height * 4));
					} else if(format == ImageFormat.DXT1 || format == ImageFormat.DXT5) {
						let magic = ms_img.ReadUInt();
						if(magic == 0x20534444) {
							let header_size = ms_img.ReadInt();
							let flags = ms_img.ReadInt();
							height = ms_img.ReadInt();
							width = ms_img.ReadInt();
							let size_0 = ms_img.ReadInt();
							let depth = ms_img.ReadInt();
							mipmap_count = ms_img.ReadInt();

							ms_img.ReadBytes(96);

							let w = width;
							let h = height;
							let dxt_size = 0;
							let bpp = 0;
							let tex_format: TextureFormat;

							if(format == ImageFormat.DXT1) {
								bpp = 4;
								tex_format = TextureFormat.DXT1;
							} else if(format == ImageFormat.DXT5) {
								bpp = 8;
								tex_format = TextureFormat.DXT5;
							}

							for(let i = 0; i < mipmap_count; i++) {
								let pitch = Math.max(1, ((w + 3) / 4)) * (bpp * 2);
								let size = w * h * bpp / 8;
								if(size < pitch) {
									size = pitch;
								}
								dxt_size += size;
								w >>= 1;
								h >>= 1;
							}
							let dxt = ms_img.ReadBytes(dxt_size);
							texture = Texture2D.Create(width, height, tex_format, wrap_mode, filter_mode, mipmap, dxt);
						}
					} else if(format == ImageFormat.ETC1 || format == ImageFormat.ETC1_X2) {
						let magic0 = ms_img.ReadUInt();
						let magic1 = ms_img.ReadUInt();
						let magic2 = ms_img.ReadUInt();

						if(	magic0 == 0x58544bab &&
							magic1 == 0xbb313120 &&
							magic2 == 0x0a1a0a0d) {
							let endianess = ms_img.ReadUInt();
							let glType = ms_img.ReadUInt();
							let glTypeSize = ms_img.ReadUInt();
							let glFormat = ms_img.ReadUInt();
							let glInternalFormat = ms_img.ReadUInt();
							let glBaseInternalFormat = ms_img.ReadUInt();
							let pixelWidth = ms_img.ReadUInt();
							let pixelHeight = ms_img.ReadUInt();
							let pixelDepth = ms_img.ReadUInt();
							let numberOfArrayElements = ms_img.ReadUInt();
							let numberOfFaces = ms_img.ReadUInt();
							let numberOfMipmapLevels = ms_img.ReadUInt();
							let bytesOfKeyValueData = ms_img.ReadUInt();

							if(bytesOfKeyValueData > 0) {
								ms_img.ReadBytes(bytesOfKeyValueData);
							}

							mipmap_count = numberOfMipmapLevels;
							width = pixelWidth;
							height = pixelHeight;

							let w = width;
							let h = height;
							let etc1_size = 0;

							for(let j = 0; j < mipmap_count; j++) {
								let w_pad = w;
								let h_pad = h;
								if(w_pad % 4 != 0 || w_pad == 0) w_pad += 4 - w_pad % 4;
								if(h_pad % 4 != 0 || h_pad == 0) h_pad += 4 - h_pad % 4;
								let size = w_pad * h_pad / 2;

								etc1_size += 4 + size;

								w >>= 1;
								h >>= 1;
							}

							let etc1 = ms_img.ReadBytes(etc1_size);
							let fmt = format == ImageFormat.ETC1 ? TextureFormat.ETC_RGB4 : TextureFormat.ETC_RGB4_X2;
							texture = Texture2D.Create(width, height, fmt, wrap_mode, filter_mode, mipmap, etc1);
						}
					} else if(format == ImageFormat.PVRTC1_4 || format == ImageFormat.PVRTC1_4_X2) {
						let version = ms_img.ReadUInt();
						let flag = ms_img.ReadUInt();
						let format_0 = ms_img.ReadUInt();
						let format_1 = ms_img.ReadUInt();
						
						if(	version == 0x03525650 &&
							format_0 == 2) {
							let color_space = ms_img.ReadUInt();
							let channel_type = ms_img.ReadUInt();
							height = ms_img.ReadUInt();
							width = ms_img.ReadUInt();
							let depth = ms_img.ReadUInt();
							let array_count = ms_img.ReadUInt();
							let face_count = ms_img.ReadUInt();
							mipmap_count = ms_img.ReadUInt();
							let meta_size = ms_img.ReadUInt();
							let cc = ms_img.ReadUInt();
							let key = ms_img.ReadUInt();
							let data_size = ms_img.ReadUInt();
							ms_img.ReadBytes(meta_size - 12);

							let w = width;
							let h = height;
							let pvr_size = 0;

							for(let j = 0; j < mipmap_count; j++) {
								pvr_size += w * h / 2;

								w >>= 1;
								h >>= 1;
							}

							let pvr_rgb = ms_img.ReadBytes(pvr_size);
							let fmt = format == ImageFormat.PVRTC1_4 ? TextureFormat.PVRTC_RGB4 : TextureFormat.PVRTC_RGB4_X2;
							texture = Texture2D.Create(width, height, fmt, wrap_mode, filter_mode, mipmap, pvr_rgb);

							if(format == ImageFormat.PVRTC1_4_X2) {
								ms_img.ReadBytes(4 * 12);
								meta_size = ms_img.ReadUInt();
								ms_img.ReadBytes(meta_size);

								let pvr_alpha = ms_img.ReadBytes(pvr_size);
								texture.pvr_alpha = Texture2D.Create(width, height, fmt, wrap_mode, filter_mode, mipmap, pvr_alpha);
							}
						}
					}

					if(texture) {
						VRObject.AddCache(path, texture);
					}

					return texture;
				}
			}

			return null;
		}

		if(bundle == null) {
			File.ReadAllBytes(path, (bytes) => {
				let ms = new MemoryStream(bytes, true);

				do_read(ms);
			});
		} else {
			return do_read(bundle.GetAssetData(path));
		}
	}

	return null;
}

function read_mesh(path: string, finish: (mesh: Mesh) => void, bundle: AssetBundle): Mesh {
	if(VRObject.IsLoading(path)) {
		VRObject.WatchLoad(path, (obj) => {
			if(finish) {
				finish(<Mesh>obj);
			}
		});
		return null;
	}

	let cache = VRObject.GetCache(path);
	if(cache) {
		if(bundle == null) {
			if(finish) {
				finish(<Mesh>cache);
			}
		} else {
			return <Mesh>cache;
		}
	} else {
		if(bundle == null) {
			VRObject.BeginLoad(path);
		}

		let do_read = function (ms: MemoryStream): Mesh {
			let mesh = Mesh.Create();
			VRObject.AddCache(path, mesh);

			if(bundle == null) {
				VRObject.EndLoad(path);
			}

			let mesh_name = read_string(ms);
			mesh.SetName(mesh_name);

			let vertex_count = ms.ReadInt();
			if(vertex_count > 0) {
				mesh.vertices.Resize(vertex_count);
				for(let i = 0; i < vertex_count; i++) {
					mesh.vertices.Set(i, read_vector3(ms));
				}
			}

			let uv_count = ms.ReadInt();
			if(uv_count > 0) {
				mesh.uv.Resize(uv_count);
				for(let i = 0; i < uv_count; i++) {
					mesh.uv.Set(i, read_vector2(ms));
				}
			}

			let color_count = ms.ReadInt();
			if(color_count > 0) {
				mesh.colors.Resize(color_count);
				for(let i = 0; i < color_count; i++) {
					mesh.colors.Set(i, read_color(ms));
				}
			}

			let uv2_count = ms.ReadInt();
			if(uv2_count > 0) {
				mesh.uv2.Resize(uv2_count);
				for(let i = 0; i < uv2_count; i++) {
					mesh.uv2.Set(i, read_vector2(ms));
				}
			}

			let normal_count = ms.ReadInt();
			if(normal_count > 0) {
				mesh.normals.Resize(normal_count);
				for(let i = 0; i < normal_count; i++) {
					mesh.normals.Set(i, read_vector3(ms));
				}
			}

			let tangent_count = ms.ReadInt();
			if(tangent_count > 0) {
				mesh.tangents.Resize(tangent_count);
				for(let i = 0; i < tangent_count; i++) {
					mesh.tangents.Set(i, read_vector4(ms));
				}
			}

			let bone_weight_count = ms.ReadInt();
			if(bone_weight_count > 0) {
				mesh.bone_weights.Resize(bone_weight_count);
				for(let i = 0; i < bone_weight_count; i++) {
					mesh.bone_weights.Set(i, read_vector4(ms));
				}
			}

			let bone_index_count = ms.ReadInt();
			if(bone_index_count > 0) {
				mesh.bone_indices.Resize(bone_index_count);
				for(let i = 0; i < bone_index_count; i++) {
					mesh.bone_indices.Set(i, read_vector4(ms));
				}
			}

			let bind_pose_count = ms.ReadInt();
			if(bind_pose_count > 0) {
				mesh.bind_poses.Resize(bind_pose_count);
				for(let i = 0; i < bind_pose_count; i++) {
					mesh.bind_poses.Set(i, read_matrix(ms));
				}
			}

			let index_count = ms.ReadInt();
			if(index_count > 0) {
				mesh.triangles.Resize(index_count);
				for(let i = 0; i < index_count; i++) {
					mesh.triangles.Set(i, ms.ReadUint16());
				}
			}

			let submesh_count = ms.ReadInt();
			if(submesh_count > 0) {
				mesh.submeshes.Resize(submesh_count);
				for(let i = 0; i < submesh_count; i++) {
					let submesh = new Submesh();
					submesh.start = ms.ReadInt();
					submesh.count = ms.ReadInt();
					mesh.submeshes.Set(i, submesh);
				}
			}

			if(bundle == null) {
				if(finish) {
					finish(mesh);
				}
			} else {
				return mesh;
			}
			
			return null;
		};

		if(bundle == null) {
			File.ReadAllBytes(path, (bytes) => {
				let ms = new MemoryStream(bytes, true);

				do_read(ms);
			});
		} else {
			return do_read(bundle.GetAssetData(path));
		}
	}

	return null;
}

function read_material(path: string, finish: (mat: Material) => void, bundle: AssetBundle): Material {
	if(VRObject.IsLoading(path)) {
		VRObject.WatchLoad(path, (obj) => {
			if(finish) {
				finish(<Material>obj);
			}
		});
		return null;
	}

	let cache = VRObject.GetCache(path);
	if(cache) {
		if(bundle == null) {
			if(finish) {
				finish(<Material>cache);
			}
		} else {
			return <Material>cache;
		}
	} else {
		if(bundle == null) {
			VRObject.BeginLoad(path);
		}

		let do_read = function (ms: MemoryStream): Material {
			let mat_name = read_string(ms);
			let shader_name = read_string(ms);

			let on_shader_find = function(shader: Shader): Material {
				let mat = Material.Create(shader);
				mat.SetName(mat_name);

				let property_count = ms.ReadInt();

				let wait_count = 0;
				let wait_for = property_count;
				let check_finish = function () {
					if(wait_count == wait_for) {
						VRObject.AddCache(path, mat);
						VRObject.EndLoad(path);

						if(finish) {
							finish(mat);
						}
					}
				}

				for(let i = 0; i < property_count; i++) {
					let property_name = read_string(ms);
					let property_type = read_string(ms);

					if(property_type == "Color") {
						if(bundle == null) {
							wait_count++;
							check_finish();
						}
					} else if(property_type == "Vector") {
						if(bundle == null) {
							wait_count++;
							check_finish();
						}
					} else if(property_type == "Float" || property_type == "Range") {
						if(bundle == null) {
							wait_count++;
							check_finish();
						}
					} else if(property_type == "TexEnv") {
						let tex_path = read_string(ms);

						if(tex_path.length > 0) {
							if(bundle == null) {
								read_texture(tex_path, (texture) => {
									if(texture) {
										mat.SetTexture(property_name, texture);
									}

									wait_count++;
									check_finish();
								}, null);
							} else {
								let texture = read_texture(tex_path, null, bundle);
								if(texture) {
									mat.SetTexture(property_name, texture);

									if(texture instanceof Texture2D) {
										if(texture.format == TextureFormat.ETC_RGB4_X2) {
											mat.SetMainTextureTillingOffset(new Vector4(1, 0.5, 0, 0));
										}
									}
								}
							}
						}
					}
				}

				if(bundle != null) {
					VRObject.AddCache(path, mat);

					return mat;
				}

				return null;
			}

			if(bundle == null) {
				Shader.Find(shader_name, (shader) => {
					on_shader_find(shader);
				}, null);
			} else {
				return on_shader_find(Shader.Find(shader_name, null, bundle));
			}

			return null;
		}

		if(bundle == null) {
			File.ReadAllBytes(path, (bytes) => {
				let ms = new MemoryStream(bytes, true);

				do_read(ms);
			});
		} else {
			return do_read(bundle.GetAssetData(path));
		}
	}

	return null;
}

function read_animation_clip(path: string, finish: (clip: AnimationClip) => void, bundle: AssetBundle): AnimationClip {
	if(VRObject.IsLoading(path)) {
		VRObject.WatchLoad(path, (obj) => {
			if(finish) {
				finish(<AnimationClip>obj);
			}
		});
		return;
	}

	let cache = VRObject.GetCache(path);
	if(cache) {
		if(bundle == null) {
			if(finish) {
				finish(<AnimationClip>cache);
			}
		} else {
			return <AnimationClip>cache;
		}
	} else {
		if(bundle == null) {
			VRObject.BeginLoad(path);
		}

		let do_read = function (ms: MemoryStream): AnimationClip {
			let clip = new AnimationClip();

			let name = read_string(ms);
			clip.SetName(name);
			clip.frame_rate = ms.ReadFloat();
			clip.length = ms.ReadFloat();
			clip.wrap_mode = <AnimationWrapMode>ms.ReadInt();
			let curve_count = ms.ReadInt();

			const property_names = [
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

			for(let i = 0; i < curve_count; i++) {
				let path = read_string(ms);
				let property = read_string(ms);
				ms.ReadInt();	//	pre_wrap_mode
				ms.ReadInt();	//	post_wrap_mode
				let frame_count = ms.ReadInt();

				let property_index = -1;
				for(let j = 0; j < CurveProperty.Count; j++) {
					if(property == property_names[j]) {
						property_index = j;
						break;
					}
				}

				let curve: AnimationCurve = null;
				if(property_index >= 0) {
					let p_binding = [<CurveBinding>null];
					if(!clip.curves.TryGet(path, p_binding)) {
						let binding = new CurveBinding();
						binding.path = path;
						binding.curves.Resize(CurveProperty.Count);
						for(let j = 0; j < binding.curves.Size(); j++) {
							binding.curves.Set(j, new AnimationCurve());
						}

						clip.curves.Add(path, binding);

						p_binding[0] = binding;
					}

					curve = p_binding[0].curves.Get(property_index);
				}

				for(let j = 0; j < frame_count; j++) {
					let time = ms.ReadFloat();
					let value = ms.ReadFloat();
					let in_tangent = ms.ReadFloat();
					let out_tangent = ms.ReadFloat();
					ms.ReadInt();	//	tangent_mode

					if(curve) {
						curve.keys.Add(new Keyframe(time, value, in_tangent, out_tangent));
					}
				}
			}

			VRObject.AddCache(path, clip);

			if(bundle == null) {
				VRObject.EndLoad(path);

				if(finish) {
					finish(clip);
				}
			} else {
				return clip;
			}

			return null;
		};

		if(bundle == null) {
			File.ReadAllBytes(path, (bytes) => {
				let ms = new MemoryStream(bytes, true);

				do_read(ms);
			});
		} else {
			return do_read(bundle.GetAssetData(path));
		}
	}

	return null;
}

function read_mesh_renderer(ms: MemoryStream, renderer: MeshRenderer, bundle: AssetBundle) {
	let mesh_path = read_string(ms);
	let mat_count = ms.ReadInt();

	let wait_count = 0;
	let wait_for = 1 + mat_count;
	let check_finish = function (r: MeshRenderer) {
		let mesh = r.shared_mesh;
		let mats = r.GetSharedMaterials();

		if(wait_count == wait_for) {
			if(mesh != null && !mats.Empty()) {
				mesh.Update(mats.Get(0).GetShader().GetVertexLayoutMask());
			}
		}
	}

	if(mesh_path.length > 0) {
		if(bundle == null) {
			read_mesh(mesh_path, (mesh) => {
				renderer.shared_mesh = mesh;

				wait_count++;
				check_finish(renderer);
			}, null);
		} else {
			renderer.shared_mesh = read_mesh(mesh_path, null, bundle);
		}
	}

	if(mat_count > 0) {
		let mats = new Vector<Material>();
		
		for(let i = 0; i < mat_count; i++) {
			let mat_path = read_string(ms);
			
			if(mat_path.length > 0) {
				if(bundle == null) {
					read_material(mat_path, (mat) => {
						mats.Add(mat);
						renderer.SetSharedMaterials(mats);

						wait_count++;
						check_finish(renderer);
					}, null);
				} else {
					let mat = read_material(mat_path, null, bundle);
					mats.Add(mat);
				}
			}
		}

		if(bundle != null) {
			renderer.SetSharedMaterials(mats);
		}
	}

	if(bundle != null) {
		let mesh = renderer.shared_mesh;
		let mats = renderer.GetSharedMaterials();
		mesh.Update(mats.Get(0).GetShader().GetVertexLayoutMask());
	}
}

function read_skinned_mesh_renderer(ms: MemoryStream, renderer: SkinnedMeshRenderer, transform_instances: VRMap<string, Transform>, bundle: AssetBundle) {
	let mesh_path = read_string(ms);
	let mat_count = ms.ReadInt();

	let wait_count = 0;
	let wait_for = 1 + mat_count;
	let check_finish = function (r: SkinnedMeshRenderer) {
		let mesh = r.shared_mesh;
		let mats = r.GetSharedMaterials();

		if(wait_count == wait_for) {
			if(mesh != null && !mats.Empty()) {
				mesh.Update(mats.Get(0).GetShader().GetVertexLayoutMask());
			}
		}
	}

	if(mesh_path.length > 0) {
		if(bundle == null) {
			read_mesh(mesh_path, (mesh) => {
				renderer.shared_mesh = mesh;

				wait_count++;
				check_finish(renderer);
			}, null);
		} else {
			renderer.shared_mesh = read_mesh(mesh_path, null, bundle);
		}
	}

	if(mat_count > 0) {
		let mats = new Vector<Material>();

		for(let i = 0; i < mat_count; i++) {
			let mat_path = read_string(ms);

			if(mat_path.length > 0) {
				if(bundle == null) {
					read_material(mat_path, (mat) => {
						//let mat_instance = Material.Create(mat.GetShader());
						//mat_instance.DeepCopy(mat);
						mats.Add(mat);
						renderer.SetSharedMaterials(mats);

						wait_count++;
						check_finish(renderer);
					}, null);
				} else {
					let mat = read_material(mat_path, null, bundle);
					mats.Add(mat);
				}
			}
		}

		if(bundle != null) {
			renderer.SetSharedMaterials(mats);
		}
	}

	if(bundle != null) {
		let mesh = renderer.shared_mesh;
		let mats = renderer.GetSharedMaterials();
		mesh.Update(mats.Get(0).GetShader().GetVertexLayoutMask());
	}

	let bone_count = ms.ReadInt();
	if(bone_count > 0) {
		let bones = new Vector<Transform>(bone_count);

		for(let i = 0; i < bone_count; i++) {
			let bone_id = ms.ReadInt();

			bones.Set(i, transform_instances.Get(bone_id.toString()));
		}

		renderer.bones = bones;

		if(bone_count > SkinnedMeshRenderer.BONE_MAX) {
			renderer.Enable(false);
			console.log("bone count " + bone_count + " over than " + SkinnedMeshRenderer.BONE_MAX);
		}
	}
}

function read_animation(ms: MemoryStream, animation: Animation, bundle: AssetBundle) {
	let defaul_clip = read_string(ms);
	let clip_count = ms.ReadInt();

	animation.state_count = clip_count;
	let states = animation.GetAnimationStates();

	for(let i = 0; i < clip_count; i++) {
		let clip_path = read_string(ms);

		if(clip_path.length > 0) {
			if(bundle == null) {
				read_animation_clip(clip_path, (clip) => {
					if(clip) {
						states.Add(clip.GetName(), new AnimationState(clip));
					}
				}, null);
			} else {
				let clip = read_animation_clip(clip_path, null, bundle);
				states.Add(clip.GetName(), new AnimationState(clip));
			}
		}
	}
}

function read_rect(ms: MemoryStream, rect: UIRect) {
	let anchor_min = read_vector2(ms);
	let anchor_max = read_vector2(ms);
	let offset_min = read_vector2(ms);
	let offset_max = read_vector2(ms);
	let pivot = read_vector2(ms);

	rect.SetAnchors(anchor_min, anchor_max);
	rect.SetOffsets(offset_min, offset_max);
	rect.SetPivot(pivot);
}

function read_canvas(ms: MemoryStream, canvas: UICanvasRenderer) {
	let sorting_order = ms.ReadInt();

	canvas.sorting_order = sorting_order;
}

function read_label(ms: MemoryStream, view: UILabel) {
	let color = read_color(ms);
	let text = read_string(ms);
	let font_name = read_string(ms);
	let font_style = read_string(ms);
	let font_size = ms.ReadInt();
	let line_space = ms.ReadFloat();
	let rich = ms.ReadBool();
	let alignment = read_string(ms);

	if(font_name.length > 0) {
		view.SetFont(font_name);

		if(font_style == "Normal") {
			view.SetFontStyle(FontStyle.Normal);
		} else if(font_style == "Bold") {
			view.SetFontStyle(FontStyle.Bold);
		} else if(font_style == "Italic") {
			view.SetFontStyle(FontStyle.Italic);
		} else if(font_style == "BoldAndItalic") {
			view.SetFontStyle(FontStyle.BoldAndItalic);
		}

		view.SetFontSize(font_size);
	}

	view.SetColor(color);
	view.SetText(text);
	view.SetLineSpace(line_space);
	view.SetRich(rich);

	if(alignment == "UpperLeft") {
		view.SetAlignment(TextAlignment.UpperLeft);
	} else if(alignment == "UpperCenter") {
		view.SetAlignment(TextAlignment.UpperCenter);
	} else if(alignment == "UpperRight") {
		view.SetAlignment(TextAlignment.UpperRight);
	} else if(alignment == "MiddleLeft") {
		view.SetAlignment(TextAlignment.MiddleLeft);
	} else if(alignment == "MiddleCenter") {
		view.SetAlignment(TextAlignment.MiddleCenter);
	} else if(alignment == "MiddleRight") {
		view.SetAlignment(TextAlignment.MiddleRight);
	} else if(alignment == "LowerLeft") {
		view.SetAlignment(TextAlignment.LowerLeft);
	} else if(alignment == "LowerCenter") {
		view.SetAlignment(TextAlignment.LowerCenter);
	} else if(alignment == "LowerRight") {
		view.SetAlignment(TextAlignment.LowerRight);
	}
}

function read_image(ms: MemoryStream, view: UISprite, bundle: AssetBundle) {
	let color = read_color(ms);
	let sprite_type = <SpriteType>ms.ReadInt();
	let fill_method = <SpriteFillMethod>ms.ReadInt();
	let fill_origin = ms.ReadInt();
	let fill_amount = ms.ReadFloat();
	let fill_clock_wise = ms.ReadBool();
	let sprite_name = read_string(ms);

	if(sprite_name.length > 0) {
		let atlas_path = read_string(ms);
		
		if(bundle == null) {
			read_atlas(atlas_path, (atlas) => {
				view.SetAtlas(atlas);
				view.SetSpriteName(sprite_name);
			}, null);
		} else {
			let atlas = read_atlas(atlas_path, null, bundle);
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

function read_atlas(path: string, finish: (atlas: Atlas) => void, bundle: AssetBundle): Atlas {
	if(VRObject.IsLoading(path)) {
		VRObject.WatchLoad(path, (obj) => {
			if(finish) {
				finish(<Atlas>obj);
			}
		});
		return null;
	}

	let cache = VRObject.GetCache(path);
	if(cache) {
		if(bundle == null) {
			if(finish) {
				finish(<Atlas>cache);
			}
		} else {
			return <Atlas>cache;
		}
	} else {
		if(bundle == null) {
			VRObject.BeginLoad(path);
		}

		let do_read = function (ms: MemoryStream): Atlas {
			let atlas = Atlas.Create();

			let texture_path = read_string(ms);
			
			let sprite_count = ms.ReadInt();
			for(let i = 0; i < sprite_count; i++) {
				let name = read_string(ms);
				let x = ms.ReadFloat();
				let y = ms.ReadFloat();
				let w = ms.ReadFloat();
				let h = ms.ReadFloat();
				read_vector2(ms);//pivot
				ms.ReadFloat();//pixel per unit
				let border = read_vector4(ms);

				let sprite = Sprite.Create(new Rect(x, y, w, h), border);
				sprite.SetName(name);
				atlas.AddSprite(name, sprite);
			}

			if(texture_path.length > 0) {
				if(bundle == null) {
					read_texture(texture_path, (texture) => {
						atlas.texture = <Texture2D>texture;

						VRObject.AddCache(path, atlas);
						VRObject.EndLoad(path);
					}, null);
				} else {
					atlas.texture = <Texture2D>read_texture(texture_path, null, bundle);

					VRObject.AddCache(path, atlas);

					return atlas;
				}
			}

			return null;
		}

		if(bundle == null) {
			File.ReadAllBytes(path, (bytes) => {
				let ms = new MemoryStream(bytes, true);

				do_read(ms);
			});
		} else {
			return do_read(bundle.GetAssetData(path));
		}
	}

	return null;
}

function read_transform(ms: MemoryStream, parent: Transform, transform_instances: VRMap<string, Transform>, bundle: AssetBundle = null) {
	let name = read_string(ms);
	let active = ms.ReadBool();

	let obj = GameObject.Create(name);
	obj.SetActive(active);
	let transform = obj.GetTransform();
	if(parent) {
		transform.SetParent(parent);
	}

	let local_position = read_vector3(ms);
	let local_rotation = read_quaternion(ms);
	let local_scale = read_vector3(ms);

	let instance_id = ms.ReadInt();
	transform_instances.Add(instance_id.toString(), transform);

	transform.SetLocalPosition(local_position);
	transform.SetLocalRotation(local_rotation);
	transform.SetLocalScale(local_scale);

	let com_count = ms.ReadInt();

	for(let i = 0; i < com_count; i++) {
		let component_name = read_string(ms);

		if(component_name == "MeshRenderer") {
			let com = <MeshRenderer>obj.AddComponent("MeshRenderer");

			read_mesh_renderer(ms, com, bundle);
		} else if(component_name == "Animation") {
			let com = <Animation>obj.AddComponent("Animation");

			read_animation(ms, com, bundle);
		} else if(component_name == "SkinnedMeshRenderer") {
			let com = <SkinnedMeshRenderer>obj.AddComponent("SkinnedMeshRenderer");

			read_skinned_mesh_renderer(ms, com, transform_instances, bundle);
		} else if(component_name == "Canvas") {
			let com = <UICanvasRenderer>obj.AddComponent("UICanvasRenderer");

			read_rect(ms, com.rect);

			let screen_w = Graphics.GetDisplay().GetWidth();
			let screen_h = Graphics.GetDisplay().GetHeight();
			com.rect.SetSize(new Vector2(screen_w, screen_h));

			com.rect.OnAnchor();

			read_canvas(ms, com);
		} else if(component_name == "Text") {
			let com = <UILabel>obj.AddComponent("UILabel");

			read_rect(ms, com.rect);
			com.rect.OnAnchor();

			read_label(ms, com);
		} else if(component_name == "Image") {
			let com = <UISprite>obj.AddComponent("UISprite");

			read_rect(ms, com.rect);
			com.rect.OnAnchor();

			read_image(ms, com, bundle);
		} else if(component_name == "RectTransform") {
			let com = <UIView>obj.AddComponent("UIView");

			read_rect(ms, com.rect);
		} else {
			console.log("no read component", component_name);
		}
	}

	let child_count = ms.ReadInt();
	for(let i = 0; i < child_count; i++) {
		read_transform(ms, transform, transform_instances, bundle);
	}

	return transform;
}

class AssetInfo {
	name = "";
	offset = 0;
	size = 0;
}

class AssetBundle {
	LoadGameObject(path: string): GameObject {
		let obj: GameObject;

		let cache = VRObject.GetCache(path);
		if(cache) {
			obj = <GameObject>cache;
		} else {
			let ms = this.GetAssetData(path);

			obj = read_transform(ms, null, new VRMap<string, Transform>(), this).GetGameObject();

			if(obj) {
				VRObject.AddCache(path, obj);
			}
		}

		return obj;
	}

	GetAssetData(path: string): MemoryStream {
		let info = [<AssetInfo>null];
		if(this.assets.TryGet(path, info)) {
			let offset = info[0].offset;
			let size = info[0].size;

			return this.ms.SubStream(offset, size);
		}

		return null;
	}

	asset_count = 0;
	assets = new VRMap<string, AssetInfo>();
	ms: MemoryStream;
}

export class Resource {
	static LoadTextureAsync(path: string, finish: (tex: Texture) => void) {
		read_texture(path, finish, null);
	}

	static LoadGameObjectAsync(path: string, finish: (obj: GameObject) => void) {
		if(VRObject.IsLoading(path)) {
			VRObject.WatchLoad(path, (obj) => {
				if(finish) {
					finish(<GameObject>obj);
				}
			});
			return;
		}

		let cache = VRObject.GetCache(path);
		if(cache) {
			if(finish) {
				finish(<GameObject>cache);
			}
		} else {
			VRObject.BeginLoad(path);

			File.ReadAllBytes(path, (bytes) => {
				let ms = new MemoryStream(bytes, true);

				let obj = read_transform(ms, null, new VRMap<string, Transform>()).GetGameObject();

				if(obj) {
					VRObject.AddCache(path, obj);
				}
				VRObject.EndLoad(path);

				if(finish) {
					finish(obj);
				}
			});
		}
	}

	static LoadAssetBundleAsync(path: string, finish: (bunlde: AssetBundle) => void, progress: (e: ProgressEvent) => void) {
		File.ReadAllBytes(path, (bytes) => {
			let ms = new MemoryStream(bytes, true);

			let bundle = new AssetBundle();
			bundle.ms = ms;
			bundle.asset_count = ms.ReadInt();

			for(let i = 0; i < bundle.asset_count; i++) {
				let asset = new AssetInfo();
				asset.name = read_string(ms);
				asset.offset = ms.ReadInt();
				asset.size = ms.ReadInt();

				bundle.assets.Add(asset.name, asset);
			}

			finish(bundle);
		}, progress);
	}

	static SetGlobalAssetBundle(bunlde: AssetBundle) {
		Resource.m_bunlde = bunlde;
	}

	static GetGlobalAssetBundle(): AssetBundle {
		return Resource.m_bunlde;
	}

	private static m_bunlde: AssetBundle;
}

Viry3D.Resource = Resource;