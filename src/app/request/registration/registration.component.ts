import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Subscription } from 'rxjs';
import { Manipulate } from '../../model/data-manipulate';
import { SmartResponse } from '../../model/smart-communication';
import { Constants } from '../../providers/Constants';
import { DataProvider } from '../../providers/DataProvider';
import { UIService } from '../../providers/ui.service';
import { ComboBoxRec, WherePart } from '../../model/combobox';
import { ConfirmDialog } from '../../common/confirm-dialog/confirm-dialog';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DiplomaDetails, StudentRequest, StudentRequestComerInfo, StudentRequestSiblings } from '../../model/studentRequest';
import { StudentRequestContacts } from '../../model/studentRequestContacts';
import { I18N } from '../../providers/i18n.provider';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionProvider } from 'src/app/providers/session.provider';
import { StudentRequestWishes } from 'src/app/model/studentRequestWishes';
import { AdsSettings } from 'src/app/model/adsSettings';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { RegistrationHelp } from 'src/app/model/registration-help';
import { ThanksMessage } from 'src/app/model/thanksMessage';
import { ThanksMessageComponent } from './thanks-message/thanks-message.component';
import { TransformerUniversities } from 'src/app/model/transformerUniversities';
import { StudentRequestAchievements } from 'src/app/model/studentRequestAchievements';
import { MessageDialogComponent } from '../../common/message-dialog/message-dialog.component';
import { Discounts } from 'src/app/model/discounts';
import { LazyLoaderService } from 'src/app/providers/lazy-loader.service';
import { Academy } from 'src/app/model/academy';
import { AnalyticsService } from 'src/app/providers/analytics/analytics.service';
var progressInterval;

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})

export class RegistrationComponent implements OnInit {

  sublang: Subscription;
  lang: string = "en";
  direction: boolean = true;

  activeMask: boolean = false;
  ttlRequest: number = 0;

  deviceInfo = null;

  isDisabled: boolean = false;
  moduleName: string = 'student-portal';
  isEditMode: string = '';
  userRecord: any;

  studentAc: StudentRequest = new StudentRequest();
  comerInfo: StudentRequestComerInfo = new StudentRequestComerInfo();
  studentContactData: StudentRequestContacts = new StudentRequestContacts();
  parentContactData1: StudentRequestContacts = new StudentRequestContacts();
  parentContactData3: StudentRequestContacts = new StudentRequestContacts();

  wishesArray: StudentRequestWishes[] = [];
  transformerUniversitiesArr: TransformerUniversities[] = [];
  selectedTransformerUniversities: TransformerUniversities;
  siblingsArr: StudentRequestSiblings[] = [];
  studentRequestAchievementsArr: StudentRequestAchievements[] = [];
  diplomaDetailsArr: DiplomaDetails[] = [];
  selectedStudentRequestAchievements: StudentRequestAchievements;
  msg: { ar: string, en: string } = { 'ar': '', 'en': '' };
  adsSettingsArr: AdsSettings[] = [];
  registrationHelpArr: RegistrationHelp[] = [];
  thanksMessage = new ThanksMessage();
  welcomeMessage = new ThanksMessage();
  acknowledgeMessage = new ThanksMessage();

  showGovCode?: boolean = false;
  verificationCode: string;

  disabledCitizenSerialType?: boolean = false;

  comboxArrOpenSemester: ComboBoxRec[] = [];
  selectedOpenSemester: ComboBoxRec = new ComboBoxRec();
  comboxArrDegreeType: ComboBoxRec[] = [];
  selectedDegreeType: ComboBoxRec = new ComboBoxRec();
  comboxArrGovernorateCode: ComboBoxRec[] = [];
  comboxArrCountry: ComboBoxRec[] = [];
  comboxArrNationality: ComboBoxRec[] = [];
  comboxArrAcademy: ComboBoxRec[] = [];
  comboxArrCertObtainingYear: ComboBoxRec[] = [];
  comboxArr_relative_relation_id: ComboBoxRec[] = [];
  comboxArr_school_id: ComboBoxRec[] = [];
  comboxArr_miliarity_region: ComboBoxRec[] = [];
  comboxArr_specializ_id: ComboBoxRec[] = [];
  comboxArr_all_specializ_id: ComboBoxRec[] = [];
  comboxArr_recognized_universities: ComboBoxRec[] = [];
  comboxArr_recognized_collages: ComboBoxRec[] = [];
  comboxArrTransportationAreas: ComboBoxRec[] = [];

  searchText: string = '';
  requiredDocs: string = '';

  isLinear = true;
  orientation: string = 'horizontal';
  @ViewChild('stepper') stepper: MatStepper;

  resendOtpEnable: boolean = true;
  optExpirationPeriod: number = 0;

  startTime?: number = 0;
  duration?: number = (1 * 60) * 1000 // 1 minutes in milliseconds
  progressValue?: number;

  path: string;

  search_country_id?: string = '';
  search_std_mobile_country_code?: string = '';
  search_std_contact_gov_code?: string = '';
  search_parent_contact_gov_code1?: string = '';
  search_parent_contact_gov_code2?: string = '';
  search_parent_contact_gov_code3?: string = '';
  search_pre_university_degree?: string = '';
  search_birth_country_id?: string = '';
  search_std_address_country_id?: string = '';
  search_certificate_country_id?: string = '';
  search_certificate_school_id?: string = '';
  search_miliarity_governorate_id?: string = '';
  search_miliarity_region_id?: string = '';
  search_transportation_area_id?: string = '';
  search_mother_mobile_country_code?: string = '';
  search_father_mobile_country_code?: string = '';
  selectedCertificateCountry = new ComboBoxRec();
  selectedBirthCountryId = new ComboBoxRec();
  selectedTransformerFromCountry = new ComboBoxRec();

  enable_add_more_wishs: boolean = false;
  enable_email_verification: boolean = false;
  hidden_flds: string[] = [];

  discount: Discounts = new Discounts();
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  private countdownInterval: any;
  currentStepId: number = 0;

  addressTouched: boolean = false;
  mobileTouched: boolean = false;
  emailTouched: boolean = false;
  mobileParentTouched: boolean = false;
  emailParentTouched: boolean = false;
  min_address_length: number = 20;
  today: Date = new Date();
  constructor(
    public provider: DataProvider,
    public i18n: I18N,
    private ui: UIService,
    private httpClient: HttpClient,
    public dialog: MatDialog,
    private session: SessionProvider,
    private router: Router,
    private deviceService: DeviceDetectorService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private lazyLoader: LazyLoaderService,
    private analytics: AnalyticsService
  ) { }

  async ngOnInit() {
    this.analytics.admissionStarted();

    this.path = this.router.url.split('?')[0].replace('/', '');
    if (this.path === 'registration') {
      this.studentAc.request_type = 1;
    } else {
      this.studentAc.request_type = 2;
    }
    this.wishesArray.push(new StudentRequestWishes());
    if (this.session.isLoggedIn()) {
      if ((document.URL.includes('/registration')) || (document.URL.includes('/login'))) {
        this.router.navigate(['view'], { replaceUrl: true });
      }
    }
    this.activatedRoute.queryParams.subscribe(paramList => {
      let params = paramList;
      try {
        if (typeof params['params'] !== 'undefined') {
          params = JSON.parse(params['params']);
        }
      } catch (error) {
        params = {};
      }
      if (Object.keys(params).length === 0) {
        this.activatedRoute.params.subscribe((pramTmp) => {
          params = pramTmp;
        });
      }
      if (params['ref']) {
        localStorage.setItem('ref', params['ref']);
      }
    });
    this.epicFunction();
    this.sublang = this.i18n.observeLanguage().subscribe({
      next: (lang) => {
        this.lang = lang;
        this.direction = this.provider.getDirection(this.lang);
      }
    });
    this.lang = I18N.lang;
    this.direction = this.provider.getDirection(this.lang);
    this.studentAc.main_category_flag = '1';
    this.parentContactData1.relative_relation_id = "2"
    this.enable_add_more_wishs = Constants.enable_add_more_wishs;
    this.enable_email_verification = Constants.enable_email_verification;
    this.min_address_length = Constants.min_address_length;
    this.hidden_flds = Constants.hidden_flds || [];
    this.wishesArray = [];
    for (let x = 0; x < Constants.mandatory_wishs_no; x++) {
      this.wishesArray.push(new StudentRequestWishes());
      for (let i = 0; i < this.wishesArray.length; i++) {
        const element = this.wishesArray[i];
        element.ordered = i + 1;
      }
    }
    this.getADSSettings();
    this.getDiscounts();

    this.populatecomboxArrOpenSemester();
    this.populateDegreeTypeComboxArr();
    this.populatecomboxArr_governorateCode();
    this.populatecomboxArrSpecializIdAll();
    // this.populatecomboxArr_academyCode();
    this.populatecomboxArrCountry();
    this.populatecomboxArrNationally();
    this.populateComboxArrCertObtainingYear();
    this.populateRelativeRelationComboxArr();
    this.getRegistrationHelp();
    this.getThanksMessage();
    this.getWelcomeMessage();
    this.getAcknowledgeMessage();
    this.populateStudyEgyptMsg();
    this.populateRecognizedUniversitiesComboxArr();
    this.populateRecognizedCollagesComboxArr();
    this.populateTransportationAreasComboxArr();
  }

  ngOnDestroy() {
    if (this.sublang) {
      this.sublang.unsubscribe();
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  populatecomboxArrOpenSemester() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_semester_open');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_open_semester_select', servletUrl, formData);
  }

