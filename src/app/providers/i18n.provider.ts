import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

// var singleton : SessionProvider;

// export function getSingle() : SessionProvider {
//     if (!singleton) singleton = new SessionProvider();
//     return singleton;
// }

@Injectable({
    providedIn: 'root'
})
export class I18N {

    public static lang: string = 'en';

    private static subject_lang = new Subject<string>();

    public static trans: any = {};

    public static default: any = {};

    private static map: Map<string, any> = new Map<string, any>(); 

    constructor() {
        // Zidan lang 
        // Stop Switch Lang in Badya 
        //I18N.lang = 'en';//
        I18N.lang = localStorage.getItem('uiLang') || 'en';
    }

    public lang(): string {
        return I18N.lang;
    }

    public t(key: string) {
        return I18N.trans[key] || I18N.default[key] || key;
    }

    public get(key: string, def: string = '') {
        return I18N.trans[key] || I18N.default[key] || def;
    }

    public field(obj: any, key: string = 'name') {
        // if (!obj[key]) key = '';
        if (!obj) return '';

        const suffix = '_' + I18N.lang;
        return obj[key + suffix] || obj[key] || obj[key + '_en'] || ''; 
    }

    public switch(lang: string) {
        I18N.lang = lang;
        localStorage.setItem('uiLang', lang);

        I18N.default = I18N.map.get('en') || {};
        I18N.trans = I18N.map.get(lang) || I18N.default || {};

        I18N.subject_lang.next(lang);

        let body = document.getElementsByTagName('body')[0];
        if (body && lang === 'ar') {
          // console.log("Arabic class applied");
          if(!body.className.includes(' arabic')){
            body.className = body.className + ' arabic';
          }
        } else {
          // console.log("Arabic class removed");
          body.className = body.className.replace(' arabic', '');
        }
    }

    public observeLanguage(): Observable<string> {
        return I18N.subject_lang.asObservable();
    }

    public load(file: any) {
        if (!file) return;

        for(let key of Object.keys(file)) {
            let values = file[key];
            if (values) {
                this.recurse(key, values); 
            }
        }
    }

    private readKey(key: string, values: any) {
        for(let lang of Object.keys(values)) {
            let obj = {};
            
            if (!I18N.map.has(lang)) {
                I18N.map.set(lang, {});
            }
            obj = I18N.map.get(lang);

            obj[key] = values[lang];
        }
    }

    private recurse(path: string, obj: any) {
        if (!obj) return;

        for(let key of Object.keys(obj)) {
            if (key == 'ar' || key == 'en') {
                // This is a leaf.. Go read values..
                this.readKey(path, obj);
                return;
            }
        }

        for(let key of Object.keys(obj)) {
            this.recurse(path + '.' + key, obj[key]);
            // let subs = obj[key];
            // if (subs) {
            //     for(let subKey of Object.keys(subs)) {
            //         this.recurse(path + '.' + subKey, subs[subKey]);
            //     }
            // }
        }
    }
}