import { Pipe, PipeTransform, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { I18N } from './i18n.provider';
// import { Subscription } from 'rxjs';

@Pipe({
    name: 'i18n',
    pure: false         // This should be false for performance.. A trade-off !!
})
export class I18NPipe implements PipeTransform, OnInit, OnDestroy {

    constructor(public i18n: I18N, private cd: ChangeDetectorRef) {
        // console.log('Pipe created');

        // this.sub = this.i18n.observeLanguage()
        // .subscribe({
        //     next: (lang) => {
        //         console.log(lang);
        //         this.cd.reattach();
        //     }
        // });
    }

    // sub: Subscription;

    ngOnInit() {
        // console.log('Pipe init');
    }

    ngOnDestroy() {
        // console.log('Pipe destroyed');
        // if (this.sub) this.sub.unsubscribe();
    }

    transform(value: any, args?: any): any {
        if (args) {
            return this.i18n.get(args, value);
        } else {
            return this.i18n.get(value, value);
        }
    }
}