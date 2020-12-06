import { ServiceUtils } from "../utilities/ServiceUtils";
import { Session } from "../model/Session";
import { UserController } from "../controllers/UserController";

export class SessionView {
    constructor(currentSession: Session, sessionIds:string[]) {
        document.getElementById('account').classList.remove('hidden');
        if(!currentSession) {
            document.getElementById('no-sessions').classList.remove('hidden');
        }
        document.getElementById('create-session').addEventListener('click', e=> {
            this.createSession();
        });
    }

    private async createSession() {
        //TODO loading
        try {
            const data = (await ServiceUtils.request('api/sessions/', 'POST')).response;
            console.log(data);
        } catch(e) {

        }
        
    }
}