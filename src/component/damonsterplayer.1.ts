'use strict';

import DaMonsterCard from './damonstercard.js'
import {DaCardEvents} from './damonstercard.js'
import DaMonsterPlayerHero from './damonsterplayerhero.js'

export enum DaPlayerComEvents {
    SetHero = 'set-hero',
    EquipHero = 'equip-hero',
    DoAction = 'do-action',
    DoneAction = 'action-done',
    DoBattle = 'do-battle'
}

export default class DaMonsterPlayer extends HTMLElement {
    public static get is(): string { return 'da-monster-player'; }

    public getTemplate(props: any): string {
        return `
            <style>
                #da-player-container{
                    position: relative;
                }

                #hand-container{
                    display: flex;
                    overflow: auto;
                }

                @media only screen and (max-width: 500px) {
                }
                
                


			</style>
            <!-- shadow DOM for your element -->
			<div id="da-player-container">
                <div id="hand-container"></div>
                <div id="btns">
                    <button id="playBtn">PLAY</button>
                    <button id="battleBtn">FIGHT</button>
                    <button id="actionBtn">DONE</button>
                </div>
            </div>
        `;
    }

    public static get properties() {
        return {
            'data-name': {
                type: String,
                value: ''
            }
        };
    }

    public static get observedAttributes(): string[] {

        const attributes: string[] = [];

        for (let key in DaMonsterPlayer.properties) {
            attributes.push(key.toLowerCase());
        }

        return attributes;
    }

    private props: any = {};

    public constructor(isNPC) {
        super();        

        this.attachShadow({ mode: 'open' });
        
        // Initialize declared properties
        for (let key in DaMonsterPlayer.properties) {
            this.props[key] = DaMonsterPlayer.properties[key].value;
        }

        this.requestRender();

        this.init(isNPC);
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string, namespace: string): void {
        if (oldValue === newValue) {
            return;
        }

        this.props[name] = newValue;
    }

