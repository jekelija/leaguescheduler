import { Session } from "../model/Session";

export class SessionView {
    constructor(currentSession: Session, sessionIds:string[]) {
        document.getElementById('account').classList.remove('hidden');
        if(!currentSession) {
            document.getElementById('no-sessions').classList.remove('hidden');
        }
    }
}