import '../../../scss/night.scss';
import * as log from 'loglevel';
import { I18NManager } from '../../utilities/I18NManager';
import { Night } from "../../model/Night";
import { League } from '../../model/League';
import { ServiceUtils } from '../../utilities/ServiceUtils';
import { Utilities } from '../../utilities/Utilities';

import SETTINGS_ICON from '../../../assets/settings.svg';
import TRASH_ICON from '../../../assets/trash.svg';
import { LeagueView } from '../LeagueView';
import { AbstractSlideViewOptions } from '../AbstractSlideView';

export interface NightComponentOptions extends AbstractSlideViewOptions {
    night:Night;
}

export class NightComponent {
    constructor(private options: NightComponentOptions) {
        if(!options.night) {
            throw 'NightComponent: must pass in a night';
        }
        if(!options.restApiPrefix) {
            throw 'NightComponent: must pass in a restApiPrefix';
        }
        if(!options.root) {
            throw 'NightComponent: must pass in a root';
        }
        if(!options.slideViewManager) {
            throw 'NightComponent: must pass in a slideViewManager';
        }
        this.buildHtml();
    }

    private buildHtml():void {
        this.options.root.classList.add('component');

        const border = document.createElement('div');
        border.classList.add('component-border');
        this.options.root.addEventListener('change', e=> {
            const input = e.target as HTMLInputElement;
            this.updateLeagueName(input);
        });
        this.options.root.addEventListener('click', e=> {
            const target = e.target as HTMLElement;
            if(target.dataset.action == 'edit') {
                this.editLeague(target.parentElement as HTMLDivElement);
            }
            else if(target.dataset.action == 'delete') {
                if (window.confirm(I18NManager.Instance().translate('league', 'deleteAreYouSure'))) {
                    this.deleteLeague(target.parentElement as HTMLDivElement);
                }
            }
            else if(target.dataset.action == 'create') {
                this.createLeague(e.target as HTMLButtonElement);
            }
        });

        const rootTitle = document.createElement('h3');
        rootTitle.innerHTML = I18NManager.Instance().translate('night', this.options.night.name);
        border.appendChild(rootTitle);

        const nightLeagues = document.createElement('div');
        nightLeagues.classList.add('leagues');
        border.appendChild(nightLeagues);

        for(let l of this.options.night.leagues) {
            this.addLeague(l, nightLeagues);
        }

        const addLeague = document.createElement('button');
        addLeague.classList.add('btn');
        addLeague.dataset.action = 'create';
        addLeague.innerHTML = I18NManager.Instance().translate('night', 'addLeague');
        border.appendChild(addLeague);

        this.options.root.appendChild(border);
    }

    private async updateLeagueName(input:HTMLInputElement): Promise<void> {
        const inputParent = input.parentElement;
        const league = this.options.night.leagues.find(x=>x._id==inputParent.dataset.id);
        if(league) {
            await Utilities.inputAutoUpdate(input, league, 'name', async name=> {
                await ServiceUtils.request('api/sessions/' + this.options.restApiPrefix + this.options.night.name + '/' + league._id, 'PATCH', {name});
            });
        }
        
    }

    private addLeague(l:League, leagueParentDiv?:HTMLDivElement, autoFocus?:boolean):void {
        if(this.options.root) {
            if(!leagueParentDiv) {
                leagueParentDiv = this.options.root.getElementsByClassName('leagues')[0] as HTMLDivElement;
            }
            const leagueDiv = document.createElement('div');
            leagueDiv.classList.add('editable-row');
            leagueDiv.dataset.id = l._id;
            const league = document.createElement('input');
            league.value = l.name;
            const editImg = document.createElement('img');
            editImg.dataset.action = 'edit';
            editImg.classList.add('clickable-icon');
            editImg.classList.add('inline-icon-right');
            editImg.src = SETTINGS_ICON;
            editImg.alt = I18NManager.Instance().translate('global', 'edit');
            const deleteImg = document.createElement('img');
            deleteImg.dataset.action = 'delete';
            deleteImg.classList.add('clickable-icon');
            deleteImg.classList.add('inline-icon-right');
            deleteImg.src = TRASH_ICON;
            deleteImg.alt = I18NManager.Instance().translate('global', 'delete');
            deleteImg.style.right = '40px';

            leagueDiv.appendChild(league);
            leagueDiv.appendChild(editImg);
            leagueDiv.appendChild(deleteImg);

            leagueParentDiv.appendChild(leagueDiv);
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
            const l = (await ServiceUtils.request('api/sessions/' + this.options.restApiPrefix + this.options.night.name, 'POST')).response as League;
            this.options.night.leagues.push(l);
            this.addLeague(l, undefined, true);
        } catch(e) {
            log.error(e);
            //TODO how should we handle errors in UI
        }
        button.innerHTML = oldHtml;
        button.disabled = false;
    }

    private async editLeague(div:HTMLDivElement): Promise<void> {
        const league = this.options.night.leagues.find(x=>x._id == div.dataset.id);
        if(league) {
            const newLeagueView = new LeagueView({
                league,
                slideViewManager: this.options.slideViewManager,
                root: document.createElement('div'),
                restApiPrefix: this.options.restApiPrefix + this.options.night.name + '/'
            });
            this.options.slideViewManager.addToStack(newLeagueView);
        }
        else {
            log.error('Cannot find league with id ' + div.dataset.id);
        }
    }

    private async deleteLeague(div:HTMLDivElement): Promise<void> {
        //TODO disable the night?
        try {
            const leagueId = div.dataset.id;
            (await ServiceUtils.request('api/sessions/' + this.options.restApiPrefix + this.options.night.name + '/' + leagueId, 'DELETE')).response;
            const leagueIndex = this.options.night.leagues.findIndex(x=>x._id == leagueId);
            if(leagueIndex != -1) {
                this.options.night.leagues.splice(leagueIndex, 1);
            }
            div.remove();
        } catch(e) {
            log.error(e);
            //TODO how should we handle errors in UI
        }
    }
}