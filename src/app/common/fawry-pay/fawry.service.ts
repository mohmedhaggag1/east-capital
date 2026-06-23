import { Injectable } from '@angular/core';
declare var FawryPay: any;

@Injectable({
  providedIn: 'root'
})
export class FawryPayService {
  //FAWRY
  public static FAWRY_MERCHANT_CODE: string = '';                         // provided by fawry (fawry dashboard)
  public static FAWRY_SECURITY_KEY: string = '';  // provided by fawry (fawry dashboard)
  public static FAWRY_EXPIRY_DATE_COUNTER: number = 1;
  private FawryPay: any;
  constructor() {
    this.FawryPay = null;
  }

  load() {
    this.FawryPay = FawryPay;
  }

  get(): any {
    try {
      if (this.FawryPay == null) {
        this.FawryPay = (<any>window).FawryPay;
        if (this.FawryPay == null) {
          this.load();
          return null;
        }
      }
      return this.FawryPay;
    } catch (error) {
      let exception: any = <Error><unknown>error;
      console.error("Error: (FawryPay.get)=> " + exception.name + " - " + exception.message + "\n" + exception.stack);
    }
    return null;
  }
}