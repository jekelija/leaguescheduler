import '../../scss/session.scss';

import * as log from 'loglevel';
import { ServiceUtils } from "../utilities/ServiceUtils";
import { Session } from "../model/Session";
import { I18NManager } from "../utilities/I18NManager";
import { NightView } from './NightView';
import { Utilities } from '../utilities/Utilities';

export class SessionView {

    nightViews:NightView[] = [];

    constructor(currentSession: Session, sessionIds:string[]) {
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
    }

    private async showSession(session:Session): Promise<void> {
        Utilities.emptyDiv(document.getElementById('current-session'));
        document.getElementById('no-sessions').classList.add('hidden');
        const headerInput = document.getElementById('session-header').getElementsByClassName('session-header-text')[0] as HTMLInputElement;
        headerInput.value = session.name;

        for(let night of session.nights) {
            const nightView = new NightView({
                night,
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

            console.log(data);
        } catch(e) {
            log.error(e);
            //TODO how should we handle errors in UI
        }
        button.innerHTML = oldHtml;
        button.disabled = false;
    }
}