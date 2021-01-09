import '../../scss/popover.scss';
import { Utilities } from './Utilities';

export enum POPOVER_POSITION_TYPE {
    BOTTOM= "bottom",
    TOP= "top",
    LEFT= "left", 
    RIGHT= "right",
    INNER= "inner"
}

export interface PopoverOptions {
    targetElement:HTMLElement;
    parentElement?:HTMLElement;
    positionType: POPOVER_POSITION_TYPE;
    popoverStyle?:string;
    hideOnClick?: boolean;
    hideOnClickOff?:boolean;
    timeout?: number;
    notifyOnHide?:()=>void;
}


export class Popover {

    public isOpen: boolean = false;
    public isVisible: boolean = false;
    public popoverContainer: HTMLElement;

    private resizeTimeout:NodeJS.Timeout;
    private hideTimeout:NodeJS.Timeout;
    private boundResizeThrottler:()=>void;
    private boundHide:()=>void;
    private boundHideOnClickOff:()=>void;

    constructor(private options:PopoverOptions) {
        this.resizeTimeout = null;
        if(!this.options.parentElement) {
            this.options.parentElement = document.body;
        }
        this.boundResizeThrottler = this.resizeThrottler.bind(this);
        this.boundHide = this.hide.bind(this);
        this.boundHideOnClickOff = this.hideOnClickOff.bind(this);
    }

    destroy():void {
        if(this.popoverContainer) {
            this.popoverContainer.remove();
        }
    }

    hideOnClickOff(e:MouseEvent):void {
        if(this.popoverContainer && !this.popoverContainer.contains(e.target as Node)) {
            this.hide();
        }
    }

    /**
     * Displays a popover with the given message.
     * @param {string | HTMLElement} message
     */
    show(message: string | HTMLElement):HTMLDivElement {
        this.hide(true); //dont notify listener
        this.isOpen = true;
        this.isVisible = true;

        if(!this.options.targetElement) { return; }

        const popoverContainer = this.popoverContainer = document.createElement("div");
        popoverContainer.classList.add("popover", "animated", "hidden");
        if(this.options.popoverStyle) {
            popoverContainer.classList.add(this.options.popoverStyle);
        }
        
        //Add a click handler for hiding the popover
        if(this.options.hideOnClick) {
            popoverContainer.addEventListener("click", this.boundHide);
        }
        if(this.options.hideOnClickOff) {
            //give it a bit so that the initial click to show doesnt end up hiding itself
            setTimeout(()=> {
                document.body.addEventListener("click", this.boundHideOnClickOff);
            }, 250);
        }

        this.options.parentElement.appendChild(popoverContainer);

        //Add an arrow to the popover
        const popoverArrow = document.createElement('div');
        popoverArrow.classList.add('modal-arrow-outer');
        switch(this.options.positionType) {
            case POPOVER_POSITION_TYPE.BOTTOM:
                popoverArrow.classList.add('menu-top-arrow');
                break;
            case POPOVER_POSITION_TYPE.TOP:
                popoverArrow.classList.add('menu-bottom-arrow');
                break;
            case POPOVER_POSITION_TYPE.RIGHT:
            case POPOVER_POSITION_TYPE.INNER:
                popoverArrow.classList.add('menu-left-arrow');
                break;
            case POPOVER_POSITION_TYPE.LEFT:
                popoverArrow.classList.add('menu-right-arrow');
                break;
            default:
                break;
        }
        const popoverArrowInner = document.createElement('div');
        popoverArrowInner.classList.add('modal-arrow-inner');
        popoverArrow.appendChild(popoverArrowInner);
        popoverContainer.appendChild(popoverArrow);

        //If we have HTML content, append it
        const popoverContent = document.createElement("div");
        popoverContent.classList.add("popover-content");
        if(message instanceof HTMLElement) {
            popoverContent.appendChild(message);
        }
        else {
            popoverContent.innerHTML = message;
        }
        popoverContainer.appendChild(popoverContent);

        this.calculatePosition(this.options.targetElement, this.options.positionType, popoverContainer);

        window.addEventListener('resize', this.boundResizeThrottler);

        
        Utilities.fadeIn(popoverContainer);
        if(this.options.timeout) {
            this.hideTimeout = setTimeout(()=> {
                this.hide();
            }, this.options.timeout);
        }        

        return popoverContainer;
    }

    recalculatePosition():void {
        if(this.popoverContainer) {
            this.calculatePosition(this.options.targetElement, this.options.positionType, this.popoverContainer);
        }
    }

