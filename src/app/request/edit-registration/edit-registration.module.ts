import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared.module'; 
import { DataProvider } from 'src/app/providers/DataProvider';
import { EditRegistrationComponent } from './edit-registration.component';

const routes: Routes = [
    { path: '', component: EditRegistrationComponent, resolve: { constants: DataProvider } }
];

@NgModule({
    declarations: [
        EditRegistrationComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditRegistrationModule { }
