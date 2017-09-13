function Pipe() {
	this.index = -1;
	this.up = null;
	this.down = null;
	this.up_start_pos = null;
	this.down_start_pos = null;
	this.y = 0;
	this.move = 0.0;
}

var GameState = {
	None: 0,
	Ready: 1,
	Play: 2,
	Over: 3,
	OverOut: 4,
	ReadyIn: 5,
};

var m_ui_camera;
var m_ui_obj;
var m_ui_scale;
var m_bird_frame_anim_speed;
var m_bird;
var m_bird_type;
var m_bird_frame;
var m_bird_ready_move;
var m_lands = new Array();
var m_land_move;
var m_lands_start_pos = new Array();
var m_pipes = new Array();
var m_pipe_base = new Pipe();
var m_score;
var m_score_obj;
var m_score_sprites = new Array();
var m_score_best = 0;
var m_cover_sprite;
var m_over_score_sprites = new Array();
var m_over_score_best_sprites = new Array();
var m_over_obj;
var m_game_state = GameState.None;
var m_blink_timer;
var m_audio_source_point;
var m_audio_source_wing;
var m_audio_source_hit;
var m_audio_source_swooshing;
var m_audio_source_die;
var m_play_start_time;
var m_pipe_gen_time;
var m_bird_rot;
var m_pipe_count;
var m_bird_speed;
var land_move_speed = -120;
var pipe_y_distance = 130;

app_construct = function () {
}

app_destruct = function () {
}

app_on_resize = function () {
	if(m_ui_camera) {
		var scale_w = m_ui_camera.GetTargetWidth() / 288.0;
		var scale_h = m_ui_camera.GetTargetHeight() / 512.0;
		m_ui_scale = Mathf.Max(scale_w, scale_h);

		m_ui_camera.SetOrthographicSize(m_ui_camera.GetTargetHeight() / 2.0);
		m_ui_obj.GetTransform().SetScale(new Vector3(m_ui_scale, m_ui_scale, m_ui_scale));
	}
}

app_start = function () {
	var camera = GameObject.Create("camera").AddComponent("Camera");
	camera.SetOrthographic(true);
	camera.SetOrthographicSize(camera.GetTargetHeight() / 2.0);
	camera.SetNearClip(-1);
	camera.SetFarClip(1);
	m_ui_camera = camera;

	var bundle_path = "";
	
	if(Application.SupportDXT()) {
		bundle_path = "app_flappy_bird_dxt.viry";
	} else if(Application.SupportETC1()) {
		bundle_path = "app_flappy_bird_etc1.viry";
	}  else if(Application.SupportPVRTC()) {
		bundle_path = "app_flappy_bird_pvrtc.viry";
	} else {
		log("not support compressed texture");
		return;
	}

	Resource.LoadAssetBundleAsync(bundle_path, function (bundle) {
		Resource.SetGlobalAssetBundle(bundle);

		var obj = bundle.LoadGameObject("Assets/AppFlappyBird/Play.prefab");
		obj.GetTransform().SetPosition(new Vector3(0, 0, 0));

		m_ui_obj = obj;
		
		app_on_resize();
		
		InitBG();
		InitReady();
		InitBird();
		InitLand();
		InitPipe();
		InitScore();
		InitCover();
		InitOver();
		InitAudio();

		m_game_state = GameState.Ready;
	}, null);
}

app_update = function () {
	UpdateBirdAnim();
    UpdateBirdMove();
    UpdateBirdRot();
	UpdateLand();
	UpdatePipeGen();
	UpdatePipeMove();
	DetectCollision();
}

function InitBG() {
	var deactive = parseInt(Mathf.RandomRange(0, 2));
	m_ui_obj.GetTransform().Find("Canvas BG/Image " + deactive).GetGameObject().SetActive(false);

	var active = (deactive + 1) % 2;
	var bg = m_ui_obj.GetTransform().Find("Canvas BG/Image " + active).GetGameObject().GetComponent("UISprite");
	bg.GetGameObject().SetActive(true);
	bg.event_handler.enable = true;
	bg.event_handler.on_pointer_down = OnTouchDownBG;
}

