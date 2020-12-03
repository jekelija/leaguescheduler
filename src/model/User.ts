import { Session } from "./Session";

export enum UserRole {
    USER= 0,
    ADMIN= 1
}

export interface User {
    email:string;
    name: string;
    role: UserRole;
    currentSession: Session;
    sessionIds:string[];
}