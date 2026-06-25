import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MagicScrollDirective } from './magic-scroll.directive';



@NgModule({
  declarations: [
    MagicScrollDirective
  ],
  exports: [
    MagicScrollDirective
  ],
  imports: [
    CommonModule
  ]
})
export class MagicScrollModule { }