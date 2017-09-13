import { UIView } from "./UIView"
import { VRObject } from "../Object"
import { Component } from "../Component"
import { Atlas } from "./Atlas"
import { Vector } from "../container/Vector"
import { Color } from "../graphics/Color"
import { Vector2 } from "../math/Vector2"
import { Vector3 } from "../math/Vector3"
import { Vector4 } from "../math/Vector4"
import { Material } from "../graphics/Material"
import { TextureFormat } from "../graphics/Texture2D"
import { Shader } from "../graphics/Shader"
import { Viry3D } from "../Viry3D"

export enum SpriteType {
	Simple = 0,
	Sliced = 1,
	Tiled = 2,
	Filled = 3
}

export enum SpriteFillMethod {
	Horizontal = 0,
	Vertical = 1,
	Radial90 = 2,
	Radial180 = 3,
	Radial360 = 4
}

enum SpriteFillOrigin180 {
	Bottom = 0,
	Top = 2,
	Right = 3
}

enum SpriteFillOrigin360 {
	Bottom = 0,
	Right = 1,
	Top = 2,
	Left = 3
}

enum SpriteFillOrigin90 {
	BottomLeft = 0,
	TopLeft = 1,
	TopRight = 2,
	BottomRight = 3
}

enum SpriteFillOriginHorizontal {
	Left = 0,
	Right = 1
}

enum SpriteFillOriginVertical {
	Bottom = 0,
	Top = 1
}

export class UISprite extends UIView {
	static ClassName(): string {
		return "UISprite";
	}

	GetTypeName(): string {
		return UISprite.ClassName();
	}

	static RegisterComponent() {
		UISprite.m_class_names = UIView.m_class_names.slice(0);
		UISprite.m_class_names.push("UISprite");

		Component.Register(UISprite.ClassName(), () => {
			return new UISprite();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return UISprite.m_class_names;
	}

	DeepCopy(source: VRObject) {
		super.DeepCopy(source);

		let src = <UISprite>source;
		this.m_atlas = src.m_atlas;
		this.m_sprite_name = src.m_sprite_name;
		this.m_sprite_type = src.m_sprite_type;
		this.m_fill_method = src.m_fill_method;
		this.m_fill_origin = src.m_fill_origin;
		this.m_fill_amount = src.m_fill_amount;
		this.m_fill_clock_wise = src.m_fill_clock_wise;
	}

	SetAtlas(atlas: Atlas) {
		if(this.m_atlas != atlas) {
			this.m_atlas = atlas;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetSpriteName(name: string) {
		if(this.m_sprite_name != name) {
			this.m_sprite_name = name;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetSpriteType(type: SpriteType) {
		if(this.m_sprite_type != type) {
			this.m_sprite_type = type;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetFillMethod(fill_method: SpriteFillMethod) {
		if(this.m_fill_method != fill_method) {
			this.m_fill_method = fill_method;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetFillOrigin(fill_origin: number) {
		if(this.m_fill_origin != fill_origin) {
			this.m_fill_origin = fill_origin;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetFillAmount(fill_amount: number) {
		if(this.m_fill_amount != fill_amount) {
			this.m_fill_amount = fill_amount;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	SetFillClockWise(fill_clock_wise: boolean) {
		if(this.m_fill_clock_wise != fill_clock_wise) {
			this.m_fill_clock_wise = fill_clock_wise;
			this.rect.SetDirty(true);
			this.rect.MarkRendererDirty();
		}
	}

	FillVerticesSimple(vertices: Vector<Vector3>, uv: Vector<Vector2>, colors: Vector<Color>, indices: Vector<number>) {
		let size = this.rect.GetSize();
		let min = new Vector2(-this.rect.pivot.x * size.x, -this.rect.pivot.y * size.y);
		let max = new Vector2((1 - this.rect.pivot.x) * size.x, (1 - this.rect.pivot.y) * size.y);
		let vertex_array = [
			new Vector3(min.x, min.y, 0),
			new Vector3(max.x, min.y, 0),
			new Vector3(max.x, max.y, 0),
			new Vector3(min.x, max.y, 0)
		];

		let mat = this.GetVertexMatrix();
		for(let i = 0; i < 4; i++) {
			let v = vertex_array[i];
			v.x = Math.floor(v.x);
			v.y = Math.floor(v.y);

			vertex_array[i] = mat.MultiplyPoint3x4(v);
		}

		vertices.AddRange(vertex_array);

		let uv_array = Array<Vector2>(4);
		if(this.m_atlas) {
			let sprite = this.m_atlas.GetSprite(this.m_sprite_name);
			let rect = sprite.rect;

			uv_array[0] = new Vector2(rect.x, 1 - rect.y);
			uv_array[1] = new Vector2(rect.x + rect.width, 1 - rect.y);
			uv_array[2] = new Vector2(rect.x + rect.width, 1 - (rect.y + rect.height));
			uv_array[3] = new Vector2(rect.x, 1 - (rect.y + rect.height));
		} else {
			uv_array[0] = new Vector2(0, 1);
			uv_array[1] = new Vector2(1, 1);
			uv_array[2] = new Vector2(1, 0);
			uv_array[3] = new Vector2(0, 0);
		}

		uv.AddRange(uv_array);
		
		colors.Add(this.m_color);
		colors.Add(this.m_color);
		colors.Add(this.m_color);
		colors.Add(this.m_color);

		let index_begin = vertices.Size() - 4;
		indices.Add(index_begin + 0);
		indices.Add(index_begin + 1);
		indices.Add(index_begin + 2);
		indices.Add(index_begin + 0);
		indices.Add(index_begin + 2);
		indices.Add(index_begin + 3);
	}

	FillVertices(vertices: Vector<Vector3>, uv: Vector<Vector2>, colors: Vector<Color>, indices: Vector<number>) {
		switch(this.m_sprite_type) {
			case SpriteType.Simple:
				this.FillVerticesSimple(vertices, uv, colors, indices);
				break;
			default:
				break;
		}
	}

	FillMaterial(mat: Material) {
		if(this.m_atlas) {
			mat.SetMainTexture(this.m_atlas.texture);

			if(this.m_atlas.texture.format == TextureFormat.ETC_RGB4_X2) {
				let shader = Shader.Find("UI/SpriteETC1x2", null, Viry3D.Resource.GetGlobalAssetBundle());
				mat.SetShader(shader);
			} else if(this.m_atlas.texture.format == TextureFormat.PVRTC_RGB4_X2) {
				let shader = Shader.Find("UI/SpritePVRTC1x2", null, Viry3D.Resource.GetGlobalAssetBundle());
				mat.SetShader(shader);
				mat.SetTexture("_MainTexAlpha", this.m_atlas.texture.pvr_alpha);
			}
		}
	}

	private constructor() {
		super();
	}

	private m_atlas: Atlas;
	private m_sprite_name: string;
	private m_sprite_type = SpriteType.Simple;
	private m_fill_method = SpriteFillMethod.Horizontal;
	private m_fill_origin = 0;
	private m_fill_amount = 1.0;
	private m_fill_clock_wise = false;
}