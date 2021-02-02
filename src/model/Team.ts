import { Player } from "./Player";
import { Restriction } from "./Restriction";

export interface Team {
    players:Player[];
    captain:Player;
    name:string;
    restrictions:Restriction[];
    readonly _id:string;
}