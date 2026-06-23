import { HttpHeaders } from '@angular/common/http';
import { EssaySettings } from '../model/essaySettings';
import { Subject } from 'rxjs';
import { SocialMedia } from '../model/socialMedia';

export class Constants {

    public static loaded: boolean = false;

    public static httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        reportProgress: true as const,
        observe: 'events' as const,
        withCredentials: true
    };
    public static subject_essaySettings = new Subject<EssaySettings>();
    public static essaySettings: EssaySettings = new EssaySettings();
    public static protocol: string = "https://";
    public static baseUrl: string = Constants.protocol + "localhost:8901";
    public static ls_fcm_token: string = "";
    public static defualtUploadSys: string = "";
    public static COOKIE_JSESSIONID_NAME: string = "CHAT_PORTAL_JSESSIONID";
    
    public static populate_academyCode_way: string = "open_semester";
    public static initial_wishs_no: number = 0;
    
    public static mainHomeUrl = "";
    public static contactUsUrl = "";
    public static company = "";
    public static enable_payment: boolean = false;
    public static enable_attachments: boolean = false;
    public static max_age: number = 25;
    public static min_age: number = 15;
    public static enable_add_more_wishs: boolean = false;
    public static max_wishs: number = 2;
    public static mandatory_wishs_no: number = 1;
    public static min_heard_about_us_no: number = 1;
    public static max_heard_about_us_no: number = 2;
    public static file_uploade_max_size?: number = 0;

    public static enable_efinance_admission_fees: boolean = true;
    public static enable_fawry_admission_fees: boolean = true;

    public static enable_efinance_first_semester_fees: boolean = true;
    public static enable_fawry_first_semester_fees: boolean = true;
    public static enable_print_first_semester_fees: boolean = true;

    public static fawry_url_script: string = "";
    public static fawry_url_style: string = "";

    public static terms_conditions_url: string = "";
    public static privacy_policy_url: string = "";
    public static refund_policy_url: string = "";
    public static social_media: SocialMedia[] = [];
    public static contact_university: string[] = [];
    public static enable_google_tag_manager: boolean = false;
    public static enable_email_verification: boolean = false;
    public static enable_switch_lang: boolean = false;
    public static default_lang: string = "";
    public static hidden_flds: string[] = [];
    public static min_address_length: number = 20;
    public static dt: string = 'true';
}