import { Team } from "./Team";

export interface League {
    name:string;
    level:string;
    teams: Team[];
}