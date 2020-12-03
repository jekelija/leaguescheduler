import * as log from 'loglevel';
import '../scss/global.scss';
import { UserController } from './controllers/UserController';
import { I18NManager } from './utilities/I18NManager';
import { DetailContainerView } from './views/DetailContainerView';
import { NavView } from './views/NavView';
import { NightView } from './views/NightView';

async function init():Promise<void> {
    //TODO loading screen
    await I18NManager.Instance().init();
    //TODO webpack this
    log.setLevel(log.levels.INFO);

    //always build nav bar
    const userController = new UserController();
    new NavView(userController);
    
    //TODO move to logged in
    // const detailView = new DetailContainerView();
    // const nights = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    // for(let i = 0; i < nights.length; ++i) {
    //     new NightView({
    //         nightId: nights[i],
    //         detailView
    //     });
    // }
}

init();