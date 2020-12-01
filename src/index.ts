import * as log from 'loglevel';
import '../scss/global.scss';
import { UserController } from './controllers/UserController';
import { I18NManager } from './utilities/I18NManager';
import { DetailContainerView } from './views/DetailContainerView';
import { LoginView } from './views/LoginView';
import { NightView } from './views/NightView';

async function init():Promise<void> {
    //TODO loading screen
    await I18NManager.Instance().init();
    //TODO webpack this
    log.setLevel(log.levels.INFO);

    const userController = new UserController();
    new LoginView(userController);

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