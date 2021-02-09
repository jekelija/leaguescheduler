import { Restriction } from "./Restriction";

export interface Player {
    name:string;
    phoneNumber:string;
    email:string;
    restrictions:Restriction[];
    readonly _id:string;
}