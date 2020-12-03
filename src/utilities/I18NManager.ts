import * as log from 'loglevel';

import i18next, { InitOptions } from 'i18next';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export class I18NManager {
    private static instance: I18NManager;
    private ready: boolean;
    private promise: Promise<void>;
    private readyResolve: ()=> void;
    private readyReject: (error:string)=> void;

    /**
     * @returns {I18NManager} - Instance of I18NManager
     */
    static Instance() {
        if (!I18NManager.instance) {
            I18NManager.instance = new I18NManager();
        }
        return I18NManager.instance;
    }

    constructor() {
        this.ready = false;
        this.promise = new Promise((resolve, reject)=> {
            this.readyResolve = resolve;
            this.readyReject = reject;
        });
    }

    /** Wait for I18N manager to be ready */
    async waitForReady():Promise<void> {
        return this.promise;
    }

    async init():Promise<void> {
        const defaultNS = ['global', 'login', 'session', 'night', 'league', 'team', 'player'];
        const loadPath = process.env.CACHE_BUSTER_PREFIX ? process.env.CACHE_BUSTER_PREFIX + '/locales/{{lng}}/{{ns}}.json' : '/locales/{{lng}}/{{ns}}.json';
        const defaultOptions:InitOptions = {
            ns: defaultNS,
            lowerCaseLng: true,
            fallbackLng: 'en',
            backend: {
                loadPath
            }
        };
        try {
            await i18next.use(LanguageDetector).use(XHR).init(defaultOptions);
            this.ready = true;
            this.readyResolve();
            this.autoPopulate();
        } catch(e) {
            this.readyReject(e);
        }
        return this.promise;
    }

    autoPopulate():void {
        const elements = document.body.getElementsByClassName('i18n');
        for(let i = 0; i < elements.length; ++i) {
            const e = elements[i] as HTMLElement;
            if(e.dataset.i18nKey && e.dataset.i18nNs) {
                e.innerHTML = this.translate(e.dataset.i18nNs, e.dataset.i18nKey);
            }
        }
    }

    /**
     * To translate, will first attempt to look at client-specific namespace. If nothing exists there, will use namespace specified
     * @param {string} ns Namespace 
     * @param {string} key 
     * @param {any} options - See options available at https://www.i18next.com/translation-function/essentials#overview-options
     */
    translate(ns:string, key:string, options?:any):string {
        if(!this.ready) {
            log.error('I18NManager is not ready yet, make sure that you initialized it and waited for it');
            return key;
        }
        let optionsToUse = options ? options : {};
        optionsToUse.ns = ns;

        //otherwise do basic translation
        return i18next.t(key, optionsToUse);
    }

    /**
     * Returns the current language being used by i18next.
     * Wait for it to be ready before using
     * @returns {string}
     */
    getCurrentLanguage():string {
        return i18next.language;
    }
}