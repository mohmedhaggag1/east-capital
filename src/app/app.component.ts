import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController, NavController, isPlatform } from '@ionic/angular';
import { SettingsProvider } from './providers/settingsProvider';
import { Subscription } from 'rxjs';
import { I18N } from './providers/i18n.provider';
import { DataProvider } from './providers/DataProvider';
import { Router } from '@angular/router';
import { SessionProvider } from './providers/session.provider';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { WebsocketService } from './providers/websocket.service';
import { UIService } from './providers/ui.service';
import { App } from '@capacitor/app';
import { Constants } from './providers/Constants';
import { ViewRegistrationPage } from './request/view-registration/view-registration.page';
import { MatDialog } from '@angular/material/dialog';
import { EssaySettings } from './model/essaySettings';
import { SmartResponse } from './model/smart-communication';
import { StudentStatusRecord } from './model/studentRequest';
import { SocialMedia } from './model/socialMedia';
import disableDevtool from 'disable-devtool';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  rootPage: any = ViewRegistrationPage;
  themeSub!: Subscription;
  essaySettingsSub!: Subscription;

  selectedTheme: String = "light-theme";
  lang: string = "en";
  langImage: string = "assets/images/lang-en.png"
  sublang!: Subscription;
  direction: boolean = true;

  isToggledLang: boolean = true;
  isToggledTheme: boolean = true;

  isUserLogin: boolean = false;
  userLoginsub!: Subscription;
  imgProfile: string = "";
  userName?: { ar: string, en: string } = { 'ar': '', 'en': '' };

  isMobile: boolean = false;

  activeButton: number = 0;
  logo: string = "";
  company: string = "";
  enable_payment: boolean = false;
  enable_attachments: boolean = false;
  enable_switch_lang: boolean = false;
  essaySettings: EssaySettings = new EssaySettings();

  showInterview: boolean = false;

  studentStatusRecord: StudentStatusRecord = new StudentStatusRecord();


  terms_conditions_url: string = "";
  privacy_policy_url: string = "";
  refund_policy_url: string = "";
  socialMediaArr: SocialMedia[] = [];
  contactUniversity: string[] = [];
  constructor(
    public navCtrl: NavController,
    private settings: SettingsProvider,
    private router: Router,
    private provider: DataProvider,
    private menu: MenuController,
    private alertController: AlertController,
    private ws: WebsocketService,
    private ui: UIService,
    private session: SessionProvider,
    public i18n: I18N,
    public dialog: MatDialog,
    private httpClient: HttpClient) {
    this.selectedTheme = localStorage.getItem('theme') || 'light-theme';
    this.settings.setActiveTheme(this.selectedTheme);
    if (this.selectedTheme === 'light-theme') {
      this.isToggledTheme = false;
    } else {
      this.isToggledTheme = true;
    }

  }

  async ngOnInit() {
    await this.provider.initCache();

    if ((typeof Constants.dt === "undefined") || (Constants.dt === null) || (Constants.dt === "") || (Constants.dt === "true")) {
      disableDevtool({
        disableSelect: false,
        disableCopy: false,
        disableCut: false,
        disableMenu: false,
        clearLog: true,
        //detectors: [-1, 0, 1, 2, 3, 4],
        ondevtoolopen: () => {
          //this.document.location.href = Constants.e;
          window.location.href = '\u0061\u0062\u006f\u0075\u0074\u003a\u0062\u006c\u0061\u006e\u006b';
        },
        ondevtoolclose: () => {
          //this.document.location.href = Constants.e;
          window.location.href = '\u0061\u0062\u006f\u0075\u0074\u003a\u0062\u006c\u0061\u006e\u006b';
        },
      });
    }

    // Change The Logo depend on Settings  
    this.setFaviconAndTitle("assets/images/logo-icon-" + Constants.company + ".png", Constants.company + ' University Registration');
    this.logo = "logo-" + Constants.company + ".png";
    this.company = Constants.company;
    this.terms_conditions_url = Constants.terms_conditions_url;
    this.privacy_policy_url = Constants.privacy_policy_url;
    this.refund_policy_url = Constants.refund_policy_url;
    this.socialMediaArr = Constants.social_media;
    this.contactUniversity = Constants.contact_university || [];
    this.enable_payment = Constants.enable_payment;
    this.enable_attachments = Constants.enable_attachments;
    this.enable_switch_lang = Constants.enable_switch_lang;

    if (isPlatform('capacitor')) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.themeSub = this.settings.activeTheme.subscribe({
      next: (val) => {
        this.selectedTheme = val;
      }
    });

    this.essaySettingsSub = Constants.subject_essaySettings.subscribe({
      next: (val) => {
        this.essaySettings = val;
        Constants.essaySettings = val;
      }
    });

    this.essaySettings = Constants.essaySettings;

    this.sublang = this.i18n.observeLanguage().subscribe({
      next: (lang) => {
        this.lang = lang;
        this.direction = this.provider.getDirection(this.lang);
      }
    });

    this.lang = I18N.lang;
    this.direction = this.provider.getDirection(this.lang);
    this.isToggledLang = !this.direction;
    this.toggleAppLang();
    this.userLoginsub = SessionProvider.subject_user.subscribe({
      next: (user) => {
        if (!this.session.isLoggedIn()) {
          this.isUserLogin = false;
          this.userName = { 'ar': '', 'en': '' };
          this.imgProfile = "";
          this.showInterview = false;
        } else {
          this.isUserLogin = true;
          this.userName.ar = user.full_name;
          this.userName.en = user.full_name_en;
          this.imgProfile = user.avatar;
          this.getImageUrl();
          this.getInterviewSettings();
          this.getRegistrationData();
          setTimeout(() => {
            this.ws.checkUserSession();
          }, 10000);
        }
      }
    });

    if (!this.session.isLoggedIn()) {
      this.isUserLogin = false;
      this.userName = { 'ar': '', 'en': '' };
      this.imgProfile = "";
      this.showInterview = false;
    } else {
      this.isUserLogin = true;
      this.userName.ar = SessionProvider.user.full_name;
      this.userName.en = SessionProvider.user.full_name_en;
      this.imgProfile = SessionProvider.user.avatar;
      this.getImageUrl();
      this.ws.checkUserSession();
      this.getInterviewSettings();
      this.getRegistrationData();
    }
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
    if (this.userLoginsub) {
      this.userLoginsub.unsubscribe();
    }
    if (this.sublang) {
      this.sublang.unsubscribe();
    }
    if (this.essaySettingsSub) {
      this.essaySettingsSub.unsubscribe();
    }
  }

  toggleAppTheme() {
    if (this.isToggledTheme) {
      this.settings.setActiveTheme('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
    } else {
      this.settings.setActiveTheme('light-theme');
      localStorage.setItem('theme', 'light-theme');
    }
  }

  toggleAppLang() {
    if (this.isToggledLang) {
      this.lang = "en";
      this.langImage = "assets/images/lang-ar.png";
    } else {
      this.lang = "ar";
      this.langImage = "assets/images/lang-en.png";
    }
    this.i18n.switch(this.lang);
  }

  getImageUrl(): string {
    if (this.imgProfile === "") {
      if (SessionProvider.user.gender === '2') {
        this.imgProfile = "./assets/images/woman.png";
      } else {
        this.imgProfile = "./assets/images/man.png";
      }
    } else {
      return this.imgProfile;
    }
  }

  onImgError(event) {
    if (SessionProvider.user.gender === '2') {
      event.target.src = "./assets/images/woman.png";
    } else {
      event.target.src = './assets/images/man.png';
    }
    return;
  }

  registration() {
    this.menu.close();
    this.router.navigate(["registration"], { replaceUrl: true });
  }

  singin() {
    this.menu.close();
    this.router.navigate(["login"], { replaceUrl: true });
  }

  essayWriter() {
    this.menu.close();
    this.router.navigate(["essay"], { replaceUrl: true });
  }

  goToInterview() {
    this.menu.close();
    this.router.navigate(["interview"], { replaceUrl: true });
  }

  goMainHome() {
    let pwa = window.open(Constants.mainHomeUrl);
  }

  contactUs() {
    let pwa = window.open(Constants.contactUsUrl);
  }

  home() {
    this.menu.close();
    this.router.navigate(['view'], { replaceUrl: true });
  }

  editJoinRequest() {
    this.menu.close();
    this.router.navigate(["edit"], { replaceUrl: true });
  }

  attachments() {
    this.menu.close();
    this.router.navigate(["attachments"], { replaceUrl: true });
  }

  async getInterviewSettings() {
    let subUrl = Constants.baseUrl + "/interview";
    let formDataSub = new FormData();
    formDataSub.append('transaction', 'select_list');
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true
    }
    try {
      let responseSub = await this.httpClient.post(subUrl, formDataSub, options).toPromise();
      if ((responseSub != null) && (responseSub['status'] == 200)) {
        let resultset = responseSub['body']['interviewSettings'];
        if (resultset === "true") {
          this.showInterview = true;
        } else {
          this.showInterview = false;
        }
      }
    } catch (error) {
      this.showInterview = false;
      console.log(error);
    }
  }

  getRegistrationData() {
    let servletUrl: string = Constants.baseUrl + '/registration';
    const formData = new FormData();
    formData.append('transaction', 'select');
    this.eSendForm(this, 'select_registration_data', servletUrl, formData);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: this.i18n.get("corr.global.askLogout", "Are you sure To Logout ?"),
      cssClass: 'custom-alert',
      animated: true,
      buttons: [
        {
          text: this.i18n.get("corr.global.no", "No"),
          cssClass: 'alert-button-cancel'
        },
        {
          text: this.i18n.get("corr.global.yes", "Yes"),
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.dialog.closeAll();
            this.ws.doLogOut();
          }
        },
      ],
    });

    await alert.present();
  }

  exitApp() {
    if (isPlatform('capacitor')) {
      App.exitApp();
    }
  }

  backToHome() {
    const currentTime: Date = new Date();
    let params = { "r": currentTime.toLocaleTimeString() };
    this.router.navigate(['/home'], {
      replaceUrl: true,
      queryParams: {
        params: this.provider.encrypt(JSON.stringify(params)), //JSON.stringify(params),
        skipLocationChange: true
      }
    });
  }



  setFaviconAndTitle(faviconPath: string, title: string, faviconType: string = 'image/png') {
    // Set favicon
    const setFavicon = () => {
      // Find the <head> element
      const head = document.querySelector('head');

      // Create a new <link> element for the favicon
      const favicon = document.createElement('link');

      // Set attributes for the favicon <link> element
      favicon.rel = 'icon';
      favicon.type = faviconType;
      favicon.href = faviconPath;

      // Append the favicon <link> element to the <head>
      head.appendChild(favicon);
    };

    // Set title
    const setTitle = () => {
      document.title = title;
    };

    // Call both functions
    setFavicon();
    setTitle();
  }

  eSendForm(handler: any, key: string, backendURL: string, formData: FormData) {
    formData.append('lang', this.lang);
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true,
    };
    this.httpClient.post<SmartResponse>(backendURL, formData, options)
      .subscribe(
        (event) => {
          try {
            handler.eResponseEvent(key, event);
          } catch (error) {
            console.error("Response is success but 'responseEvent' implementation throws error => " + error);
          }
        },
        (exception) => {
          handler.eResponseFailure(key, exception);
        }
      );
  }

  eResponse(key: string, smartResponse: SmartResponse) {
    if (key === "select_registration_data") {
      if (smartResponse['studentRecord']) {
        this.studentStatusRecord = <StudentStatusRecord>smartResponse['studentRecord'];
      }
    }
  }

  eResponseSuccess(key: string, smartResponse: SmartResponse) {
    try {
      this.eResponse(key, smartResponse);
    } catch (error) {
      console.error("Response is success but 'response' implementation in component  throws error => " + error);
    }
  }

  eFailure(key: string, exception: any) {
    console.log('key >> ' + key + ' ,  exception ' + JSON.stringify(exception, null, 4));
    if (key === "update_registration_data") {
      let error = exception['error'];
      let errorKey = error['errors'][0];
      this.ui.error(this.i18n.get('corr.' + errorKey, errorKey));
    }
  }

  eResponseFailure(key: string, exception: any) {
    try {
      this.eFailure(key, exception);
    } catch (error) {
      console.error("Response is success but 'response' implementation throws error => " + error);
    }
  }

  eResponseEvent(key: string, event: HttpEvent<any>) {
    if (event.type === HttpEventType.Sent) {
      //The request was sent out over the wire.
      console.log('event Sent => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.UploadProgress) {
      //An upload progress event was received.
      console.log('event UploadProgress => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.ResponseHeader) {
      //The response status code and headers were received.
      console.log('event ResponseHeader => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.DownloadProgress) {
      //A download progress event was received.
      console.log('event DownloadProgress => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.Response) {
      //The full response including the body was received.
      let smartResponse = <SmartResponse>event.body;
      this.eResponseSuccess(key, smartResponse);
    }
    if (event.type === HttpEventType.User) {
      //A custom event from an interceptor or a backend.
      console.log('event User => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
  }

}