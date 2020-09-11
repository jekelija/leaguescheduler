import '../scss/global.scss';
import { LeagueView } from './LeagueView';

const leagues:LeagueView[] = [];

document.getElementById('add-league').addEventListener('click', e=> {
    leagues.push(new LeagueView(document.getElementById('leagues-container') as HTMLDivElement));
});