import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared.module';
import { FilesAttachmentUploadComponent } from './files-attachment-upload.component';
import { DataProvider } from 'src/app/providers/DataProvider';

const routes: Routes = [
    { path: '', component: FilesAttachmentUploadComponent, resolve: { constants: DataProvider } }
];

@NgModule({
    declarations: [
        FilesAttachmentUploadComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FilesAttachmentUploadModule { }
