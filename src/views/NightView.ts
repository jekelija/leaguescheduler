import { Night } from "../model/Night";
import { DetailContainerView } from "./DetailContainerView";

export interface NightViewOptions {
    nightId:string;
    detailView: DetailContainerView;
}

export class NightView {
    private night:Night;
    private root:HTMLDivElement;
    constructor(options: NightViewOptions) {
        this.root = document.getElementById('night-' + options.nightId) as HTMLDivElement;
        this.root.getElementsByClassName('add-league')[0].addEventListener('click', e=> {
            const testDiv = document.createElement('div');
            testDiv.innerHTML = 'ha';
            options.detailView.show(testDiv);
        });
    }

    private buildDetailView(): void {
        for(let l of this.night.leagues) {
            
        }
    }
}