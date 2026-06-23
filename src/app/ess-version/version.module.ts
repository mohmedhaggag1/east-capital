import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataProvider } from '../providers/DataProvider';
import { SharedModule } from '../shared.module';
import { EssVersionComponent } from './ess-version.component';

const routes: Routes = [
    { path: '', component: EssVersionComponent, resolve: { constants: DataProvider } }
];

@NgModule({
    declarations: [
        EssVersionComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VersionModule { }
