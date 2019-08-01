import { DaCard, DaCardType } from "./card.js";
import { DaPlayer } from "./player.js";

export enum DaActions {
	AtomicBomb,
	Stop,
	Radar,
	Steal,
	// Super,
	// PerfectCube,
	Retreat,
	Provoke,
	Attack,	
	SuicideBelt,
	MindReading,
}

export class DaActionCard extends DaCard {


	static callbacks:{(target:DaPlayer, args?:any []): void | DaCard | DaCard[] | DaPlayer[] | boolean;}[] = [];

	// private _callback = undefined;
	// get callback() {
	// 	return this._callback;
	// }
	// set callback(value) {
	// 	this._callback = value;
	// }
	
	private _action:DaActions;
	get action():DaActions{
		return this._action;
	}

	constructor(id:number, name:string, action:DaActions) {
		super(id, name, DaCardType.Action);
		this._action = action;
	}


	Play(player: DaPlayer, args?:[]) {
		let callback = DaActionCard.callbacks[this._action];
		if (callback == undefined){
			throw new Error('Card action callback is not defined!!!');						
		}
		
		return callback.call(null, player, args);
	}
}