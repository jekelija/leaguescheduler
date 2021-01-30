import { Utilities } from "../utilities/Utilities";
import { AbstractSlideView } from "./AbstractSlideView";


export class SlideViewManager {
    private slideViewStack:AbstractSlideView[] = [];

    constructor() {
        document.documentElement.style.setProperty('--slider-animation-speed', Utilities.SLIDER_SPEED + "s");
        document.getElementById('breadcrumbs').addEventListener('click', e=> {
            const breadcrumb = (e.target as HTMLElement).closest('.breadcrumb');
            if(breadcrumb) {
                let index = -1;
                const b = document.getElementById('breadcrumbs');
                for(let i = 0; i < b.children.length; ++i) {
                    if(b.children[i] == breadcrumb) {
                        index = i;
                        break;
                    }
                }
                if(index != -1 && (index < this.slideViewStack.length-1)) {
                    while(this.slideViewStack.length > (index+1)) {
                        this.popFromStack();
                    }
                }
            }
        });
    }

    open(view:AbstractSlideView, slideOldStuffLeft:boolean): void {
        document.getElementById('content-sliding-area').appendChild(view.options.root);
        //is there a current view? what direction should it slide?
        if(this.slideViewStack.length > 0) {
            const oldStack = this.slideViewStack.slice();
            if(slideOldStuffLeft) {
                view.slideRight();
                view.options.root.offsetHeight; //force a repaint
                view.slideCenter();
                oldStack[oldStack.length-1].slideLeft().then(()=> {
                    for(let oldView of oldStack) {
                        oldView.destroy();
                    }
                });
            }
            else {
                view.slideLeft();
                view.options.root.offsetHeight; //force a repaint
                view.slideCenter();
                oldStack[oldStack.length-1].slideRight().then(()=> {
                    for(let oldView of oldStack) {
                        oldView.destroy();
                    }
                });
            }
        }
        else {
            view.slideCenter();
        }
        this.slideViewStack = [view];

        const breadcrumbs = document.getElementById('breadcrumbs') as HTMLDivElement;
        Utilities.emptyDiv(breadcrumbs);
        const b = view.getBreadcrumb();
        b.classList.add('breadcrumb');
        breadcrumbs.appendChild(b);
    }

    close(view:AbstractSlideView): void {
        view.destroy();
        this.slideViewStack = [];
        const breadcrumbs = document.getElementById('breadcrumbs') as HTMLDivElement;
        Utilities.emptyDiv(breadcrumbs);
    }

    addToStack(view:AbstractSlideView): void {
        document.getElementById('content-sliding-area').appendChild(view.options.root);

        this.slideViewStack.push(view);
        view.slideLeft();
        view.options.root.offsetHeight; //force a repaint
        view.slideCenter();
        if(this.slideViewStack.length > 1) {
            this.slideViewStack[this.slideViewStack.length-2].slideLeft();
        }
        const breadcrumbs = document.getElementById('breadcrumbs') as HTMLDivElement;
        const b = view.getBreadcrumb();
        b.classList.add('breadcrumb');
        breadcrumbs.appendChild(b);
    }

    popFromStack(): void {
        if(this.slideViewStack.length > 0) {
            this.slideViewStack[this.slideViewStack.length-1].destroy();
            const removed = this.slideViewStack.splice(this.slideViewStack.length-1, 1)[0];
            const breadcrumbs = document.getElementById('breadcrumbs') as HTMLDivElement;
            const breadcrumbEls = breadcrumbs.getElementsByClassName('breadcrumb');
            if(breadcrumbEls.length > 1) {
                breadcrumbEls[breadcrumbEls.length-1].remove();
            }
            removed.slideRight().then(()=> {
                removed.destroy();
            });
            if(this.slideViewStack.length > 0) {
                this.slideViewStack[this.slideViewStack.length-1].slideCenter();
            }
        }
    }

    getSlideViewStackRoot():AbstractSlideView {
        return this.slideViewStack.length > 0 ? this.slideViewStack[0] : null;
    }
}