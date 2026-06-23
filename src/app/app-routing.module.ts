import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewRegistrationPage } from './request/view-registration/view-registration.page';
import { DataProvider } from './providers/DataProvider';
import { NotFoundComponent } from './not-found/not-found.component';
import { RegistrationComponent } from './request/registration/registration.component';
import { FilesAttachmentUploadComponent } from './request/files-attachment-upload/files-attachment-upload.component';
import { EditRegistrationComponent } from './request/edit-registration/edit-registration.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'ess/version',
    loadChildren: () =>
      import('./ess-version/version.module').then(m => m.VersionModule)
  },

  { path: 'registration', component: RegistrationComponent, resolve: { constants: DataProvider } },
  { path: 'registration/guradian-details', component: RegistrationComponent, resolve: { constants: DataProvider } },
  { path: 'registration/email-verifcation', component: RegistrationComponent, resolve: { constants: DataProvider } },

  { path: 'view', component: ViewRegistrationPage, resolve: { constants: DataProvider } },
  {
    path: 'edit',
    loadChildren: () =>
      import('./request/edit-registration/edit-registration.module').then(m => m.EditRegistrationModule)
  },
  {
    path: 'attachments',
    loadChildren: () =>
      import('./request/files-attachment-upload/files-attachment-upload.module').then(m => m.FilesAttachmentUploadModule)
  },
  {
    path: 'essay',
    loadChildren: () =>
      import('./essay-writer/essay.module').then(m => m.EssayModule)
  },

  {
    path: 'interview',
    loadChildren: () =>
      import('./interview/interview.module').then(m => m.InterviewModule)
  },

  {
    path: 'forget-password',
    loadChildren: () =>
      import('./forget-password/forget-password.module').then(m => m.ForgetPasswordModule)
  },

  { path: '404', component: NotFoundComponent, resolve: { constants: DataProvider } },
  { path: '', redirectTo: 'registration', pathMatch: 'full' },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  // imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  // exports: [RouterModule]
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', useHash: true })], //  
  exports: [RouterModule]
})
export class AppRoutingModule { }
