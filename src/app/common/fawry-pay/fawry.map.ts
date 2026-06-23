import { SHA256 } from 'crypto-js';

export const FAWRY_DISPLAY_MODE = {
    POPUP: 'POPUP',
    INSIDE_PAGE: 'INSIDE_PAGE',
    SIDE_PAGE: 'SIDE_PAGE',
    SEPARATED: 'SEPARATED',
}

export class FawryPay {

    fawry_pay_object: any;
    constructor(fawry_pay_object: any) {
        this.fawry_pay_object = fawry_pay_object;
    }

    checkout(chargeRequest: any, config: any, accessToken: any): void {
        this.fawry_pay_object.checkout(chargeRequest, config, accessToken);
    }

    /*captureOrderInfo(chargeRequest: any, config: any, accessToken: any): void {
        this.fawry_pay_object.captureOrderInfo(chargeRequest, config, accessToken);
    }*/


    loadPlugin(paymentId: any, config: any): void {
        this.fawry_pay_object.loadPlugin(paymentId, config);
    }

    getIframStyleBasedOnMode(mode: any): any {
        return this.fawry_pay_object.getIframStyleBasedOnMode(mode);
    }

    createDiv(): any {
        return this.fawry_pay_object.createDiv();
    }

    checkStatus(): boolean {
        return this.fawry_pay_object != null;
    }

    // Signature(fawry_signature_plain_message: string): any {
    //     // encode as UTF-8
    //     const msgBuffer = new TextEncoder().encode(fawry_signature_plain_message);
    //     // hash the message
    //     return crypto.subtle.digest('SHA-256', msgBuffer);
    //     //SHA-256 "merchantCode + merchantRefNum + customerProfileId (if exists, otherwise insert "") + returnUrl + itemId + quantity + Price (in tow decimal format like ‘10.00’) + Secure hash key
    // }

    signRequest(chargeRequest: any): string {
        let signString = chargeRequest.merchantCode + chargeRequest.merchantRefNum;
        signString += chargeRequest.customerProfileId != null ? chargeRequest.customerProfileId : '';
        signString += chargeRequest.returnUrl != null ? chargeRequest.returnUrl : '';

        const items = chargeRequest.chargeItems.sort((x, y) => {
            let a = x.itemId.toUpperCase();
            let b = y.itemId.toUpperCase();
            return a === b ? 0 : a > b ? 1 : -1;
        });

        items.forEach(item => {
            signString += item.itemId + '' + item.quantity + '' + item.price.toFixed(2);
        });

        signString += chargeRequest.secKey;

        // Hash the signString using SHA-256
        return SHA256(signString).toString();
    }
}