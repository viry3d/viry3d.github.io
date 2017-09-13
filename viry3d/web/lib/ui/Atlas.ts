import { VRObject } from "../Object"
import { Sprite } from "./Sprite"
import { VRMap } from "../container/Map"
import { Texture2D } from "../graphics/Texture2D"

export class Atlas extends VRObject {
	static Create(): Atlas {
		return new Atlas();
	}

	AddSprite(name: string, sprite: Sprite) {
		this.m_sprites.Add(name, sprite);
	}

	RemoveSprite(name: string) {
		this.m_sprites.Remove(name);
	}

	GetSprite(name: string) {
		return this.m_sprites.Get(name);
	}

	private constructor() {
		super();
	}

	texture: Texture2D;
	private m_sprites = new VRMap<string, Sprite>();
}