import { DaDeck, DaDeckEvents, GetDefaultCards } from "./deck.js"
import { DaPlayer, DaPlayerTypes, DaPlayerEvents } from "./player.js"
import { DaCardType } from "./card.js"
import { DaHeroCard } from "./herocard.js"
import { DaActions, DaActionCard } from  "./actioncard.js"
import { DaNpc } from "./npc.js"


export enum DaMonsterGameEvents {
	MonsterInvade,
	BattleDone,
	DoneDrawFromDeck,
	SetHero,
	EquipHero,
	ActionStart,
	ActionDone,	
}


export default class DaMonsterGame {
	

	
	public monsterCard: DaCard | undefined = undefined;
	public availableMonsters: DaCard[] = [];
	public playedActions: DaCard[] = [];		
		
	private _deck: DaDeck;
	get deck() {
		return this._deck;
	}
		
	private _players: DaPlayer[] = [];
	get players() {
		return this._players;
	}
	private _player: DaPlayer;
	get player(){
		return this._player;
	}
	private _npc: DaPlayer;
	get npc(){
		return this._npc;
	}
	
	get activePlayer(){
		return this._players.find((p) => {return p.isActive;});
	}
	
	private _isProvokeBattle:boolean = false;	

	constructor() {
		this.initDeck();
		this.initPlayers();
		this.initActionCards();
	}
	
	private _callbacks = [];
	AddEventListener(event: DaPlayerEvents, callback) {
		let callbacks = this._callbacks[event];
		if (callbacks == undefined) {
			this._callbacks[event] = [callback];
		} else {
			this._callbacks[event].push(callback);
		}
	}

	private initDeck() {
		this._deck = new DaDeck();
		
		this._deck.AddEventListener(DaDeckEvents.MonsterFound, (monster) =>{
			//Monster INvade
			//console.log('%s draw from deck.... and MONSTER %o invade', p.name, monster);
			console.log('MONSTER %o invade', monster);
			this._isProvokeBattle = false;
			this.monsterCard = monster;
			
			let callbacks = this._callbacks[DaMonsterGameEvents.MonsterInvade];
			if (callbacks) {
				callbacks.forEach((c) => {
					c.call(null, monster);
				})
			}																
		});
	}

	private initPlayers() {
		let p1 = new DaPlayer("p1", this._deck),
			p2 = new DaNpc("npc", this._deck);
			
		p1.nextPlayer = p2;
		p2.nextPlayer = p1;

		this._players.push(p1, p2);
		this._player = p1;
		this._npc = p2;
		
		this._players.forEach((p, index) => {
						
			// p.AddEventListener(DaPlayerEvents.MonsterInvade,(monster) => {
			// 	console.log('%s draw from deck.... and MONSTER %o invade', p.name, monster);
			// 	this._isProvokeBattle = false;
			// 	this.monsterCard = monster;									
			// });
									
			p.AddEventListener(DaPlayerEvents.DoneDrawFromDeck,(card) => {
				//component to display the card taken																												
				let callbacks = this._callbacks[DaMonsterGameEvents.DoneDrawFromDeck];
				if (callbacks) {
					callbacks.forEach((c) => {
						c.call(null, p, card);
					})
				}
				
				if (this.activePlayer.isNPC){
					this.activePlayer.DoARound(this._players, this.availableMonsters);					
				}				
			});
			
			p.AddEventListener(DaPlayerEvents.SetHero,(hero) => {
				let callbacks = this._callbacks[DaMonsterGameEvents.SetHero];
				if (callbacks) {
					callbacks.forEach((c) => {
						c.call(null, p, hero);
					})
				}
				
				if (p.isNPC){
					p.DoARound(this._players, this.availableMonsters);
				}
			});

			p.AddEventListener(DaPlayerEvents.EquipHero,(card) => {
				let callbacks = this._callbacks[DaMonsterGameEvents.EquipHero];
				if (callbacks) {
					callbacks.forEach((c) => {
						c.call(null, p, card);
					})
				}
								
				if (p.isNPC){
					p.DoARound(this._players, this.availableMonsters);
				}				
			});

									
			
			p.AddEventListener(DaPlayerEvents.StartAction,(card, args) => {
				console.log('%s play an action %s with args %o', p.name, card.name, args);

				// if (this.playedActions.length > 0 && (card.action != DaActions.Stop || card.action != DaActions.Retreat)) {
				// 	throw new Error("Cannot play another action when there is a pending action (only stop and retreat can)!!!!");
				// }
				
				if (this.playedActions.length == 0 && card.action == DaActions.Stop){
					throw new Error("No pending action to stop!!!!");
				}
				
				this.playedActions.push({
					player: p,
					card: card,
					args: args,
					isStopped: false
				});				
				
				// if (card.action == DaActions.Stop){
				// 	
				// }else{
				// 	this.playedActions[0].isStopped = !this.playedActions[0].isStopped;
				// 	this.playedActions.push({
				// 		player: p,
				// 		card: card
				// 	});
				// }
								
				this._players.forEach((player) =>{
					if (player !== p){
						player.isActionDone = false;
						if (player.isNPC){
							player.ReactOnAction(card, args);
						}
					}else{
						player.isActionDone = true;
					}
				})
				
				let callbacks = this._callbacks[DaMonsterGameEvents.ActionStart];
				if (callbacks) {
					callbacks.forEach((c) => {
						c.call(null, p, card);
					})
				}																
			});
						
			p.AddEventListener(DaPlayerEvents.EndAnAction, (player) =>{
				if (this._players.every((p) => {
					return p.isActionDone;
				})){
					this.ExeCardAction();
					
				}				
			});
		});
	}

