import { Application } from "./lib/Application"
import { GameObject } from "./lib/GameObject"
import { Camera } from "./lib/graphics/Camera"
import { Resource } from "./lib/Resource"
import { Mathf } from "./lib/math/Mathf"
import { Vector3 } from "./lib/math/Vector3"
import { UICanvasRenderer } from "./lib/ui/UICanvasRenderer"
import { UILabel } from "./lib/ui/UILabel"
import { UISprite } from "./lib/ui/UISprite"
import { Transform } from "./lib/Transform"
import { Quaternion } from "./lib/math/Quaternion"
import { Time } from "./lib/time/Time"
import { Graphics } from "./lib/graphics/Graphics"

export class AppWatch extends Application {
	constructor() {
		super();
		this.SetName("Viry3D::AppWatch");
		this.SetInitSize(720, 772);
		this.SetInitFPS(5);
	}
	
	Start() {
		let camera = <Camera>GameObject.Create("camera").AddComponent("Camera");
		camera.SetOrthographic(true);
		camera.SetOrthographicSize(camera.GetTargetHeight() / 2.0);
		camera.SetNearClip(-1);
		camera.SetFarClip(1);

		let scale_w = camera.GetTargetWidth() / 720.0;
		let scale_h = camera.GetTargetHeight() / 772.0;
		let scale_ui = Mathf.Min(scale_w, scale_h);

		let bundle_path = "";

		if(Graphics.GetDisplay().SupportDXT()) {
			bundle_path = "app_watch_dxt.viry";
		} else if(Graphics.GetDisplay().SupportETC1()) {
			bundle_path = "app_watch_etc1.viry";
		} else {
			alert("not support compressed texture");
		}

		Resource.LoadAssetBundleAsync(bundle_path, (bundle) => {
			Resource.SetGlobalAssetBundle(bundle);
			
			let ui = bundle.LoadGameObject("Assets/AppWatch/ui.prefab");
			ui.GetTransform().SetScale(Vector3.Multiply(Vector3.One(), scale_ui));

			this.hour = ui.GetTransform().Find("hour/sprite");
			this.minute = ui.GetTransform().Find("minute/sprite");
			this.second = ui.GetTransform().Find("second/sprite");
			this.day_week = ui.GetTransform().Find("day_week/label").GetGameObject().GetComponent("UILabel");

			this.fps = ui.GetTransform().Find("fps/label").GetGameObject().GetComponent("UILabel");
			this.fps.Enable(false);

			this.ui = ui;
		}, null);
	}

	Update() {
		if(!this.ui) {
			return;
		}

		let date = Time.GetDate();

		let hour_degree = 360 * (((date.hour % 12) * 60 + date.minute) * 60 + date.second) / (12.0 * 60 * 60);
		let minute_degree = 360 * (date.minute * 60 + date.second) / (60.0 * 60);
		let second_degree = 360 * date.second / 60.0;

		this.hour.SetLocalRotation(Quaternion.Euler(0, 0, -hour_degree));
		this.minute.SetLocalRotation(Quaternion.Euler(0, 0, -minute_degree));
		this.second.SetLocalRotation(Quaternion.Euler(0, 0, -second_degree));

		let week_days = [ "日", "一", "二", "三", "四", "五", "六" ];
		let day_week_str = "<color=#ff0000ff>" + date.day + "</color>  " + "周" + week_days[date.week_day];
		this.day_week.SetText(day_week_str);

		this.fps.SetText("FPS:" + Time.GetFPS());
	}

	ui: GameObject;
	hour: Transform;
	minute: Transform;
	second: Transform;
	day_week: UILabel;
	fps: UILabel;
}