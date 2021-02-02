import * as log from 'loglevel';
import { SlideViewManager } from "../views/SlideViewManager";
import { Session } from "../model/Session";
import { I18NManager } from "../utilities/I18NManager";
import { ServiceUtils } from "../utilities/ServiceUtils";
import { Utilities } from "../utilities/Utilities";
import { SessionView } from '../views/SessionView';

export class AccountPageController {

    private viewManager: SlideViewManager = new SlideViewManager();
    
    constructor(currentSession: Session, public sessionIds:string[]) {
        document.getElementById('account').classList.remove('hidden');
        if(!currentSession) {
            document.getElementById('no-sessions').classList.remove('hidden');
        }
        else {
            this.showSession(currentSession, false);
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
    }

    getCurrentSessionView():SessionView {
        const rootView = this.viewManager.getSlideViewStackRoot();
        if(rootView && rootView instanceof SessionView) {
            return rootView;
        }
        return null;
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
            this.sessionIds.push(data._id);
            this.showSession(data, true);
            
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

    private showSession(session:Session, slideOldStuffLeft: boolean): void {
        document.getElementById('no-sessions').classList.add('hidden');
        const newView = new SessionView({
            restApiPrefix: 'api/sessions/',
            slideViewManager:this.viewManager, 
            root: document.createElement('div'),
            session
        });
        const headerInput = document.getElementById('session-header').getElementsByClassName('session-header-text')[0] as HTMLInputElement;
        headerInput.value = session.name;
        headerInput.focus();
        this.viewManager.open(newView, slideOldStuffLeft);
    }

    private async deleteSession(button:HTMLButtonElement): Promise<void> {
        button.disabled = true;
        const oldHtml = button.innerHTML;
        let loader:HTMLDivElement;
        button.innerHTML = '';
        loader = Utilities.createLoadingSpinner();
        button.appendChild(loader);
        const currentSessionView = this.getCurrentSessionView();
        if(currentSessionView) {
            try {
                (await ServiceUtils.request('api/sessions/' + currentSessionView.getSession()._id, 'DELETE')).response as Session;
                const currentIndex = this.sessionIds.indexOf(currentSessionView.getSession()._id);
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
                    this.viewManager.close(currentSessionView);
                    this.showSession(nextSession, nextIndex<currentIndex);
                }
                else {
                    this.viewManager.close(currentSessionView);
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
        const currentSessionView = this.getCurrentSessionView();
        if(!currentSessionView) {
            return;
        }
        const currentIndex = this.sessionIds.indexOf(currentSessionView.getSession()._id);
        if(currentIndex != -1) {
            const newIndex = currentIndex + moveIndex;
            if(newIndex >= 0 && newIndex < this.sessionIds.length) {
                const newSessionId = this.sessionIds[newIndex];
                try {
                    const newSession = (await ServiceUtils.request('api/sessions/' + newSessionId)).response as Session;   
                    this.showSession(newSession, moveIndex>0);
                } catch(e) {
                    log.error('Cannot find session ' + newSessionId);
                    log.error(e);
                }
            }
        }
        else {
            log.error('Could not find session ' + currentSessionView.getSession()._id + ' in sessions');
        }
    }
}