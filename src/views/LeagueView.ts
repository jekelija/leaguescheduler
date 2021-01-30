import '../../scss/league.scss';
import { League } from '../model/League';
import { AbstractSlideView, AbstractSlideViewOptions } from './AbstractSlideView';

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
    }
}