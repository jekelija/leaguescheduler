import '../scss/league.scss';
import { League } from '../model/League';
export class LeagueView {

    private root:HTMLDivElement;
    private currentLeague:League;

    constructor() {
        this.root = document.getElementById('current-league') as HTMLDivElement;
    }

    private async showLeague(league:League): Promise<void> {
        this.currentLeague = league;
        
        this.root.classList.remove('right');
        this.root.classList.remove('left');
    }
}