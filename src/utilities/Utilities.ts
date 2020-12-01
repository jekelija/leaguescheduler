export class Utilities {
    static emptyDiv(div:HTMLDivElement):void {
        if(div) {
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
        }
    }

    static localStorageAvailable(): boolean { 
        const test = 'test';
        try {
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
          return true;
        } catch(e) {
          return false;
        }
    }
}