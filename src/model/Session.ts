import { Night } from "./Night";

export interface Session {
    nights:Night[];
    name: string;
    from: string;
    to: string;
    readonly _id:string;
}