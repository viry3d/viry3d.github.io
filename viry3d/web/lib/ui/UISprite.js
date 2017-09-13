var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./UIView", "../Component", "../math/Vector2", "../math/Vector3", "../graphics/Texture2D", "../graphics/Shader", "../Viry3D"], function (require, exports, UIView_1, Component_1, Vector2_1, Vector3_1, Texture2D_1, Shader_1, Viry3D_1) {
    "use strict";
    (function (SpriteType) {
        SpriteType[SpriteType["Simple"] = 0] = "Simple";
        SpriteType[SpriteType["Sliced"] = 1] = "Sliced";
        SpriteType[SpriteType["Tiled"] = 2] = "Tiled";
        SpriteType[SpriteType["Filled"] = 3] = "Filled";
    })(exports.SpriteType || (exports.SpriteType = {}));
    var SpriteType = exports.SpriteType;
    (function (SpriteFillMethod) {
        SpriteFillMethod[SpriteFillMethod["Horizontal"] = 0] = "Horizontal";
        SpriteFillMethod[SpriteFillMethod["Vertical"] = 1] = "Vertical";
        SpriteFillMethod[SpriteFillMethod["Radial90"] = 2] = "Radial90";
        SpriteFillMethod[SpriteFillMethod["Radial180"] = 3] = "Radial180";
        SpriteFillMethod[SpriteFillMethod["Radial360"] = 4] = "Radial360";
    })(exports.SpriteFillMethod || (exports.SpriteFillMethod = {}));
    var SpriteFillMethod = exports.SpriteFillMethod;
    var SpriteFillOrigin180;
    (function (SpriteFillOrigin180) {
        SpriteFillOrigin180[SpriteFillOrigin180["Bottom"] = 0] = "Bottom";
        SpriteFillOrigin180[SpriteFillOrigin180["Top"] = 2] = "Top";
        SpriteFillOrigin180[SpriteFillOrigin180["Right"] = 3] = "Right";
    })(SpriteFillOrigin180 || (SpriteFillOrigin180 = {}));
    var SpriteFillOrigin360;
    (function (SpriteFillOrigin360) {
        SpriteFillOrigin360[SpriteFillOrigin360["Bottom"] = 0] = "Bottom";
        SpriteFillOrigin360[SpriteFillOrigin360["Right"] = 1] = "Right";
        SpriteFillOrigin360[SpriteFillOrigin360["Top"] = 2] = "Top";
        SpriteFillOrigin360[SpriteFillOrigin360["Left"] = 3] = "Left";
    })(SpriteFillOrigin360 || (SpriteFillOrigin360 = {}));
    var SpriteFillOrigin90;
    (function (SpriteFillOrigin90) {
        SpriteFillOrigin90[SpriteFillOrigin90["BottomLeft"] = 0] = "BottomLeft";
        SpriteFillOrigin90[SpriteFillOrigin90["TopLeft"] = 1] = "TopLeft";
        SpriteFillOrigin90[SpriteFillOrigin90["TopRight"] = 2] = "TopRight";
        SpriteFillOrigin90[SpriteFillOrigin90["BottomRight"] = 3] = "BottomRight";
    })(SpriteFillOrigin90 || (SpriteFillOrigin90 = {}));
    var SpriteFillOriginHorizontal;
    (function (SpriteFillOriginHorizontal) {
        SpriteFillOriginHorizontal[SpriteFillOriginHorizontal["Left"] = 0] = "Left";
        SpriteFillOriginHorizontal[SpriteFillOriginHorizontal["Right"] = 1] = "Right";
    })(SpriteFillOriginHorizontal || (SpriteFillOriginHorizontal = {}));
    var SpriteFillOriginVertical;
    (function (SpriteFillOriginVertical) {
        SpriteFillOriginVertical[SpriteFillOriginVertical["Bottom"] = 0] = "Bottom";
        SpriteFillOriginVertical[SpriteFillOriginVertical["Top"] = 1] = "Top";
    })(SpriteFillOriginVertical || (SpriteFillOriginVertical = {}));
    var UISprite = (function (_super) {
        __extends(UISprite, _super);
        function UISprite() {
            _super.call(this);
            this.m_sprite_type = SpriteType.Simple;
            this.m_fill_method = SpriteFillMethod.Horizontal;
            this.m_fill_origin = 0;
            this.m_fill_amount = 1.0;
            this.m_fill_clock_wise = false;
        }
        UISprite.ClassName = function () {
            return "UISprite";
        };
        UISprite.prototype.GetTypeName = function () {
            return UISprite.ClassName();
        };
        UISprite.RegisterComponent = function () {
            UISprite.m_class_names = UIView_1.UIView.m_class_names.slice(0);
            UISprite.m_class_names.push("UISprite");
            Component_1.Component.Register(UISprite.ClassName(), function () {
                return new UISprite();
            });
        };
        UISprite.prototype.GetClassNames = function () {
            return UISprite.m_class_names;
        };
        UISprite.prototype.DeepCopy = function (source) {
            _super.prototype.DeepCopy.call(this, source);
            var src = source;
            this.m_atlas = src.m_atlas;
            this.m_sprite_name = src.m_sprite_name;
            this.m_sprite_type = src.m_sprite_type;
            this.m_fill_method = src.m_fill_method;
            this.m_fill_origin = src.m_fill_origin;
            this.m_fill_amount = src.m_fill_amount;
            this.m_fill_clock_wise = src.m_fill_clock_wise;
        };
        UISprite.prototype.SetAtlas = function (atlas) {
            if (this.m_atlas != atlas) {
                this.m_atlas = atlas;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UISprite.prototype.SetSpriteName = function (name) {
            if (this.m_sprite_name != name) {
                this.m_sprite_name = name;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UISprite.prototype.SetSpriteType = function (type) {
            if (this.m_sprite_type != type) {
                this.m_sprite_type = type;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UISprite.prototype.SetFillMethod = function (fill_method) {
            if (this.m_fill_method != fill_method) {
                this.m_fill_method = fill_method;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UISprite.prototype.SetFillOrigin = function (fill_origin) {
            if (this.m_fill_origin != fill_origin) {
                this.m_fill_origin = fill_origin;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UISprite.prototype.SetFillAmount = function (fill_amount) {
            if (this.m_fill_amount != fill_amount) {
                this.m_fill_amount = fill_amount;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UISprite.prototype.SetFillClockWise = function (fill_clock_wise) {
            if (this.m_fill_clock_wise != fill_clock_wise) {
                this.m_fill_clock_wise = fill_clock_wise;
                this.rect.SetDirty(true);
                this.rect.MarkRendererDirty();
            }
        };
        UISprite.prototype.FillVerticesSimple = function (vertices, uv, colors, indices) {
            var size = this.rect.GetSize();
            var min = new Vector2_1.Vector2(-this.rect.pivot.x * size.x, -this.rect.pivot.y * size.y);
            var max = new Vector2_1.Vector2((1 - this.rect.pivot.x) * size.x, (1 - this.rect.pivot.y) * size.y);
            var vertex_array = [
                new Vector3_1.Vector3(min.x, min.y, 0),
                new Vector3_1.Vector3(max.x, min.y, 0),
                new Vector3_1.Vector3(max.x, max.y, 0),
                new Vector3_1.Vector3(min.x, max.y, 0)
            ];
            var mat = this.GetVertexMatrix();
            for (var i = 0; i < 4; i++) {
                var v = vertex_array[i];
                v.x = Math.floor(v.x);
                v.y = Math.floor(v.y);
                vertex_array[i] = mat.MultiplyPoint3x4(v);
            }
            vertices.AddRange(vertex_array);
            var uv_array = Array(4);
            if (this.m_atlas) {
                var sprite = this.m_atlas.GetSprite(this.m_sprite_name);
                var rect = sprite.rect;
                uv_array[0] = new Vector2_1.Vector2(rect.x, 1 - rect.y);
                uv_array[1] = new Vector2_1.Vector2(rect.x + rect.width, 1 - rect.y);
                uv_array[2] = new Vector2_1.Vector2(rect.x + rect.width, 1 - (rect.y + rect.height));
                uv_array[3] = new Vector2_1.Vector2(rect.x, 1 - (rect.y + rect.height));
            }
            else {
                uv_array[0] = new Vector2_1.Vector2(0, 1);
                uv_array[1] = new Vector2_1.Vector2(1, 1);
                uv_array[2] = new Vector2_1.Vector2(1, 0);
                uv_array[3] = new Vector2_1.Vector2(0, 0);
            }
            uv.AddRange(uv_array);
            colors.Add(this.m_color);
            colors.Add(this.m_color);
            colors.Add(this.m_color);
            colors.Add(this.m_color);
            var index_begin = vertices.Size() - 4;
            indices.Add(index_begin + 0);
            indices.Add(index_begin + 1);
            indices.Add(index_begin + 2);
            indices.Add(index_begin + 0);
            indices.Add(index_begin + 2);
            indices.Add(index_begin + 3);
        };
        UISprite.prototype.FillVertices = function (vertices, uv, colors, indices) {
            switch (this.m_sprite_type) {
                case SpriteType.Simple:
                    this.FillVerticesSimple(vertices, uv, colors, indices);
                    break;
                default:
                    break;
            }
        };
        UISprite.prototype.FillMaterial = function (mat) {
            if (this.m_atlas) {
                mat.SetMainTexture(this.m_atlas.texture);
                if (this.m_atlas.texture.format == Texture2D_1.TextureFormat.ETC_RGB4_X2) {
                    var shader = Shader_1.Shader.Find("UI/SpriteETC1x2", null, Viry3D_1.Viry3D.Resource.GetGlobalAssetBundle());
                    mat.SetShader(shader);
                }
                else if (this.m_atlas.texture.format == Texture2D_1.TextureFormat.PVRTC_RGB4_X2) {
                    var shader = Shader_1.Shader.Find("UI/SpritePVRTC1x2", null, Viry3D_1.Viry3D.Resource.GetGlobalAssetBundle());
                    mat.SetShader(shader);
                    mat.SetTexture("_MainTexAlpha", this.m_atlas.texture.pvr_alpha);
                }
            }
        };
        return UISprite;
    }(UIView_1.UIView));
    exports.UISprite = UISprite;
});
//# sourceMappingURL=UISprite.js.map