	private initActionCards() {
		Object.keys(DaActions).filter(key => !isNaN(Number(key))).forEach((index) => {

			switch (parseInt(index)) {
				case DaActions.AtomicBomb:
					DaActionCard.callbacks[index] = (player) => {
						console.log("Action card (Atomic bomb) played");
						let hasMonster = this.monsterCard != undefined;								
						//monster
						if (this.monsterCard) {
							player.monsterKilled.push(this.monsterCard);
							this.monsterCard = undefined;
						}						
						//heros
						this._players.forEach((p) => {
							p.hero = undefined;
						});
						
						return hasMonster;
					}
					break;

				case DaActions.Provoke:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log('Provoke a monster %o', args[0]);
						let id = args[0],
							index = this.availableMonsters.findIndex((c) => { return c.id == id; });

						if (index < 0) {
							throw new Error("Monster card is not found from the available monster");
						}
							
						let monsterCard = this.availableMonsters[index];
						if (monsterCard.type != DaCardType.Monster) {
							throw new Error("Card type is not monster in provoke");
						}
								
						//provoke monster!!!
						this._isProvokeBattle = true;
						this.availableMonsters.splice(index, 1);									
						this.monsterCard = monsterCard;
						return this.monsterCard;
					}
					break;

				case DaActions.Stop:
					//Stopping logic is handled in DaMonsterGame player play action callback event??	
					break;

				case DaActions.Radar:
					DaActionCard.callbacks[index] = (player) => {
						console.log('Radar.... %s', player);
						return this._deck.NextNCards(3);
					}
					break;

				case DaActions.Steal:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log('Steal..... %s', player);
						let cardIndex = args[0];
						if (isNaN(cardIndex)) {
							throw new Error('NO CARD to steal.. (card index is empty)!!!!');
						}
						let target = player.isNPC 
							? this.player 
							: this.npc,							
							card = target.hand[cardIndex];
						target.hand.splice(cardIndex, 1);							 
						player.hand.push(card);
						return card;
					}
					break;

// 				case DaActions.Super:
// 					DaActionCard.callbacks[index] = (player) => {
// 						console.log('Suuuuuper... %o', player);
// 						player.attack = 10000;
// 					}
// 					break;
// 
// 				case DaActions.PerfectCube:
// 					DaActionCard.callbacks[index] = (player) => {
// 						console.log('Perfect cube.... %o', player);
// 						player.defense = 100000;
// 					}
// 					break;

				case DaActions.Retreat:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log("Retreat......");
						player.hero.items.forEach((i) => {
							player.hand.push(i);
						})
						player.hand.push(player.hero);
						
						player.hero = undefined;
					}
					break;

				case DaActions.Attack:
					DaActionCard.callbacks[index] = (player, args) => {
						console.log('Attack action by %s', player);
						if (this.players[0].hero.totalPoint == this.players[1].hero.totalPoint){
							this.players[0].hero = undefined;
							this.players[1].hero = undefined;
						}
						
						if (this.players[0].hero.totalPoint < this.players[1].hero.totalPoint){
							this.players[0].hero = undefined;
							return this.players[0];							
						}else{
							this.players[1].hero = undefined;
							return this.players[1];							
						}						 
					}
					break;
					
				// case DaActions.SuicideBelt:
				// 	//destory a target
				// 	DaActionCard.callbacks[index] = (player, args) =>{
				// 		let target = args[0];
				// 		if (!target){
				// 			throw new Error("Target player is needed for suicide belt!!!!");
				// 		}						
				// 		console.log('Suicide belt by %s', player);
				// 	}
				// 	break;
				// 
				// case DaActions.MindReading:
				// 	DaActionCard.callbacks[index] = (player, args) =>{
				// 		let target = args[0];
				// 		if (!target){
				// 			throw new Error("Target player is needed for mind reading!!!!");
				// 		}
				// 		if (typeof target != 'DaPlayer'){
				// 			throw new Error("Card type is not player in mind reading")
				// 		}
				// 		console.log('Mind reading to %s by %s', target, player);
				// 	}
				// 	break;
			}
		})
	}
	
	
	
	Battle() {
		console.log('BATTLE');
		if (!this.monsterCard){
			throw new Error("No monster to BATTLE!!!");
		}

		let maxPointPlayer = null,
			winner = null,
			isPlayerWin = false;
		this._players.forEach((p: DaPlayer) => {
			//TODO::how about equal point????
			if (p.hero){
				if (!maxPointPlayer || 
					(maxPointPlayer.hero.totalPoint < p.hero.totalPoint) ||
					(maxPointPlayer.hero.totalPoint == p.hero.totalPoint && p.isActive)){
					maxPointPlayer = p;
				}					
			}
		});

		if (!maxPointPlayer || this.monsterCard.point > maxPointPlayer.hero.totalPoint) {
			//monster win
			console.log('monster win!!!!');
			this.availableMonsters.push(this.monsterCard);
			this._players.forEach((p: DaPlayer) => {
				p.hero = undefined;
			});
			winner = this.monsterCard;
		} else {
			console.log('player win!!!!!');
			//check for each player
			winner = maxPointPlayer;
			isPlayerWin = true;
			maxPointPlayer.monsterKilled.push(this.monsterCard);
		}
				
		let callbacks = this._callbacks[DaMonsterGameEvents.BattleDone];
		if (callbacks) {
			callbacks.forEach((c) => {
				c.call(null, isPlayerWin, winner, this.activePlayer);
			})
		}

		this.monsterCard = undefined;		
		if (this.activePlayer.isNPC){
			this.activePlayer.DoARound(this._players, this.availableMonsters);
		}
	}

	New() {
		let cards = GetDefaultCards();
		this._deck.Empty();
		this._deck.AddCardsAndShuffle([].concat(cards.hero, cards.item, cards.skill));

		this._players.forEach((p, index) => {
			p.New();
			//there wont be any monster card at this point of time...
			for (var i = 5; i > 0; i--) {
				p.hand.push(this._deck.Deal());								
			}
		})
		this._deck.AddCardsAndShuffle(cards.monster);
		
		this._players.find((p) => {return !p.isNPC;}).isActive = true;		
	}

	ExeCardAction() {
		
		let cards = this.playedActions.map((a) => {return {cardId: a.card.id, player: a.player};}),
			nonStopActions = [],			
			
		for (var i = 0; i < this.playedActions.length; i++){
			if (this.playedActions[i].card.action != DaActions.Stop){
				nonStopActions.push(this.playedActions[i]);				
			}else{
				let currentAction = nonStopActions[nonStopActions.length - 1];
				currentAction.isStopped = !currentAction.isStopped;				
			}						 			
		}
		
		nonStopActions.forEach((action) =>{
			if (!action.isStopped){
				//do action
				action.result = action.card.Play(action.player, action.args);
			}
			let callbacks = this._callbacks[DaMonsterGameEvents.ActionDone];
			if (callbacks) {
				callbacks.forEach((c) => {
					c.call(null, action, cards);
				})
			}																															
		})
									
		this.playedActions = [];
																						
		//check for monster card...
		// //can be monster invade -> atomic bomb (next player)
		// //or action -> provoke....			
		if (!this.monsterCard){
			if (this.activePlayer.isNPC){
				this.activePlayer.DoARound(this._players, this.availableMonsters);
			}
		}else{
			//battle mode....
			let monsterCallback = this._callbacks[DaMonsterGameEvents.MonsterInvade];
			if (monsterCallback) {
				monsterCallback.forEach((c) => {
					c.call(null, this.monsterCard);
				})
			}																
		}																
		
	}
	
}
