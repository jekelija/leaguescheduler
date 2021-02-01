import { I18NManager } from "src/utilities/I18NManager";
import { Team } from "../../model/Team";

export interface TeamComponentOptions {
    team:Team;
    restApiPrefix:string;
}

export class TeamComponent {
    private root:HTMLDivElement;
    constructor(private options: TeamComponentOptions) {
        if(!options.team) {
            throw 'TeamComponent: must pass in a team';
        }
        if(!options.restApiPrefix) {
            throw 'TeamComponent: must pass in a restApiPrefix';
        }
    }

    buildHtml() {
        this.root = document.createElement('div');
        this.root.classList.add('session-night');

        const border = document.createElement('div');
        border.classList.add('session-night-border');
        this.root.addEventListener('change', e=> {
            const input = e.target as HTMLInputElement;
            this.updateTeamName(input);
        });
        this.root.addEventListener('click', e=> {
            const target = e.target as HTMLElement;
            if(target.dataset.action == 'edit') {
                //TODO
            }
            else if(target.dataset.action == 'delete') {
                if (window.confirm(I18NManager.Instance().translate('team', 'deleteAreYouSure'))) {
                    this.deleteTeam(target.parentElement as HTMLDivElement);
                }
            }
        });

        const rootTitle = document.createElement('h3');
        rootTitle.innerHTML = this.options.team.name;
        border.appendChild(rootTitle);

        const teamPlayers = document.createElement('div');
        teamPlayers.classList.add('teams');
        border.appendChild(teamPlayers);

        for(let p of this.options.team.players) {
            this.addPlayer(p, teamPlayers);
        }

        const addPlayer = document.createElement('button');
        addPlayer.classList.add('btn');
        addPlayer.dataset.action = 'create';
        addPlayer.innerHTML = I18NManager.Instance().translate('team', 'addPlayer');
        border.appendChild(addPlayer);

        this.root.appendChild(border);
        return this.root;
    }

    private async updateLeagueName(input:HTMLInputElement): Promise<void> {
        const inputParent = input.parentElement;
        const league = this.options.night.leagues.find(x=>x._id==inputParent.dataset.id);
        if(league) {
            await Utilities.inputAutoUpdate(input, league.name, async name=> {
                await ServiceUtils.request('api/sessions/' + this.options.restApiPrefix + this.options.night.name + '/' + league._id, 'POST', {name});
            });
        }
        
    }

    private addLeague(l:League, leagueParentDiv?:HTMLDivElement, autoFocus?:boolean):void {
        if(this.root) {
            if(!leagueParentDiv) {
                leagueParentDiv = this.root.getElementsByClassName('leagues')[0] as HTMLDivElement;
            }
            const leagueDiv = document.createElement('div');
            leagueDiv.classList.add('league');
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
                root: document.createElement('div')
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
            div.remove();
        } catch(e) {
            log.error(e);
            //TODO how should we handle errors in UI
        }
    }
}