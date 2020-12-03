import { UserController } from "../controllers/UserController";

export class NavView {
    constructor(private userController: UserController) {
        this.init();
        document.getElementById('login').addEventListener('click', e=> {
            document.getElementById('loginForm').classList.remove('hidden');
        });

        document.getElementById('loginForm').addEventListener('submit', async e=> {
            const form = e.currentTarget as HTMLFormElement;
            e.preventDefault();
            //TODO change button text to loader
            if(form.reportValidity()) {
                try {
                    await this.userController.login((document.getElementById('loginEmail') as HTMLInputElement).value,
                        (document.getElementById('loginPassword') as HTMLInputElement).value ,
                        (document.getElementById('loginRemember') as HTMLInputElement).checked);
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
        //TODO change to account button
        const loggedIn = await import('../loggedIn');
        loggedIn.init(this.userController.currentUser.currentSession, this.userController.currentUser.sessionIds);
    }

    private async onLogOut() {
        //TODO change to sign up button
        const loggedOut = await import('../loggedOut');
        loggedOut.init();
    }
}
