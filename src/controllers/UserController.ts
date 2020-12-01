import * as log from 'loglevel';

import { Utilities } from "../utilities/Utilities";
import { ServiceUtils } from "../utilities/ServiceUtils";
import { User } from "../model/User";

export class UserController {

    private currentUser:User;
    private currentToken:string;
    private autoLoginPromise:Promise<boolean>;

    constructor() {
        if(Utilities.localStorageAvailable() && localStorage.getItem('token')) {
            this.autoLoginPromise = this.autoLogin(localStorage.getItem('token'));
        }
        else {
            this.autoLoginPromise = Promise.resolve(false);
        }
    }

    logout(): void {
        if(Utilities.localStorageAvailable()) {
            localStorage.removeItem('token');
        }
        this.currentUser = null;
        this.currentToken = null;
    }

    waitForAutoLogin(): Promise<boolean> {
        return this.autoLoginPromise;
    }

    private async autoLogin(token:string): Promise<boolean> {
        try {
            const data = await ServiceUtils.request('api/users/auth-token', 'GET', undefined, new Map([['x-auth-token', token]]));
            const user = data.response;
            this.setUser(token, user, false); //dont re-remember user, that way when it times out, forces re-login
            log.info('Successfully auto logged in');
            return true;
        }
        catch(e) {
            log.error('Failed to auto login');
            log.error(e);
        }
    }

    async login(email:string, password:string, rememberMe: boolean): Promise<void> {
        const data = await ServiceUtils.request('api/users/auth', 'POST', {
            email,
            password
        });
        const token = data.request.getResponseHeader('x-auth-token');
        const user = data.response;
        this.setUser(token, user, rememberMe);
    }

    private setUser(token: string, user: User, remember: boolean) {
        this.currentUser = user;
        this.currentToken = token;
        if(remember && Utilities.localStorageAvailable()) {
            localStorage.setItem('token', this.currentToken);
        }
    }

}