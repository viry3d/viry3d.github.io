import { Application as Application_ } from "./lib/Application"
import { GameObject as GameObject_ } from "./lib/GameObject"
import { Component as Component_ } from "./lib/Component"
import { Resource as Resource_ } from "./lib/Resource"
import { Mathf as Mathf_ } from "./lib/math/Mathf"
import { Vector3 as Vector3_ } from "./lib/math/Vector3"
import { Graphics as Graphics_ } from "./lib/graphics/Graphics"
import { Color as Color_ } from "./lib/graphics/Color"
import { TweenerPlayStyle as TweenerPlayStyle_ } from "./lib/tweener/Tweener"
import { File as File_ } from "./lib/io/File"
import { Time as Time_ } from "./lib/time/Time"
import { Timer as Timer_ } from "./lib/time/Timer"

let win = <any>window;

export class AppJavaScript extends Application_ {
	constructor() {
		super();

		this.SetName("Viry3D::AppJavaScript");
		this.SetInitSize(512 * 9 / 16, 512);

        File_.ReadAllText("Assets/AppJavaScript/AppFlappyBird.js", (text: string) => {
			win.log = console.log;
			win.Application = Application_;
			win.GameObject = GameObject_;
			win.Component = Component_;
			win.Resource = Resource_;
			win.Mathf = Mathf_;
			win.Graphics = Graphics_;
			win.Vector3 = Vector3_;
			win.Color = Color_;
			win.TweenerPlayStyle = TweenerPlayStyle_;
			win.File = File_;
			win.Time = Time_;
			win.Timer = Timer_;

            win.eval(text);

            win.app_construct();
        });
	}
	
    Start() { }

	Update() {
		if(!this.started && win.app_start) {
			this.started = true;

			win.app_start();
		}

		if(this.started) {
			win.app_update();
		}
	}

	started = false;
}