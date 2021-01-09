import '../../scss/night.scss';
import * as log from 'loglevel';
import { I18NManager } from '../utilities/I18NManager';
import { Night } from "../model/Night";
import { Session } from '../model/Session';
import { League } from '../model/League';
import { ServiceUtils } from '../utilities/ServiceUtils';
import { Utilities } from '../utilities/Utilities';

export interface NightViewOptions {
    night:Night;
    session:Session;
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
        this.root.addEventListener('change', e=> {
            const input = e.target as HTMLInputElement;
            this.updateLeagueName(input);
        });

        const rootTitle = document.createElement('h3');
        rootTitle.innerHTML = I18NManager.Instance().translate('night', this.options.night.name);
        this.root.appendChild(rootTitle);

        const nightLeagues = document.createElement('div');
        nightLeagues.classList.add('leagues');
        this.root.appendChild(nightLeagues);

        for(let l of this.options.night.leagues) {
            this.addLeague(l, nightLeagues);
        }

        const addLeague = document.createElement('button');
        addLeague.classList.add('btn');
        addLeague.innerHTML = I18NManager.Instance().translate('night', 'addLeague');
        this.root.appendChild(addLeague);
        addLeague.addEventListener('click', e=> {
            this.createLeague(e.target as HTMLButtonElement);
        });

        this.options.sessionParentElement.appendChild(this.root);
    }

    private async updateLeagueName(input:HTMLInputElement): Promise<void> {
        const league = this.options.night.leagues.find(x=>x._id==input.dataset.id);
        if(league) {
            await Utilities.inputAutoUpdate(input, league.name, async name=> {
                await ServiceUtils.request('api/sessions/' + this.options.session._id + '/' + this.options.night.name + '/' + league._id, 'POST', {name});
            });
        }
        
    }

    private addLeague(l:League, leagueDiv?:HTMLDivElement, autoFocus?:boolean):void {
        if(this.root) {
            if(!leagueDiv) {
                leagueDiv = this.root.getElementsByClassName('leagues')[0] as HTMLDivElement;
            }
            const league = document.createElement('input');
            league.dataset.id = l._id;
            league.value = l.name;
            leagueDiv.appendChild(league);
            if(autoFocus) {
                league.select();
            }
        }
    }

    private async createLeague(button:HTMLButtonElement): Promise<void> {
        button.disabled = true;
        const oldHtml = button.innerHTML;
        button.innerHTML = I18NManager.Instance().translate('global', 'creating');
        try {
            const l = (await ServiceUtils.request('api/sessions/' + this.options.session._id + '/' + this.options.night.name, 'POST')).response as League;
            this.addLeague(l, undefined, true);
        } catch(e) {
            log.error(e);
            //TODO how should we handle errors in UI
        }
        button.innerHTML = oldHtml;
        button.disabled = false;
    }

    destroyHtml() {
        if(this.root) {
            this.root.remove();
        }
    }
}