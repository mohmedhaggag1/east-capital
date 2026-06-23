/**
 * @author Mohammad Zidan
 * <a href="mailto:mohamed.zidan@esmartsoft.com.eg">mohamed.zidan@esmartsoft.com.eg</a>
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataProvider } from '../providers/DataProvider';
import { I18N } from '../providers/i18n.provider';
import { Constants } from '../providers/Constants';
import { UIService } from '../providers/ui.service';
import { SmartResponse } from '../model/smart-communication';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {

  sublang: Subscription;
  lang: string = "ar";
  direction: boolean = true;
  activeMask: boolean = false;
  ttlRequest: number = 0;
  citizen_serial_type: string = "1";
  citizen_serial: string = "";

  constructor(
    private router: Router,
    private provider: DataProvider,
    private httpClient: HttpClient,
    private ui: UIService,
    public i18n: I18N) {
  }

  ngOnInit() {
    this.sublang = this.i18n.observeLanguage().subscribe({
      next: (lang) => {
        this.lang = lang;
        this.direction = this.provider.getDirection(this.lang);
      }
    });
    this.lang = I18N.lang;
    this.direction = this.provider.getDirection(this.lang);
  }

  ngOnDestroy() {
    if (this.sublang) {
      this.sublang.unsubscribe();
    }
  }

  login() {
    this.router.navigate(["login"], { replaceUrl: true });
  }

  forgetPassword() {
    if (this.citizen_serial.length > 0) {
      let servletUrl: string = Constants.baseUrl + '/forgetpassword';
      const formData = new FormData();
      formData.append('citizenSerialType', '' + this.citizen_serial_type);
      formData.append('citizenSerial', '' + this.citizen_serial);
      formData.append('transaction', 'insert');
      this.eSendForm(this, 'rec_insert', servletUrl, formData);
    } else {
      this.ui.error(this.i18n.get("corr.ERROR_EMPTY_FLD", "ERROR_EMPTY_FLD"));
    }
  }

  eSendForm(
    handler: any,
    key: string,
    backendURL: string,
    formData: FormData) {
    this.activeMask = true;
    this.ttlRequest += 1;
    formData.append('lang', this.lang);
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true
    }
    this.httpClient.post<SmartResponse>(backendURL, formData, options)
      .subscribe((event) => {
        try {
          handler.eResponseEvent(key, event);
        } catch (error) {
          console.error("Response is success but 'responseEvent' implementation throws error => " + error);
        }
      }, (exception) => {
        handler.eResponseFailure(key, exception);
      });
  }

  /*Common Reselt between GET POST sendFORM*/
  eResponse(key: string, smartResponse: SmartResponse) {
    //console.log("Transaction '"+key+"' SUCCESS => \n" + JSON.stringify(smartResponse, null, 4));
    if (key === "rec_insert") {
      this.ui.success(this.i18n.get("corr.global.mailSent", "mailSent"));
    }
  }

  eResponseSuccess(key: string, smartResponse: SmartResponse) {
    try {
      this.eResponse(key, smartResponse);
      this.ttlRequest = this.ttlRequest - 1;
      if (this.ttlRequest <= 0) {
        this.ttlRequest = 0;
        setTimeout(() => { this.activeMask = false; }, 1000);
      }
    } catch (error) {
      console.error("Response is success but 'response' implementation in component  throws error => " + error);
      this.ttlRequest = this.ttlRequest - 1;
      if (this.ttlRequest <= 0) {
        this.ttlRequest = 0;
        setTimeout(() => { this.activeMask = false; }, 1000);
      }
    }
  }

  eFailure(key: string, exception: any) {
    console.log("key >> " + key + " ,  exception " + JSON.stringify(exception, null, 4));
    this.ttlRequest = this.ttlRequest - 1;
    if (this.ttlRequest <= 0) {
      this.ttlRequest = 0;
      setTimeout(() => { this.activeMask = false; }, 5000);
    }
    if (key === "rec_insert") {
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
      //console.log("event Sent => " + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.UploadProgress) {
      //An upload progress event was received.
      //console.log("event UploadProgress => " + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.ResponseHeader) {
      //The response status code and headers were received.
      //console.log("event ResponseHeader => " + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.DownloadProgress) {
      //A download progress event was received.
      //console.log("event DownloadProgress => " + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.Response) {
      //The full response including the body was received.
      let smartResponse = <SmartResponse>event.body;
      this.eResponseSuccess(key, smartResponse);
    }
    if (event.type === HttpEventType.User) {
      //A custom event from an interceptor or a backend.
      //console.log('event User => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
  }
} 
