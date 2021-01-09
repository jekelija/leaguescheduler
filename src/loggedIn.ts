import { Session } from "./model/Session";
import { SessionView } from "./views/SessionView";

//dynamically imported as entry point when logged in
export async function init(currentSession: Session, sessionIds:string[]) {
    //hide all views otehr than mine
    document.getElementById('main').classList.add('hidden');
    const sessionView = new SessionView(currentSession, sessionIds);
}