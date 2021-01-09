import { Night } from "./Night";

export interface Session {
    nights:Night[];
    name: string;
    from: Date;
    to: Date;
    readonly _id:string;
}