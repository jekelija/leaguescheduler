import '../../scss/session.scss';

import { ServiceUtils } from "../utilities/ServiceUtils";
import { Session } from "../model/Session";
import { I18NManager } from "../utilities/I18NManager";
import { NightComponent } from './components/NightComponent';
import { Utilities } from '../utilities/Utilities';
import { AbstractSlideView, AbstractSlideViewOptions } from './AbstractSlideView';

export interface SessionViewOptions extends AbstractSlideViewOptions {
    session:Session
}
export class SessionView extends AbstractSlideView {
    constructor(options:SessionViewOptions) {
        super(options);
        this.options.root.classList.add('session-view');
        this.showSession(options.session);
        

        const headerInput = document.getElementById('session-header').getElementsByClassName('session-header-text')[0] as HTMLInputElement;
        headerInput.addEventListener('change', e=> {
            const input = e.target as HTMLInputElement;
            this.updateSessionName(input);
        });
    }

    getSession():Session {
        return (this.options as SessionViewOptions).session;
    }

    getBreadcrumb():HTMLElement {
        const sessionBreadcrumb = document.createElement('span');
        sessionBreadcrumb.classList.add('session-breadcrumb');

        const dateFormat = new Intl.DateTimeFormat([I18NManager.Instance().getCurrentLanguage(), 'en']);
        const fromDate = new Date(this.getSession().from);
        const toDate = new Date(this.getSession().to);
        sessionBreadcrumb.innerHTML = this.getSession().name + ': ' + dateFormat.format(fromDate) + ' - ' + dateFormat.format(toDate);

        return sessionBreadcrumb;
    }

    private async updateSessionName(input:HTMLInputElement): Promise<void> {
        const session = this.getSession();
        await Utilities.inputAutoUpdate(input, session, 'name', async name=> {
            await ServiceUtils.request(this.options.restApiPrefix + this.getSession()._id, 'PATCH', {name});
        });
    }

    private showSession(session:Session): void {        
        for(let night of session.nights) {
            const nightRoot = document.createElement('div');
            new NightComponent({
                restApiPrefix: session._id + '/',
                night,
                root: nightRoot,
                slideViewManager: this.options.slideViewManager
            });
            this.options.root.appendChild(nightRoot);
        }
    }
}