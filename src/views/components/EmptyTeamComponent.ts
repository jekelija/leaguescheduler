import { I18NManager } from "../../utilities/I18NManager";
import { AbstractSlideViewOptions } from '../AbstractSlideView';

import PLUS_ICON from '../../../assets/plus.svg';
import log from "loglevel";

export interface EmptyTeamComponentOptions extends AbstractSlideViewOptions {
    callback:()=>Promise<void>;
}

export class EmptyTeamComponent {
    constructor(private options: EmptyTeamComponentOptions) {
        if(!options.restApiPrefix) {
            throw 'EmptyTeamComponent: must pass in a restApiPrefix';
        }
        if(!options.root) {
            throw 'EmptyTeamComponent: must pass in a root';
        }
        if(!options.callback) {
            throw 'EmptyTeamComponent: must pass in a callback';
        }
        this.buildHtml();
    }

    private buildHtml():void {
        this.options.root.classList.add('component');

        const border = document.createElement('button');
        border.classList.add('component-border');
        border.classList.add('empty-team');
        
        border.addEventListener('click', e=> {
            this.createTeam(e.currentTarget as HTMLButtonElement);
        });

        const addImg = document.createElement('img');
        addImg.alt = I18NManager.Instance().translate('team', 'createTeam');
        addImg.src = PLUS_ICON;
        border.appendChild(addImg);

        const rootTitle = document.createElement('h3');
        rootTitle.innerHTML = I18NManager.Instance().translate('team', 'createTeam');
        border.appendChild(rootTitle);

        this.options.root.appendChild(border);
    }

    private async createTeam(border:HTMLButtonElement):Promise<void> {
        border.disabled = true;
        try {
            await this.options.callback();
        }
        catch(e) {
            log.error(e);
            //TODO error handling
        }
        border.disabled = false;
    }

}