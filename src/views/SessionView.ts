import '../../scss/session.scss';

import * as log from 'loglevel';
import { ServiceUtils } from "../utilities/ServiceUtils";
import { Session } from "../model/Session";
import { I18NManager } from "../utilities/I18NManager";
import { NightView } from './NightView';
import { Utilities } from '../utilities/Utilities';

export class SessionView {

    nightViews:NightView[] = [];

    constructor(public currentSession: Session, public sessionIds:string[]) {
        document.getElementById('account').classList.remove('hidden');
        if(!currentSession) {
            document.getElementById('no-sessions').classList.remove('hidden');
        }
        else {
            this.showSession(currentSession);
        }

        document.getElementById('session-header').addEventListener('click', e=> {
            const btn = (e.target as HTMLElement).closest('.btn') as HTMLButtonElement;
            if(btn && btn.dataset.action) {
                if(btn.dataset.action == 'create') {
                    this.createSession(btn, true);
                }
                else if(btn.dataset.action == 'previous') {
                    this.moveToSession(-1);
                }
                else if(btn.dataset.action == 'next') {
                    this.moveToSession(1);
                }
                else if(btn.dataset.action == 'delete') {
                    if (window.confirm(I18NManager.Instance().translate('session', 'deleteAreYouSure'))) {
                        this.deleteSession(btn);
                    }
                }
            }
        });

        document.getElementById('create-session').addEventListener('click', e=> {
            this.createSession(e.currentTarget as HTMLButtonElement, false);
        });

        const headerInput = document.getElementById('session-header').getElementsByClassName('session-header-text')[0] as HTMLInputElement;
        headerInput.addEventListener('change', e=> {
            const input = e.target as HTMLInputElement;
            this.updateSessionName(input);
        });
    }

    private updateBreadcrumb(): void {
        const breadcrumbs = document.getElementById('session-breadcrumbs') as HTMLDivElement;
        if(this.currentSession) {
            let sessionBreadcrumb = breadcrumbs.getElementsByClassName('session-breadcrumb')[0];
            if(!sessionBreadcrumb) {
                sessionBreadcrumb = document.createElement('span');
                sessionBreadcrumb.classList.add('session-breadcrumb', 'breadcrumb');
                breadcrumbs.appendChild(sessionBreadcrumb);
            }
            const dateFormat = new Intl.DateTimeFormat([I18NManager.Instance().getCurrentLanguage(), 'en']);
            const fromDate = new Date(this.currentSession.from);
            const toDate = new Date(this.currentSession.to);
            sessionBreadcrumb.innerHTML = this.currentSession.name + ': ' + dateFormat.format(fromDate) + ' - ' + dateFormat.format(toDate);
        }
        else {
            Utilities.emptyDiv(breadcrumbs);
        }
        
        
    }

    private async deleteSession(button:HTMLButtonElement): Promise<void> {
        button.disabled = true;
        const oldHtml = button.innerHTML;
        let loader:HTMLDivElement;
        button.innerHTML = '';
        loader = Utilities.createLoadingSpinner();
        button.appendChild(loader);
        if(this.currentSession) {
            try {
                (await ServiceUtils.request('api/sessions/' + this.currentSession._id, 'DELETE')).response as Session;
                const currentIndex = this.sessionIds.indexOf(this.currentSession._id);
                //try and show a session on either side of it
                let nextIndex = -1;
                if(currentIndex != -1) {
                    this.sessionIds.splice(currentIndex, 1);
                    if(currentIndex < this.sessionIds.length) {
                        nextIndex = currentIndex;
                    }
                    else if((currentIndex-1) < this.sessionIds.length && (currentIndex-1) >= 0) {
                        nextIndex = currentIndex -1;
                    }
                }
                else {
                    //this should never happen, but just in case
                    nextIndex = this.sessionIds.length - 1;
                }
                if(nextIndex >= 0) {
                    const nextSession = (await ServiceUtils.request('api/sessions/' + this.sessionIds[nextIndex])).response as Session;    
                    await this.showSession(nextSession);
                }
                else {
                    document.getElementById('no-sessions').classList.remove('hidden');
                }
            } catch(e) {
                log.error(e);
                //TODO how should we handle errors in UI
            }
        }
        loader.remove();
        button.innerHTML = oldHtml;

        button.disabled = false;
    }

    private async moveToSession(moveIndex:number): Promise<void> {
        const currentIndex = this.sessionIds.indexOf(this.currentSession._id);
        if(currentIndex != -1) {
            const newIndex = currentIndex + moveIndex;
            if(newIndex >= 0 && newIndex < this.sessionIds.length) {
                const newSessionId = this.sessionIds[newIndex];
                try {
                    const newSession = (await ServiceUtils.request('api/sessions/' + newSessionId)).response as Session;    
                    this.showSession(newSession);
                } catch(e) {
                    log.error('Cannot find session ' + newSessionId);
                    log.error(e);
                }
            }
        }
        else {
            log.error('Could not find session ' + this.currentSession._id + ' in sessions');
        }
    }

    private async updateSessionName(input:HTMLInputElement): Promise<void> {
        await Utilities.inputAutoUpdate(input, this.currentSession.name, async name=> {
            await ServiceUtils.request('api/sessions/' + this.currentSession._id, 'POST', {name});
        });
    }

    private async showSession(session:Session): Promise<void> {
        this.currentSession = session;
        for(let n of this.nightViews) {
            n.destroyHtml();
            this.nightViews = [];
        }
        Utilities.emptyDiv(document.getElementById('current-session') as HTMLDivElement);
        document.getElementById('no-sessions').classList.add('hidden');
        this.updateBreadcrumb();
        const headerInput = document.getElementById('session-header').getElementsByClassName('session-header-text')[0] as HTMLInputElement;
        headerInput.value = session.name;

        for(let night of session.nights) {
            const nightView = new NightView({
                night,
                session,
                sessionParentElement: document.getElementById('current-session') as HTMLDivElement
            });
            nightView.buildHtml();
            this.nightViews.push(nightView);
        }
    }

    /**
     * Promisifies a timeout
     * @param {number} ms - milliseconds to wait
     */
    async wait(ms: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    private async createSession(button:HTMLButtonElement, useLoadingSpinner:boolean): Promise<void> {
        button.disabled = true;
        const oldHtml = button.innerHTML;
        let loader:HTMLDivElement;
        if(!useLoadingSpinner) {
            button.innerHTML = I18NManager.Instance().translate('global', 'creating');
        }
        else {
            button.innerHTML = '';
            loader = Utilities.createLoadingSpinner();
            button.appendChild(loader);
        }
        try {
            const data = (await ServiceUtils.request('api/sessions/', 'POST')).response as Session;
            await this.showSession(data);
            this.sessionIds.push(data._id);
            const headerInput = document.getElementById('session-header').getElementsByClassName('session-header-text')[0] as HTMLInputElement;
            headerInput.focus();
        } catch(e) {
            log.error(e);
            //TODO how should we handle errors in UI
        }
        if(useLoadingSpinner) {
            loader.remove();
        }
        button.innerHTML = oldHtml;

        button.disabled = false;
    }
}