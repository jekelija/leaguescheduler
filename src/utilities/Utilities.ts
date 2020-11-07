export class Utilities {
    static emptyDiv(div:HTMLDivElement):void {
        if(div) {
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
        }
    }
}