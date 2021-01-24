export class AbstractView {

    root:HTMLDivElement;

    slideLeft():void {
        this.root.classList.remove('content-slide-right');
        this.root.classList.remove('content-slide-center');
        this.root.classList.add('content-slide-left');
    }
    slideCenter():void {
        this.root.classList.add('content-slide-center');
        this.root.classList.remove('content-slide-left');
        this.root.classList.remove('content-slide-right');
    }
    slideRight():void {
        this.root.classList.remove('content-slide-left');
        this.root.classList.remove('content-slide-center');
        this.root.classList.add('content-slide-right');
    }
}