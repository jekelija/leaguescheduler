import '../../scss/league.scss';

import * as log from 'loglevel';
import { ServiceUtils } from '../utilities/ServiceUtils';
import { League } from '../model/League';
import { Team } from '../model/Team';
import { Player } from '../model/Player';
import { AbstractSlideView, AbstractSlideViewOptions } from './AbstractSlideView';
import { EmptyTeamComponent } from './components/EmptyTeamComponent';
import { TeamComponent } from './components/TeamComponent';

export interface LeagueViewOptions extends AbstractSlideViewOptions {
    league:League;
}

export class LeagueView extends AbstractSlideView {
    getBreadcrumb(): HTMLElement {
        const leagueBreadcrumb = document.createElement('span');
        leagueBreadcrumb.classList.add('session-breadcrumb');
        leagueBreadcrumb.innerHTML = this.getLeague().name;

        return leagueBreadcrumb;
    }

    getLeague():League {
        return (this.options as LeagueViewOptions).league;
    }

    constructor(options:LeagueViewOptions) {
        super(options);
        this.options.root.classList.add('league-view');

        const playerIds = new Set<string>();
        const teamComponents:TeamComponent[] = [];
        for(let team of options.league.teams) {
            const teamRoot = document.createElement('div');
            teamComponents.push(new TeamComponent({
                team,
                league: options.league,
                root: teamRoot,
                slideViewManager: this.options.slideViewManager,
                restApiPrefix: (this.options as LeagueViewOptions).restApiPrefix + this.getLeague()._id + '/'
            }));
            this.options.root.appendChild(teamRoot);
            for(let p of team.players) {
                playerIds.add(p);
            }
        }
        this.populatePlayers(teamComponents, Array.from(playerIds));

        //create team button
        const emptyTeamRoot = document.createElement('div');
        new EmptyTeamComponent({
            root:emptyTeamRoot,
            slideViewManager: this.options.slideViewManager,
            restApiPrefix: (this.options as LeagueViewOptions).restApiPrefix + this.getLeague()._id + '/',
            callback: this.createTeam.bind(this)
        });
        this.options.root.appendChild(emptyTeamRoot);
    }

    private async populatePlayers(teamComponents:TeamComponent[], playerIds:string[]): Promise<void> {
        try {
            const players = (await ServiceUtils.request('api/players/bulk', 'POST', {
                ids: playerIds
            })).response as Player[];
            for(let tc of teamComponents) {
                const playersOnTeam = players.filter(x=> tc.getTeam().players.includes(x._id));
                //is one of them the captain?
                playersOnTeam.sort((a,b)=> {
                    if(tc.getTeam().captain == a._id) {
                        return -1;
                    }
                    else if(tc.getTeam().captain == b._id) {
                        return 1;
                    }
                    return 0;
                });
                for(let p of playersOnTeam) {
                    tc.addPlayer(p);
                }
            }
        } catch(e) {
            //TODO should we try again?
            log.error(e);   
        }
    }

    private async createTeam(): Promise<void> {
        try {
            const newTeam = (await ServiceUtils.request('api/sessions/' + this.options.restApiPrefix + this.getLeague()._id, 'POST')).response as Team;
            this.getLeague().teams.push(newTeam);
            //put before empty team
            const emptyTeamDiv = this.options.root.children[this.options.root.children.length-1];
            const teamRoot = document.createElement('div');
            const teamComponent = new TeamComponent({
                team:newTeam,
                root: teamRoot,
                league: this.getLeague(),
                slideViewManager: this.options.slideViewManager,
                restApiPrefix: (this.options as LeagueViewOptions).restApiPrefix + this.getLeague()._id + '/'
            });
            this.options.root.insertBefore(teamRoot, emptyTeamDiv);
            teamComponent.autoFocusInput();
        } catch(e) {
            log.error(e);
            //TODO how should we handle errors in UI
        }
    }
}