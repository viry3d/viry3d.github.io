import { Application } from "./lib/Application"
import { GameObject } from "./lib/GameObject"
import { Camera } from "./lib/graphics/Camera"
import { Color } from "./lib/graphics/Color"

enum Command {
	CommandSit,
	CommandReady,
	CommandStart,
	CommandCall,
	CommandGive,
}

export class AppSocket extends Application {
	constructor() {
		super();
		this.SetName("Viry3D::AppSocket");
		this.SetInitSize(800, 600);
	}
	
	Start() {
		let camera = <Camera>GameObject.Create("camera").AddComponent("Camera");
		camera.SetClearColor(new Color(0, 0, 0, 1));

		this.socket = new WebSocket("ws://127.0.0.1/WebSocketServer", "websocket.viry3d.com");

		this.socket.onopen = (event) => {
			console.log("socket connected.");
		};

		this.socket.onclose = (event) => {
			console.log("socket closed.");
		};

		this.socket.onmessage = (event) => {
			if(typeof (event.data) === "string") {
				let msg = JSON.parse(event.data);

				let cmd: number = msg.cmd;
				switch(cmd) {
					case Command.CommandSit: {
						if(msg.me == msg.who_sit) {
							this.table = msg.table;
							this.me = msg.me;

							this.socket.send(JSON.stringify({
								cmd: Command.CommandReady,
								table: msg.table,
								name: "user " + Math.floor(Math.random() * 100),
							}));
						}

						this.players = msg.players;

						break;
					}
					case Command.CommandReady: {
						let player = this.players[msg.player.toString()];
						player.name = msg.name;

						console.log(msg.name + " is ready");

						break;
					}
					case Command.CommandStart: {
						console.log("game start");

						this.round = msg.round;
						this.cards = msg.cards;

						console.log("get cards", this.cards);

						let me = this.players[this.me.toString()];
						if(this.round % 3 == me.sit) {
							this.socket.send(JSON.stringify({
								cmd: Command.CommandCall,
								table: this.table,
								score: 2,
							}));
						}

						break;
					}
					case Command.CommandCall: {
						let player = this.players[msg.player.toString()];
						let score = msg.score;
						let me = this.players[this.me.toString()];

						player.call_score = score;

						console.log(player.name + " call " + score);

						if((player.sit + 1) % 3 == me.sit) {
							if(me.call_score == null) {
								if(score < 3) {
									this.socket.send(JSON.stringify({
										cmd: Command.CommandCall,
										table: this.table,
										score: score + 1,
									}));
								}
							}
						}

						break;
					}
					case Command.CommandGive: {
						let player = this.players[msg.player.toString()];
						let cards = msg.cards;

						console.log("give cards:", cards, "to", player.name);

						if(this.me == msg.player) {
							this.cards = this.cards.concat(cards);

							console.log("i'm boss,", this.cards);
						}

						break;
					}
				}
			}
		};
	}

	Update() {
		if(this.socket.readyState == this.socket.OPEN) {
			
		}
	}

	socket: WebSocket;
	table: number;
	me: number;
	players: any;
	round: number;
	cards: number[];
}