import { Component } from "../Component"
import { VRObject } from "../Object"
import { GameObject } from "../GameObject"
import { Color } from "./Color"
import { FrameBuffer } from "./FrameBuffer"
import { RenderPass } from "./RenderPass"
import { Graphics } from "./Graphics"
import { List } from "../container/List"
import { Rect } from "../math/Rect"
import { Matrix4x4 } from "../math/Matrix4x4"
import { ImageEffect } from "../postprocess/ImageEffect"
import { Viry3D } from "../Viry3D"
import { Renderer } from "../renderer/Renderer"

export enum CameraClearFlags {
	Invalidate = 1,
	Color = 2,
	Depth = 3,
	Nothing = 4,
}

export class Camera extends Component {
	static ClassName(): string {
		return "Camera";
	}

	GetTypeName(): string {
		return Camera.ClassName();
	}

	static RegisterComponent() {
		Camera.m_class_names = Component.m_class_names.slice(0);
		Camera.m_class_names.push("Camera");

		Component.Register(Camera.ClassName(), () => {
			return new Camera();
		});
	}

	protected static m_class_names: string[];
	GetClassNames(): string[] {
		return Camera.m_class_names;
	}

	static PrepareAll() {
		Camera.m_current_index = 0;
		Camera.m_cameras.ForEach((i: Camera) => {
			if(i.CanRender()) {
				Camera.m_current = i;
				i.Prepare();
				Camera.m_current_index++;
			}
			return true;
		});
		Camera.m_current = null;
		Camera.m_current_index = -1;
	}

	static RenderAll() {
		Camera.m_current_index = 0;
		Camera.m_cameras.ForEach((i: Camera) => {
			if(i.CanRender()) {
				Camera.m_current = i;
				i.Render();
				Camera.m_current_index++;
			}
			return true;
		});
		Camera.m_current = null;
		Camera.m_current_index = -1;
	}

	static Current(): Camera {
		return Camera.m_current;
	}

	static CurrentIndex(): number {
		return Camera.m_current_index;
	}

	static OnResize(width: number, height: number) {
		Camera.m_cameras.ForEach((i: Camera) => {
			i.ResetRenderPass();
			i.m_matrix_dirty = true;
			return true;
		});

		Camera.m_post_target_front = null;
		Camera.m_post_target_back = null;
	}

	private constructor() {
		super();
		
		Camera.m_cameras.AddLast(this);

		this.m_clear_flags = CameraClearFlags.Color;
		this.m_clear_color = new Color(0, 0, 0, 1);
		this.SetDepth(0);
		this.m_culling_mask = -1;
		this.m_orthographic = false;
		this.m_orthographic_size = 1;
		this.m_field_of_view = 60;
		this.m_near_clip = 0.3;
		this.m_far_clip = 1000;
		this.m_rect = new Rect(0, 0, 1, 1);
		this.m_hdr = false;

		this.m_frame_buffer = null;
		this.m_target_rendering = null;
		this.m_matrix_dirty = true;
		this.m_view_matrix = Matrix4x4.Identity();
		this.m_projection_matrix = Matrix4x4.Identity();
		this.m_view_projection_matrix = Matrix4x4.Identity();
		this.m_render_pass = null;
	}

	DeepCopy(source: VRObject) {
		super.DeepCopy(source);
	}

	OnDestroy() {
		Camera.m_cameras.Remove(this);
		this.ResetRenderPass();
	}

	private ResetRenderPass() {
		this.m_render_pass = null;
	}

	OnTranformChanged() {
		this.m_matrix_dirty = true;
	}

	CanRender(): boolean {
		return this.GetGameObject().IsActiveInHierarchy() && this.IsEnable();
	}

	IsCulling(obj: GameObject): boolean {
		return (this.m_culling_mask & (1 << obj.GetLayer())) == 0;
	}

	GetPostTargetFront(): FrameBuffer {
		console.error("GetPostTargetFront not implemment");
		return null;
	}

	GetPostTargetBack(): FrameBuffer {
		console.error("GetPostTargetBack not implemment");
		return null;
	}

	SetFrameBuffer(frame_buffer: FrameBuffer) {
		this.m_matrix_dirty = true;
		this.m_frame_buffer = frame_buffer;
	}

	DecideTarget() {
		let effects = <Component[]>this.GetGameObject().GetComponents("ImageEffect");

		if(effects.length == 0) {
			this.m_target_rendering = this.m_frame_buffer;
		} else {
			this.m_target_rendering = this.GetPostTargetFront();
		}
	}

	Prepare() {
		this.DecideTarget();

		if(this.m_render_pass == null) {
			if(this.m_target_rendering != null) {
				this.m_render_pass = RenderPass.Create(this.m_target_rendering.color_texture, this.m_target_rendering.depth_texture, this.m_clear_flags, true, this.m_rect);
			} else {
				this.m_render_pass = RenderPass.Create(null, null, this.m_clear_flags, true, this.m_rect);
			}
		}

		this.m_render_pass.Bind();
		Renderer.PrepareAllPass();
		this.m_render_pass.Unbind();
	}

