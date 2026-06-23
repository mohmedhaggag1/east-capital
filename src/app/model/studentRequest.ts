export class StudentRequest {
    id?: number = 0;
    first_name_ar?: string = '';
    middle_name_ar?: string = '';
    grand_name_ar?: string = '';
    surname_ar?: string = '';
    first_name_en?: string = '';
    middle_name_en?: string = '';
    grand_name_en?: string = '';
    surname_en?: string = '';
    category_flag?: string = '1';
    school_name?: string = "";
    pre_university_degree?: string = "0";

    specializ_id?: string = "0";
    high_school_final_percentage?: number = 0;
    high_school_seat_number?: string = "";

    degree_year?: string = "0";
    wish_academy_code_1?: string = '';
    religion?: number = 0;
    gender?: string = "1";
    citizen_serial_type?: string = "0";//"1";
    citizen_serial?: string = '';
    birth_date?: any = '';
    gov_code?: string = '';
    request_status?: number = 0;

    main_category_flag?: string = '1';
    country_id?: string;
    program_code?: string;
    student_case_type?: string;
    grade_id?: string = '';
    academy_language_id?: string = '';
    attachment_reference_no?: string = '';
    student_code?: string = '';
    request_reference?: string = '';
    username?: string = '';
    open_semester_id?: string = '';

    ads_reference?: string = '';
    is_paid_registration_fees?: number = 0;
    essay?: string = '';
    lock_essay?: number = 0;
    insert_timestamp?: string = '';
    last_update_timestamp?: string = '';
    request_type?: number = 1;
    passport_issuance_date?: string = '';
    passport_expiry_date?: string = '';
    birth_country_id?: string = '';
    certificate_country_id?: string = '';

    // new Flds
    certificate_gov_id?: string = '';
    certificate_school_id?: string = '';
    miliarity_governorate_id?: string = '';
    miliarity_region_id?: string = '';
    recruit_dec_no_part1?: string = '';
    recruit_dec_no_part2?: string = '';
    recruit_dec_no_part3?: string = '';

    accept_terms?: number = 0;
    is_transfer?: number = 0;

    heard_about_us?: string []= [];
    heard_about_us_other?: string = '';
    has_chronic_diseases?: number = 0;
    chronic_diseases_details?: string = '';
    use_university_transportation?: number = 0;
    transportation_area_id?: string = '';
    is_father_past_away?: number = 0;
    is_mother_past_away?: number = 0;
    is_early?: number = 0;
    have_any_siblings?: number = 0;

    is_paid_first_semester_fees?: number = 0;
    certificate_country_name?: string = '';

    // View Only flds
    remain_value?: number = 0;
    due_value?: number = 0;
    fawry_settings_id?: number = 0;
    //-----------------------------------
    first_semester_remain_value?: number = 0;
    first_semester_due_value?: number = 0;
    first_semester_fawry_settings_id?: number = 0;
}

export class StudentStatusRecord {
    is_approve?: number = 0;
    is_initial_approve?: number = 0;
    tansik_status?: number = 0;
    tansik_msg?: string = '';
}

export class StudentRequestComerInfo {
    id?: number = 0;
    student_request_id?: number = 0;
    is_study_in_egypt?: number = 2;
    study_in_egypt_ref_no?: string = '';
    is_there_broker?: number = 2;
    broker_name?: string = '';
    broker_phone_no?: string = '';
    broker_phone_no_is_whatsapp?: number = 2;
    is_need_university_residences?: number = 2;
    is_chronic_diseases?: number = 2;
    chronic_diseases?: string = '';
    is_special_needs?: number = 2;
    special_needs?: string = '';
    is_residence_in_egypt?: number = 2;
    residency_expiry_date?: string = '';
    place_of_issuance?: string = '';
}


export class StudentRequestSiblings {
    id?: number = 0;
    student_request_id?: number = 0;
    search_value?: string = '';
    sibling_student_code?: string = '';
    student_name?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    academy_name?: { ar: string, en: string } = { 'ar': '', 'en': '' };
}

export class DiplomaDetails {
    id?: number = 0;
    request_id?: number = 0;
    diploma_type?: string = '0';
    diploma_username?: string = '';
    diploma_password?: string = '';
}