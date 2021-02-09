import '../../../scss/team.scss';

import * as log from 'loglevel';
import { I18NManager } from "../../utilities/I18NManager";
import { Utilities } from "../../utilities/Utilities";
import { Team } from "../../model/Team";
import { ServiceUtils } from "../../utilities/ServiceUtils";
import { Player } from "../../model/Player";
import { AbstractSlideViewOptions } from '../AbstractSlideView';

import TRASH_ICON from '../../../assets/trash.svg';
import { League } from '../../model/League';

export interface TeamComponentOptions extends AbstractSlideViewOptions {
    team:Team;
    league:League;
}

export class TeamComponent {
    constructor(private options: TeamComponentOptions) {
        if(!options.team) {
            throw 'TeamComponent: must pass in a team';
        }
        if(!options.restApiPrefix) {
            throw 'TeamComponent: must pass in a restApiPrefix';
        }
        if(!options.root) {
            throw 'TeamComponent: must pass in a root';
        }
        this.buildHtml();
    }

    getTeam():Team {
         return this.options.team;
    }

    autoFocusInput(): void {
        (this.options.root.getElementsByClassName('teamname')[0] as HTMLInputElement).select();
    }

    private buildHtml():void {
        this.options.root.classList.add('component');

        const border = document.createElement('div');
        border.classList.add('component-border');
        this.options.root.addEventListener('change', e=> {
            const input = e.target as HTMLInputElement;
            this.updateTeamName(input);
        });
        this.options.root.addEventListener('click', e=> {
            const target = e.target as HTMLElement;
            if(target.dataset.action == 'edit') {
                //TODO
            }
            else if(target.dataset.action == 'addPlayer') {
                this.createPlayer();
            }
            else if(target.dataset.action == 'delete') {
                if (window.confirm(I18NManager.Instance().translate('team', 'deleteAreYouSure'))) {
                    this.deleteTeam(target.parentElement as HTMLDivElement);
                }
            }
            else if(target.dataset.action == 'deletePlayer') {
                if (window.confirm(I18NManager.Instance().translate('team', 'deletePlayerAreYouSure'))) {
                    this.deletePlayer(target.parentElement as HTMLDivElement);
                }
            }
        });

        const teamNameDiv = document.createElement('div');
        teamNameDiv.classList.add('editable-row');
        teamNameDiv.dataset.id = this.options.team._id;
        const team = document.createElement('input');
        team.classList.add('teamname');
        team.value = this.options.team.name;

        const deleteImg = document.createElement('img');
        deleteImg.dataset.action = 'delete';
        deleteImg.classList.add('clickable-icon');
        deleteImg.classList.add('inline-icon-right');
        deleteImg.src = TRASH_ICON;
        deleteImg.alt = I18NManager.Instance().translate('global', 'delete');
        deleteImg.style.right = '40px';

        teamNameDiv.appendChild(team);
        teamNameDiv.appendChild(deleteImg);

        border.appendChild(teamNameDiv);

        const teamPlayers = document.createElement('div');
        teamPlayers.classList.add('players');
        border.appendChild(teamPlayers);

        const addPlayer = document.createElement('button');
        addPlayer.classList.add('btn');
        addPlayer.dataset.action = 'addPlayer';
        addPlayer.innerHTML = I18NManager.Instance().translate('team', 'addPlayer');
        border.appendChild(addPlayer);

        this.options.root.appendChild(border);
    }

    private async createPlayer(): Promise<void> {
        try {
            const newPlayer = (await ServiceUtils.request('api/players/', 'POST')).response as Player;
            //associate player with the team
            await ServiceUtils.request('api/sessions/' + this.options.restApiPrefix + this.options.team._id, 'PATCH', {
                playerId: newPlayer._id
            });
            this.options.team.players.push(newPlayer._id);

            this.addPlayer(newPlayer);
        } catch(e) {
            //TODO if i error out on associating player, should i mark that player as deleted?
            log.error(e);
            //TODO how should we handle errors in UI
        }
    }

    private async updateTeamName(input:HTMLInputElement): Promise<void> {
        await Utilities.inputAutoUpdate(input, this.options.team, 'name', async name=> {
            await ServiceUtils.request('api/sessions/' + this.options.restApiPrefix + this.options.team._id, 'PATCH', {name});
        });        
    }

    addPlayer(p:Player):void {
        if(this.options.root) {
            const teamParentDiv = this.options.root.getElementsByClassName('players')[0] as HTMLDivElement;
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('player');
            playerDiv.dataset.id = p._id;
            const playerName = document.createElement('span');
            playerName.innerHTML = p.name;
            
            const deleteImg = document.createElement('img');
            deleteImg.dataset.action = 'deletePlayer';
            deleteImg.classList.add('clickable-icon');
            deleteImg.classList.add('inline-icon-right');
            deleteImg.src = TRASH_ICON;
            deleteImg.alt = I18NManager.Instance().translate('global', 'delete');
            deleteImg.style.right = '40px';

            playerDiv.appendChild(playerName);
            playerDiv.appendChild(deleteImg);

            teamParentDiv.appendChild(playerDiv);
        }
    }


    private async deleteTeam(div:HTMLDivElement): Promise<void> {
        //TODO disable the night?
        try {
            (await ServiceUtils.request('api/sessions/' + this.options.restApiPrefix + this.options.team._id, 'DELETE')).response;
            this.options.root.remove();
            const i = this.options.league.teams.findIndex(x=>x._id == this.options.team._id);
            if(i != -1) {
                this.options.league.teams.splice(i, 1);
            }
        } catch(e) {
            log.error(e);
            //TODO how should we handle errors in UI
        }
    }

    private async deletePlayer(div:HTMLDivElement): Promise<void> {
        //TODO disable the night?
        try {
            const playerId = div.dataset.id;
            (await ServiceUtils.request('api/sessions/' + this.options.restApiPrefix  + this.options.team + '/' + playerId, 'DELETE')).response;
            div.remove();
        } catch(e) {
            log.error(e);
            //TODO how should we handle errors in UI
        }
    }
}