import * as log from 'loglevel';
import { I18NManager } from './I18NManager';

export class Utilities {
    static emptyDiv(div:HTMLDivElement):void {
        if(div) {
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
        }
    }

    static localStorageAvailable(): boolean { 
        const test = 'test';
        try {
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
          return true;
        } catch(e) {
          return false;
        }
    }

    /**
     * Get the correct animation event based on the browser type
     */
    static whichAnimationEvent():string{
        const el = document.createElement("fakeelement");

        const animations = {
            "animation"      : "animationend",
            "OAnimation"     : "oAnimationEnd",
            "MozAnimation"   : "animationend",
            "WebkitAnimation": "webkitAnimationEnd"
        };

        for (let t in animations){
            if (el.style[t] !== undefined){
                return animations[t];
            }
        }
    }

    static async fadeOut(el:HTMLElement):Promise<void> {    
        return new Promise((resolve, reject)=> {
            if(!el.classList.contains('fadeOut') && !el.classList.contains('hidden')) {
                el.classList.remove('fadeIn');
                el.addEventListener(this.whichAnimationEvent(), ()=>{
                    //did someone start fading me back in?
                    if(el.classList.contains('fadeOut')) {
                        el.classList.add('hidden');
                    }    
                    //always call callback so we dont leave dangling reference that eats memory
                    //in the future, if we end up with a callback that cares whether or not it was faded in while still fading out, add a boolean
                    //to this callback
                    resolve();
                }, {
                    'once' : true
                });
                el.classList.add('fadeOut');
            }
            else {
                resolve();
            }
        });
        
    }
    
    static async fadeIn(el:HTMLElement):Promise<void> {
        return new Promise((resolve, reject)=> {
            if(el.classList.contains('hidden')) {
                el.classList.remove('hidden');
            }
            if(!el.classList.contains('fadeIn')) {
                el.classList.remove('fadeOut');
                el.addEventListener(this.whichAnimationEvent(), ()=>{
                    resolve();
                }, {
                    'once' : true
                }); 
                el.classList.add('fadeIn');
            }
            else {
                resolve();
            }  
        });  
    }

    static async inputAutoUpdate(input:HTMLInputElement, currentValue:string, serviceUpdate:(newValue:string)=>Promise<void>):Promise<void> {
        if(input.value != currentValue) {
            input.disabled = true;
            input.nextElementSibling.innerHTML = '';
            try {
                input.nextElementSibling.innerHTML = I18NManager.Instance().translate('global', 'updating');
                await serviceUpdate(input.value);
                input.nextElementSibling.innerHTML = '';
            }
            catch(e) {
                input.nextElementSibling.innerHTML = I18NManager.Instance().translate('global', 'error');
                input.value = currentValue;
                log.error('Cannot update session name');
                log.error(e);
            }
            input.disabled = false;
        }
    }
}