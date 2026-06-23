import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataProvider } from '../providers/DataProvider';
import { SharedModule } from '../shared.module';
import { EssayWriterComponent } from './essay-writer.component';

const routes: Routes = [
    { path: '', component: EssayWriterComponent, resolve: { constants: DataProvider } }
];

@NgModule({
    declarations: [
        EssayWriterComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EssayModule { }
