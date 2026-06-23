import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataProvider } from '../providers/DataProvider';
import { SharedModule } from '../shared.module';
import { InterviewComponent } from './interview.component';

const routes: Routes = [
     { path: '', component: InterviewComponent, resolve: { constants: DataProvider } }
];

@NgModule({
    declarations: [
        InterviewComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InterviewModule { }
