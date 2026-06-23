export class FawrySettings {
    id?: number = 0;
    fawry_merchant_code?: string = '';
    fawry_security_key?: string = '';
    is_production?: boolean | false;
    is_active?: boolean | false;
    expiry_date_counter?: number = 0;
}

export class FawryPayHistory{
    referenceNumber?: string = '';
    merchantRefNumber?: string = '';
    orderStatus?: string = '';
    paymentMethod?: string = '';
    expirationTime?: string = '';
    paymentTime?: string = '';
    statusDescription?: string = '';
    cardLastFourDigits?: string = '';
    action_timestamp?: string = '';

}
