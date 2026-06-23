export class Users {
    id?: number = 0;
    person_id?: number = 0;
    job_title?: string = '';
    active?: string = '';
    username?: string = '';
    full_name?: string = '';
    full_name_en?: string = '';
    created?: string = '';
    updated?: string = '';
    email?: string = '';
    space?: string = '';
    usercol?: string = '';
    avatar?: string = '';
    gender?: string = '1';
    fcm_token?: string = '';
}

export class Email {
    id?: number = 0;
    person_id?: number = 0;
    email?: string = '';
    is_default?: string = '';
}

export class Phone {
    id?: number = 0;
    person_id?: number = 0;
    phone_name?: string = '';
    phone?: string = '';
    sms?: string = '';
    os?: string = '';
    os_serial?: string = '';
}