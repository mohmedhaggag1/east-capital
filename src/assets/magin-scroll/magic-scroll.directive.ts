import { Directive, ElementRef, HostBinding, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[magicScroll]'
})
export class MagicScrollDirective implements OnInit{

  @Input('magicScroll') magicScroll: any;

  @HostBinding('style.overflow') overflow: string = 'auto';
  @HostBinding('style.maxHeight') maxHeight: any;

  constructor(private ele: ElementRef) { }

  ngOnInit(): void {
    this.ele.nativeElement.classList.add('scrolling');
    this.maxHeight = this.magicScroll;
  }


}