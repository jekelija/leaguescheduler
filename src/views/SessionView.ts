import '../../scss/session.scss';

import * as log from 'loglevel';
import { ServiceUtils } from "../utilities/ServiceUtils";
import { Session } from "../model/Session";
import { I18NManager } from "../utilities/I18NManager";
import { NightView } from './NightView';
import { Utilities } from '../utilities/Utilities';

export class SessionView {

    nightViews:NightView[] = [];

    constructor(public currentSession: Session, sessionIds:string[]) {
        document.getElementById('account').classList.remove('hidden');
        if(!currentSession) {
            document.getElementById('no-sessions').classList.remove('hidden');
        }
        else {
            this.showSession(currentSession);
        }
        document.getElementById('create-session').addEventListener('click', e=> {
            this.createSession(e.currentTarget as HTMLButtonElement);
        });

        const headerInput = document.getElementById('session-header').getElementsByClassName('session-header-text')[0] as HTMLInputElement;
        headerInput.addEventListener('change', e=> {
            const input = e.target as HTMLInputElement;
            this.updateSessionName(input);
        });
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

    private async createSession(button:HTMLButtonElement): Promise<void> {
        button.disabled = true;
        const oldHtml = button.innerHTML;
        button.innerHTML = I18NManager.Instance().translate('global', 'creating');
        try {
            const data = (await ServiceUtils.request('api/sessions/', 'POST')).response as Session;

            await this.showSession(data);
            const headerInput = document.getElementById('session-header').getElementsByClassName('session-header-text')[0] as HTMLInputElement;
            headerInput.focus();

            console.log(data);
        } catch(e) {
            log.error(e);
            //TODO how should we handle errors in UI
        }
        button.innerHTML = oldHtml;
        button.disabled = false;
    }
}