    private requestRender(): void {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.createElement('template');

        template.innerHTML = this.getTemplate({});

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    
    //------------------------------------------------------------//
    // private _action = {
    //     name: DaPlayerComEvents.DrawFromDeck,
    //     detail: null
    // };
    
    private _isNPC;
    public get isNPC(){
        return this._isNPC;
    }
    
    private _hero;
    public get hero(){
        return this._hero;
    }

    private init(isNPC) {
        this._isNPC = isNPC;
        
        let container = this.shadowRoot.getElementById('da-player-container');

        this._hero = new DaMonsterPlayerHero();
        container.insertBefore(this._hero, container.firstChild);
        
        if (isNPC){
            container.removeChild(this.shadowRoot.getElementById('btns'));                        
        }else{
            this.shadowRoot.getElementById('playBtn').onclick = (e) => {
            let container = this.shadowRoot.getElementById('hand-container'),
                card = Array.from(container.children).find((c) =>{
                return c.isSelected;
            });
            
            if (!card){
                console.log('NOTHING is selected!!!!');
                return;
            }
            
            switch (card.cardType) {
                case 'h':
                    this.dispatchEvent(new CustomEvent(DaPlayerComEvents.SetHero, { detail: {card: card}, bubbles: true, composed: true }));
                    break;
            
                case 'a':
                    this._action.name = DaPlayerComEvents.DoAction;
                    break;
            
                case 'i':
                    this.dispatchEvent(new CustomEvent(DaPlayerComEvents.EquipHero, { detail: {card: card}, bubbles: true, composed: true }));
                    break;
            }
            //this.dispatchEvent(new CustomEvent(this._action.name, { detail: this._action.detail, bubbles: true, composed: true }));
            
            //reset
            //this._action.name = DaPlayerComEvents.DrawFromDeck;
            //this._action.detail = null;
            }    
            
            this.shadowRoot.getElementById('battleBtn').onclick = (e) =>{
            this.dispatchEvent(new CustomEvent(DaPlayerComEvents.DoBattle, {detail: null, bubbles: true, composed: true}));
            }
            
            this.shadowRoot.getElementById('actionBtn').onclick = (e) =>{
            this.dispatchEvent(new CustomEvent(DaPlayerComEvents.DoneAction, {detail: null, bubbles: true, composed: true}));            
            }              
        }                   
    }

    private toggleCard(card, isSelected) {
        //deselect other
        let container = this.shadowRoot.getElementById('hand-container');
        Array.from(container.children).forEach((c) => {
            let id = parseInt(c.getAttribute('data-id'));
            if (id != card.id) {
                c.isSelected = false;
            }
        })

        if (!isSelected) {
            //disable btn.. nothing selected
            
        }
    }

    public InitHand(cards) {
        cards.forEach((card) => {
            let container = this.shadowRoot.getElementById('hand-container');
               
            card.addEventListener('card-toggle',(e) => {
                this.toggleCard(card, e.detail);
            });

            container.appendChild(card);
        })
    }
            
    public GetCardById(id){
        let container = this.shadowRoot.getElementById('hand-container');
        return Array.from(container.children).find((c)=>{
            return c.id == id;
        });
    }
    
    public GetHandIds(){
        let container = this.shadowRoot.getElementById('hand-container');
        
        return Array.from(container.children).map((n) =>
            {
                return n.id;
            });
    }

    public AddHand(daCard:DaMonsterCard) {
        let container = this.shadowRoot.getElementById('hand-container');
        container.prepend(daCard); 
        
        return daCard.add().then(() =>{
            daCard.addEventListener(DaCardEvents.Toggle,(e) => {
                this.toggleCard(daCard);
            });                             
        });                                                 
        
        // return this._animation = new Promise((resolve, reject) =>{                                
        //         let animation = daCard.animate(
        //             [   {'marginTop': '-15px'}, 
        //                 {'marginTop': 0}
        //             ], 
        //             {   duration: 500, 
        //                 iterations: 1,
        //                 //startDelay: 1000,
        //                 //endDelay: 500
        //             }
        //         );                
        //         animation.onfinish = (e) =>{
        //             daCard.addEventListener(DaCardEvents.Toggle,(e) => {
        //                 this.toggleCard(daCard);
        //             });                
        //             resolve();                        
        //         };
        //     });
    }


    public RemoveHand(id) {
        let container = this.shadowRoot.getElementById('hand-container'),
            daCard = Array.from(container.children).find((c) => {
                return c.id == id;
            });
            
        if (!daCard){
            console.log('CARD NOT IN HAND!!!!! cannot remove');
        }
        
        return daCard.remove().then(() =>{
            container.removeChild(daCard);
        });         
    }
   
    // public EquipHero(point) {
    //     return this._hero.Equip(point);
    // }
    
    // public ShowCard(id){
    //     let container = this.shadowRoot.getElementById('hand-container'),
    //         daCard = Array.from(container.children).find((c) => { return c.id == id;});
    //     if (!daCard){
    //         console.log('CARD NOT IN HAND!!!!');
    //     }
    //     
    //     return daCard.flip();
    //     
    //     // return this._animation = new Promise((resolve, reject) => {
    //     //     //only one direction because it should be called by NPC playing an action
    //     //     return daCard.flip().then(() =>{
    //     //         let animation = daCard.animate(
    //     //             [   {'marginTop': 0}, 
    //     //                 {'marginTop': '15px'}
    //     //             ], 
    //     //             {   duration: 500, 
    //     //                 iterations: 1,
    //     //                 //startDelay: 1000
    //     //                 //endDelay: 500
    //     //             }
    //     //         );                
    //     //         animation.onfinish = (e) =>{
    //     //             resolve();                        
    //     //         };                            
    //     //     });            
    //     // });
    // }
    
    public Battle(){
        
    }
}

customElements.define(DaMonsterPlayer.is, DaMonsterPlayer);