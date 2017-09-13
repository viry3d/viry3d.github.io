import { Application } from "./lib/Application"
import { GameObject } from "./lib/GameObject"
import { Transform } from "./lib/Transform"
import { Component } from "./lib/Component"
import { Camera } from "./lib/graphics/Camera"
import { Mesh } from "./lib/graphics/Mesh"
import { Vector3 } from "./lib/math/Vector3"
import { Vector2 } from "./lib/math/Vector2"
import { Quaternion } from "./lib/math/Quaternion"
import { Material } from "./lib/graphics/Material"
import { Shader } from "./lib/graphics/Shader"
import { MeshRenderer } from "./lib/renderer/MeshRenderer"
import { Texture2D, TextureFormat } from "./lib/graphics/Texture2D"
import { Resource } from "./lib/Resource"

export class AppMesh extends Application {
	constructor() {
		super();
		this.SetName("Viry3D::AppMesh");
		this.SetInitSize(800, 600);
	}
	
	Start() {
		let camera = <Camera>GameObject.Create("camera").AddComponent("Camera");
		camera.GetTransform().SetPosition(new Vector3(0, 6, -10));
		camera.GetTransform().SetRotation(Quaternion.Euler(30, 0, 0));
		camera.SetCullingMask(1 << 0);
		
		let mesh = Mesh.Create();
		mesh.vertices.Add(new Vector3(-1, 1, -1));
		mesh.vertices.Add(new Vector3(-1, -1, -1));
		mesh.vertices.Add(new Vector3(1, -1, -1));
		mesh.vertices.Add(new Vector3(1, 1, -1));
		mesh.vertices.Add(new Vector3(-1, 1, 1));
		mesh.vertices.Add(new Vector3(-1, -1, 1));
		mesh.vertices.Add(new Vector3(1, -1, 1));
		mesh.vertices.Add(new Vector3(1, 1, 1));
		mesh.uv.Add(new Vector2(0, 0));
		mesh.uv.Add(new Vector2(0, 1));
		mesh.uv.Add(new Vector2(1, 1));
		mesh.uv.Add(new Vector2(1, 0));
		mesh.uv.Add(new Vector2(1, 0));
		mesh.uv.Add(new Vector2(1, 1));
		mesh.uv.Add(new Vector2(0, 1));
		mesh.uv.Add(new Vector2(0, 0));
		mesh.triangles.AddRange([
			0, 1, 2, 0, 2, 3,
			3, 2, 6, 3, 6, 7,
			7, 6, 5, 7, 5, 4,
			4, 5, 1, 4, 1, 0,
			4, 0, 3, 4, 3, 7,
			1, 5, 6, 1, 6, 2
		]);
		
		Shader.Find("Diffuse", (shader) => {
			let mat = Material.Create(shader);
			mesh.Update(mat.GetShader().GetVertexLayoutMask());

			let renderer = <MeshRenderer>GameObject.Create("mesh").AddComponent("MeshRenderer");
			renderer.shared_mesh = mesh;
			renderer.SetSharedMaterial(mat);

			Resource.LoadTextureAsync("Assets/AppMesh/wow.png.tex", (tex) => {
				mat.SetMainTexture(tex);
			});

			this.m_cube = renderer.GetTransform();
		}, null);

		Resource.LoadGameObjectAsync("Assets/AppMesh/plane.prefab", null);
	}

	Update() {
		if(this.m_cube) {
			this.m_cube.SetLocalRotation(Quaternion.Euler(0, this.m_deg, 0));
			this.m_deg += 1;
		}
	}

	private m_cube: Transform;
	private m_deg = 0;
}