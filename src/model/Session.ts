import { Night } from "./Night";

export interface Session {
    nights:Night[];
    name: string;
    from: Date;
    to: Date;
    _id:string;
}