import { Session } from "../model/Session";

export interface INightViewDelegate {
    addToBreadcrumbTrail(breadcrumb:string): void;
    slideLeft(): void;
    slideCenter(): void;
    popFromBreadcrumbTrail(): void;
    getSession():Session;
    addChild(el:HTMLDivElement): void;
}