import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataProvider } from '../providers/DataProvider';
import { SharedModule } from '../shared.module';
import { LoginComponent } from './login.component';

const routes: Routes = [
    { path: '', component: LoginComponent, resolve: { constants: DataProvider } }
];

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginModule { }
