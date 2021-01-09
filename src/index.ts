import * as log from 'loglevel';
import '../scss/global.scss';
import { UserController } from './controllers/UserController';
import { I18NManager } from './utilities/I18NManager';
import { NavView } from './views/NavView';

async function init():Promise<void> {
    //TODO loading screen
    await I18NManager.Instance().init();
    //TODO webpack this
    log.setLevel(log.levels.INFO);

    //always build nav bar
    const userController = new UserController();
    new NavView(userController);
}

init();