function OnTouchDownBG() {
	if(m_game_state == GameState.Ready) {
		m_game_state = GameState.Play;
		m_play_start_time = Time.GetTime();
		m_pipe_gen_time = -1;
		m_bird_rot = 0;
		m_pipe_count = 0;

		var tc = m_ui_obj.GetTransform().Find("Canvas UI/Ready").GetGameObject().AddComponent("TweenUIColor");
		tc.duration = 0.2;
		tc.from = new Color(1, 1, 1, 1);
		tc.to = new Color(1, 1, 1, 0);
		tc.on_finish = function () {
			m_ui_obj.GetTransform().Find("Canvas UI/Ready").GetGameObject().SetActive(false);
		};

		Component.Destroy(m_bird_ready_move);
	}

	if(m_game_state == GameState.Ready || m_game_state == GameState.Play) {
		const fly_speed = 400;
		m_bird_speed = fly_speed;
		m_bird_frame_anim_speed = 14;

		m_audio_source_wing.Play();
	}
}

function InitReady() {
	var ready = m_ui_obj.GetTransform().Find("Canvas UI/Ready").GetGameObject();
	ready.SetActive(true);
	var vs = ready.GetComponentsInChildren("UIView");
	for(var i = 0; i < vs.length; i++) {
		vs[i].SetColor(new Color(1, 1, 1, 1));
	}
}

function InitBird() {
	m_bird_frame_anim_speed = 7;
	
	m_bird = m_ui_obj.GetTransform().Find("Canvas Dynamic/Image Bird").GetGameObject().GetComponent("UISprite");
	m_bird_type = parseInt(Mathf.RandomRange(0, 3));
	m_bird_frame = 0;
	m_bird.SetSpriteName("bird" + m_bird_type + "_" + m_bird_frame);

	m_bird.GetGameObject().GetTransform().SetLocalPosition(new Vector3(-56, -4, 0));
	m_bird.GetGameObject().GetTransform().SetLocalRotationEuler(new Vector3(0, 0, 0));
	
	var move = m_bird.GetGameObject().AddComponent("TweenPosition");
	move.duration = 0.37;
	move.play_style = TweenerPlayStyle.PingPong;
	move.from = m_bird.GetGameObject().GetTransform().GetLocalPosition();
	move.to = move.from.Add(new Vector3(0, 10, 0));
	m_bird_ready_move = move;
}

function UpdateBirdAnim() {
	if(	m_game_state == GameState.Ready ||
		m_game_state == GameState.Play ||
		m_game_state == GameState.ReadyIn) {
		var bird = m_bird;
		m_bird_frame += Time.GetDeltaTime() * m_bird_frame_anim_speed;
		if(parseInt(m_bird_frame) >= 3) {
			m_bird_frame = 0;
		}
		bird.SetSpriteName("bird" + m_bird_type + "_" + parseInt(m_bird_frame));
	}
}

function UpdateBirdMove() {
	if( m_game_state == GameState.Play ||
		m_game_state == GameState.Over) {
		const gravity = -1300;
		m_bird_speed += gravity * Time.GetDeltaTime();
		const speed_min = -450;
		m_bird_speed = Mathf.Max(m_bird_speed, speed_min);

		var birt_t = m_bird.GetTransform();
		var pos = birt_t.GetLocalPosition();
		pos.y += m_bird_speed * Time.GetDeltaTime();

		const bottom_y = -133;
		if(pos.y < bottom_y) {
			pos.y = bottom_y;

			if(m_game_state == GameState.Play) {
				GameOver();
			}
		}

		const top_y = 270;
		pos.y = Mathf.Min(pos.y, top_y);

		birt_t.SetLocalPosition(pos);
	}
}

function UpdateBirdRot() {
	if( m_game_state == GameState.Play ||
		m_game_state == GameState.Over)
	{
		var birt_t = m_bird.GetTransform();

		const minus_start_speed = -350;
		if(m_bird_speed > 0) {
			const rot_add_speed = 600;
			m_bird_rot += rot_add_speed * Time.GetDeltaTime();
			const rot_max = 25;
			m_bird_rot = Mathf.Min(m_bird_rot, rot_max);
		}
		else if(m_bird_speed < minus_start_speed) {
			const rot_minus_speed = -500;
			m_bird_rot += rot_minus_speed * Time.GetDeltaTime();
			const rot_min = -90;
			m_bird_rot = Mathf.Max(m_bird_rot, rot_min);

			m_bird_frame_anim_speed = 0;
		}
		
		birt_t.SetLocalRotationEuler(new Vector3(0, 0, m_bird_rot));
	}
}

