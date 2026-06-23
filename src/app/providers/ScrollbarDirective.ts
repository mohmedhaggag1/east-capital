/**
 * @author Mohammad Zidan
 * <a href="mailto:mohamed.zidan@esmartsoft.com.eg">mohamed.zidan@esmartsoft.com.eg</a>
 */

import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[scrollbar]'
})
export class ScrollbarDirective implements OnInit {

    @Input() scrollbar: string
    @Input() allowAllScreens: boolean | string

    hostElement: HTMLElement

    constructor(public elementRef: ElementRef) { }

    ngOnInit() { 
        this.hostElement = this.elementRef.nativeElement
        if (this.hostElement && this.hostElement.tagName && this.hostElement.tagName == 'ION-CONTENT') {
            let el = document.createElement('style')
            el.innerText = this.scrollbar || this.getCustomStyle()
            this.hostElement.shadowRoot.appendChild(el)
        }
    }

    getCustomStyle() { 
        if (this.allowAllScreens === true || this.allowAllScreens === 'true') {
            return `::-webkit-scrollbar {
           width: 0.5rem !important;
        }
        ::-webkit-scrollbar-track {
          background: #a9a9b0;
        }
        ::-webkit-scrollbar-thumb {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
            background-image: -webkit-gradient(linear, left bottom, left top, from(#ecf9f1), to(#273866));
            background-image: -webkit-linear-gradient(bottom, #ecf9f1 0%, #273866 100%);
            background-image: linear-gradient(to top, #ecf9f1 0%, #273866 100%);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #5cd1c7;
        } 
        `
        } else {
            return `@media(pointer: fine) {
        ::-webkit-scrollbar {
           width: 0.5rem !important;
        }
        ::-webkit-scrollbar-track {
          background: #a9a9b0;
        }
        ::-webkit-scrollbar-thumb {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
            background-image: -webkit-gradient(linear, left bottom, left top, from(#ecf9f1), to(#273866));
            background-image: -webkit-linear-gradient(bottom, #ecf9f1 0%, #273866 100%);
            background-image: linear-gradient(to top, #ecf9f1 0%, #273866 100%);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #5cd1c7;
        } 
      }`
        }
    }

}