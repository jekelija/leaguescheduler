import '../scss/global.scss';
import { I18NManager } from './utilities/I18NManager';
import { DetailContainerView } from './views/DetailContainerView';
import { NightView } from './views/NightView';

async function init():Promise<void> {
    //TODO loading screen
    await I18NManager.Instance().init();
    const detailView = new DetailContainerView();
    const nights = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for(let i = 0; i < nights.length; ++i) {
        new NightView({
            nightId: nights[i],
            detailView
        });
    }
}

init();