function InitLand() {
	m_lands[0] = m_ui_obj.GetTransform().Find("Canvas Dynamic/Image Land 0").GetGameObject().GetComponent("UISprite");
	m_lands[1] = m_ui_obj.GetTransform().Find("Canvas Dynamic/Image Land 1").GetGameObject().GetComponent("UISprite");
	m_land_move = 0;
	m_lands_start_pos[0] = new Vector3(24, -200, 0);
	m_lands_start_pos[1] = new Vector3(360, -200, 0);
}

function UpdateLand() {
	if( m_game_state == GameState.Ready ||
		m_game_state == GameState.Play ||
		m_game_state == GameState.ReadyIn) {
		var move = Time.GetDeltaTime() * land_move_speed;
        m_land_move += move;

		const land_move_min = -336;
		if(m_land_move <= land_move_min) {
			m_land_move = 0;
		}

		var moved = Math.floor(m_land_move * m_ui_scale) / m_ui_scale;
		m_lands[0].GetTransform().SetLocalPosition(m_lands_start_pos[0].Add(new Vector3(moved, 0, 0)));
		m_lands[1].GetTransform().SetLocalPosition(m_lands_start_pos[1].Add(new Vector3(moved, 0, 0)));
	}
}

function InitPipe() {
	m_pipe_base.up = m_ui_obj.GetTransform().Find("Canvas Dynamic/Pipes/Up");
	m_pipe_base.down = m_ui_obj.GetTransform().Find("Canvas Dynamic/Pipes/Down");

	for(var i = 0; i < m_pipes.length; i++) {
		GameObject.Destroy(m_pipes[i].up.GetGameObject());
		GameObject.Destroy(m_pipes[i].down.GetGameObject());
	}
	m_pipes = new Array();
}

function UpdatePipeGen() {
    if(m_game_state == GameState.Play) {
        var time = Time.GetTime();

        const pipe_start_delay = 1;
        if(time - m_play_start_time < pipe_start_delay) {
            return;
        }

        const pipe_gen_delta = 1.4;
        if(m_pipe_gen_time < 0 || time - m_pipe_gen_time > pipe_gen_delta) {
            m_pipe_gen_time = time;

            GenPipe();
        }
    }
}

function GenPipe() {
    var base_up = m_pipe_base.up.GetGameObject();
    var up = GameObject.Instantiate(base_up);
    up.GetTransform().SetParent(base_up.GetTransform().GetParent());

    var base_down = m_pipe_base.down.GetGameObject();
    var down = GameObject.Instantiate(base_down);
    down.GetTransform().SetParent(base_down.GetTransform().GetParent());

    var new_pipe = new Pipe();
    new_pipe.index = m_pipe_count++;
    new_pipe.up = up.GetTransform();
    new_pipe.down = down.GetTransform();

    const pipe_y_max = 176;
    const pipe_y_min = -64;
    new_pipe.y = Mathf.RandomRange(pipe_y_min, pipe_y_max);

    new_pipe.up_start_pos = up.GetTransform().GetLocalPosition().Add(new Vector3(0, new_pipe.y - pipe_y_distance / 2, 0));
    new_pipe.down_start_pos = down.GetTransform().GetLocalPosition().Add(new Vector3(0, new_pipe.y + pipe_y_distance / 2, 0));
    new_pipe.move = 0;

    m_pipes.push(new_pipe);
}

function UpdatePipeMove() {
    if(m_game_state == GameState.Play) {
        var move = Time.GetDeltaTime() * land_move_speed;

        for(var i = 0; i < m_pipes.length;) {
            var pipe = m_pipes[i];

            pipe.move += move;

            const pipe_move_min = -470;
            if(pipe.move <= pipe_move_min) {
                GameObject.Destroy(pipe.up.GetGameObject());
                GameObject.Destroy(pipe.down.GetGameObject());
                m_pipes.splice(i, 1);
                continue;
            }

            var moved = Math.floor(pipe.move * m_ui_scale) / m_ui_scale;
            pipe.up.SetLocalPosition(pipe.up_start_pos.Add(new Vector3(moved, 0, 0)));
            pipe.down.SetLocalPosition(pipe.down_start_pos.Add(new Vector3(moved, 0, 0)));

            i++;
        }
    }
}

