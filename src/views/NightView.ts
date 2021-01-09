import '../../scss/night.scss';
import { I18NManager } from '../utilities/I18NManager';
import { Night } from "../model/Night";

export interface NightViewOptions {
    night:Night;
    sessionParentElement:HTMLDivElement;
}

export class NightView {
    private root:HTMLDivElement;
    constructor(private options: NightViewOptions) {
        if(!options.night) {
            throw 'NightView: must pass in a night';
        }
        if(!options.sessionParentElement) {
            throw 'NightView: must pass in a sessionParentElement';
        }
    }

    buildHtml() {
        this.root = document.createElement('div');
        this.root.classList.add('session-night');

        const rootTitle = document.createElement('h3');
        rootTitle.innerHTML = I18NManager.Instance().translate('night', this.options.night.name);
        this.root.appendChild(rootTitle);


        this.options.sessionParentElement.appendChild(this.root);
    }

    destroyHtml() {
        if(this.root) {
            this.root.remove();
        }
    }
}