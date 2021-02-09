import { Player } from "./Player";
import { Restriction } from "./Restriction";

export interface Team {
    players:string[];
    captain:string;
    name:string;
    restrictions:Restriction[];
    readonly _id:string;
}