function InitScore() {
	m_score = 0;
	m_score_obj = m_ui_obj.GetTransform().Find("Canvas UI/Play/Score").GetGameObject();
	m_score_obj.SetActive(true);

	for(var i = 1; i < m_score_sprites.length; i++) {
		GameObject.Destroy(m_score_sprites[i].GetGameObject());
	}
	m_score_sprites = new Array();

	var score_sprite = m_ui_obj.GetTransform().Find("Canvas UI/Play/Score/Image Score").GetGameObject().GetComponent("UISprite");
	m_score_sprites.push(score_sprite);

	UpdateScore(m_score, m_score_sprites, 24, "font_0", 48, false);

	LoadScoreBest();
}

function LoadScoreBest() {
	var path = Application.SavePath() + "/AppFlappyBird/save.json";
	if(File.Exist(path)) {
		var root = JSON.parse(File.ReadAllText(path));
		m_score_best = root.score_best;
	}
}

function UpdateScore(score, sprites, sprite_width, sprite_name, sprite_base_num, align_right) {
	var score_str = score.toString();
	var number_count = score_str.length;
	for(var i = sprites.length; i < number_count; i++) {
		var new_sprite = GameObject.Instantiate(sprites[0].GetGameObject());
		new_sprite.GetTransform().SetParent(sprites[0].GetTransform().GetParent());
		sprites.push(new_sprite.GetComponent("UISprite"));
	}

	var start_x;
	if(align_right) {
		start_x = -(number_count - 1) * sprite_width;
	} else {
		// align center
		if(number_count % 2 == 1) {
			start_x = -parseInt(number_count / 2) * sprite_width;
		} else {
			start_x = parseInt((-parseInt(number_count / 2) + 0.5) * sprite_width);
		}
	}

	for(var i = 0; i < sprites.length; i++) {
		var sprite = sprites[i];
		var x = start_x + i * sprite_width;
		sprite.GetTransform().SetLocalPosition(new Vector3(x, 0, 0));

		var num = score_str[i] - '0';
		sprite.SetSpriteName(sprite_name + (sprite_base_num + num));
	}
}

function InitCover() {
	m_cover_sprite = m_ui_obj.GetTransform().Find("Canvas UI/Cover").GetGameObject().GetComponent("UISprite");
}

function InitOver() {
	var obj = m_ui_obj.GetTransform().Find("Canvas UI/Over").GetGameObject();
	obj.SetActive(false);
	obj.GetTransform().Find("Image Panel").SetLocalPosition(new Vector3(0, -320, 0));
	obj.GetTransform().Find("Button").GetGameObject().SetActive(false);
	obj.GetTransform().Find("Image Panel/New").GetGameObject().SetActive(false);
	obj.GetTransform().Find("Image Panel/Image Medal").GetGameObject().SetActive(false);

	for(var i = 1; i < m_over_score_sprites.length; i++) {
		GameObject.Destroy(m_over_score_sprites[i].GetGameObject());
	}
	m_over_score_sprites = new Array();

	m_over_score_sprites.push(obj.GetTransform().Find("Image Panel/Score/Image Score").GetGameObject().GetComponent("UISprite"));
	UpdateScore(0, m_over_score_sprites, 16, "number_score_0", 0, true);

	for(var i = 1; i < m_over_score_best_sprites.length; i++) {
		GameObject.Destroy(m_over_score_best_sprites[i].GetGameObject());
	}
	m_over_score_best_sprites = new Array();

	m_over_score_best_sprites.push(obj.GetTransform().Find("Image Panel/Best/Image Score").GetGameObject().GetComponent("UISprite"));
	UpdateScore(m_score_best, m_over_score_best_sprites, 16, "number_score_0", 0, true);

	m_over_obj = obj;

	var button_play = obj.GetTransform().Find("Button/Image Play").GetGameObject().GetComponent("UISprite");
	button_play.event_handler.enable = true;
	button_play.event_handler.on_pointer_down = function () {
		button_play.GetTransform().SetLocalPosition(new Vector3(-70, -3, 0));
	};
	button_play.event_handler.on_pointer_up = function () {
		button_play.GetTransform().SetLocalPosition(new Vector3(-70, 0, 0));
	};
	button_play.event_handler.on_pointer_click = function () {
		Restart();

		m_audio_source_swooshing.Play();
	};
}

