import '../../scss/detail-container.scss'
import { Utilities } from "../utilities/Utilities";

export class DetailContainerView {
    show(child:HTMLDivElement): void {
        const me = document.getElementById('detail-container');
        Utilities.emptyDiv(me as HTMLDivElement);
        me.appendChild(child);
        me.classList.add('open');
    }

    hide() {
        const me = document.getElementById('detail-container');
        me.classList.remove('open');
    }
}