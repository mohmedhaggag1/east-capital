
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataProvider } from 'src/app/providers/DataProvider';
import { RegistrationComponent } from './registration.component';
import { SharedModule } from 'src/app/shared.module';

const routes: Routes = [
    { path: '', component: RegistrationComponent, resolve: { constants: DataProvider } }
];

@NgModule({
    declarations: [
        RegistrationComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
   
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegistrationModule { }
