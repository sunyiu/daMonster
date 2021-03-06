/*<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
*/

/*<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></svg>*/

'use strict';
import { DaHeroTypes, DaActions, DaCardType, ICard_com_data } from './idamonster'
import Card_com from "./card";

const template = document.createElement('template');
template.innerHTML = `
<style>
    div[da-hero-container]{
        position: relative;
    }

    div[hero-item-container]{
        position: relative;
        display: flex;
        justify-content: space-evenly;
        align-items: flex-end;
    }
    :host([type='npc']) div[hero-item-container]{
        flex-direction: row-reverse;
    }
    
    div[hero-context]{
        width: 85px;
        height: 85px;                    
        background-size: contain;
        background-repeat: no-repeat;  
        background-position-y: bottom;
        background-image: url(images/none.png);        
        transition: all .2s ease-in-out;    
        border-radius: 45px;                
    }
                    
    div[hero-container].k div[hero-context]{
        background-image: url(images/knight.png);
    }
    div[hero-container].w div[hero-context]{
        background-image: url(images/wizard.png);
    }
    div[hero-container].r div[hero-context]{
        background-image: url(images/ranger.png);
    }
    div[da-hero-container].active div[hero-container] div[hero-context]{
    }
                                                                            
    @keyframes addItem {
        0% {
            transform: scale(0.1);
            -webkit-transform: scale(0.1);
        }
        75%{
            transform: scale(1.3);
            -webkit-transform: scale(1.3);            
        }
        100% {
            transform: scale(1.0);
            -webkit-transform: scale(1.0);
        }                    
    }
    @keyframes removeItem{
        0%{
            transform: scale(1.0);
            -webkit-transform: scale(1.0);                        
        }
        15%{
            transform: scale(1.3);
            -webkit-transform: scale(1.3);                        
        }
        100%{
            transform: scale(0.1);
            -webkit-transform: scale(0.1);
            
        }
    }

    [item-container]{
        display: flex;
        align-items: center;
    }

    [item-container] [item-card-slot]{
        width: 32px;
        height: 49px;
        padding: 5px;
        margin: 5px;
        display: inline-block;
        background-color: white;
        border-radius: 5px;
    }
    [item-container] [item-card-slot] > div{
        background-color: #ccc;
        width: 100%;
        height: 100%;
    }
    [item-container] da-card{}
    
    [item-container] da-monster-card{
        display: block;
        animation-duration: 0.5s; 
        animation-timing-function: ease-out; 
        animation-delay: 0s;
        animation-direction: alternate;
        animation-iteration-count: 1;
        animation-fill-mode: none;
        animation-play-state: running; 
    }                                        
    [item-container] da-monster-card.add{
        animation-name: addItem;                    
    }
    [item-container] da-monster-card.remove{
        animation-name: removeItem;                    
    }
    
    div[star-container]{
        display: flex;
        justify-content: center;
    }
    div[star]{
        width: 15px;
        height: 15px;
        fill: rgba(253, 231, 76, 1);                    
    }
    div[star].dim{
        fill: rgba(88, 88,88,1);
    }                                                                                                                   
    
    [trophy-container] div[trophy]{
        width: 25px;
        height: 25px;
        background: url(./images/trophy.png);
        margin: 5px;
        background-size: contain;
        background-position: right;
        background-repeat: no-repeat;
        display: inline-block;
        margin-bottom: 0;
    }
    [trophy-container] div[monster-killed]{
        font-size: 15px;
        display: inline-block;
        font-family: 'Bowlby One SC', cursive; 
        margin-right: 5px;
    }
    
</style>
<!-- shadow DOM for your element -->
    <div da-hero-container>
        <div hero-item-container>
            <div hero-container>  
                <div star-container>
                    <div star class='dim'><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"></path></svg></div>
                    <div star class='dim'><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"></path></svg></div>
                    <div star class='dim'><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"></path></svg></div>
                    <div star class='dim'><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"></path></svg></div>
                </div>                                      
                <div hero-context></div> 
            </div>
                <div trophy-container>
                    <div trophy></div>
                    <div monster-killed>x 0</div>
                </div>                                                               
            </div>
            <div item-container>
                <div item-card-slot><div></div></div>
                <div item-card-slot><div></div></div>
                <div item-card-slot><div></div></div>
            </div>
            <div monster-container>
                <div></div>
            </div>
        </div>                                       
    </div>
`;

export default class Playerhero_com extends HTMLElement {

    private _shadowRoot: ShadowRoot;
    private _container: HTMLElement;
    private _monsterKilled: number = 0;

    public set isActive(value: boolean) {
        if (value) {
            this._container.classList.add('active');
        } else {
            this._container.classList.remove('active');
        }
    }

    public constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._container = this.shadowRoot!.querySelector('div[da-hero-container]') as HTMLElement;
    }

    public attributeChangedCallback(name: string, oldValue: any, newValue: any): void { }

    public equip(daCard: Card_com): Promise<void> {        
        const star = this._shadowRoot.querySelector('div[star].dim') as HTMLElement;
        const itemContainer = this._shadowRoot.querySelector('[item-container]') as HTMLElement;
        const itemCardSlot = this._shadowRoot.querySelector('[item-card-slot]') as HTMLFormElement;
        
        daCard.setAttribute('card-size', 'small');

        itemContainer.replaceChild(daCard, itemCardSlot);
        star.classList.remove('dim');

        return Promise.resolve();
    }

    public empty(): Promise<void> {
        let heroContainer = this.shadowRoot!.querySelector('div[hero-container]') as HTMLElement,
            starContainer = this.shadowRoot!.querySelector('div[star-container]') as HTMLElement;

        heroContainer.className = "";
        Array.from(starContainer.children).forEach((c) =>{
            c.classList.add('dim');
        })
        return Promise.resolve();
    }

    public set(heroType: DaHeroTypes, point: number): Promise<void> {
        let heroContainer = this.shadowRoot!.querySelector('div[hero-container]') as HTMLElement
        heroContainer!.classList.add(heroType);
        const star = this._shadowRoot.querySelector('div[star].dim') as HTMLElement;
        star.classList.remove('dim');
        return Promise.resolve();
    }

    public killAMonster(){
        const monsterKilled = this.shadowRoot!.querySelector('[monster-killed]') as HTMLElement;
        this._monsterKilled++;
        monsterKilled.innerHTML = `x ${this._monsterKilled}`;
    }
}

customElements.define('da-monster-player-hero', Playerhero_com);