import '../../scss/league.scss';

import * as log from 'loglevel';
import { ServiceUtils } from '../utilities/ServiceUtils';
import { League } from '../model/League';
import { Team } from '../model/Team';
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

        for(let team of options.league.teams) {
            const teamRoot = document.createElement('div');
            new TeamComponent({
                team,
                root: teamRoot,
                slideViewManager: this.options.slideViewManager,
                restApiPrefix: (this.options as LeagueViewOptions).restApiPrefix + '/' + this.getLeague()._id + '/'
            });
            this.options.root.appendChild(teamRoot);
        }
        //create team button
        const emptyTeamRoot = document.createElement('div');
        new EmptyTeamComponent({
            root:emptyTeamRoot,
            slideViewManager: this.options.slideViewManager,
            restApiPrefix: (this.options as LeagueViewOptions).restApiPrefix + '/' + this.getLeague()._id + '/',
            callback: this.createTeam.bind(this)
        });
        this.options.root.appendChild(emptyTeamRoot);
    }

    private async createTeam(): Promise<void> {
        try {
            const newTeam = (await ServiceUtils.request('api/sessions/' + this.options.restApiPrefix + this.getLeague()._id, 'POST')).response as Team;
            this.getLeague().teams.push(newTeam);
            //put before empty team
            const emptyTeamDiv = this.options.root.children[this.options.root.children.length-1];
            const teamRoot = document.createElement('div');
            new TeamComponent({
                team:newTeam,
                root: teamRoot,
                slideViewManager: this.options.slideViewManager,
                restApiPrefix: (this.options as LeagueViewOptions).restApiPrefix + '/' + this.getLeague()._id + '/'
            });
            this.options.root.insertBefore(teamRoot, emptyTeamDiv);
        } catch(e) {
            log.error(e);
            //TODO how should we handle errors in UI
        }
    }
}