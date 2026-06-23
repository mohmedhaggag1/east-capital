export class StudentRequestPayment {
    id?: number = 0;
    request_id?: number = 0;
    payment_type?: string = 'visa';
    credit_card_no?: string = '';
    credit_card_expiry_date?: string = '';
    cvc?: string = '';
    refrance_no?: string = '';
    total_payment?: number = 0;
}