import { Application } from "./lib/Application"
import { GameObject } from "./lib/GameObject"
import { Camera } from "./lib/graphics/Camera"
import { Color } from "./lib/graphics/Color"

export class AppClear extends Application {
	constructor() {
		super();
		this.SetName("Viry3D::AppClear");
		this.SetInitSize(800, 600);
	}
	
	Start() {
		let camera = <Camera>GameObject.Create("camera").AddComponent("Camera");
		camera.SetClearColor(new Color(0, 0, 1, 1));
	}
}