import { Component, Input, OnInit } from '@angular/core';
import { FawryPayService } from './fawry.service';
import { FawryPay, FAWRY_DISPLAY_MODE } from './fawry.map';
import { HttpClient } from '@angular/common/http';
import { Constants } from 'src/app/providers/Constants';
import { Subscription } from 'rxjs';
import { I18N } from 'src/app/providers/i18n.provider';
import { DataProvider } from 'src/app/providers/DataProvider';
import { UIService } from 'src/app/providers/ui.service';
import { FawrySettings } from 'src/app/model/fawrySettings';
import { AnalyticsService } from 'src/app/providers/analytics/analytics.service';

@Component({
  selector: 'app-fawry-pay',
  templateUrl: './fawry-pay.component.html',
  styleUrls: ['./fawry-pay.component.scss'],
})
export class FawryPayComponent implements OnInit {

  @Input() FAWRY_RETURN_URL: string = '';                   // user url
  @Input() requestId: number = 0;
  @Input() fawrySettingId: number = 0;
  @Input() requestScreenName: string = '';

  merchantRefNum: string = '';                     // request generated ref number ( example : request_code ) //must be unique for the whole system // so you will get this code in the backend after the customer make a payment

  @Input() itemId: number = 0;                              // request generated id  ( example : request_id )
  @Input() quantity: string = '1';                          // quantity of this item 
  @Input() price: string = '0.00';                          // Price (in tow decimal format like ‘10.00’) 
  @Input() description: string = '';                        // description of the request (which appears on fawry machine)
  @Input() imageUrl: string = '';                           // imageUrl of item/service (if exist)

  @Input() customerMobile: string = '';                     // Mobile of the customer (if exist)
  @Input() customerEmail: string = '';                      // Email of the customer (if exist)
  @Input() customerName: string = '';                       // Name of the customer (if exist)

  @Input() fawryBtnId: string = 'fawry-payment-btn'; // Default value
  // @Output() signature = new EventEmitter<string>();         // generated signature for this payment request // you must save this signature of this request into db
  fawry_pay: FawryPay;

  sublang: Subscription;
  lang: string = "en";
  direction: boolean = true;

  constructor(public fawry_pay_service: FawryPayService,
    public i18n: I18N,
    private provider: DataProvider,
    private ui: UIService,
    private httpClient: HttpClient,
    private analytics: AnalyticsService) {
    this.fawry_pay_service.load();
    this.fawry_pay = new FawryPay(this.fawry_pay_service.get());
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

  //SHA-256 "merchantCode + merchantRefNum + customerProfileId (if exists, otherwise insert "") + returnUrl + itemId + quantity + Price (in tow decimal format like ‘10.00’) + Secure hash key
  //let fawry_signature_plain_message: string = 
  //  FawryPayService.FAWRY_MERCHANT_CODE + "23124654641212" /*this.merchantRefNum()*/ + "" + FawryPayService.FAWRY_RETURN_URL
  //  + /*this.masterRecord.id*/ '69' + '1' + 75.25.toString() + FawryPayService.FAWRY_SECURITY_KEY;
  async checkout() {
    if (this.fawrySettingId <= 0) {
      this.ui.error(this.i18n.get('corr.errMissingFawrySettings', 'Error please try again Later or Contact Site Administrator'));
      return;
    }
    let url = Constants.baseUrl + "/crd/fawrysettings";
    let formData = new FormData();
    formData.append('transaction', 'select');
    formData.append('fawrySettingId', this.fawrySettingId.toString());
    formData.append("lang", "" + this.lang);
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true
    }
    await this.httpClient.post(url, formData, options)
      .toPromise()
      .then(async response => {
        if ((response != null) && (response['status'] == 200)) {
          let fawrySettings = <FawrySettings>response['body']['resultset'][0]['masterRecordData'];
          FawryPayService.FAWRY_MERCHANT_CODE = fawrySettings.fawry_merchant_code;
          FawryPayService.FAWRY_SECURITY_KEY = fawrySettings.fawry_security_key;
          FawryPayService.FAWRY_EXPIRY_DATE_COUNTER = fawrySettings.expiry_date_counter;

          // Insert New merchant Ref Num
          let subUrl = Constants.baseUrl + "/crd/requestfawrypaymentlog";
          let formDataSub = new FormData();
          formDataSub.append('transaction', 'insert');
          formDataSub.append("requestId", this.requestId.toString());
          formDataSub.append('fawrySettingId', this.fawrySettingId.toString());
          formDataSub.append("requestScreenName", "" + this.requestScreenName);
          await this.httpClient.post(subUrl, formDataSub, options)
            .toPromise()
            .then(responseSub => {
              if ((responseSub != null) && (responseSub['status'] == 200)) {
                this.merchantRefNum = responseSub['body']['merchantRefNum'];
                this.sendRequestToFawry();
              } else {
                this.ui.error(this.i18n.get('corr.errWhileCreateMerchantRefNum', 'Error please try again Later or Contact Site Administrator'));
              }
            }).catch(error => {
              console.log(error);
              this.ui.error(this.i18n.get('corr.errWhileCreateMerchantRefNum', 'Error please try again Later or Contact Site Administrator'));
            });
        } else {
          this.ui.error(this.i18n.get('corr.errMissingFawrySettings', 'Error please try again Later or Contact Site Administrator'));
        }
      }).catch(error => {
        console.log(error);
        this.ui.error(this.i18n.get('corr.errMissingFawrySettings', 'Error please try again Later or Contact Site Administrator'));
      });
  }