  onChangeOpenSemester() {
    for (let element of this.comboxArrOpenSemester) {
      if (this.studentAc.open_semester_id === element.id) {
        this.setOpenSemester(element);
        break;
      }
    }
    this.wishesArray = [];
    for (let x = 0; x < Constants.mandatory_wishs_no; x++) {
      this.wishesArray.push(new StudentRequestWishes());
      for (let i = 0; i < this.wishesArray.length; i++) {
        const element = this.wishesArray[i];
        element.ordered = i + 1;
      }
    }
    this.populatecomboxArr_academyCode();

    if (this.studentAc.citizen_serial) {
      this.checkCitizenSerial();
    }

  }

  setOpenSemester(selectedRow: ComboBoxRec) {
    this.studentAc.open_semester_id = selectedRow.id;
    this.selectedOpenSemester = selectedRow;
    this.getAcknowledgeMessage();
  }

  populateRecognizedUniversitiesComboxArr() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('conType', 'academic_central');
    let values: WherePart[] = [];
    formData.append('viewCode', 'populate_recognized_universities_select');
    values.push(new WherePart({ value: "1", type: "number" }));
    formData.append('values', JSON.stringify(values));
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_recognized_universities_select', servletUrl, formData);
  }

  populateRecognizedCollagesComboxArr() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('conType', 'academic_central');
    let values: WherePart[] = [];
    formData.append('viewCode', 'populate_recognized_universities_select');
    values.push(new WherePart({ value: "2", type: "number" }));
    formData.append('values', JSON.stringify(values));
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_recognized_collages_select', servletUrl, formData);
  }

  populateTransportationAreasComboxArr() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('conType', 'academic_central');
    formData.append('viewCode', 'populate_transportation_areas_select');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_transportation_areas_select', servletUrl, formData);
  }

  populateDegreeTypeComboxArr() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('conType', 'academic_central');
    formData.append('viewCode', 'populate_degree_type_code_select_all');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_degree_type_code_select', servletUrl, formData);
  }

  populateSchoolComboxArr() {
    this.comboxArr_school_id = [];
    this.studentAc.certificate_school_id = "";
    if ((this.studentAc.certificate_country_id !== '')) {
      let servletUrl: string = Constants.baseUrl + '/combboxview';
      const formData = new FormData();
      formData.append('conType', 'academic_central');
      let values: WherePart[] = [];
      if ((this.studentAc.certificate_country_id !== '')) {
        values.push(new WherePart({ value: this.studentAc.certificate_country_id, type: "number" }));
        formData.append('viewCode', 'populate_school_by_country');
      }
      if (values.length > 0) {
        formData.append('values', JSON.stringify(values));
        formData.append('transaction', 'select_list');
        this.eSendForm(this, 'populate_school_select', servletUrl, formData);
      }
    } else {
      this.comboxArr_school_id = [];
    }
  }

  populateMiliarityRegionComboxArr() {
    this.comboxArr_miliarity_region = [];
    if ((this.studentAc.miliarity_governorate_id !== '')) {
      let servletUrl: string = Constants.baseUrl + '/combboxview';
      const formData = new FormData();
      formData.append('conType', 'academic_central');
      let values: WherePart[] = [];
      values.push(new WherePart({ value: this.studentAc.miliarity_governorate_id, type: "number" }));
      formData.append('viewCode', 'populate_miliarity_region_select');
      formData.append('values', JSON.stringify(values));
      formData.append('transaction', 'select_list');
      this.eSendForm(this, 'populate_miliarity_region_select', servletUrl, formData);
    } else {
      this.comboxArr_miliarity_region = [];
    }
  }

  populatecomboxArr_governorateCode() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_governorate_code_select');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_governorate_code_select', servletUrl, formData);
  }

  populatecomboxArr_academyCode() {
    if (Constants.populate_academyCode_way === "open_semester") {
      this.populatecomboxArr_academyCode_based_on_open_semester();
    } else if (Constants.populate_academyCode_way === "academy_precondition") {
      this.populatecomboxArr_academyCode_based_on_pre_condition();
    }
  }

  populatecomboxArr_academyCode_based_on_open_semester() {
    if (this.studentAc.open_semester_id) {
      let servletUrl: string = Constants.baseUrl + '/combboxview';
      const formData = new FormData();
      formData.append('viewCode', 'populate_academy_code_select');
      formData.append('conType', 'academic_central');
      let values: WherePart[] = [];
      values.push(new WherePart({ value: this.studentAc.open_semester_id, type: "number" }));
      formData.append('values', JSON.stringify(values));
      formData.append('transaction', 'select_list');
      this.eSendForm(this, 'populate_academy_code_select', servletUrl, formData);
    } else {
      this.comboxArrAcademy = [];
    }
  }

  populatecomboxArr_academyCode_based_on_pre_condition() {
    let servletUrl: string = Constants.baseUrl + '/AcademyPreCondition';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    formData.append('certificate', this.studentAc.pre_university_degree);
    formData.append('categoryFlag', this.studentAc.category_flag);
    //formData.append('degree', '' + this.studentAc.gpa);
    formData.append('degree', '0');
    formData.append('year', this.studentAc.degree_year);
    formData.append('specializ', this.studentAc.specializ_id);
    formData.append('openSemesterId', this.studentAc.open_semester_id);
    this.eSendForm(this, 'populate_academy_code_select', servletUrl, formData);
  }

  populatecomboxArrCountry() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_country_select');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_country_select', servletUrl, formData);
  }

  populatecomboxArrNationally() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    // if (this.studentAc.citizen_serial_type === '2') {
    //   formData.append('viewCode', 'populate_nationally_select_without_is_default');
    // } else {
    formData.append('viewCode', 'populate_nationally_select');
    //}
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_nationally_select', servletUrl, formData);
  }

  populatecomboxArrSpecializId(degreeTypeId: string) {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    let values: WherePart[] = [];
    const formData = new FormData();
    formData.append('conType', 'academic_central');
    if (degreeTypeId != '' && degreeTypeId != null && degreeTypeId != '0') {
      values.push(new WherePart({ value: degreeTypeId, type: "string" }));
      formData.append('viewCode', 'populate_specializ_id_select_by_degree_type_code');
    } else {
      formData.append('viewCode', 'populate_specializ_id_select_all');
    }
    formData.append('values', JSON.stringify(values));
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_specializ_id_select', servletUrl, formData);
  }

  populatecomboxArrSpecializIdAll() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    let values: WherePart[] = [];
    const formData = new FormData();
    formData.append('conType', 'academic_central');
    formData.append('viewCode', 'populate_specializ_id_select_all');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_all_specializ_id_select', servletUrl, formData);
  }


  populateStudyEgyptMsg() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_study_in_egypt_msg');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_study_in_egypt_msg', servletUrl, formData);
  }

  populateComboxArrCertObtainingYear() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_obtaining_year_select');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_obtaining_year_select', servletUrl, formData);
  }

  populateRelativeRelationComboxArr() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_relative_relation_id_select');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_relative_relation_id_select', servletUrl, formData);
  }

  onChangeMainCategoryFlag() {
    this.populateDegreeTypeComboxArr();
  }

  onChangeNationalityId() {
    this.studentAc.pre_university_degree = "";
    this.studentAc.gov_code = "";
    this.showGovCode = false;
    this.disabledCitizenSerialType = false;
    let isThereDefault: boolean = false;
    for (let element of this.comboxArrNationality) {
      if (this.studentAc.country_id === element.id) {
        if (element.additional_data1 === '1') {
          this.parentContactData1.relative_relation_id = "2";
          isThereDefault = true;
          this.studentAc.citizen_serial_type = "1";
          this.disabledCitizenSerialType = true;
          this.showGovCode = true;
          break;
        } else {
          this.parentContactData1.relative_relation_id = "10";
        }
      }
    }
    if (!isThereDefault) {
      this.studentAc.citizen_serial_type = "2";
      this.disabledCitizenSerialType = false;
      this.showGovCode = false;
    }
    this.populateDegreeTypeComboxArr();
  }

  onChangePreUniversityDegree() {
    this.populatecomboxArrSpecializId(this.studentAc.pre_university_degree);
    for (let element of this.comboxArrDegreeType) {
      if (this.studentAc.pre_university_degree === element.id) {
        this.selectedDegreeType = element;
        this.studentAc.category_flag = element.additional_data1;
        this.studentAc.main_category_flag = element.additional_data1;
        break;
      }
    }
  }
  onChangeBirthCountryId() {
    for (let element of this.comboxArrCountry) {
      if (this.studentAc.birth_country_id === element.id) {
        this.selectedBirthCountryId = element;
        break;
      }
    }
  }

  async sendRequestWithoutOTP() {
    if (!(await this.checkError(1))) {
      this.saveRequest();
    }
  }

  saveRequest() {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      data: {
        thanksMessage: this.acknowledgeMessage,
        yes: this.i18n.get("corr.yesAcknowledgeMessage", "Yes"),
        show_checkbox: true
      }, width: "50rem", disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.studentAc.accept_terms = 1;

        if (this.studentAc.is_transfer === 0) {
          this.transformerUniversitiesArr = [];
        }

        if (this.studentAc.accept_terms === 1) {

          this.getGender();
          if (this.isDisabled === false) {

            let errorStrArr = '';
            let isThereError: boolean = false;

            this.studentAc.first_name_ar = this.studentAc.first_name_ar.trim();
            this.studentAc.middle_name_ar = this.studentAc.middle_name_ar.trim();
            this.studentAc.grand_name_ar = this.studentAc.grand_name_ar.trim();
            this.studentAc.surname_ar = this.studentAc.surname_ar.trim();

            this.studentAc.first_name_en = this.studentAc.first_name_en.trim();
            this.studentAc.middle_name_en = this.studentAc.middle_name_en.trim();
            this.studentAc.grand_name_en = this.studentAc.grand_name_en.trim();
            this.studentAc.surname_en = this.studentAc.surname_en.trim();

            for (let row of this.wishesArray) {
              let ttlcount: number = 0;
              this.wishesArray.forEach(element => {
                if (row.academy_code === element.academy_code) {
                  ttlcount += 1;
                }
              });
              if (ttlcount > 1) {
                errorStrArr += '-' + this.i18n.get('corr.ERROR_WISH', 'ERROR_WISH');
                isThereError = true;
                break;
              }
            }

            this.studentAc.wish_academy_code_1 = "";
            if (this.wishesArray.length > 0) {
              this.studentAc.wish_academy_code_1 = this.wishesArray[0].academy_code;
            }

            if (this.studentAc.wish_academy_code_1 === '') {
              if (errorStrArr !== '') {
                errorStrArr += '</br>';
              }
              errorStrArr += '-' + this.i18n.get('corr.ERROR_WISH', 'ERROR_WISH');
              isThereError = true;
            }

            if (isThereError === false) {
              this.studentAc.ads_reference = localStorage.getItem('ref');
              let studentAcRecordCopy = { ...this.studentAc };
              studentAcRecordCopy.birth_date = this.provider.convertStringToDate(studentAcRecordCopy.birth_date);
              studentAcRecordCopy.passport_issuance_date = this.provider.convertStringToDate(studentAcRecordCopy.passport_issuance_date);
              studentAcRecordCopy.passport_expiry_date = this.provider.convertStringToDate(studentAcRecordCopy.passport_expiry_date);
              let comerInfoRecord = { ...this.comerInfo };
              comerInfoRecord.residency_expiry_date = this.provider.convertStringToDate(comerInfoRecord.residency_expiry_date);
              let servletUrl: string = Constants.baseUrl + '/registration';
              const formData = new FormData();
              formData.append('studentRequest', JSON.stringify(studentAcRecordCopy));
              formData.append('comerInfo', JSON.stringify(comerInfoRecord));
              formData.append('studentContactData', JSON.stringify(this.studentContactData));
              formData.append('parentContactData1', JSON.stringify(this.parentContactData1));
              if (this.showGovCode && !this.checkFldIsHidden('mohter_name') && this.parentContactData3.relative_relation_name) {
                this.parentContactData3.relative_relation_id = "3";
                this.parentContactData3.relation_type = 4;
                formData.append('parentContactData3', JSON.stringify(this.parentContactData3));
              }
              formData.append('wishesArray', JSON.stringify(this.wishesArray));
              formData.append('transformerUniversitiesArr', JSON.stringify(this.transformerUniversitiesArr));
              formData.append('siblingsArr', JSON.stringify(this.siblingsArr));
              formData.append('diplomaDetailsArr', JSON.stringify(this.diplomaDetailsArr));
              formData.append('studentRequestAchievementsArr', JSON.stringify(this.studentRequestAchievementsArr));
              formData.append('verificationCode', '' + this.verificationCode);
              formData.append('enableEmailVerification', '' + this.enable_email_verification);
              formData.append('transaction', 'insert');
              this.eSendForm(this, 'rec_insert', servletUrl, formData);
            } else {
              if (isThereError) {
                this.ui.error(this.i18n.get('corr.' + errorStrArr, errorStrArr));
              }
            }
          }
        }
      }
    });
  }

  goBack(stepper: MatStepper) {
    let myElement = 'focus_step_' + (stepper.selectedIndex - 2);
    this.scrollToTargetAdjusted(myElement);
    if (stepper.selectedIndex === 1) {
      this.router.navigate([this.path], { queryParams: {}, replaceUrl: true });
    } else if (stepper.selectedIndex === 2) {
      this.router.navigate([this.path], { queryParams: { step: 'guardian-details' }, replaceUrl: true });
    }
    stepper.previous();
  }
  /// ZidanBack
  async goForward(stepper: MatStepper) {
    if (stepper.selectedIndex === 0 || stepper.selectedIndex === 1) {
      this.checkCitizenSerial();
      this.currentStepId = stepper.selectedIndex;
    }
    let myElement = 'focus_step_' + stepper.selectedIndex;
    console.log(myElement);
    this.scrollToTargetAdjusted(myElement);
    if (!(await this.checkError(stepper.selectedIndex))) {
      if (stepper.selectedIndex === 0) {
        this.analytics.personalInfoCompleted();
        this.router.navigate([this.path], { queryParams: { step: 'guardian-details' }, replaceUrl: true });
      } else if (stepper.selectedIndex === 1) {
        this.analytics.guardianDetailsCompleted();
        this.router.navigate([this.path], { queryParams: { step: 'email-verification' }, replaceUrl: true });
      }
      stepper.next();
    }
  }

  scrollToTargetAdjusted(elementName: string) {
    setTimeout(() => {
      let myElement = document.getElementById(elementName);
      if (myElement) {
        myElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 1000);
  }

  onChangeCertificateCountry(comboxRec: ComboBoxRec) {
    this.selectedCertificateCountry = comboxRec;
    this.studentAc.main_category_flag = '1';
    this.studentAc.pre_university_degree = "0";
    this.studentAc.certificate_school_id = "";
    this.onChangeMainCategoryFlag();
    this.populateSchoolComboxArr();
  }

  checkCitizenSerial() {

    this.studentAc.wish_academy_code_1 = "";
    if (this.wishesArray.length > 0) {
      this.studentAc.wish_academy_code_1 = this.wishesArray[0].academy_code;
    }

    this.getGender();
    if ((this.studentAc.citizen_serial_type === "1") && (this.studentAc.citizen_serial.length === 14)) {
      //if (this.studentAc.gov_code === '') {
      this.studentAc.gov_code = this.studentAc.citizen_serial.substring(7, 9);
      //}
      let yearPrefix = this.studentAc.citizen_serial[0] === '2' ? '19' : '20';
      let year = parseInt(yearPrefix + this.studentAc.citizen_serial.substring(1, 3), 10);
      let month = parseInt(this.studentAc.citizen_serial.substring(3, 5), 10) - 1; // JS months 0-based
      let day = parseInt(this.studentAc.citizen_serial.substring(5, 7), 10);
      // ✅ Construct a Date object in **local time**
      this.studentAc.birth_date = new Date(year, month, day); // Correct, no shift
      if (this.studentAc.citizen_serial.substring(7, 9) === "88") {
        for (let row of this.comboxArrCountry) {
          if (row.additional_data2 === "2") {
            this.studentAc.birth_country_id = row.id;
            this.onChangeBirthCountryId();
            break;
          }
        }
      } else {
        for (let element of this.comboxArrNationality) {
          if (element.additional_data1 === '1') {
            this.studentAc.birth_country_id = element.id;
            this.onChangeBirthCountryId();
            break;
          }
        }
      }
      if (this.validationNationalId() === false) {
        this.ui.error(this.i18n.get('corr.ERROR_NAT_ID_NOT_CORRECT', 'ERROR_NAT_ID_NOT_CORRECT'));
      } else {
        let servletUrl: string = Constants.baseUrl + '/registration';
        const formData = new FormData();
        formData.append('citizenSerialType', '' + this.studentAc.citizen_serial_type);
        formData.append('citizenSerial', '' + this.studentAc.citizen_serial);
        formData.append('openSemesterId', '' + this.studentAc.open_semester_id);
        formData.append('wish_academy_code_1', '' + this.studentAc.wish_academy_code_1);
        formData.append('transaction', 'select_tree');
        this.eSendForm(this, 'check_citizen_serial', servletUrl, formData);
      }
    } else if ((this.studentAc.citizen_serial_type === "1") && (this.studentAc.citizen_serial.length > 14)) {
      this.studentAc.citizen_serial = this.studentAc.citizen_serial.substring(0, 14);
    } else if ((this.studentAc.citizen_serial_type === "2") && (this.studentAc.citizen_serial.length >= 6)) {
      if (this.studentAc.citizen_serial.length > 0) {
        let servletUrl: string = Constants.baseUrl + '/registration';
        const formData = new FormData();
        formData.append('citizenSerialType', '' + this.studentAc.citizen_serial_type);
        formData.append('citizenSerial', '' + this.studentAc.citizen_serial);
        formData.append('openSemesterId', '' + this.studentAc.open_semester_id);
        formData.append('wish_academy_code_1', '' + this.studentAc.wish_academy_code_1);
        formData.append('transaction', 'select_tree');
        this.eSendForm(this, 'check_citizen_serial', servletUrl, formData);
      }
    }
  }

  validationNationalId(): Boolean {
    if (this.studentAc.citizen_serial_type === '1') {
      if (this.studentAc.citizen_serial.length != 14) {
        return false;
      }

      if (this.studentAc.citizen_serial.length === 14) {
        let birth_date = this.provider.convertStringToDate(this.studentAc.birth_date);
        let birth_year: number = +birth_date.substring(0, 4);
        let f1 = this.studentAc.citizen_serial.substring(0, 1);

        if (birth_year >= 1900 && birth_year <= 1999) {
          if (f1 !== '2') {
            return false;
          }
        }

        if (birth_year >= 2000 && birth_year <= 2099) {
          if (f1 !== '3') {
            return false;
          }
        }

        let birth_date_gov = birth_date.split('/').join('');
        if (
          birth_date_gov.substring(2, birth_date_gov.length) !==
          this.studentAc.citizen_serial.substring(1, 7)
        ) {
          return false;
        }

        if (this.studentAc.gov_code !== this.studentAc.citizen_serial.substring(7, 9)) {
          return false;
        }
      }
    }
    return true;
  }

  onInputEvent(event: any): void {
    // if (this.studentAc.citizen_serial_type === '1') {
    //   event.target.value = event.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    // }
    if (this.studentAc.citizen_serial_type === '1') {
      // Allow only numbers, and limit to 14 digits
      let value = event.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      if (value.length > 14) {
        value = value.substring(0, 14);
      }
      event.target.value = value;
    }
  }

  onInputEvent2(event: any, element: StudentRequestContacts): void {
    if (element.citizen_serial_type === '1') {
      event.target.value = event.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    }
  }

  addNewRow() {
    if ((this.wishesArray.length + 1) > Constants.max_wishs) {
      return;
    } else {
      if (this.wishesArray.length < this.comboxArrAcademy.length) {
        this.wishesArray.push(new StudentRequestWishes());
        for (let i = 0; i < this.wishesArray.length; i++) {
          const element = this.wishesArray[i];
          element.ordered = i + 1;
        }
      }
    }
  }

  deleteRow(selected: StudentRequestWishes) {
    this.wishesArray.splice(this.wishesArray.indexOf(selected), 1);
    if (this.wishesArray.length === 0) {
      for (let x = 0; x < Constants.mandatory_wishs_no; x++) {
        this.wishesArray.push(new StudentRequestWishes());
        for (let i = 0; i < this.wishesArray.length; i++) {
          const element = this.wishesArray[i];
          element.ordered = i + 1;
        }
      }
    } else {
      for (let i = 0; i < this.wishesArray.length; i++) {
        const element = this.wishesArray[i];
        element.ordered = i + 1;
      }
    }
  }

  moveUp(index: number) {
    if ((index > 0) && (index <= (this.wishesArray.length - 1))) {
      const tmp = this.wishesArray[index - 1];
      this.wishesArray[index - 1] = this.wishesArray[index];
      this.wishesArray[index] = tmp;
      for (let i = 0; i < this.wishesArray.length; i++) {
        this.wishesArray[i].ordered = (i + 1);
      }
    }
  }

  moveDown(index: number) {
    if (index < (this.wishesArray.length - 1)) {
      const tmp = this.wishesArray[index + 1];
      this.wishesArray[index + 1] = this.wishesArray[index];
      this.wishesArray[index] = tmp;
      for (let i = 0; i < this.wishesArray.length; i++) {
        this.wishesArray[i].ordered = (i + 1);
      }
    }
  }

  updateOrderedValues() {
    for (let i = 0; i < this.wishesArray.length; i++) {
      this.wishesArray[i].ordered = (i + 1);
    }
  }

  addTransformerUniversities() {
    this.transformerUniversitiesArr.push(new TransformerUniversities());
  }

  deleteTransformerUniversities(selected: TransformerUniversities) {
    this.transformerUniversitiesArr.splice(this.transformerUniversitiesArr.indexOf(selected), 1);
  }

  addDiplomaDetails() {
    this.diplomaDetailsArr.push(new DiplomaDetails());
  }

  deleteDiplomaDetails(selected: DiplomaDetails) {
    this.diplomaDetailsArr.splice(this.diplomaDetailsArr.indexOf(selected), 1);
  }

  addSiblings() {
    this.siblingsArr.push(new StudentRequestSiblings());
  }

  deleteSiblings(selected: StudentRequestSiblings) {
    this.siblingsArr.splice(this.siblingsArr.indexOf(selected), 1);
  }

  async checkSiblingsAll() {
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true
    }
    let servletUrl: string = Constants.baseUrl + '/registration';
    const formData = new FormData();
    formData.append('siblingsArr', JSON.stringify(this.siblingsArr));
    formData.append('transaction', 'data');
    let response = await this.httpClient.post(servletUrl, formData, options).toPromise();
    response = response['body'];
    if (response['response']['status'] === 'success' && response['resultset']) {
      this.siblingsArr = response['resultset'];
    } else {
      this.ui.error(this.i18n.get('corr.ERROR_SIBLINGS', 'ERROR_SIBLINGS'));
    }
  }

  addStudentRequestAchievements() {
    let newRow = new StudentRequestAchievements();
    this.studentRequestAchievementsArr.push(newRow);
    this.onChangeAchievementType(newRow);
  }

  deleteStudentRequestAchievements(selected: StudentRequestAchievements) {
    this.studentRequestAchievementsArr.splice(this.studentRequestAchievementsArr.indexOf(selected), 1);
  }

  onChangeAchievementType(selected: StudentRequestAchievements) {
    this.selectedStudentRequestAchievements = selected;
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('conType', 'academic_central');
    let values: WherePart[] = [];
    formData.append('viewCode', 'populate_achievement_select');
    values.push(new WherePart({ value: this.selectedStudentRequestAchievements.achievement_type, type: "number" }));
    formData.append('values', JSON.stringify(values));
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_achievement_select', servletUrl, formData);
  }

  resendVerification() {
    this.optExpirationPeriod = 0;
    let servletUrl: string = Constants.baseUrl + '/registration';
    const formData = new FormData();
    formData.append('studentContactData', '' + JSON.stringify(this.studentContactData));
    formData.append('transaction', 'insert_list');
    this.eSendForm(this, 'rec_send_email_verification', servletUrl, formData);
  }

  getADSSettings() {
    let servletUrl: string = Constants.baseUrl + '/crd/adssettings';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'get_ads_settings', servletUrl, formData);
  }

  getDiscounts() {
    let servletUrl: string = Constants.baseUrl + '/crd/discounts';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'get_discounts', servletUrl, formData);
  }

  getSanitizedUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  openInNewTab(row: AdsSettings) {
    if (row.click_url) {
      window.open(row.click_url, '_blank');
    }
  }

  updateProgress() {
    const elapsedTime = Date.now() - this.startTime;
    this.progressValue = Math.floor((elapsedTime / this.duration) * 100);
    if (this.progressValue > 100) {
      this.progressValue = 100; // Ensure progress doesn't exceed 100%
      this.optExpirationPeriod = 0;
      clearInterval(progressInterval);
    }
  }

  getRegistrationHelp() {
    let servletUrl: string = Constants.baseUrl + '/registrationhelp';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'get_registration_help', servletUrl, formData);
  }

  getWelcomeMessage() {
    let servletUrl: string = Constants.baseUrl + '/crd/thanks_message';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    formData.append('messageType', '2');
    this.eSendForm(this, 'get_welcome_message', servletUrl, formData);
  }

  getAcknowledgeMessage() {
    let servletUrl: string = Constants.baseUrl + '/crd/thanks_message';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    formData.append('messageType', '3');
    this.eSendForm(this, 'get_acknowledge_message', servletUrl, formData);
  }

  getThanksMessage() {
    let servletUrl: string = Constants.baseUrl + '/crd/thanks_message';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    formData.append('messageType', '1');
    this.eSendForm(this, 'get_thanks_message', servletUrl, formData);
  }

  async viewHelp(templateRef: TemplateRef<any>) {
    if (this.registrationHelpArr.filter(item => item.view_type === 2).length > 0) {
      await this.lazyLoader.loadScript('https://www.youtube.com/iframe_api');
    }
    this.dialog.open(templateRef);
  }

  getSelectedCountryCodeLabel(countryCode: string): any {
    for (let element of this.provider.options) {
      if (element.value === countryCode) {
        return element;
      }
    }
  }

  initializeCountdown(targetDate: Date): void {
    this.countdownInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      const timeDifference = targetDate.getTime() - currentTime;

      this.days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      if (timeDifference < 0) {
        clearInterval(this.countdownInterval);
        this.days = this.hours = this.minutes = this.seconds = 0;
      }
    }, 1000);
  }


  isValidMobile(mobile: string): boolean {
    if (!mobile) return false;
    // Must be exactly 11 digits
    return /^\d{11}$/.test(mobile);
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Basic email validation regex
    return emailRegex.test(email);
  }

  // haggag remove address validation
  // isValidStr(dataString: string, minLength: number): boolean {
  //   if (!dataString || dataString.trim() === '' || dataString.length < minLength) {
  //     return false;
  //   }
  //   return true;
  // }

  eSendForm(handler: any, key: string, backendURL: string, formData: FormData) {
    formData.append('lang', this.lang);
    this.ttlRequest += 1;
    this.activeMask = true;
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true,
    };
    this.httpClient
      .post<SmartResponse>(backendURL, formData, options)
      .subscribe(
        (event) => {
          try {
            handler.eResponseEvent(key, event);
          } catch (error) {
            console.error("Response is success but 'responseEvent' implementation throws error => " + error);
          }
        },
        (exception) => {
          handler.eResponseFailure(key, exception);
        }
      );
  }

  eResponse(key: string, smartResponse: SmartResponse) {
    if (key === 'rec_insert') {
      if (smartResponse.response.code == 200) {
        this.studentAc.id = smartResponse.generated_id;
        this.isEditMode = 'edit';
        this.ui.success(this.i18n.get('corr.dataSend', 'dataSend'));
        this.isDisabled = true;
        this.userRecord = { 'username': smartResponse['username'], 'password': smartResponse['password'] };

        if (this.enable_email_verification) {
          this.analytics.emailVerified();
        }

        // Fire marketing event ----------------------------------
        let major_of_interest = this.comboxArrAcademy.filter(item => this.studentAc.wish_academy_code_1 === item.id)[0]?.name[this.lang];
        let application_semester = this.comboxArrOpenSemester.filter(item => this.studentAc.open_semester_id === item.id)[0]?.name[this.lang];
        this.analytics.applicationSubmitted({
          application_id: 'APP-' + this.studentAc.id,
          major_of_interest: major_of_interest, // 'Medicine',
          application_semester: application_semester, //'Fall 2026_2027',
          user_data: {
            email_address: this.studentContactData.email,
            phone_number: this.studentContactData.mobile_country_code + this.studentContactData.mobile,
            address: {
              first_name: this.studentAc.first_name_en,
              last_name: this.studentAc.surname_en
            }
          }
        });

        if (this.thanksMessage.id > 0) {
          const dialogRef = this.dialog.open(ThanksMessageComponent, {
            data: {
              userRecord: this.userRecord,
              thanksMessage: this.thanksMessage
            }, width: "40rem", disableClose: true
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result == true) {
              this.router.navigate(['/login'], {
                queryParams: {
                  params: this.provider.encrypt(JSON.stringify(this.userRecord)),
                }, replaceUrl: true
              });
            }
          });
        } else {
          this.router.navigate(['/login'], {
            queryParams: {
              params: this.provider.encrypt(JSON.stringify(this.userRecord)),
            }, replaceUrl: true
          });
        }


      } else if (smartResponse.response.code == 201) {
        let errorKey = smartResponse['errors'][0];
        this.ui.error(this.i18n.get('corr.' + errorKey, errorKey));
      }
    } else if (key === 'populate_degree_type_code_select') {
      this.comboxArrDegreeType = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_transportation_areas_select') {
      this.comboxArrTransportationAreas = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_governorate_code_select') {
      this.comboxArrGovernorateCode = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_recognized_universities_select') {
      this.comboxArr_recognized_universities = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_recognized_collages_select') {
      this.comboxArr_recognized_collages = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'check_citizen_serial') {
      if (smartResponse.response.code == 201) {
        let errorKey = smartResponse['errors'][0];
        this.ui.error(this.i18n.get('corr.' + errorKey, errorKey));
        this.move(this.currentStepId);
      } else {
        if (this.studentAc.birth_date) {
          if (!this.validateDateOfBirth(this.studentAc.birth_date)) {
            this.ui.error(this.i18n.get('corr.Age_Error', 'Age_Error'));
          }
        }
      }
    } else if (key === 'populate_nationally_select') {
      this.comboxArrNationality = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
       this.comboxArrNationality.sort((a, b) => a.name[this.lang].localeCompare(b.name[this.lang]));
      for (let element of this.comboxArrNationality) {
        if (element.additional_data1 === '1') {
          this.studentAc.citizen_serial_type = "1";
          this.studentAc.country_id = element.id;
          this.studentAc.birth_country_id = element.id;
          this.onChangeBirthCountryId();
          this.onChangeNationalityId();
          this.populateDegreeTypeComboxArr();
          break;
        }
      }
    } else if (key === 'populate_open_semester_select') {
      this.comboxArrOpenSemester = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
      if (this.comboxArrOpenSemester.length === 1) {
        this.setOpenSemester(this.comboxArrOpenSemester[0]);
        this.studentAc.open_semester_id = this.comboxArrOpenSemester[0].id;
        this.onChangeOpenSemester();
      }
    } else if (key === "populate_academy_code_select") {
      if (Constants.populate_academyCode_way === "open_semester") {
        this.comboxArrAcademy = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
      } else if (Constants.populate_academyCode_way === "academy_precondition") {
        this.comboxArrAcademy = [];
        let academyArr = <Academy[]>Manipulate.set_fill(new Academy(), smartResponse.resultset);
        academyArr.forEach(element => {
          if (element.is_active_portal === 1) {
            let row = new ComboBoxRec();
            row.id = element.code;
            row.name.ar = element.name_ar;
            row.name.en = element.name_en;
            row.additional_data1 = element['ttl_levels'];
            this.comboxArrAcademy.push(row);
          }
        });
      }
      if (Constants.initial_wishs_no > 0) {
        let maxVal = Constants.initial_wishs_no > this.comboxArrAcademy.length ? this.comboxArrAcademy.length : Constants.initial_wishs_no;
        this.wishesArray = [];
        for (let x = 0; x < maxVal; x++) {
          this.wishesArray.push(new StudentRequestWishes());
          for (let i = 0; i < this.wishesArray.length; i++) {
            const element = this.wishesArray[i];
            element.ordered = i + 1;
          }
        }
      }
    } else if (key === 'populate_obtaining_year_select') {
      this.comboxArrCertObtainingYear = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "populate_relative_relation_id_select") {
      this.comboxArr_relative_relation_id = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
      if (this.comboxArr_relative_relation_id.length > 0) {
        this.parentContactData1.relative_relation_id = this.comboxArr_relative_relation_id[0].id;
      }
    } else if (key === "rec_send_email_verification") {
      this.analytics.otpSent();
      this.ui.success(this.i18n.get('corr.verificationCodeSent', 'verificationCodeSent'));
      this.resendOtpEnable = false;
      this.optExpirationPeriod = <number>smartResponse['OPT_EXPIRATION_PERIOD'];
      this.duration = (2 * 60) * 1000;
      this.startTime = Date.now();
      this.updateProgress();
      progressInterval = setInterval(() => {
        this.updateProgress();
      }, 1000); // Update progress every second
      setTimeout(() => {
        this.resendOtpEnable = true;
      }, this.duration);
    } else if (key === "get_ads_settings") {
      this.adsSettingsArr = Manipulate.set_fill(new AdsSettings(), smartResponse.resultset);
    } else if (key === "get_discounts") {
      let discountsArr = Manipulate.set_fill(new Discounts(), smartResponse.resultset);
      if (discountsArr.length > 0) {
        this.discount = discountsArr[0];
        this.initializeCountdown(new Date(this.discount.valid_till_date));
      }
    } else if (key === "get_registration_help") {
      this.registrationHelpArr = Manipulate.set_fill(new RegistrationHelp(), smartResponse.resultset);
    } else if (key === "get_thanks_message") {
      let thanksMessageArr = Manipulate.set_fill(new ThanksMessage(), smartResponse.resultset);
      if (thanksMessageArr.length > 0) {
        this.thanksMessage = thanksMessageArr[0];
      }
    } else if (key === "get_welcome_message") {
      let welcomeMessageArr = Manipulate.set_fill(new ThanksMessage(), smartResponse.resultset);
      if (welcomeMessageArr.length > 0) {
        this.welcomeMessage = welcomeMessageArr[0];
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          data: {
            thanksMessage: this.welcomeMessage,
            yes: this.i18n.get("corr.acceptWelcomeMessage", "Accept")
          }, width: "40rem", disableClose: true
        });
      }
    } else if (key === "get_acknowledge_message") {
      let acknowledgeMessageArr = Manipulate.set_fill(new ThanksMessage(), smartResponse.resultset);
      if (acknowledgeMessageArr.length > 0) {
        this.acknowledgeMessage = acknowledgeMessageArr[0];
        if (this.acknowledgeMessage.message_ar) {
          this.acknowledgeMessage.message_ar = this.acknowledgeMessage.message_ar.replace('KEY_SEMSETER', this.selectedOpenSemester.name.ar);
        }
        if (this.acknowledgeMessage.message_en) {
          this.acknowledgeMessage.message_en = this.acknowledgeMessage.message_en.replace('KEY_SEMSETER', this.selectedOpenSemester.name.en);
        }
        if (this.acknowledgeMessage.subject_ar) {
          this.acknowledgeMessage.subject_ar = this.acknowledgeMessage.subject_ar.replace('KEY_SEMSETER', this.selectedOpenSemester.name.ar);
        }
        if (this.acknowledgeMessage.subject_en) {
          this.acknowledgeMessage.subject_en = this.acknowledgeMessage.subject_en.replace('KEY_SEMSETER', this.selectedOpenSemester.name.en);
        }
      }
    } else if (key === 'populate_country_select') {
      this.comboxArrCountry = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
      // haggag sort country list by name
      this.comboxArrCountry.sort((a, b) => a.name[this.lang].localeCompare(b.name[this.lang]));

    } else if (key === "populate_school_select") {
      this.comboxArr_school_id = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "populate_miliarity_region_select") {
      this.comboxArr_miliarity_region = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "populate_achievement_select") {
      this.selectedStudentRequestAchievements.comboxArr_achievement = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "populate_study_in_egypt_msg") {
      let comboxArr = <ComboBoxRec[]>Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
      if (comboxArr.length > 0) {
        this.msg.ar = comboxArr[0].name.ar;
        this.msg.en = comboxArr[0].name.en;
      } else {
        this.msg.ar = "";
        this.msg.en = "";
      }
    } else if (key === 'populate_specializ_id_select') {
      this.comboxArr_specializ_id = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_all_specializ_id_select') {
      this.comboxArr_all_specializ_id = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    }
  }

  eResponseSuccess(key: string, smartResponse: SmartResponse) {
    try {
      this.eResponse(key, smartResponse);
      this.ttlRequest = this.ttlRequest - 1;
      if (this.ttlRequest <= 0) {
        this.ttlRequest = 0;
        setTimeout(() => {
          this.activeMask = false;
        }, 1000);
      }
    } catch (error) {
      console.error(
        "Response is success but 'response' implementation in component  throws error => " +
        error
      );
      this.ttlRequest = this.ttlRequest - 1;
      if (this.ttlRequest <= 0) {
        this.ttlRequest = 0;
        setTimeout(() => {
          this.activeMask = false;
        }, 1000);
      }
    }
  }

  eFailure(key: string, exception: any) {
    console.log('key >> ' + key + ' ,  exception ' + JSON.stringify(exception, null, 4));
    this.ttlRequest = this.ttlRequest - 1;
    if (this.ttlRequest <= 0) {
      this.ttlRequest = 0;
      setTimeout(() => {
        this.activeMask = false;
      }, 5000);
    }
    if (key === 'rec_insert') {
      let error = exception['error'];
      let errorKey = error['errors'][0];
      this.ui.error(this.i18n.get('corr.' + errorKey, errorKey));
      if (errorKey === 'ERROR_CITIZEN_SERIAL_DUPLICATE') {
        this.move(0);
      }
    } else if (key === "rec_send_email_verification") {
      let error = exception['error'];
      let errorKey = error['errors'][0];
      this.ui.error(this.i18n.get('corr.' + errorKey, errorKey));
    } else {
      let error = exception['error'] || exception['errors'];
      if (error['errors']) {
        let errorKey = error['errors'][0];
        let errorKey2 = "";
        if (error['errors'][1]) {
          errorKey2 = error['errors'][1];
        }
        this.ui.error(this.i18n.get('corr.' + errorKey, errorKey) + " " + errorKey2);
      } else {
        this.ui.error(JSON.stringify(exception, null, 4));
      }
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
      //console.log('event Sent => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.UploadProgress) {
      //An upload progress event was received.
      //console.log('event UploadProgress => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.ResponseHeader) {
      //The response status code and headers were received.
      //console.log('event ResponseHeader => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.DownloadProgress) {
      //A download progress event was received.
      //console.log('event DownloadProgress => ' + key + '=>' + JSON.stringify(event, null, 4));
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

  move(index: number) {
    this.stepper.selectedIndex = index;
  }

  exitRequest() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        message: this.i18n.get('corr.exitRequestMsg', 'exitRequestMsg'),
        yes: this.i18n.get('corr.global.yes', 'Yes'),
        no: this.i18n.get('corr.global.no', "No"),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.analytics.admissionStarted();
        this.mobileTouched = false;
        this.addressTouched = false;
        this.emailTouched = false;
        this.mobileParentTouched = false;
        this.emailParentTouched = false;

        this.studentAc = new StudentRequest();
        // new Record
        this.path = this.router.url.split('?')[0].replace('/', '');
        this.router.navigate([this.path], { replaceUrl: true });
        if (this.path === 'registration') {
          this.studentAc.request_type = 1;
        } else {
          this.studentAc.request_type = 2;
        }
        this.showGovCode = false;
        this.comerInfo = new StudentRequestComerInfo();
        this.selectedDegreeType = new ComboBoxRec();
        this.transformerUniversitiesArr = [];
        this.diplomaDetailsArr = [];
        this.siblingsArr = [];
        this.studentRequestAchievementsArr = [];
        this.search_country_id = "";
        this.search_std_contact_gov_code = "";
        this.search_parent_contact_gov_code1 = "";
        this.search_parent_contact_gov_code2 = "";
        this.search_parent_contact_gov_code3 = "";
        this.search_pre_university_degree = "";
        this.search_birth_country_id = "";
        this.search_std_address_country_id = "";
        this.search_certificate_country_id = "";
        this.search_certificate_school_id = "";
        this.search_miliarity_governorate_id = "";
        this.search_miliarity_region_id = "";
        this.search_transportation_area_id = "";

        this.selectedCertificateCountry = new ComboBoxRec();
        this.selectedTransformerFromCountry = new ComboBoxRec();
        for (let element of this.comboxArrNationality) {
          if (element.additional_data1 === '1') {
            this.studentAc.country_id = element.id;
            this.studentAc.birth_country_id = element.id;
            this.onChangeBirthCountryId();
            this.showGovCode = true;
            this.populateDegreeTypeComboxArr();
            break;
          }
        }
        this.studentAc.citizen_serial_type = '0';
        if (this.comboxArrOpenSemester.length === 1) {
          this.setOpenSemester(this.comboxArrOpenSemester[0]);
          this.studentAc.open_semester_id = this.comboxArrOpenSemester[0].id;
          this.onChangeOpenSemester();
        }
        this.studentContactData = new StudentRequestContacts();
        this.studentContactData.relative_relation_id = "1";
        this.parentContactData1 = new StudentRequestContacts();
        if (this.comboxArr_relative_relation_id.length > 0) {
          this.parentContactData1.relative_relation_id = this.comboxArr_relative_relation_id[0].id;
        }
        this.parentContactData3 = new StudentRequestContacts();
        this.parentContactData3.relative_relation_id = "3";
        this.parentContactData3.relation_type = 4;
        this.isDisabled = false;
        this.move(0);
        const elementToFocus = document.getElementById("txt_first_name_ar") as HTMLInputElement | null;
        const elementToSelect = document.getElementById("txt_first_name_ar") as HTMLInputElement | null;

        if (elementToFocus) {
          elementToFocus.focus();
        }

        if (elementToSelect) {
          elementToSelect.select();
        }
      }
    });
  }
  epicFunction(innerWidth?: any) {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop();
    if (isMobile === true || isTablet === true) {
      this.orientation = 'vertical';
    } else {
      this.orientation = 'horizontal';
    }
    if (typeof innerWidth !== 'undefined') {
      if (innerWidth <= 1000) {
        this.orientation = 'vertical';
      } else {
        this.orientation = 'horizontal';
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.epicFunction(window.innerWidth);
  }

  getGender() {
    if (
      this.studentAc.citizen_serial.length === 14 &&
      this.studentAc.citizen_serial_type === '1'
    ) {
      let n = parseInt(
        this.studentAc.citizen_serial.charAt(
          this.studentAc.citizen_serial.length - 2
        )
      );
      let checkMaleOrFemal = Math.abs(n % 2) == 1;
      if (checkMaleOrFemal) {
        this.studentAc.gender = '1';
      } else {
        this.studentAc.gender = '2';
      }
    }
  }

  async checkError(stepNo: number) {
    // let regexMail = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    this.onChangeBirthCountryId();
    let regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let errorStrArr = "";
    let isThereError: boolean = false;
    if (stepNo === 0) {

      if ((this.studentAc.open_semester_id === "") || (this.studentAc.open_semester_id === "0")) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_APPLY_YEAR', 'ERROR_APPLY_YEAR').trim();
        isThereError = true;
      }
      this.studentAc.first_name_ar = this.studentAc.first_name_ar.trim().replace(/[^\s؀-ۿ]/g, '');
      this.studentAc.middle_name_ar = this.studentAc.middle_name_ar.trim().replace(/[^\s؀-ۿ]/g, '');
      this.studentAc.grand_name_ar = this.studentAc.grand_name_ar.trim().replace(/[^\s؀-ۿ]/g, '');
      this.studentAc.surname_ar = this.studentAc.surname_ar.trim().replace(/[^\s؀-ۿ]/g, '');
      this.studentAc.first_name_en = this.studentAc.first_name_en.trim().replace(/[^\sA-Za-z]/g, '');
      this.studentAc.middle_name_en = this.studentAc.middle_name_en.trim().replace(/[^\sA-Za-z]/g, '');
      this.studentAc.grand_name_en = this.studentAc.grand_name_en.trim().replace(/[^\sA-Za-z]/g, '');
      this.studentAc.surname_en = this.studentAc.surname_en.trim().replace(/[^\sA-Za-z]/g, '');

      if (this.showGovCode) {
        if ((this.studentAc.first_name_ar === "") || (this.studentAc.middle_name_ar === "") || (this.studentAc.grand_name_ar === "") || (this.studentAc.surname_ar === "")  ) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_NAME', 'ERROR_NAME').trim();
          isThereError = true;
        }
      } 
      // else {
      //   if ((this.studentAc.first_name_ar === "") || (this.studentAc.surname_ar === "")) {
      //     if (errorStrArr !== "") {
      //       errorStrArr += "</br>";
      //     }
      //     errorStrArr += "-" + this.i18n.get('corr.ERROR_NAME_FOREIGN', 'ERROR_NAME_FOREIGN').trim();
      //     isThereError = true;
      //   }
      // }

      if (this.showGovCode) {
        if ((this.studentAc.first_name_en === "") || (this.studentAc.middle_name_en === "") || (this.studentAc.grand_name_en === "") || (this.studentAc.surname_en === "")) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_NAME_EN', 'ERROR_NAME_EN').trim();
          isThereError = true;
        }
      } else {
        if ((this.studentAc.first_name_en === "") || (this.studentAc.surname_en === "")) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_NAME_EN_FOREIGN', 'ERROR_NAME_EN_FOREIGN').trim();
          isThereError = true;
        }
      }
      if ((this.studentAc.citizen_serial_type === "") || (this.studentAc.citizen_serial_type === "0")) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_CITIZEN_SERIAL_TYPE', 'ERROR_CITIZEN_SERIAL_TYPE').trim();
        isThereError = true;
      }
      if (this.studentAc.citizen_serial_type === '1') {
        if ((this.studentAc.gov_code === null) || (this.studentAc.gov_code === "")) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.birthGovernorateErr', 'birthGovernorateErr').trim();

          isThereError = true;
        }
      }

      if (this.studentAc.citizen_serial_type === '2') {
        if ((this.studentAc.country_id === null) || (this.studentAc.country_id === "")) {

          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.country', 'country').trim();

          isThereError = true;
        }

        if (this.studentAc.citizen_serial.length < 6) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_NAT_ID_NOT_CORRECT', 'ERROR_NAT_ID_NOT_CORRECT');
          isThereError = true;
        }

        if ((this.studentAc.passport_issuance_date === null) || (this.studentAc.passport_issuance_date === "")) {

          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.passport_issuance_date', 'passport_issuance_date').trim();

          isThereError = true;
        }
        if ((this.studentAc.passport_expiry_date === null) || (this.studentAc.passport_expiry_date === "")) {

          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.passport_expiry_date', 'passport_expiry_date').trim();

          isThereError = true;
        }

      }

      if (!this.showGovCode) {
        if (typeof this.studentAc.birth_country_id === 'undefined' || this.studentAc.birth_country_id === "") {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }

          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.birth_country_id', 'birth_country_id').trim();
          isThereError = true;
        }
      }

      if ((this.studentAc.birth_date === null) || (this.studentAc.birth_date === "")) {

        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ErrorBirthDate', 'ErrorBirthDate').trim();

        isThereError = true;
      } else {
        if (!this.validateDateOfBirth(this.studentAc.birth_date)) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.Age_Error', 'Age_Error').trim();

          isThereError = true;
        }
      }

      if (this.validationNationalId() === false) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_NAT_ID_NOT_CORRECT', 'ERROR_NAT_ID_NOT_CORRECT').trim();
        isThereError = true;
      }



      if (this.studentContactData.email === "") {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_CONTACT_EMAIL', 'ERROR_CONTACT_EMAIL').trim();
        isThereError = true;
      }

      if (this.studentContactData.email != "") {
        if (!regexMail.test(this.studentContactData.email)) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_CONTACT_EMAIL', 'ERROR_CONTACT_EMAIL').trim();
          isThereError = true;
        }
      }

      if (typeof this.studentContactData.mobile === 'undefined' || this.studentContactData.mobile === "") {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_CONTACT_MOBILE', 'ERROR_CONTACT_MOBILE').trim();
        isThereError = true;
      } else if (this.studentContactData.mobile_country_code === "+2" && this.studentContactData.mobile.length != 11) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_MOBILE_LENGTH', 'ERROR_MOBILE_LENGTH').trim();
        isThereError = true;
      }

      if (this.showGovCode) {
        if (typeof this.studentContactData.gov_code === 'undefined' || this.studentContactData.gov_code === "") {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_GOV_ADRESS', 'ERROR_GOV_ADRESS');
          isThereError = true;
        }
      }

      if (!this.showGovCode) {
        if (typeof this.studentAc.birth_country_id === 'undefined' || this.studentAc.birth_country_id === "") {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.birth_country_id', 'birth_country_id').trim();
          isThereError = true;
        }
      }

      if (typeof this.studentContactData.adress === 'undefined' || this.studentContactData.adress === "") {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_ADRESS', 'ERROR_ADRESS').trim();
        isThereError = true;
      }
    }

    if (stepNo === 1) {
      if (this.showGovCode && !this.checkFldIsHidden('mohter_name')) {
        if (!this.checkFldIsHidden('stop_validate_on_mohter_name')) {
          this.parentContactData3.relative_relation_name = this.parentContactData3.relative_relation_name.trim();
          if (this.parentContactData3.relative_relation_name === "") {
            if (errorStrArr !== "") {
              errorStrArr += "</br>";
            }
            errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.mohterName', 'mohterName').trim();
            isThereError = true;
          }
        }
      }
      this.parentContactData1.relative_relation_name = this.parentContactData1.relative_relation_name.trim();
      this.parentContactData1.mobile = this.parentContactData1.mobile.trim();
      if (this.showGovCode) {
        if (this.parentContactData1.relative_relation_name === "") {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_RELATIVE_RELATION_NAME', 'ERROR_RELATIVE_RELATION_NAME').trim();
          isThereError = true;
        }
        if (!this.parentContactData1.relation_other_name) {
          this.parentContactData1.relation_other_name = "";
        }
        this.parentContactData1.relation_other_name = this.parentContactData1.relation_other_name.trim();
        if ((this.parentContactData1.relative_relation_id === "10") && (this.parentContactData1.relation_other_name === "")) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_RELATION_OTHER_NAME', 'ERROR_RELATION_OTHER_NAME').trim();
          isThereError = true;
        }

        if (this.parentContactData1.mobile === "") {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PARENT_MOBILE', 'ERROR_PARENT_MOBILE').trim();
          isThereError = true;
        }

        if (this.checkFldIsHidden('enable_validate_on_email_parent_contact_data1')) {
          if (this.parentContactData1.email === "") {
            if (errorStrArr !== "") {
              errorStrArr += "</br>";
            }
            errorStrArr += "-" + this.i18n.get('corr.ERROR_CONTACT_EMAIL_PARENT', 'ERROR_CONTACT_EMAIL_PARENT').trim();
            isThereError = true;
          }
        }
      }

      if (this.parentContactData1.mobile !== "") {
        if (this.parentContactData1.mobile_country_code === "+2" && this.parentContactData1.mobile.length != 11) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_MOBILE_LENGTH', 'ERROR_MOBILE_LENGTH').trim();
          isThereError = true;
        }
        if (this.checkFldIsHidden('enable_check_duplicated_mobile') === true) {
          if (this.parentContactData1.mobile === this.studentContactData.mobile) {
            if (errorStrArr !== "") {
              errorStrArr += "</br>";
            }
            errorStrArr += "-" + this.i18n.get('corr.ERROR_PARENT_MOBILE_2', 'ERROR_PARENT_MOBILE_2').trim();
            isThereError = true;
          }
        }
      }

      if (this.parentContactData1.email != "") {
        if (!regexMail.test(this.parentContactData1.email)) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_CONTACT_EMAIL_PARENT', 'ERROR_CONTACT_EMAIL_PARENT').trim();
          isThereError = true;
        }

        if (this.checkFldIsHidden('enable_check_duplicated_email') === true) {
          if (this.parentContactData1.email === this.studentContactData.email) {
            if (errorStrArr !== "") {
              errorStrArr += "</br>";
            }
            errorStrArr += "-" + this.i18n.get('corr.ERROR_CONTACT_EMAIL_2', 'ERROR_CONTACT_EMAIL_2').trim();
            isThereError = true;
          }
        }

      }


      if (typeof this.studentAc.certificate_country_id === 'undefined' || this.studentAc.certificate_country_id === "") {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.certificate_country_id', 'certificate_country_id').trim();
        isThereError = true;
      }

      if (typeof this.studentAc.certificate_school_id === 'undefined' || this.studentAc.certificate_school_id === "") {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.certificate_school_id', 'certificate_school_id').trim();
        isThereError = true;
      }

      if ((this.studentAc.certificate_school_id === '0')) {
        this.studentAc.school_name = this.studentAc.school_name.trim();
        if (this.studentAc.school_name === "") {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_SCHOOL_NAME', 'ERROR_SCHOOL_NAME').trim();
          isThereError = true;
        }
      }

      if (
        this.studentAc.pre_university_degree === '' ||
        this.studentAc.pre_university_degree === '0'
      ) {
        if (errorStrArr !== '') {
          errorStrArr += '</br>';
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.pre_university_degree', 'pre_university_degree').trim();
        isThereError = true;
      }

      if (!this.checkFldIsHidden('specializ_id')) {
        if (
          this.studentAc.specializ_id === '0' ||
          this.studentAc.specializ_id === '') {
          if (errorStrArr !== '') {
            errorStrArr += '</br>';
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.specializ_id', 'specializ_id').trim();
          isThereError = true;
        }
      }

      if (
        this.studentAc.degree_year === '0' ||
        this.studentAc.degree_year === '') {
        if (errorStrArr !== '') {
          errorStrArr += '</br>';
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.get_year', 'get_year').trim();
        isThereError = true;
      }
      if (this.selectedDegreeType.additional_data2 === 'c1' /*thanwya */) {

        if (!this.checkFldIsHidden('high_school_final_percentage')) {
          if (this.studentAc.high_school_final_percentage < 0 || this.studentAc.high_school_final_percentage > 100) {
            if (errorStrArr !== '') {
              errorStrArr += '</br>';
            }
            errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.high_school_final_percentage', 'high_school_final_percentage').trim();
            isThereError = true;
          }
        }
        if (!this.checkFldIsHidden('high_school_seat_number') && this.selectedOpenSemester.additional_data1 === '0' /*is_early*/) {
          if (
            !this.studentAc.high_school_seat_number ||
            this.studentAc.high_school_seat_number === '0' ||
            this.studentAc.high_school_seat_number === '') {
            if (errorStrArr !== '') {
              errorStrArr += '</br>';
            }
            errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.high_school_seat_number', 'high_school_seat_number').trim();
            isThereError = true;
          }
        }
      } else if (this.selectedDegreeType.additional_data3 === '1' /*American Diploma */) {
        if (!this.checkFldIsHidden('diploma_details')) {
          if (this.diplomaDetailsArr.length === 0) {
            if (errorStrArr !== '') {
              errorStrArr += '</br>';
            }
            errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.diplomaDetails', 'diplomaDetails').trim();
            isThereError = true;
          } else {
            for (let element of this.diplomaDetailsArr) {
              if (
                element.diploma_type === '0' ||
                element.diploma_type === '') {
                if (errorStrArr !== '') {
                  errorStrArr += '</br>';
                }
                errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.american_diploma_type', 'american_diploma_type').trim();
                isThereError = true;
              }

              if (
                element.diploma_username === '0' ||
                element.diploma_username === '') {
                if (errorStrArr !== '') {
                  errorStrArr += '</br>';
                }
                errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.american_diploma_username', 'american_diploma_username').trim();
                isThereError = true;
              }


              if (
                element.diploma_password === '0' ||
                element.diploma_password === '') {
                if (errorStrArr !== '') {
                  errorStrArr += '</br>';
                }
                errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.american_diploma_password', 'american_diploma_password').trim();
                isThereError = true;
              }
            }
          }
        }
      } else {
        this.diplomaDetailsArr = [];
        this.studentAc.high_school_seat_number = "";
        this.studentAc.high_school_final_percentage = 0;
      }

      if (this.wishesArray.length < Constants.mandatory_wishs_no) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += '-' + this.i18n.get('corr.ERROR_WISH_NO', 'ERROR_WISH_NO').replace('{0}', Constants.mandatory_wishs_no.toString());
        isThereError = true;
      }

      let isOkCheckWish = true;
      for (let row of this.wishesArray) {
        let ttlcount: number = 0;
        this.wishesArray.forEach(element => {
          if (row.academy_code === element.academy_code) {
            ttlcount += 1;
          }
        });
        if (ttlcount > 1) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += '-' + this.i18n.get('corr.ERROR_WISH', 'ERROR_WISH');
          isOkCheckWish = false;
          isThereError = true;
          break;
        }
      }
      if (isOkCheckWish) {
        this.studentAc.wish_academy_code_1 = "";
        if (this.wishesArray.length > 0) {
          this.studentAc.wish_academy_code_1 = this.wishesArray[0].academy_code;
        }
        if ((this.studentAc.wish_academy_code_1 === "")) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_WISH', 'ERROR_WISH').trim();
          isThereError = true;
        }
      }

      if (Constants.min_heard_about_us_no > 0 && this.studentAc.heard_about_us.length < Constants.min_heard_about_us_no) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_HEARD_ABOUT_US', 'ERROR_HEARD_ABOUT_US').trim().replace('{0}', Constants.min_heard_about_us_no.toString());
        isThereError = true;
      }

      if (Constants.max_heard_about_us_no > 0 && this.studentAc.heard_about_us.length > Constants.max_heard_about_us_no) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_HEARD_ABOUT_US_MAX', 'ERROR_HEARD_ABOUT_US_MAX').replace('{0}', Constants.max_heard_about_us_no.toString()).trim();
        isThereError = true;
      }

      for (let row of this.transformerUniversitiesArr) {
        if ((row.university_id === "")) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.university_id', 'university_id').trim();
          isThereError = true;
          break;
        }

        if ((row.specialization_id === "") && !this.checkFldIsHidden('transformer_universities_specialization_id')) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.transformer_universities_specialization_id', 'specialization_id').trim();
          isThereError = true;
          break;
        }
      }

      if (this.studentAc.has_chronic_diseases === 1) {
        this.studentAc.chronic_diseases_details = this.studentAc.chronic_diseases_details.trim();
        if (this.studentAc.chronic_diseases_details === "") {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.chronic_diseases_details', 'chronic_diseases_details').trim();
          isThereError = true;
        }
      }

      if (this.studentAc.use_university_transportation === 1 && !this.checkFldIsHidden('transportation_area_id')) {
        if (this.studentAc.transportation_area_id === '0' || this.studentAc.transportation_area_id === '') {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.transportation_area_id', 'transportation_area_id').trim();
          isThereError = true;
        }
      }

      if (this.studentAc.have_any_siblings === 1) {
        if (this.siblingsArr.length === 0) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.siblings', 'siblings').trim();
          isThereError = true;
        } else {

          await this.checkSiblingsAll();

          for (let sibling of this.siblingsArr) {
            if (this.siblingsArr.filter(s => s.sibling_student_code.trim() === sibling.sibling_student_code.trim()).length > 1) {
              if (errorStrArr !== "") {
                errorStrArr += "</br>";
              }
              errorStrArr += "-" + this.i18n.get('corr.ERROR_SIBLING_CODE_DUPLICATE', 'ERROR_SIBLING_CODE_DUPLICATE').trim();
              isThereError = true;
              break;
            }
          }

          if (this.siblingsArr.filter(sibling => sibling.sibling_student_code === "").length > 0) {
            if (errorStrArr !== "") {
              errorStrArr += "</br>";
            }
            errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.siblings', 'siblings').trim();
            isThereError = true;
          }
        }
      }

      for (let row of this.studentRequestAchievementsArr) {
        if ((row.achievement_id === "")) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.achievement_id', 'achievement_id').trim();
          isThereError = true;
          break;
        }
      }
    }

    if (isThereError) {
      this.ui.error(this.i18n.get('corr.' + errorStrArr, errorStrArr));
    }
    return isThereError;
  }

  checkDateOfBirth() {
    if (!this.validateDateOfBirth(this.studentAc.birth_date)) {
      this.ui.error(this.i18n.get('corr.Age_Error', 'Age_Error'));
    }
  }

  // validateDateOfBirth(dateOfBirth: string): boolean {
  //   if (this.studentAc.citizen_serial_type === '2' && this.checkFldIsHidden('stop_validate_on_birthdate_case_foreign_student')) {
  //     return true;
  //   }
  //   // Parse the string date to a Date object
  //   const dobDate = new Date(dateOfBirth);
  //   // Calculate current date
  //   const currentDate = new Date();
  //   // Calculate minimum and maximum birth dates based on age range
  //   const minBirthDate = new Date(currentDate.getFullYear() - Constants.max_age, currentDate.getMonth(), currentDate.getDate());
  //   const maxBirthDate = new Date(currentDate.getFullYear() - Constants.min_age, currentDate.getMonth(), currentDate.getDate());
  //   // Check if the provided date of birth falls within the age range
  //   return dobDate >= minBirthDate && dobDate <= maxBirthDate;
  // }

  validateDateOfBirth(dateOfBirth: string): boolean {
  if (
    this.studentAc.citizen_serial_type === '2' &&
    this.checkFldIsHidden('stop_validate_on_birthdate_case_foreign_student')
  ) {
    return true;
  }

  const dobDate = new Date(dateOfBirth);
  const currentDate = new Date();

  const maxBirthDate = new Date(
    currentDate.getFullYear() - Constants.min_age,
    currentDate.getMonth(),
    currentDate.getDate()
  );

  return dobDate <= maxBirthDate;
}

  onPhoneNumberKeyUp(event: any) {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;
    // Remove all non-numeric characters
    const numericValue = inputValue.replace(/\D/g, '');
    // Update the input value with only numeric characters
    input.value = numericValue;
  }

  onEnglishKeyUp(event: any, type: number) {
    const input = event.target as HTMLInputElement;
    let inputValue = input.value;
    // Remove all characters that are not from A to Z
    const alphaNumericValue = inputValue.replace(/[^\sA-Za-z]/g, '');
    // Capitalize only the first character of the input
    const capitalizedValue = alphaNumericValue.charAt(0).toUpperCase() + alphaNumericValue.slice(1).toLowerCase();
    // Update the input value with only alpha characters and capitalized first character
    input.value = capitalizedValue;
    if (type === 1) {
      this.studentAc.first_name_en = capitalizedValue;
    } else if (type === 2) {
      this.studentAc.middle_name_en = capitalizedValue;
    } else if (type === 3) {
      this.studentAc.grand_name_en = capitalizedValue;
    } else if (type === 4) {
      this.studentAc.surname_en = capitalizedValue;
    }
  }
  checkFldIsHidden(fldName: string): boolean {
    return this.hidden_flds.filter(f => f === fldName).length > 0;
  }
  onArabicKeyUp(event: any) {
    const input = event.target as HTMLInputElement;
    let inputValue = input.value;
    // Remove all characters that are not Arabic
    //    const arabicValue = inputValue.replace(/[^؀-ۿ]/g, '');
    const arabicValue = inputValue.replace(/[^\s؀-ۿ]/g, '');
    // Update the input value with only Arabic characters
    input.value = arabicValue;
  }

  changeSpecializ() {
    this.studentAc.wish_academy_code_1 = "";
    this.wishesArray = [];
    for (let x = 0; x < Constants.mandatory_wishs_no; x++) {
      this.wishesArray.push(new StudentRequestWishes());
      for (let i = 0; i < this.wishesArray.length; i++) {
        const element = this.wishesArray[i];
        element.ordered = i + 1;
      }
    }
  }

  handleInput(event: KeyboardEvent): void {
    event.stopPropagation();
  }

  limitSelection(event: any) {
    if (Constants.min_heard_about_us_no > 0 && this.studentAc.heard_about_us.length < Constants.min_heard_about_us_no) {
      this.ui.error(this.i18n.get('corr.ERROR_HEARD_ABOUT_US', 'ERROR_HEARD_ABOUT_US').trim().replace('{0}', Constants.min_heard_about_us_no.toString()));
    }
    if (Constants.max_heard_about_us_no > 0 && this.studentAc.heard_about_us.length > Constants.max_heard_about_us_no) {
      this.ui.error(this.i18n.get('corr.ERROR_HEARD_ABOUT_US_MAX', 'ERROR_HEARD_ABOUT_US_MAX').trim().replace('{0}', Constants.max_heard_about_us_no.toString()));
    }
  }
}