    /**
     * Hides this popover (by removing the HTML).
     */
    hide(noNotify?:boolean):void {
        this.isOpen = false;
        this.isVisible = false;
        if(this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        if(this.popoverContainer) {
            if(this.options.hideOnClick) {
                this.popoverContainer.removeEventListener("click", this.boundHide);
            }
            const popoverElement = this.popoverContainer;
            Utilities.fadeOut(popoverElement).then(()=> {
                popoverElement.remove();
            });

            this.popoverContainer = null;
        }

        if(this.options.hideOnClickOff) {
            //give it a bit so that the initial click to show doesnt end up hiding itself
            setTimeout(()=> {
                document.body.removeEventListener("click", this.boundHideOnClickOff);
            }, 250);
        }
        window.removeEventListener('resize', this.boundResizeThrottler);

        if(!noNotify && this.options.notifyOnHide) {
            this.options.notifyOnHide();
        }
    }

    /**
     * Calling this will toggle the visibility of the popover and its contents, this is separate of the main show/hide method as it does not alter/destroy the contents of the popover
     */
    toggleVisibility(visible:boolean):void {
        if (this.popoverContainer) {
            if (visible) {
                Utilities.fadeIn(this.popoverContainer);
            } else {
                Utilities.fadeOut(this.popoverContainer);
            }
        }
        this.isVisible = visible;
    }

    setTarget(targetElement:HTMLElement):void {
        this.options.targetElement = targetElement;
    }

    /**
     * Determines where in the parent element we should position the popover.
     * @param {HTMLElement} targetElement
     * @param {POPOVER_POSITION_TYPE} positionType 
     * @param {HTMLElement} popoverContainer 
     */
    private calculatePosition(targetElement:HTMLElement, positionType:POPOVER_POSITION_TYPE, popoverContainer:HTMLElement):void {
        const parentRect = this.options.parentElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const popoverRect = popoverContainer.getBoundingClientRect();
        const arrow = popoverContainer.querySelector(".modal-arrow-outer") as HTMLElement;
        arrow.style.left = null; //null out the left offset that we may have had to put in if we need the box to shift
        const arrowRect = arrow.getBoundingClientRect();

        const relativeTargetRect = {
            top : targetRect.top - parentRect.top,
            right : targetRect.right - parentRect.left,
            bottom : targetRect.bottom - parentRect.top,
            left : targetRect.left - parentRect.left
        };
        popoverContainer.classList.remove("top", "right", "bottom", "left");

        let top = 0, left = 0;
        switch(positionType) {
            case POPOVER_POSITION_TYPE.BOTTOM:
                top = relativeTargetRect.bottom + (arrowRect.height / 2);
                left = relativeTargetRect.left + (targetRect.width / 2) - (popoverRect.width / 2);

                popoverContainer.classList.add("bottom");
                break;
            case POPOVER_POSITION_TYPE.TOP:
                top = relativeTargetRect.top - popoverRect.height - (arrowRect.height / 2);
                left = relativeTargetRect.left + (targetRect.width / 2) - (popoverRect.width / 2);

                popoverContainer.classList.add("top");
                break;
            case POPOVER_POSITION_TYPE.RIGHT:
                top = relativeTargetRect.top + (targetRect.height / 2) - (popoverRect.height / 2);
                left = relativeTargetRect.left + targetRect.width + (arrowRect.width / 2);

                popoverContainer.classList.add("right");
                break;
            case POPOVER_POSITION_TYPE.LEFT:
                top = relativeTargetRect.top + (targetRect.height / 2) - (popoverRect.height / 2);
                left = relativeTargetRect.left - targetRect.width - (arrowRect.width / 2);

                popoverContainer.classList.add("left");
                break;
            case POPOVER_POSITION_TYPE.INNER:
                top = relativeTargetRect.top + targetRect.height - popoverRect.height - 35;
                left = relativeTargetRect.left + 15;

                popoverContainer.classList.add("inner");
                break;
            default:
                break;
        }

        //If the popover would be positioned above/below the viewport, fix it.
        if(top  < 0) {
            top = relativeTargetRect.top - 10; //Overlap the parent container a little bit
            popoverContainer.classList.add("top");
        }
        else if(top + popoverRect.height > this.options.parentElement.offsetHeight) {
            top = this.options.parentElement.offsetHeight - popoverRect.height - 10;
            arrow.style.top = targetRect.top - top + 'px';
        }

        //if we are off screen to the left/right, and we are a top or bottom, we need to shift the box, but not the arrow
        if(popoverContainer.classList.contains('top') || popoverContainer.classList.contains('bottom')) {
            if(left < 0) {
                arrow.style.left = 'calc(50% - ' + ((arrowRect.width/2) - left) + 'px)'
                left = 0;
            }
            else if(left + popoverRect.width > this.options.parentElement.offsetWidth) {
                const diff = (left + popoverRect.width) - this.options.parentElement.offsetWidth;
                left = this.options.parentElement.offsetWidth - popoverRect.width;
                arrow.style.left = 'calc(50% - ' + ((arrowRect.width/2) - diff) + 'px)'
            }
        }
        

        popoverContainer.style.top = top + "px";
        popoverContainer.style.left = left + "px";
    }

    private resizeThrottler():void {
        if (!this.resizeTimeout) {
            this.resizeTimeout = setTimeout(()=> {
                this.resizeTimeout = null;

                if(this.popoverContainer) {
                    this.calculatePosition(this.options.targetElement, this.options.positionType, this.popoverContainer);
                }
            }, 500);
        }
    }
}