function Restart() {
	if(m_game_state == GameState.Over) {
		m_game_state = GameState.OverOut;

		var sprite = m_cover_sprite;
		sprite.GetGameObject().SetActive(true);
		sprite.SetColor(new Color(0, 0, 0, 0));

		var tc = sprite.GetGameObject().AddComponent("TweenUIColor");
		tc.duration = 0.3;
		tc.from = new Color(0, 0, 0, 0);
		tc.to = new Color(0, 0, 0, 1);
        tc.on_finish = function() {
			var tc = m_cover_sprite.GetGameObject().AddComponent("TweenUIColor");
			tc.duration = 0.3;
			tc.from = new Color(0, 0, 0, 1);
			tc.to = new Color(0, 0, 0, 0);
			tc.on_finish = function () {
				m_cover_sprite.GetGameObject().SetActive(false);
				m_game_state = GameState.Ready;
			};

            InitBG();
            InitReady();
            InitBird();
            InitLand();
            InitPipe();
            InitScore();
            InitCover();
            InitOver();

			m_game_state = GameState.ReadyIn;

			if(m_blink_timer != null) {
				m_blink_timer.Stop();
				m_blink_timer = null;
            }
        };
	}
}

function InitAudio() {
	GameObject.Create("AudioListener").AddComponent("AudioListener");

	m_audio_source_point = GameObject.Create("").AddComponent("AudioSource");
	m_audio_source_point.SetClip(Application.DataPath() + "/AppFlappyBird/sfx_point.wav");

	m_audio_source_wing = GameObject.Create("").AddComponent("AudioSource");
	m_audio_source_wing.SetClip(Application.DataPath() + "/AppFlappyBird/sfx_wing.wav");

	m_audio_source_hit = GameObject.Create("").AddComponent("AudioSource");
	m_audio_source_hit.SetClip(Application.DataPath() + "/AppFlappyBird/sfx_hit.wav");

	m_audio_source_swooshing = GameObject.Create("").AddComponent("AudioSource");
	m_audio_source_swooshing.SetClip(Application.DataPath() + "/AppFlappyBird/sfx_swooshing.wav");

	m_audio_source_die = GameObject.Create("").AddComponent("AudioSource");
	m_audio_source_die.SetClip(Application.DataPath() + "/AppFlappyBird/sfx_die.wav");
}

function GameOver() {
	m_game_state = GameState.Over;

	CoverFlashWhite();

	m_audio_source_hit.Play();

	Timer.CreateTimer(0.5, false).on_tick = function () {
		m_score_obj.SetActive(false);

		// show game over
		{
			var over_obj = m_over_obj;
			over_obj.SetActive(true);

			var tp = over_obj.GetTransform().Find("Image Title").GetGameObject().AddComponent("TweenPosition");
			tp.duration = 0.2;
			tp.from = tp.GetTransform().GetLocalPosition();
			tp.to = tp.from.Add(new Vector3(0, 10, 0));
			tp.curve = [
				0, 0, 1, 1,
				0.5, 1, 1, -1,
				1, 0, -1, -1
			];

			var tc = over_obj.GetTransform().Find("Image Title").GetGameObject().AddComponent("TweenUIColor");
			tc.GetGameObject().GetComponent("UIView").SetColor(new Color(1, 1, 1, 0));
			tc.duration = 0.2;
			tc.from = new Color(1, 1, 1, 0);
			tc.to = new Color(1, 1, 1, 1);

			m_audio_source_swooshing.Play();

			tp = over_obj.GetTransform().Find("Image Panel").GetGameObject().AddComponent("TweenPosition");
			tp.duration = 0.3;
			tp.delay = 0.7;
			tp.from = tp.GetTransform().GetLocalPosition();
			tp.to = new Vector3(0, 0, 0);
			tp.curve = [
				0, 0, 2, 2,
				1, 1, 0, 0
			];

			Timer.CreateTimer(0.7, false).on_tick = function () {
				m_audio_source_swooshing.Play();
			};

			Timer.CreateTimer(1.2, false).on_tick = function () {
				if(m_score > 0) {
					var tick = 1.0 / m_score;

					var t = Timer.CreateTimer(tick, true);
					t.on_tick = function () {
						var score = t.tick_count;
						UpdateScore(score, m_over_score_sprites, 16, "number_score_0", 0, true);

						if(score == m_score) {
							t.Stop();

							if(m_score > m_score_best) {
								m_ui_obj.GetTransform().Find("Canvas UI/Over/Image Panel/New").GetGameObject().SetActive(true);
								UpdateScore(m_score, m_over_score_best_sprites, 16, "number_score_0", 0, true);
								SaveScoreBest(m_score);
							}

							if(m_score >= 10 && m_score < 20) {
								ShowMedal(3);
							}
							else if(m_score >= 20 && m_score < 40) {
								ShowMedal(2);
							}
							else if(m_score >= 40 && m_score < 80) {
								ShowMedal(1);
							}
							else if(m_score >= 80) {
								ShowMedal(0);
							}

							Timer.CreateTimer(0.3, false).on_tick = function () {
								over_obj.GetTransform().Find("Button").GetGameObject().SetActive(true);
							};
						}
					};
				} else {
					Timer.CreateTimer(0.3, false).on_tick = function () {
						over_obj.GetTransform().Find("Button").GetGameObject().SetActive(true);
					};
				}
			};
		}
	};
}

