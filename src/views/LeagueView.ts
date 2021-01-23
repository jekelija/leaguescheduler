import '../../scss/league.scss';
import { League } from '../model/League';

export interface LeagueViewOptions {
    league:League;
}

export class LeagueView {

    private root:HTMLDivElement;

    constructor(private options:LeagueViewOptions) {
        this.root = document.createElement('div');
        this.root.classList.add('league-view', 'content-slider', 'content-slide-right');
        document.getElementById('content-sliding-area').appendChild(this.root);
        this.root.offsetHeight; //force a repaint
    }

    private async showLeague(league:League): Promise<void> {
        this.root.classList.remove('content-slide-right');
        this.root.classList.add('content-slide-center');
    }
}