  sendRequestToFawry() {
    this.analytics.paymentStarted();
    this.initiatePayment([
      {
        itemId: this.itemId,
        description: this.description,
        price: parseFloat(this.price),
        quantity: parseFloat(this.quantity),
        imageUrl: this.imageUrl,
      }
    ]);
  }

  initiatePayment(charge_item_list: any[]) {
    // Get the dates
    const today = new Date();
    const tomorrow = new Date(today.setDate(today.getDate() + FawryPayService.FAWRY_EXPIRY_DATE_COUNTER));
    let expire_date: string = tomorrow.getTime().toString();
    const configuration = {
      locale: "en",  //default en
      mode: FAWRY_DISPLAY_MODE.POPUP,  //required, allowed values [POPUP, INSIDE_PAGE, SIDE_PAGE , SEPARATED]
    };

    // For Testing --------------------------------------------
    // const currentTimestamp = Date.now();
    // const futureTimestamp = currentTimestamp + (1 * 60 * 60 * 1000);
    // let merchantRefNum = Math.floor((Math.random() * 100000000) + 1);
    // let chargeRequest = {
    //   merchantCode: '770000019442',
    //   merchantRefNum: '01234567891',
    //   customerProfileId: '',
    //   customerName: '',
    //   customerMobile: '01234567891',
    //   customerEmail: 'Abdelrahman.Salem@Fawry.com',
    //   paymentExpiry: futureTimestamp,
    //   chargeItems: [
    //     {
    //       itemId: '6b5f',
    //       description: 'test item description Product 2',
    //       price: 1000.00,
    //       quantity: 1
    //     },
    //     {
    //       itemId: '10b5f6',
    //       description: 'Product 1',
    //       price: 400.00,
    //       quantity: 2
    //     }
    //   ],
    //   returnUrl: 'https://developer.fawrystaging.com',
    //   // paymentMethod: "PayAtFawry,CARD,MWALLET",
    //   paymentMethod: "",
    //   authCaptureModePayment: false,
    //   description: "test description",
    //   secKey: "4f362513-7601-4126-94cc-b833c40e4185",
    //   signature: ''
    // };

    let chargeRequest = {
      merchantCode: FawryPayService.FAWRY_MERCHANT_CODE,
      merchantRefNum: this.merchantRefNum,
      customerMobile: this.customerMobile,
      customerEmail: this.customerEmail,
      customerName: this.customerName,
      customerProfileId: '',
      paymentExpiry: expire_date,
      chargeItems: charge_item_list,
      returnUrl: this.FAWRY_RETURN_URL,
      authCaptureModePayment: false,
      signature: '',
      paymentSource: 'NEW_PLUGIN',
      paymentMethod: "",
      secKey: FawryPayService.FAWRY_SECURITY_KEY,
    };
    chargeRequest.signature = this.fawry_pay.signRequest(chargeRequest);
    this.fawry_pay.checkout(chargeRequest, configuration, FawryPayService.FAWRY_SECURITY_KEY);
  }
}