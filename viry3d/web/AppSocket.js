var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./lib/Application", "./lib/GameObject", "./lib/graphics/Color"], function (require, exports, Application_1, GameObject_1, Color_1) {
    "use strict";
    var Command;
    (function (Command) {
        Command[Command["CommandSit"] = 0] = "CommandSit";
        Command[Command["CommandReady"] = 1] = "CommandReady";
        Command[Command["CommandStart"] = 2] = "CommandStart";
        Command[Command["CommandCall"] = 3] = "CommandCall";
        Command[Command["CommandGive"] = 4] = "CommandGive";
    })(Command || (Command = {}));
    var AppSocket = (function (_super) {
        __extends(AppSocket, _super);
        function AppSocket() {
            _super.call(this);
            this.SetName("Viry3D::AppSocket");
            this.SetInitSize(800, 600);
        }
        AppSocket.prototype.Start = function () {
            var _this = this;
            var camera = GameObject_1.GameObject.Create("camera").AddComponent("Camera");
            camera.SetClearColor(new Color_1.Color(0, 0, 0, 1));
            this.socket = new WebSocket("ws://127.0.0.1/WebSocketServer", "websocket.viry3d.com");
            this.socket.onopen = function (event) {
                console.log("socket connected.");
            };
            this.socket.onclose = function (event) {
                console.log("socket closed.");
            };
            this.socket.onmessage = function (event) {
                if (typeof (event.data) === "string") {
                    var msg = JSON.parse(event.data);
                    var cmd = msg.cmd;
                    switch (cmd) {
                        case Command.CommandSit: {
                            if (msg.me == msg.who_sit) {
                                _this.table = msg.table;
                                _this.me = msg.me;
                                _this.socket.send(JSON.stringify({
                                    cmd: Command.CommandReady,
                                    table: msg.table,
                                    name: "user " + Math.floor(Math.random() * 100),
                                }));
                            }
                            _this.players = msg.players;
                            break;
                        }
                        case Command.CommandReady: {
                            var player = _this.players[msg.player.toString()];
                            player.name = msg.name;
                            console.log(msg.name + " is ready");
                            break;
                        }
                        case Command.CommandStart: {
                            console.log("game start");
                            _this.round = msg.round;
                            _this.cards = msg.cards;
                            console.log("get cards", _this.cards);
                            var me = _this.players[_this.me.toString()];
                            if (_this.round % 3 == me.sit) {
                                _this.socket.send(JSON.stringify({
                                    cmd: Command.CommandCall,
                                    table: _this.table,
                                    score: 2,
                                }));
                            }
                            break;
                        }
                        case Command.CommandCall: {
                            var player = _this.players[msg.player.toString()];
                            var score = msg.score;
                            var me = _this.players[_this.me.toString()];
                            player.call_score = score;
                            console.log(player.name + " call " + score);
                            if ((player.sit + 1) % 3 == me.sit) {
                                if (me.call_score == null) {
                                    if (score < 3) {
                                        _this.socket.send(JSON.stringify({
                                            cmd: Command.CommandCall,
                                            table: _this.table,
                                            score: score + 1,
                                        }));
                                    }
                                }
                            }
                            break;
                        }
                        case Command.CommandGive: {
                            var player = _this.players[msg.player.toString()];
                            var cards = msg.cards;
                            console.log("give cards:", cards, "to", player.name);
                            if (_this.me == msg.player) {
                                _this.cards = _this.cards.concat(cards);
                                console.log("i'm boss,", _this.cards);
                            }
                            break;
                        }
                    }
                }
            };
        };
        AppSocket.prototype.Update = function () {
            if (this.socket.readyState == this.socket.OPEN) {
            }
        };
        return AppSocket;
    }(Application_1.Application));
    exports.AppSocket = AppSocket;
});
//# sourceMappingURL=AppSocket.js.map