function CoverFlashWhite() {
	var sprite = m_cover_sprite;
	sprite.GetGameObject().SetActive(true);
	sprite.SetColor(new Color(1, 1, 1, 1));
	
	var tc = sprite.GetGameObject().AddComponent("TweenUIColor");
	tc.duration = 0.2;
	tc.from = new Color(1, 1, 1, 1);
	tc.to = new Color(1, 1, 1, 0);
	tc.on_finish = function () {
		m_cover_sprite.GetGameObject().SetActive(false);
	};
}

function SaveScoreBest(score) {
	m_score_best = score;
	var path = Application.SavePath() + "/AppFlappyBird/save.json";

	var root = {};
	root.score_best = m_score_best;

	File.WriteAllText(path, JSON.stringify(root));
}

function ShowMedal(index) {
	var obj = m_ui_obj.GetTransform().Find("Canvas UI/Over/Image Panel/Image Medal").GetGameObject();
	obj.SetActive(true);
	obj.GetComponent("UISprite").SetSpriteName("medals_" + index);
	obj.GetTransform().Find("Blink").GetGameObject().SetActive(false);

	m_blink_timer = Timer.CreateTimer(0.5, true);
	m_blink_timer.on_tick = function () {
		var blink_obj = obj.GetTransform().Find("Blink").GetGameObject();
		blink_obj.SetActive(true);
		var blink = blink_obj.GetComponent("UISprite");
		blink.SetSpriteName("blink_00");

		blink_obj.GetTransform().SetLocalPosition(new Vector3(Mathf.RandomRange(-22.0, 22.0), Mathf.RandomRange(-22.0, 22.0), 0));

		var t = Timer.CreateTimer(0.1, true);
		t.on_tick = function () {
			var tick_count = t.tick_count;
			if(tick_count == 3) {
				t.Stop();
				blink_obj.SetActive(false);
			} else {
				blink.SetSpriteName("blink_0" + tick_count);
			}
		};
	};
}

function DetectCollision() {
	if(m_game_state == GameState.Play) {
		var bird_y = m_bird.GetTransform().GetLocalPosition().y;

        for(var i = 0; i < m_pipes.length; i++) {
			var p = m_pipes[i];
			
			if(p.move < -314 && p.move > -400) {
				if(bird_y - 12 < p.y - pipe_y_distance / 2 || bird_y + 12 > p.y + pipe_y_distance / 2) {
					GameOver();

                    Timer.CreateTimer(0.3, false).on_tick = function () {
						m_audio_source_die.Play();
					};
					return;
				}
			} else if(p.move < -400) {
				var score = p.index + 1;

				if(score > m_score) {
					m_score = score;
					UpdateScore(m_score, m_score_sprites, 24, "font_0", 48, false);

					m_audio_source_point.Play();
				}
			}
		}
	}
}