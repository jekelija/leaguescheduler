import { Team } from "./Team";

export interface League {
    name:string;
    difficulty:string;
    teams: Team[];
}