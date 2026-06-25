import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SettingsProvider } from './providers/settingsProvider';
import { AllMaterialModules } from './all-material-modules';
import { ViewRegistrationPage } from './request/view-registration/view-registration.page';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { JSessionInterceptor } from './providers/JSessionInterceptor';
import { SessionProvider } from './providers/session.provider';
import { NotFoundComponent } from './not-found/not-found.component';
import { NavigationService } from './providers/navigation.service';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { OverlayContainer, ToastrModule } from 'ngx-toastr';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FullscreenOverlayContainer } from '@angular/cdk/overlay';
import { MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { ThanksMessageComponent } from './request/registration/thanks-message/thanks-message.component';
import { StudentApplicationFormComponent } from './request/student-application-form/student-application-form.component';
import { SharedModule } from './shared.module';
import { MagicScrollDirective } from 'src/assets/magin-scroll/magic-scroll.directive';
// Import ngx-barcode module
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    ViewRegistrationPage,
    NotFoundComponent,
    ThanksMessageComponent,
    StudentApplicationFormComponent,
    MagicScrollDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AllMaterialModules,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    HttpClientModule,
    NgxPaginationModule,
    MatInputModule,
    MatFormFieldModule,
    MatStepperModule,
    ToastrModule.forRoot(), // ToastrModule added
    SharedModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  {
    provide: MAT_CHIPS_DEFAULT_OPTIONS,
    useValue: {
      separatorKeyCodes: [ENTER, COMMA]
    }
  },
  { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: JSessionInterceptor,
    multi: true,
  },
    SessionProvider,
    SettingsProvider,
    DatePipe,
    NavigationService,
    BackgroundMode,
    FingerprintAIO,
    Geolocation,
  { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
  { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ThanksMessageComponent
  ]
})
export class AppModule { }