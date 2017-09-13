var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./lib/Application", "./lib/GameObject", "./lib/graphics/Mesh", "./lib/math/Vector3", "./lib/math/Vector2", "./lib/math/Quaternion", "./lib/graphics/Material", "./lib/graphics/Shader", "./lib/Resource"], function (require, exports, Application_1, GameObject_1, Mesh_1, Vector3_1, Vector2_1, Quaternion_1, Material_1, Shader_1, Resource_1) {
    "use strict";
    var AppMesh = (function (_super) {
        __extends(AppMesh, _super);
        function AppMesh() {
            _super.call(this);
            this.m_deg = 0;
            this.SetName("Viry3D::AppMesh");
            this.SetInitSize(800, 600);
        }
        AppMesh.prototype.Start = function () {
            var _this = this;
            var camera = GameObject_1.GameObject.Create("camera").AddComponent("Camera");
            camera.GetTransform().SetPosition(new Vector3_1.Vector3(0, 6, -10));
            camera.GetTransform().SetRotation(Quaternion_1.Quaternion.Euler(30, 0, 0));
            camera.SetCullingMask(1 << 0);
            var mesh = Mesh_1.Mesh.Create();
            mesh.vertices.Add(new Vector3_1.Vector3(-1, 1, -1));
            mesh.vertices.Add(new Vector3_1.Vector3(-1, -1, -1));
            mesh.vertices.Add(new Vector3_1.Vector3(1, -1, -1));
            mesh.vertices.Add(new Vector3_1.Vector3(1, 1, -1));
            mesh.vertices.Add(new Vector3_1.Vector3(-1, 1, 1));
            mesh.vertices.Add(new Vector3_1.Vector3(-1, -1, 1));
            mesh.vertices.Add(new Vector3_1.Vector3(1, -1, 1));
            mesh.vertices.Add(new Vector3_1.Vector3(1, 1, 1));
            mesh.uv.Add(new Vector2_1.Vector2(0, 0));
            mesh.uv.Add(new Vector2_1.Vector2(0, 1));
            mesh.uv.Add(new Vector2_1.Vector2(1, 1));
            mesh.uv.Add(new Vector2_1.Vector2(1, 0));
            mesh.uv.Add(new Vector2_1.Vector2(1, 0));
            mesh.uv.Add(new Vector2_1.Vector2(1, 1));
            mesh.uv.Add(new Vector2_1.Vector2(0, 1));
            mesh.uv.Add(new Vector2_1.Vector2(0, 0));
            mesh.triangles.AddRange([
                0, 1, 2, 0, 2, 3,
                3, 2, 6, 3, 6, 7,
                7, 6, 5, 7, 5, 4,
                4, 5, 1, 4, 1, 0,
                4, 0, 3, 4, 3, 7,
                1, 5, 6, 1, 6, 2
            ]);
            Shader_1.Shader.Find("Diffuse", function (shader) {
                var mat = Material_1.Material.Create(shader);
                mesh.Update(mat.GetShader().GetVertexLayoutMask());
                var renderer = GameObject_1.GameObject.Create("mesh").AddComponent("MeshRenderer");
                renderer.shared_mesh = mesh;
                renderer.SetSharedMaterial(mat);
                Resource_1.Resource.LoadTextureAsync("Assets/AppMesh/wow.png.tex", function (tex) {
                    mat.SetMainTexture(tex);
                });
                _this.m_cube = renderer.GetTransform();
            }, null);
            Resource_1.Resource.LoadGameObjectAsync("Assets/AppMesh/plane.prefab", null);
        };
        AppMesh.prototype.Update = function () {
            if (this.m_cube) {
                this.m_cube.SetLocalRotation(Quaternion_1.Quaternion.Euler(0, this.m_deg, 0));
                this.m_deg += 1;
            }
        };
        return AppMesh;
    }(Application_1.Application));
    exports.AppMesh = AppMesh;
});
//# sourceMappingURL=AppMesh.js.map