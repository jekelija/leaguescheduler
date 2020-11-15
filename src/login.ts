import { ServiceUtils } from "./utilities/ServiceUtils";

document.getElementById('loginForm').addEventListener('submit', async e=> {
    const form = e.currentTarget as HTMLFormElement;
    e.preventDefault();
    if(form.reportValidity()) {
        try {
            await ServiceUtils.request('api/users/auth', 'POST', {
                email: (document.getElementById('loginEmail') as HTMLInputElement).value ,
                password: (document.getElementById('loginPassword') as HTMLInputElement).value 
            });
            window.location.href = './index.html';
        } catch(e) {
            alert(e.status);
        }
    }
});