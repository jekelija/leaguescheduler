import { Restriction } from "./Restriction";

export interface Player {
    name:string;
    phone:string;
    email:string;
    restrictions:Restriction[];
}