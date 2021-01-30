import { AccountPageController } from "./controllers/AccountPageController";
import { Session } from "./model/Session";

//dynamically imported as entry point when logged in
export async function init(currentSession: Session, sessionIds:string[]) {
    //hide all views otehr than mine
    document.getElementById('main').classList.add('hidden');
    const accountController = new AccountPageController(currentSession, sessionIds);
}