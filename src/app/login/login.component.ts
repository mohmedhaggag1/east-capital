/**
 * @author Mohammad Zidan
 * <a href="mailto:mohamed.zidan@esmartsoft.com.eg">mohamed.zidan@esmartsoft.com.eg</a>
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProvider } from '../providers/DataProvider';
import { I18N } from '../providers/i18n.provider';
import { Subscription } from 'rxjs';
import { HttpParams, HttpHeaders, HttpClient } from '@angular/common/http';
import { Users } from '../model/users';
import { Constants } from '../providers/Constants';
import { SessionProvider } from '../providers/session.provider';
import { WebsocketService } from '../providers/websocket.service';
import { UIService } from '../providers/ui.service';
import { FingerprintAIO, FingerprintOptions } from '@ionic-native/fingerprint-aio/ngx';
import { isPlatform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Q } from '../providers/q';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  sublang: Subscription;
  lang: string = "en";
  direction: boolean = true;

  userName: string = "";
  password: string = "";
  startCheckVerify: boolean = false;

  fingerprintOptions: FingerprintOptions;
  isMobile: boolean = false;

  logo: string = "";

  constructor(
    private provider: DataProvider,
    public i18n: I18N,
    private router: Router,
    private session: SessionProvider,
    private ws: WebsocketService,
    private ui: UIService,
    private httpClient: HttpClient,
    private fingerAuth: FingerprintAIO,
    private geolocation: Geolocation,
    private activatedRoute: ActivatedRoute) {

  }

  ngOnInit() {
    if (Constants.company !== '') {
      this.logo = "logo2-" + Constants.company;
    }
    if (isPlatform('capacitor')) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.sublang = this.i18n.observeLanguage().subscribe({
      next: (lang) => {
        this.lang = lang;
        this.direction = this.provider.getDirection(this.lang);
      }
    });

    if (this.session.isLoggedIn()) {
      if ((document.URL.includes('/registration')) || (document.URL.includes('/login'))) {
        this.router.navigate(['view'], { replaceUrl: true });
      }
    }
    this.lang = I18N.lang;
    this.direction = this.provider.getDirection(this.lang);

    this.activatedRoute.queryParams.subscribe(paramList => {
      let params = {};
      try {
        params = JSON.parse(this.provider.decrypt(paramList['params']));
        if (typeof params['params'] !== 'undefined') {
          params = JSON.parse(params['params']);
        }
      } catch (error) {
        params = {};
      }
      if (Object.keys(params).length === 0) {
        this.activatedRoute.params.subscribe((pramTmp) => {
          params = pramTmp;
        });
      }
      if ((typeof params['username'] != 'undefined') && (params['username'] != null) && (params['username'] != '')) {
        this.userName = params['username'];
      }
      if ((typeof params['password'] != 'undefined') && (params['password'] != null) && (params['password'] != '')) {
        this.password = params['password'];
      }
      if ((this.userName != '') && (this.password != '')) {
        this.login();
      }
    });
  }


  ngOnDestroy() {
    if (this.sublang) {
      this.sublang.unsubscribe();
    }
  }

  login() {
    this.startCheckVerify = true;
    let msg = "";
    let isThereError: boolean = false;
    if ((typeof this.userName === 'undefined') || (this.userName === null) || (this.userName === '')) {
      isThereError = true;
      msg += this.i18n.get("corr.global.ERROR_EMPTY_USERNAME", "ERROR_EMPTY_USERNAME");
      this.startCheckVerify = false;
    }

    if ((typeof this.password === 'undefined') || (this.password === null) || (this.password === '')) {
      isThereError = true;
      if (msg !== "") {
        msg += "<br>";
      }
      msg += this.i18n.get("corr.global.ERROR_EMPTY_PASSWORD", "ERROR_EMPTY_PASSWORD");
      this.startCheckVerify = false;
    }

    if (isThereError) {
      this.ui.error(msg);
      return;
    } 

    let servletUrl = Constants.baseUrl + "/login";
    let parameter: HttpParams = new HttpParams()
      .append("userName", this.userName)
      .append("userPassword", this.password)
    let options: any = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      params: parameter,
      reportProgress: true as const,
      observe: 'body' as const,
      responseType: 'json' as const,
      withCredentials: true
    };
    this.httpClient.post<any>(servletUrl, "", options)
      .subscribe((response) => {
        try {
          if (response['code'] === 200) {
            SessionProvider.user = response['user'];
            Constants.httpOptions.headers['cloud-session'] = response['JSESSIONID'];
            Constants.httpOptions.headers['un'] = SessionProvider.user.username;
            Q.t(1, SessionProvider.user[""]);
            localStorage.removeItem('user');
            localStorage.removeItem('cloud-session');
            localStorage.removeItem('login_guid');
            localStorage.removeItem('fingerprint-record');
            localStorage.setItem('cloud-session', response['JSESSIONID']);
            localStorage.setItem('login_guid', response['login_guid']);
            localStorage.setItem('user', this.provider.encrypt(JSON.stringify(SessionProvider.user)));
            let fingerprintRecord = { u: "", p: "" };
            fingerprintRecord.u = this.userName;
            fingerprintRecord.p = this.password;
            localStorage.setItem('fingerprint-record', this.provider.encrypt(JSON.stringify(fingerprintRecord)));
            setTimeout(() => {
              SessionProvider.subject_user.next(SessionProvider.user);
              this.ws.checkUserSession();
              this.router.navigate(['view'], { replaceUrl: true });
            }, 1000);
          } else {
            this.ui.error(this.i18n.get('corr.global.' + response['message'], "Error ... "));
            this.startCheckVerify = false;
          }
        } catch (error) {
          SessionProvider.user = new Users();
          SessionProvider.subject_user.next(SessionProvider.user);
          this.ui.error(this.i18n.get("corr.global.EXCEPTION_GETTING_USER_DATA", "EXCEPTION_GETTING_USER_DATA"));
          this.startCheckVerify = false;
        }
      }, (exception) => {
        console.trace(exception);
        this.ui.error(this.i18n.get("corr.global.EXCEPTION_GETTING_USER_DATA", "EXCEPTION_GETTING_USER_DATA"));
        this.startCheckVerify = false;
      });
  }

  forgetPassword() {
    this.router.navigate(["forget-password"], { replaceUrl: true });
  }

  async LoginWithFingerprintAuthDlg() {
    this.fingerprintOptions = {
      title: "Chat-App",
      subtitle: "eSmartSoft",
      //cancelButtonTitle: "Not Now",
      disableBackup: true  //Only for Android(optional)
    }

    try {
      console.log('############# Start Call Fingerprint #############');
      await this.fingerAuth.isAvailable().then(result => {
        //console.log(result);
        //this.ui.info(result);
        if ((result === "OK") || (result === "biometric")) {
          this.fingerAuth.show(this.fingerprintOptions)
            .then((data: any) => {

              console.log(localStorage.getItem('fingerprint-record'));

              if ((localStorage.getItem('fingerprint-record') != null) && (localStorage.getItem('fingerprint-record') != "")) {
                let fingerprintRecord = { u: "", p: "" };
                fingerprintRecord = JSON.parse(this.provider.decrypt(localStorage.getItem('fingerprint-record')));
                this.userName = fingerprintRecord.u;
                this.password = fingerprintRecord.p;
                this.login();
              } else {
                this.ui.info("This is First Login Please Enter User Name & Password To And Press Login");
              }
              console.log('############# Fingerprint is OK #############');
            })
            .catch((error: any) => {
              console.trace(error);
              this.ui.info('Fingerprint Is Not Recognized');
            });
        }
      });
    } catch (error) {
      this.ui.error("Fingerprint Not Supported On Your Device");
      console.log('############# Error 1 Call Fingerprint #############');
      console.trace(error);
    }
  }
  test() {
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      try {
        this.ui.info('latitude >> ' + data['coords'].latitude);
        this.ui.info('longitude >> ' + data['coords'].longitude);
      } catch (error) {
        this.ui.error('' + data);
      }
      // data can be a set of coordinates, or an error (if an error occurred).
      // data.coords.latitude
      // data.coords.longitude
    });
  }
}
