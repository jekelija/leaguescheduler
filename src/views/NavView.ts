import '../../scss/nav.scss';
import * as log from 'loglevel';
import { Session } from "../model/Session";
import { ServiceUtils } from "../utilities/ServiceUtils";
import { Popover, POPOVER_POSITION_TYPE } from '../utilities/Popover';
import { UserController } from "../controllers/UserController";

export class NavView {

    loginPopover:Popover;
    loginForm:HTMLFormElement;

    constructor(private userController: UserController) {
        this.init();
        const login = document.getElementById('login');
        this.loginForm = document.getElementById('loginForm') as HTMLFormElement;
        login.addEventListener('click', e=> {
            this.loginForm.classList.remove('hidden');
            this.loginPopover.show(this.loginForm);
        });

        this.loginPopover = new Popover({
            targetElement: login,
            positionType: POPOVER_POSITION_TYPE.BOTTOM
        });

        this.loginForm.addEventListener('submit', async e=> {
            const form = e.currentTarget as HTMLFormElement;
            e.preventDefault();
            //TODO change button text to loader
            if(form.reportValidity()) {
                try {
                    await this.userController.login((document.getElementById('loginEmail') as HTMLInputElement).value,
                        (document.getElementById('loginPassword') as HTMLInputElement).value ,
                        (document.getElementById('loginRemember') as HTMLInputElement).checked);
                    this.loginPopover.hide(true);
                    await this.onLogIn();
                } catch(e) {
                    //TODO
                    alert(e.status);
                }
            }
        });
    }

    private async init() {
        const loggedIn = await this.userController.waitForAutoLogin();
        //dynamic import to cut down on file size
        if(loggedIn) {
            await this.onLogIn();
        }
        else {
            await this.onLogOut();
        }
    }

    private async onLogIn() {
        document.getElementById('login').classList.add("hidden");
        document.getElementById('loggedInButtons').classList.remove("hidden");
        const loggedIn = await import('../loggedIn');
        const mostRecentSessionId = this.userController.currentUser.sessionIds.length > 0 ? this.userController.currentUser.sessionIds[this.userController.currentUser.sessionIds.length-1] : null;
        let mostRecentSession:Session;
        if(mostRecentSessionId) {
            try {
                mostRecentSession = (await ServiceUtils.request('api/sessions/' + mostRecentSessionId)).response as Session;    
            } catch(e) {
                log.error('Cannot find session ' + mostRecentSessionId);
                log.error(e);
            }
        }
        loggedIn.init(mostRecentSession, this.userController.currentUser.sessionIds);
    }

    private async onLogOut() {
        document.getElementById('login').classList.remove("hidden");
        document.getElementById('loggedInButtons').classList.add("hidden");
        const loggedOut = await import('../loggedOut');
        loggedOut.init();
    }
}
