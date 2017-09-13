define(["require", "exports", "./lib/Transform", "./lib/graphics/Graphics", "./lib/graphics/Camera", "./lib/renderer/Renderer", "./lib/renderer/MeshRenderer", "./lib/renderer/SkinnedMeshRenderer", "./lib/animation/Animation", "./lib/ui/UICanvasRenderer", "./lib/ui/UIView", "./lib/ui/UISprite", "./lib/ui/UILabel", "./lib/postprocess/ImageEffect", "./lib/tweener/Tweener", "./lib/tweener/TweenPosition", "./lib/tweener/TweenUIColor", "./lib/audio/AudioListener", "./lib/audio/AudioSource", "./lib/time/Timer", "./lib/Application", "./AppClear", "./AppMesh", "./AppAnim", "./AppWatch", "./AppSocket", "./AppJavaScript"], function (require, exports, Transform_1, Graphics_1, Camera_1, Renderer_1, MeshRenderer_1, SkinnedMeshRenderer_1, Animation_1, UICanvasRenderer_1, UIView_1, UISprite_1, UILabel_1, ImageEffect_1, Tweener_1, TweenPosition_1, TweenUIColor_1, AudioListener_1, AudioSource_1, Timer_1, Application_1, AppClear_1, AppMesh_1, AppAnim_1, AppWatch_1, AppSocket_1, AppJavaScript_1) {
    "use strict";
    Transform_1.Transform.RegisterComponent();
    Camera_1.Camera.RegisterComponent();
    Renderer_1.Renderer.RegisterComponent();
    MeshRenderer_1.MeshRenderer.RegisterComponent();
    SkinnedMeshRenderer_1.SkinnedMeshRenderer.RegisterComponent();
    Animation_1.Animation.RegisterComponent();
    UICanvasRenderer_1.UICanvasRenderer.RegisterComponent();
    UIView_1.UIView.RegisterComponent();
    UISprite_1.UISprite.RegisterComponent();
    UILabel_1.UILabel.RegisterComponent();
    ImageEffect_1.ImageEffect.RegisterComponent();
    Tweener_1.Tweener.RegisterComponent();
    TweenPosition_1.TweenPosition.RegisterComponent();
    TweenUIColor_1.TweenUIColor.RegisterComponent();
    AudioListener_1.AudioListener.RegisterComponent();
    AudioSource_1.AudioSource.RegisterComponent();
    Timer_1.Timer.RegisterComponent();
    function show_select_app() {
        var append = function (name) {
            var a = document.createElement("a");
            a.href = "index.html?" + name;
            a.innerText = name;
            document.body.appendChild(a);
            document.body.appendChild(document.createElement("br"));
        };
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
    var app = function create_app() {
        var loc = location.toString();
        var param_start = loc.lastIndexOf('?');
        if (param_start >= 0) {
            var app_name = loc.substr(param_start + 1);
            switch (app_name) {
                case "AppClear":
                    return new AppClear_1.AppClear();
                case "AppMesh":
                    return new AppMesh_1.AppMesh();
                case "AppAnim":
                    return new AppAnim_1.AppAnim();
                case "AppWatch":
                    return new AppWatch_1.AppWatch();
                case "AppSocket":
                    return new AppSocket_1.AppSocket();
                case "AppJavaScript":
                    return new AppJavaScript_1.AppJavaScript();
            }
        }
        show_select_app();
        return null;
    }();
    function start() {
        if (app != null) {
            var platform = Application_1.Application.Platform();
            if (platform == Application_1.Platform.Android || platform == Application_1.Platform.iOS) {
                app.SetInitSize(window.innerWidth, window.innerHeight);
            }
            app.OnInit();
            update();
        }
    }
    exports.start = start;
    function update() {
        app.OnUpdate();
        app.OnDraw();
        var fps = Graphics_1.Graphics.GetDisplay().GetPreferredFPS();
        if (fps <= 0) {
            fps = 60;
        }
        var timeout = 1000.0 / fps;
        setTimeout(function () {
            window.requestAnimationFrame(update);
        }, timeout - 1000.0 / 60);
    }
    window.onbeforeunload = function () {
    };
    window.onunload = function () {
        if (app != null) {
            app.Deinit();
        }
    };
});
//# sourceMappingURL=app.js.map