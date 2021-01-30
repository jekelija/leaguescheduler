import { Utilities } from "../utilities/Utilities";
import { SlideViewManager } from "./SlideViewManager";

export interface AbstractSlideViewOptions {
    slideViewManager:SlideViewManager,
    root:HTMLDivElement
}

export abstract class AbstractSlideView {


    constructor(public options: AbstractSlideViewOptions) {
        this.options.root.classList.add('content-slider');
    }

    abstract getBreadcrumb():HTMLElement;

    destroy(): void {
        this.options.root.remove();
    }

    async slideLeft():Promise<void> {
        if(!this.options.root.classList.contains('content-slide-left')) {
            this.options.root.classList.remove('content-slide-right');
            this.options.root.classList.remove('content-slide-center');
            this.options.root.classList.add('content-slide-left');
            await Utilities.wait(Utilities.SLIDER_SPEED * 1000);
        }
    }
    async slideCenter():Promise<void> {
        if(!this.options.root.classList.contains('content-slide-center')) {
            this.options.root.classList.add('content-slide-center');
            this.options.root.classList.remove('content-slide-left');
            this.options.root.classList.remove('content-slide-right');
            await Utilities.wait(Utilities.SLIDER_SPEED * 1000);
        }
    }
    async slideRight():Promise<void> {
        if(!this.options.root.classList.contains('content-slide-right')) {
            this.options.root.classList.remove('content-slide-left');
            this.options.root.classList.remove('content-slide-center');
            this.options.root.classList.add('content-slide-right');
            await Utilities.wait(Utilities.SLIDER_SPEED * 1000);
        }
    }
}