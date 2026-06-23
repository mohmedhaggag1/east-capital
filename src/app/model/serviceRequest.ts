export class ServiceRequest {
    id?: number = 0;
    request_date?: string = '';
    request_type?: string = '1';
    academic_year_code?: string = '';
    academic_year_name?: string = '';
    semester_code?: string = '';
    semester_name?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    student_code?: string = '';
    student_name?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    scholarship_types_id?: string = '0';
    subject?: string = '';
    comments?: string = '';
    step_status?: string = '';
    bcase_trn_id?: number = 0;
    bcase_trn_relative_id?: number = 0;
    draft_id?: number = 0;
    approved_flag?: number = 0;
    insert_user_id?: number = 0;
    insert_timestamp?: string = '';
    scholarship_types_name?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    serial?: number = 0;
    suggestion_date_action?: string;
    receive_date_action?: string;
    
    total_payment:number = 0;
    ref_no?: string = '';
    course_code?: string = '';
    reciept_country_id?: string = '';
    reciept_governate_id?: string = '';
    reciept_city_id?: string = '';
    reciept_address?: string = '';
}

export class ServiceRequestDtl {
    id?: number = 0;
    request_id?: number = 0;
    revenue_type_code?: number = 0;
    due_value?: number = 0;
    value_type?: string = '1';
    percentage_value?: number = 0;
    dis_value?: number = 0;
    ttl_value?: number = 0;
    net_value?: number = 0;
    calc_way?: string = '';
    currency_id?: number = 0;
    currencyNameFin?: string= '';
    due_date?: string= '';
    payment_code?: string= '';
    refrance_no?: string= '';
    payment_flag?: string= '';
    payment_way?: string= '';
    payment_type?: string= ''; 
}