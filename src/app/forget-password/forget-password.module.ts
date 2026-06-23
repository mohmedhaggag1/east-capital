import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataProvider } from '../providers/DataProvider';
import { SharedModule } from '../shared.module';
import { ForgetPasswordComponent } from './forget-password.component';

const routes: Routes = [
    { path: '', component: ForgetPasswordComponent, resolve: { constants: DataProvider } }
];

@NgModule({
    declarations: [
        ForgetPasswordComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ForgetPasswordModule { }
