import { Player } from "./Player";

export interface Team {
    players:Player[];
    captain:Player;
    name:string;
}