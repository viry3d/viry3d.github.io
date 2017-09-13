import { VRMap } from "./container/Map"
import { List } from "./container/List"
import { VRObject } from "./Object"
import { GameObject } from "./GameObject"
import { Camera } from "./graphics/Camera"
import { Shader } from "./graphics/Shader"
import { Renderer } from "./renderer/Renderer"

export class World {
	static Init() {
		let win: any = window;
		win.show_world = function () {
			return World.m_gameobjects;
		};
	}

    static AddGameObject(obj: GameObject) {
        World.m_gameobjects_new.Add(obj.GetId(), obj);
	}

	static Update() {
		Renderer.HandleUIEvent();

		//	start
		let starts = new VRMap<number, GameObject>(World.m_gameobjects);

		do {
			starts.ForEach((k, v) => {
				let obj = v;
				if(obj.IsActiveInHierarchy()) {
					obj.Start();
				}
				return true;
			});
			starts.Clear();

			World.m_gameobjects_new.ForEach((k, v) => {
				let key = parseInt(k);
				starts.Add(key, v);
				World.m_gameobjects.Add(key, v);
				return true;
			});
			World.m_gameobjects_new.Clear();
		} while(!starts.Empty());

		//	update
		World.m_gameobjects.ForEach((k, v) => {
			let obj = v;
			if(obj.IsActiveInHierarchy()) {
				obj.Update();
			}
			return true;
		});

		//	late update
		World.m_gameobjects.ForEach((k, v) => {
			let obj = v;
			if(obj.IsActiveInHierarchy()) {
				obj.LateUpdate();
			}
			return true;
		});

		let renderers = Renderer.GetRenderers();
		renderers.Clear();

		//	delete
		let deletes = new List<GameObject>();
		World.m_gameobjects.ForEach((k, v) => {
			let obj = v;
			if(obj.IsDeleted()) {
				deletes.AddLast(obj);
			} else {
				let rs = obj.GetComponents("Renderer");
				for(let i = 0; i < rs.length; i++) {
					renderers.AddLast(<Renderer>rs[i]);
				}
			}
			return true;
		});

		deletes.ForEach((i: GameObject) => {
			World.m_gameobjects.Remove(i.GetId());
			return true;
		});
    }

	private static m_gameobjects_new = new VRMap<number, GameObject>();
	private static m_gameobjects = new VRMap<number, GameObject>();
}