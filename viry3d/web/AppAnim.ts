import { Application } from "./lib/Application"
import { GameObject } from "./lib/GameObject"
import { Camera } from "./lib/graphics/Camera"
import { Resource } from "./lib/Resource"
import { Vector3 } from "./lib/math/Vector3"
import { Quaternion } from "./lib/math/Quaternion"
import { Animation } from "./lib/animation/Animation"
import { AnimationWrapMode } from "./lib/animation/AnimationClip"
import { Graphics } from "./lib/graphics/Graphics"
import { Time } from "./lib/time/Time"

export class AppAnim extends Application {
	constructor() {
		super();
		this.SetName("Viry3D::AppAnim");
		this.SetInitSize(800, 600);
	}
	
	Start() {
		Graphics.GetDisplay().Show(false);

		let canvas = Graphics.GetDisplay().Get2D();
		canvas.font = "30px Arial";
		canvas.fillStyle = "rgba(0, 0, 0, 1)";
		let text = "Loading...0%"
		let text_w = canvas.measureText(text).width;
		let text_h = 30 * 72 / 96;
		let w = Graphics.GetDisplay().GetWidth();
		let h = Graphics.GetDisplay().GetHeight();
		canvas.fillText(text, (w - text_w) / 2, (h - text_h) / 2);

		let camera = <Camera>GameObject.Create("camera").AddComponent("Camera");
		camera.GetTransform().SetPosition(new Vector3(0, 1.2, -2.0));
		camera.GetTransform().SetRotation(Quaternion.Euler(10, 0, 0));

		let bundle_path = "";

		if(Graphics.GetDisplay().SupportDXT()) {
			bundle_path = "app_anim_dxt.viry";
		} else if(Graphics.GetDisplay().SupportETC1()) {
			bundle_path = "app_anim_etc1.viry";
		} else if(Graphics.GetDisplay().SupportPVRTC()) {
			bundle_path = "app_anim_pvrtc.viry";
		} else {
			alert("not support compressed texture");
		}

		Resource.LoadAssetBundleAsync(bundle_path, (bundle) => {
			this.m_obj = bundle.LoadGameObject("Assets/AppAnim/unity_chan_splited.prefab");
			let anim = <Animation>this.m_obj.GetComponent("Animation");
			let state = anim.GetAnimationState("WAIT02");

			state.wrap_mode = AnimationWrapMode.Loop;
			anim.UpdateAnimationState("WAIT02", state);
			anim.Play("WAIT02");

			this.m_time_done = Time.GetTime();

			canvas.clearRect(0, 0, w, h);
			text = "Loading...100%";
			text_w = canvas.measureText(text).width;
			canvas.fillText(text, (w - text_w) / 2, (h - text_h) / 2);
		}, (progress) => {
			canvas.clearRect(0, 0, w, h);
			text = "Loading..." + Math.ceil(100 * progress.loaded / progress.total).toString() + "%";
			text_w = canvas.measureText(text).width;
			canvas.fillText(text, (w - text_w) / 2, (h - text_h) / 2);
		});
	}

	Update() {
		if(this.m_time_done > 0 && Time.GetTime() - this.m_time_done > 2) {
			this.m_time_done = -1;

			let canvas = Graphics.GetDisplay().Get2D();
			let w = Graphics.GetDisplay().GetWidth();
			let h = Graphics.GetDisplay().GetHeight();
			canvas.clearRect(0, 0, w, h);

			Graphics.GetDisplay().Show(true);
		}
	}

	private m_obj: GameObject;
	private m_time_done = -1;
}