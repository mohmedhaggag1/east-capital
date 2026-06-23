import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { AllMaterialModules } from './all-material-modules';
import { NgxPaginationModule } from 'ngx-pagination';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrModule } from 'ngx-toastr';
import { YouTubePlayerModule } from "@angular/youtube-player";
import { CKEditorModule } from 'ng2-ckeditor';
import { I18NPipe } from './providers/i18n.pipe';
import { I18NFieldPipe } from './providers/i18n.field.pipe';
import { FilterPipe } from './providers/FilterPipe';
import { ScrollbarDirective } from './providers/ScrollbarDirective';
import { HlpFileUploadComponent } from './common/hlp-file-upload/hlp-file-upload.component';
import { ConfirmDialog } from './common/confirm-dialog/confirm-dialog';
import { ReportViwerComponent } from './common/report-viwer/report-viwer.component';
import { FawryPayComponent } from './common/fawry-pay/fawry-pay.component';
import { DeleteConfirmComponent } from './common/delete-confirm/delete-confirm.component';
import { MessageDialogComponent } from './common/message-dialog/message-dialog.component';
import { JSessionInterceptor } from './providers/JSessionInterceptor';
import { EncryptDecryptAuthInterceptor } from './providers/encrypt-decrypt-interceptor';
import { SessionProvider } from './providers/session.provider';
import { DataProvider } from './providers/DataProvider';
import { SettingsProvider } from './providers/settingsProvider';
import { I18N } from './providers/i18n.provider';
import { NavigationService } from './providers/navigation.service';
import { FawryPayService } from './common/fawry-pay/fawry.service';
import { FilterAnyPipe } from './providers/FilterAnyPipe';

// Pipes & Directives

// Components

// Providers

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [
        I18NPipe,
        I18NFieldPipe,
        FilterPipe,
        FilterAnyPipe,
        ScrollbarDirective,
        HlpFileUploadComponent,
        ConfirmDialog,
        ReportViwerComponent,
        FawryPayComponent,
        DeleteConfirmComponent,
        MessageDialogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        AllMaterialModules,
        HttpClientModule,
        NgxPaginationModule,
        PdfViewerModule,
        MatInputModule,
        MatFormFieldModule,
        MatStepperModule,
        ToastrModule.forRoot(),
        YouTubePlayerModule,
        CKEditorModule,
        IonicModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        AllMaterialModules,
        NgxPaginationModule,
        PdfViewerModule,
        MatInputModule,
        MatFormFieldModule,
        MatStepperModule,
        ToastrModule,
        YouTubePlayerModule,
        CKEditorModule,
        IonicModule,
        // Export pipes, directives, and shared components
        I18NPipe,
        I18NFieldPipe,
        FilterPipe,
        FilterAnyPipe,
        ScrollbarDirective,
        HlpFileUploadComponent,
        ConfirmDialog,
        ReportViwerComponent,
        FawryPayComponent,
        DeleteConfirmComponent,
        MessageDialogComponent
    ],
    providers: [
        DatePipe,
        SessionProvider,
        DataProvider,
        SettingsProvider,
        I18N,
        NavigationService,
        FawryPayService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JSessionInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: EncryptDecryptAuthInterceptor,
            multi: true,
        }
    ]
})
export class SharedModule { }