	Render() {
		this.m_render_pass.Begin(this.m_clear_color);

		Renderer.RenderAllPass();

		this.GetGameObject().OnPostRender();

		this.m_render_pass.End();

		this.PostProcess();
	}

	PostProcess() {

	}

	GetTargetWidth(): number {
		let width = 0;

		if(this.m_frame_buffer != null) {
			width = this.m_frame_buffer.color_texture.GetWidth();
		} else {
			width = Graphics.GetDisplay().GetWidth();
		}

		return width;
	}

	GetTargetHeight(): number {
		let height = 0;

		if(this.m_frame_buffer != null) {
			height = this.m_frame_buffer.color_texture.GetHeight();
		} else {
			height = Graphics.GetDisplay().GetHeight();
		}

		return height;
	}

	UpdateMatrix() {
		this.m_matrix_dirty = false;

		let width = this.GetTargetWidth();
		let height = this.GetTargetHeight();

		let transform = this.GetTransform();

		this.m_view_matrix = Matrix4x4.LookTo(
			transform.GetPosition(),
			transform.GetForward(),
			transform.GetUp());

		if(!this.m_orthographic) {
			this.m_projection_matrix.Set(Matrix4x4.Perspective(this.m_field_of_view, width / height, this.m_near_clip, this.m_far_clip));
		} else {
			let ortho_size = this.m_orthographic_size;
			let rect = this.m_rect;

			let top = ortho_size;
			let bottom = -ortho_size;
			let plane_h = ortho_size * 2;
			let plane_w = plane_h * (width * rect.width) / (height * rect.height);
			this.m_projection_matrix.Set(Matrix4x4.Ortho(-plane_w / 2, plane_w / 2, bottom, top, this.m_near_clip, this.m_far_clip));
		}

		this.m_view_projection_matrix.Set(this.m_projection_matrix.Multiply(this.m_view_matrix));
	}

	GetViewMatrix(): Matrix4x4 {
		if(this.m_matrix_dirty != null) {
			this.UpdateMatrix();
		}

		return this.m_view_matrix;
	}

	GetProjectionMatrix(): Matrix4x4 {
		if(this.m_matrix_dirty != null) {
			this.UpdateMatrix();
		}

		return this.m_projection_matrix;
	}

	GetViewProjectionMatrix(): Matrix4x4 {
		if(this.m_matrix_dirty != null) {
			this.UpdateMatrix();
		}

		return this.m_view_projection_matrix;
	}

	GetClearFlags(): CameraClearFlags {
		return this.m_clear_flags;
	}

	SetClearFlags(flag: CameraClearFlags) {
		this.m_clear_flags = flag;
	}

	GetClearColor(): Color {
		return this.m_clear_color;
	}

	SetClearColor(color: Color) {
		this.m_clear_color = color;
	}

	GetSepth(): number {
		return this.m_depth;
	}

	SetDepth(depth: number) {
		this.m_depth = depth;

		Camera.m_cameras.Sort((left: Camera, right: Camera) => {
			return left.m_depth < right.m_depth;
		});
	}

	GetCullingMask(): number {
		return this.m_culling_mask;
	}

	SetCullingMask(mask: number) {
		this.m_culling_mask = mask;
	}

	GetOrthographic(): boolean {
		return this.m_orthographic;
	}

	SetOrthographic(value: boolean) {
		this.m_orthographic = value;
	}

	GetOrthographicSize(): number {
		return this.m_orthographic_size;
	}

	SetOrthographicSize(size: number) {
		this.m_orthographic_size = size;
	}

	GetFieldOfView(): number {
		return this.m_field_of_view;
	}

	SetFieldOfView(value: number) {
		this.m_field_of_view = value;
	}

	GetNearClip(): number {
		return this.m_near_clip;
	}

	SetNearClip(clip: number) {
		this.m_near_clip = clip;
	}

	GetFarClip(): number {
		return this.m_far_clip;
	}

	SetFarClip(clip: number) {
		this.m_far_clip = clip;
	}

	GetRect(): Rect {
		return this.m_rect;
	}

	SetRect(rect: Rect) {
		this.m_rect = rect;
	}

	GetHdr(): boolean {
		return this.m_hdr;
	}

	SetHdr(hdr: boolean) {
		this.m_hdr = hdr;
	}

	private static m_cameras = new List<Camera>();
	private static m_current: Camera;
	private static m_current_index = -1;
	private static m_post_target_front: FrameBuffer;
	private static m_post_target_back: FrameBuffer;

	private m_clear_flags: CameraClearFlags;
	private m_clear_color: Color;
	private m_depth: number;
	private m_culling_mask: number;
	private m_orthographic: boolean;
	private m_orthographic_size: number;
	private m_field_of_view: number;
	private m_near_clip: number;
	private m_far_clip: number;
	private m_rect: Rect;
	private m_hdr: boolean;
	private m_frame_buffer: FrameBuffer;
	private m_target_rendering: FrameBuffer;
	private m_matrix_dirty: boolean;
	private m_view_matrix: Matrix4x4;
	private m_projection_matrix: Matrix4x4;
	private m_view_projection_matrix: Matrix4x4;
	private m_render_pass: RenderPass;
}

Viry3D.Camera = Camera;