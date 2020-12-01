import { UserController } from "../controllers/UserController";

export class LoginView {
    constructor(private userController: UserController) {
        document.getElementById('login').addEventListener('click', e=> {
            document.getElementById('loginForm').classList.remove('hidden');
        });

        document.getElementById('loginForm').addEventListener('submit', async e=> {
            const form = e.currentTarget as HTMLFormElement;
            e.preventDefault();
            if(form.reportValidity()) {
                try {
                    await this.userController.login((document.getElementById('loginEmail') as HTMLInputElement).value,
                        (document.getElementById('loginPassword') as HTMLInputElement).value ,
                        (document.getElementById('loginRemember') as HTMLInputElement).checked);
                    
                } catch(e) {
                    //TODO
                    alert(e.status);
                }
            }
        });
    }
}
