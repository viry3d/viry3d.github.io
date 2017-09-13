import { Transform } from "./lib/Transform"
import { Graphics } from "./lib/graphics/Graphics"
import { Camera } from "./lib/graphics/Camera"
import { Renderer } from "./lib/renderer/Renderer"
import { MeshRenderer } from "./lib/renderer/MeshRenderer"
import { SkinnedMeshRenderer } from "./lib/renderer/SkinnedMeshRenderer"
import { Animation } from "./lib/animation/Animation"
import { UICanvasRenderer } from "./lib/ui/UICanvasRenderer"
import { UIView } from "./lib/ui/UIView"
import { UISprite } from "./lib/ui/UISprite"
import { UILabel } from "./lib/ui/UILabel"
import { ImageEffect } from "./lib/postprocess/ImageEffect"
import { Tweener } from "./lib/tweener/Tweener"
import { TweenPosition } from "./lib/tweener/TweenPosition"
import { TweenUIColor } from "./lib/tweener/TweenUIColor"
import { AudioListener } from "./lib/audio/AudioListener"
import { AudioSource } from "./lib/audio/AudioSource"
import { Timer } from "./lib/time/Timer"

import { Application, Platform } from "./lib/Application"
import { AppClear } from "./AppClear"
import { AppMesh } from "./AppMesh"
import { AppAnim } from "./AppAnim"
import { AppWatch } from "./AppWatch"
import { AppSocket } from "./AppSocket"
import { AppJavaScript } from "./AppJavaScript"

Transform.RegisterComponent();
Camera.RegisterComponent();
Renderer.RegisterComponent();
MeshRenderer.RegisterComponent();
SkinnedMeshRenderer.RegisterComponent();
Animation.RegisterComponent();
UICanvasRenderer.RegisterComponent();
UIView.RegisterComponent();
UISprite.RegisterComponent();
UILabel.RegisterComponent();
ImageEffect.RegisterComponent();
Tweener.RegisterComponent();
TweenPosition.RegisterComponent();
TweenUIColor.RegisterComponent();
AudioListener.RegisterComponent();
AudioSource.RegisterComponent();
Timer.RegisterComponent();

function show_select_app() {
	let append = function(name: string) {
		let a = document.createElement("a");
		a.href = "index.html?" + name;
		a.innerText = name;
		document.body.appendChild(a);
		document.body.appendChild(document.createElement("br"));
	}

	document.body.removeChild(document.getElementById("canvas"));
	document.body.removeChild(document.getElementById("canvas2d"));

	append("AppClear");
	append("AppMesh");
	append("AppAnim");
	append("AppWatch");
	append("AppSocket");
    append("AppJavaScript");
	append("AppBlur (to do)");
}

let app = function create_app() {
	let loc = location.toString();
	let param_start = loc.lastIndexOf('?');
	if(param_start >= 0) {
		let app_name = loc.substr(param_start + 1);

		switch(app_name) {
			case "AppClear":
				return new AppClear();
			case "AppMesh":
				return new AppMesh();
			case "AppAnim":
				return new AppAnim();
			case "AppWatch":
				return new AppWatch();
			case "AppSocket":
				return new AppSocket();
            case "AppJavaScript":
                return new AppJavaScript();
		}
	}

	show_select_app();

	return null;
}();

export function start() {
	if(app != null) {
		let platform = Application.Platform();
		
		if(platform == Platform.Android || platform == Platform.iOS) {
			app.SetInitSize(window.innerWidth, window.innerHeight);
		}

		app.OnInit();

		update();
	}
}

function update() {
	app.OnUpdate();
    app.OnDraw();

	let fps = Graphics.GetDisplay().GetPreferredFPS();
	if(fps <= 0) {
		fps = 60;
	}
	let timeout = 1000.0 / fps;

	setTimeout(() => {
		window.requestAnimationFrame(update);
	}, timeout - 1000.0 / 60);
}

window.onbeforeunload = function () {
    
}

window.onunload = function() {
	if(app != null) {
		app.Deinit();
	}
}