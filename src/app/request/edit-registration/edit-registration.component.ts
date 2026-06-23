/**
 * @author Mohammad Zidan
 * <a href="mailto:mohamed.zidan@esmartsoft.com.eg">mohamed.zidan@esmartsoft.com.eg</a>
 */
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataProvider } from '../../providers/DataProvider';
import { I18N } from '../../providers/i18n.provider';
import { UIService } from '../../providers/ui.service';
import { MatDialog } from '@angular/material/dialog';
import { MediaMatcher } from '@angular/cdk/layout';
import { Constants } from '../../providers/Constants';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Manipulate } from '../../model/data-manipulate';
import { SmartResponse } from '../../model/smart-communication';
import { StudentRequest, StudentStatusRecord } from '../../model/studentRequest';
import { StudentRequestContacts } from '../../model/studentRequestContacts';
import { ComboBoxRec, WherePart } from '../../model/combobox';
import { SessionProvider } from 'src/app/providers/session.provider';
import { StudentRequestWishes } from 'src/app/model/studentRequestWishes';

@Component({
  selector: 'app-edit-registration',
  templateUrl: './edit-registration.component.html',
  styleUrls: ['./edit-registration.component.scss'],
})
export class EditRegistrationComponent implements OnInit, OnDestroy {

  sublang: Subscription;
  lang: string = "en";
  direction: boolean = true;

  activeMask: boolean = false;
  ttlRequest: number = 0;

  studentAc: StudentRequest = new StudentRequest();
  studentContactData: StudentRequestContacts = new StudentRequestContacts();
  parentContactData1: StudentRequestContacts = new StudentRequestContacts();
  parentContactData2: StudentRequestContacts = new StudentRequestContacts();
  parentContactData3: StudentRequestContacts = new StudentRequestContacts();
  wishesArray: StudentRequestWishes[] = [];
  studentStatusRecord: StudentStatusRecord = new StudentStatusRecord();

  comboxArrNationality: ComboBoxRec[] = [];
  comboxArrAcademy: ComboBoxRec[] = [];
  comboxArrAllAcademy: ComboBoxRec[] = [];
  comboxArr_relative_relation_id: ComboBoxRec[] = [];
  comboxArrDegreeType: ComboBoxRec[] = [];
  comboxArrCertObtainingYear: ComboBoxRec[] = [];
  comboxArrGovernorateCode: ComboBoxRec[] = [];
  comboxArrCountry: ComboBoxRec[] = [];
  selectedCertificateCountry = new ComboBoxRec();
  comboxArr_school_id: ComboBoxRec[] = [];

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

  showGovCode = false;

  mobileQuery: MediaQueryList;
  _mobileQueryListener: () => void;

  enable_payment: boolean = false;

  viewOnly: boolean = false;

  enable_add_more_wishs: boolean = false;

  paymentClosed: boolean = false;

  constructor(
    public provider: DataProvider,
    public i18n: I18N,
    private ui: UIService,
    public dialog: MatDialog,
    private httpClient: HttpClient,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private router: Router,
    private session: SessionProvider,
    private activatedRoute: ActivatedRoute) {
    this.mobileQuery = media.matchMedia('(max-width: 800px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.enable_payment = Constants.enable_payment;
    this.enable_add_more_wishs = Constants.enable_add_more_wishs;
    if (!this.session.isLoggedIn()) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
    this.sublang = this.i18n.observeLanguage().subscribe({
      next: (lang) => {
        this.lang = lang;
        this.direction = this.provider.getDirection(this.lang);
      }
    });
    this.lang = I18N.lang;
    this.direction = this.provider.getDirection(this.lang);
    this.activatedRoute.queryParams.subscribe(paramList => {
      let params = {};
      try {
        params = JSON.parse(this.provider.decrypt(paramList['params']));
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

    });

    this.getRegistrationData();
    this.populateDegreeTypeComboxArr();
    this.populatecomboxArr_academyCode_all();
    this.populateComboxArrCertObtainingYear();
    this.populatecomboxArr_governorateCode();
  }

  ngOnDestroy() {
    if (this.sublang) {
      this.sublang.unsubscribe();
    }
  }

  onChangeMainCategoryFlag() {
    this.populateDegreeTypeComboxArr();
  }

  onChangePreUniversityDegree() {
    for (let element of this.comboxArrDegreeType) {
      if (this.studentAc.pre_university_degree === element.id) {
        this.studentAc.category_flag = element.additional_data1;
        this.studentAc.main_category_flag = element.additional_data1;
        break;
      }
    }
  }

  changeSpecializ() {
    this.studentAc.wish_academy_code_1 = "";
    this.wishesArray = [];
    this.wishesArray.push(new StudentRequestWishes());
    for (let i = 0; i < this.wishesArray.length; i++) {
      const element = this.wishesArray[i];
      element.ordered = i + 1;
    }
  }



  populateComboxArrCertObtainingYear() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_obtaining_year_select');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_obtaining_year_select', servletUrl, formData);
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
    formData.append('viewCode', 'populate_nationally_select');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_nationally_select', servletUrl, formData);
  }

  populatecomboxArr_governorateCode() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_governorate_code_select');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_governorate_code_select', servletUrl, formData);
  }

  populateDegreeTypeComboxArr() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('conType', 'academic_central');
    formData.append('viewCode', 'populate_degree_type_code_select_all');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_degree_type_code_select', servletUrl, formData);
  }


  populatecomboxArr_academyCode_all() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_all_academy_code_select');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_all_academy_code_select', servletUrl, formData);
  }

  populatecomboxArr_academyCode() {
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
  populateRelativeRelationComboxArr() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_relative_relation_id_select');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_relative_relation_id_select', servletUrl, formData);
  }

  getRegistrationData() {
    let servletUrl: string = Constants.baseUrl + '/registration';
    const formData = new FormData();
    formData.append('transaction', 'select');
    this.eSendForm(this, 'select_registration_data', servletUrl, formData);
  }

  populateSchoolComboxArr() {
    this.comboxArr_school_id = [];
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

  onChangeCertificateCountry(comboxRec: ComboBoxRec) {
    this.selectedCertificateCountry = comboxRec;
    this.studentAc.main_category_flag = '1';
    this.studentAc.pre_university_degree = "0";
    this.studentAc.certificate_school_id = "";
    this.onChangeMainCategoryFlag();
    this.populateSchoolComboxArr();
  }

  doSave() {
    if (!this.checkError()) {

      this.studentAc.first_name_ar = this.studentAc.first_name_ar.trim().toLowerCase();
      this.studentAc.middle_name_ar = this.studentAc.middle_name_ar.trim().toLowerCase();
      this.studentAc.grand_name_ar = this.studentAc.grand_name_ar.trim().toLowerCase();
      this.studentAc.surname_ar = this.studentAc.surname_ar.trim().toLowerCase();

      this.studentAc.first_name_en = this.studentAc.first_name_en.trim().toLowerCase();
      this.studentAc.middle_name_en = this.studentAc.middle_name_en.trim().toLowerCase();
      this.studentAc.grand_name_en = this.studentAc.grand_name_en.trim().toLowerCase();
      this.studentAc.surname_en = this.studentAc.surname_en.trim().toLowerCase();

      let studentAcRecordCopy = { ...this.studentAc };
      studentAcRecordCopy.birth_date = this.provider.convertStringToDate(studentAcRecordCopy.birth_date);
      studentAcRecordCopy.passport_issuance_date = this.provider.convertStringToDate(studentAcRecordCopy.passport_issuance_date);
      studentAcRecordCopy.passport_expiry_date = this.provider.convertStringToDate(studentAcRecordCopy.passport_expiry_date);
      let servletUrl: string = Constants.baseUrl + '/registration';
      const formData = new FormData();
      formData.append('transaction', 'update');
      formData.append('studentRequest', '' + JSON.stringify(studentAcRecordCopy));
      formData.append('studentContactData', '' + JSON.stringify(this.studentContactData));
      formData.append('parentContactData1', '' + JSON.stringify(this.parentContactData1));
      formData.append('parentContactData2', '' + JSON.stringify(this.parentContactData2));
      formData.append('parentContactData3', '' + JSON.stringify(this.parentContactData3));
      formData.append('wishesArray', '' + JSON.stringify(this.wishesArray));
      this.eSendForm(this, 'update_registration_data', servletUrl, formData);
    }

  }

  addNewRow() {
    if ((this.wishesArray.length + 1) > Constants.max_wishs) {
      return;
    } else {
      this.wishesArray.push(new StudentRequestWishes());
      this.updateOrderedValues();
    }
  }

  deleteRow(selected: StudentRequestWishes) {
    this.wishesArray.splice(this.wishesArray.indexOf(selected), 1);
    if (this.wishesArray.length === 0) {
      this.addNewRow();
    } else {
      this.updateOrderedValues();
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

  getSelectedCountryCodeLabel(countryCode: string): any {
    for (let element of this.provider.options) {
      if (element.value === countryCode) {
        return element;
      }
    }
  }

  onPhoneNumberKeyUp(event: any) {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;
    // Remove all non-numeric characters
    const numericValue = inputValue.replace(/\D/g, '');
    // Update the input value with only numeric characters
    input.value = numericValue;
  }

  validateDateOfBirth(dateOfBirth: string): boolean {
    // Parse the string date to a Date object
    const dobDate = new Date(dateOfBirth);
    // Calculate current date
    const currentDate = new Date();
    // Calculate minimum and maximum birth dates based on age range
    const minBirthDate = new Date(currentDate.getFullYear() - Constants.max_age, currentDate.getMonth(), currentDate.getDate());
    const maxBirthDate = new Date(currentDate.getFullYear() - Constants.min_age, currentDate.getMonth(), currentDate.getDate());
    // Check if the provided date of birth falls within the age range
    return dobDate >= minBirthDate && dobDate <= maxBirthDate;
  }

  onEnglishKeyUp(event: any) {
    const input = event.target as HTMLInputElement;
    let inputValue = input.value;
    // Remove all characters that are not from A to Z
    const alphaNumericValue = inputValue.replace(/[^A-Za-z]/g, '');
    // Update the input value with only alpha characters
    input.value = alphaNumericValue;
  }

  onArabicKeyUp(event: any) {
    const input = event.target as HTMLInputElement;
    let inputValue = input.value;
    // Remove all characters that are not Arabic
    const arabicValue = inputValue.replace(/[^؀-ۿ]/g, '');
    // Update the input value with only Arabic characters
    input.value = arabicValue;
  }

  handleInput(event: KeyboardEvent): void {
    event.stopPropagation();
  }

  onInputEvent(event: any): void {
    if (this.studentAc.citizen_serial_type === '1') {
      event.target.value = event.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    }
  }

  onInputEvent2(event: any, element: StudentRequestContacts): void {
    if (element.citizen_serial_type === '1') {
      event.target.value = event.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    }
  }


  checkError() {
    if (this.studentAc.is_father_past_away === 1) {
      this.parentContactData2 = new StudentRequestContacts();
    }
    if (this.studentAc.is_mother_past_away === 1) {
      this.parentContactData3 = new StudentRequestContacts();
    }
    // let regexMail = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    let regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    let errorStrArr = "";
    let isThereError: boolean = false;
    this.studentAc.first_name_ar = this.studentAc.first_name_ar.trim().toLowerCase();
    this.studentAc.middle_name_ar = this.studentAc.middle_name_ar.trim().toLowerCase();
    this.studentAc.grand_name_ar = this.studentAc.grand_name_ar.trim().toLowerCase();
    this.studentAc.surname_ar = this.studentAc.surname_ar.trim().toLowerCase();
    this.studentAc.first_name_en = this.studentAc.first_name_en.trim().toLowerCase();
    this.studentAc.middle_name_en = this.studentAc.middle_name_en.trim().toLowerCase();
    this.studentAc.grand_name_en = this.studentAc.grand_name_en.trim().toLowerCase();
    this.studentAc.surname_en = this.studentAc.surname_en.trim().toLowerCase();

    if (this.showGovCode) {
      if ((this.studentAc.first_name_ar === "") || (this.studentAc.middle_name_ar === "") || (this.studentAc.grand_name_ar === "") || (this.studentAc.surname_ar === "")) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_NAME', 'ERROR_NAME').trim();
        isThereError = true;
      }
    } else {
      if ((this.studentAc.first_name_ar === "") || (this.studentAc.surname_ar === "")) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_NAME_FOREIGN', 'ERROR_NAME_FOREIGN').trim();
        isThereError = true;
      }
    }

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
    } else {
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




    this.parentContactData1.relative_relation_name = this.parentContactData1.relative_relation_name.trim();
    this.parentContactData2.relative_relation_name = this.parentContactData2.relative_relation_name.trim();

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

    this.parentContactData1.mobile = this.parentContactData1.mobile.trim();
    if (this.parentContactData1.mobile === "") {
      if (errorStrArr !== "") {
        errorStrArr += "</br>";
      }
      errorStrArr += "-" + this.i18n.get('corr.ERROR_PARENT_MOBILE', 'ERROR_PARENT_MOBILE').trim();
      isThereError = true;
    } else if (this.parentContactData1.mobile_country_code === "+2" && this.parentContactData1.mobile.length != 11) {
      if (errorStrArr !== "") {
        errorStrArr += "</br>";
      }
      errorStrArr += "-" + this.i18n.get('corr.ERROR_MOBILE_LENGTH', 'ERROR_MOBILE_LENGTH').trim();
      isThereError = true;
    }

    if (this.parentContactData1.mobile === this.studentContactData.mobile) {
      if (errorStrArr !== "") {
        errorStrArr += "</br>";
      }
      errorStrArr += "-" + this.i18n.get('corr.ERROR_PARENT_MOBILE_2', 'ERROR_PARENT_MOBILE_2').trim();
      isThereError = true;
    }

    if (this.parentContactData1.citizen_serial !== "") {
      if (this.parentContactData1.citizen_serial_type === "1") {
        if (this.parentContactData1.citizen_serial.length != 14) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.ERROR_PARENT_CITIZEN_SERIAL_LENGTH', 'ERROR_PARENT_CITIZEN_SERIAL_LENGTH').trim() + "/ 2";
          isThereError = true;
        }
      }

      if ((this.studentAc.citizen_serial.toLocaleLowerCase() === this.parentContactData1.citizen_serial.toLocaleLowerCase())
        || (this.parentContactData1.citizen_serial.toLocaleLowerCase() === this.parentContactData2.citizen_serial.toLocaleLowerCase())) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_PARENT_CITIZEN_SERIAL_DUPLICATE', 'ERROR_PARENT_CITIZEN_SERIAL_DUPLICATE').trim() + "/ 2";
        isThereError = true;
      }
    }

    if (this.parentContactData1.email != "") {
      if (!regexMail.test(this.parentContactData1.email)) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_CONTACT_EMAIL', 'ERROR_CONTACT_EMAIL').trim();
        isThereError = true;
      }
    }

    if (this.parentContactData2.email != "") {
      if (!regexMail.test(this.parentContactData2.email)) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_CONTACT_EMAIL', 'ERROR_CONTACT_EMAIL').trim();
        isThereError = true;
      }
    }

    if (this.parentContactData3.email != "") {
      if (!regexMail.test(this.parentContactData3.email)) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_CONTACT_EMAIL', 'ERROR_CONTACT_EMAIL').trim();
        isThereError = true;
      }
    }


    if (typeof this.parentContactData1.gov_code === 'undefined' || this.parentContactData1.gov_code === "") {
      if (errorStrArr !== "") {
        errorStrArr += "</br>";
      }
      errorStrArr += "-" + this.i18n.get('corr.ERROR_GOV_ADRESS', 'ERROR_GOV_ADRESS');
      isThereError = true;
    }

    if (typeof this.parentContactData1.adress === 'undefined' || this.parentContactData1.adress === "") {
      if (errorStrArr !== "") {
        errorStrArr += "</br>";
      }
      errorStrArr += "-" + this.i18n.get('corr.ERROR_ADRESS', 'ERROR_ADRESS').trim();
      isThereError = true;
    }

    if (this.parentContactData2.citizen_serial !== "") {
      if (this.parentContactData2.citizen_serial_type === "1") {
        if (this.parentContactData2.citizen_serial.length != 14) {
          if (errorStrArr !== "") {
            errorStrArr += "</br>";
          }
          errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.ERROR_PARENT_CITIZEN_SERIAL_LENGTH', 'ERROR_PARENT_CITIZEN_SERIAL_LENGTH').trim() + "/ 2";
          isThereError = true;
        }
      }

      if ((this.studentAc.citizen_serial.toLocaleLowerCase() === this.parentContactData2.citizen_serial.toLocaleLowerCase())
        || (this.parentContactData1.citizen_serial.toLocaleLowerCase() === this.parentContactData2.citizen_serial.toLocaleLowerCase())) {
        if (errorStrArr !== "") {
          errorStrArr += "</br>";
        }
        errorStrArr += "-" + this.i18n.get('corr.ERROR_PARENT_CITIZEN_SERIAL_DUPLICATE', 'ERROR_PARENT_CITIZEN_SERIAL_DUPLICATE').trim() + "/ 2";
        isThereError = true;
      }
    }

    if (typeof this.studentAc.certificate_country_id === 'undefined' || this.studentAc.certificate_country_id === "") {
      if (errorStrArr !== "") {
        errorStrArr += "</br>";
      }
      errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.certificate_country_id', 'certificate_country_id').trim();
      isThereError = true;
    }

    // if (this.selectedCertificateCountry.additional_data1 === '1') {
    //   if (typeof this.studentAc.certificate_gov_id === 'undefined' || this.studentAc.certificate_gov_id === "") {
    //     if (errorStrArr !== "") {
    //       errorStrArr += "</br>";
    //     }
    //     errorStrArr += "-" + this.i18n.get('corr.ERROR_PLEASE_ENTER', 'ERROR_PLEASE_ENTER') + this.i18n.get('corr.certificate_gov_id', 'certificate_gov_id').trim();
    //     isThereError = true;
    //   }
    // }

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
      this.studentAc.degree_year === '0' ||
      this.studentAc.degree_year === '' ||
      this.studentAc.pre_university_degree === '' ||
      this.studentAc.pre_university_degree === '0'
    ) {
      if (errorStrArr !== '') {
        errorStrArr += '</br>';
      }
      errorStrArr += '-' + this.i18n.get('corr.ERROR_CERT_INFO', 'ERROR_CERT_INFO');
      isThereError = true;
    }

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
        isThereError = true;
        break;
      }
    }

    this.studentAc.wish_academy_code_1 = "";


    if (this.wishesArray.length < Constants.mandatory_wishs_no) {
      if (errorStrArr !== "") {
        errorStrArr += "</br>";
      }
      errorStrArr += '-' + this.i18n.get('corr.ERROR_WISH_NO', 'ERROR_WISH_NO').replace('{0}', Constants.mandatory_wishs_no.toString());
      isThereError = true;
    }

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
        isThereError = true;
        break;
      }
    }

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


    if (isThereError) {
      this.ui.error(this.i18n.get('corr.' + errorStrArr, errorStrArr));
    }
    return isThereError;
  }

  eSendForm(handler: any, key: string, backendURL: string, formData: FormData) {
    formData.append('lang', this.lang);
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true,
    };
    this.ttlRequest += 1;
    this.activeMask = true;
    this.httpClient.post<SmartResponse>(backendURL, formData, options)
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
    if (key === "select_registration_data") {
      let data = smartResponse.resultset[0];
      this.studentAc = data['masterRecordData'];
      this.wishesArray = data['wishesArray'];
      this.populatecomboxArrCountry();
      this.populatecomboxArrNationally();
      this.populateSchoolComboxArr();
      if (this.studentAc.request_status === 1) {
        this.ui.info(this.i18n.get('corr.ERROR_REQUEST_IS_CLOSED', 'ERROR_REQUEST_IS_CLOSED'));
        this.viewOnly = true;
      }

      if (smartResponse['studentRecord']) {
        this.studentStatusRecord = <StudentStatusRecord>smartResponse['studentRecord'];

        if (this.studentStatusRecord.is_approve === 1) {
          this.ui.success(this.i18n.get('corr.ERROR_REQUEST_IS_APPROVED', 'ERROR_REQUEST_IS_APPROVED'));
          this.viewOnly = true;
        }

        if (this.studentStatusRecord.is_approve === 2) {
          this.ui.warning(this.i18n.get('corr.ERROR_REQUEST_IS_REJECTED', 'ERROR_REQUEST_IS_REJECTED'));
          this.viewOnly = true;
        }

        if (this.studentStatusRecord.is_initial_approve === 1) {
          this.ui.success(this.i18n.get('corr.ERROR_REQUEST_IS_INITIAL_APPROVED', 'ERROR_REQUEST_IS_INITIAL_APPROVED'));
          this.viewOnly = true;
        }
      }

      let contactArr: StudentRequestContacts[] = data['studentContactArr'];
      for (let row of contactArr) {
        if (row.relation_type === 1) {
          this.studentContactData = row;
        } else if (row.relation_type === 2) {
          this.parentContactData1 = row;
        } else if (row.relation_type === 3) {
          this.parentContactData2 = row;
        } else if (row.relation_type === 4) {
          this.parentContactData3 = row;
        }
      }
      this.populatecomboxArr_academyCode();
      this.onChangePreUniversityDegree();
      this.onChangeMainCategoryFlag();
      this.populateRelativeRelationComboxArr();
    } else if (key === "populate_academy_code_select") {
      this.comboxArrAcademy = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
      for (let element of this.wishesArray) {
        if (this.comboxArrAcademy.filter(x => x.id === element.academy_code).length === 0) {
          this.paymentClosed = true;
          this.comboxArrAcademy = this.comboxArrAllAcademy;
          break;
        }
      }
    } else if (key === "populate_all_academy_code_select") {
      this.comboxArrAllAcademy = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "populate_relative_relation_id_select") {
      this.comboxArr_relative_relation_id = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
      if (this.comboxArr_relative_relation_id.length > 0) {
        if (this.parentContactData2.relative_relation_id === "" || this.parentContactData2.relative_relation_id === "0") {
          this.parentContactData2.relative_relation_id = this.comboxArr_relative_relation_id[0].id;
        }
      }
      if (this.comboxArr_relative_relation_id.length > 1) {
        if (this.parentContactData3.relative_relation_id === "" || this.parentContactData3.relative_relation_id === "0") {
          this.parentContactData3.relative_relation_id = this.comboxArr_relative_relation_id[1].id;
        }
      }
    } else if (key === "update_registration_data") {
      if (smartResponse.response.code == 200) {
        this.ui.success(this.i18n.get('corr.data_updated', 'dataUpdated'));
        this.getRegistrationData();
      } else if (smartResponse.response.code == 201) {
        this.ui.success(this.i18n.get('corr.other', 'other'));
      }
    } else if (key === 'populate_degree_type_code_select') {
      this.comboxArrDegreeType = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_obtaining_year_select') {
      this.comboxArrCertObtainingYear = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_governorate_code_select') {
      this.comboxArrGovernorateCode = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "populate_school_select") {
      this.comboxArr_school_id = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_nationally_select') {
      this.comboxArrNationality = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
      for (let element of this.comboxArrNationality) {
        if ((this.studentAc.country_id === element.id) && (element.additional_data1 === '1')) {
          this.showGovCode = true;
          break;
        }
      }
    } else if (key === 'populate_country_select') {
      this.comboxArrCountry = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
      for (let row of this.comboxArrCountry) {
        if (this.studentAc.certificate_country_id === row.id) {
          this.selectedCertificateCountry = row;
          break;
        }
      }
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
    if (key === "update_registration_data") {
      let error = exception['error'] || exception['errors'];
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
      console.log('event Sent => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.UploadProgress) {
      //An upload progress event was received.
      console.log('event UploadProgress => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.ResponseHeader) {
      //The response status code and headers were received.
      console.log('event ResponseHeader => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.DownloadProgress) {
      //A download progress event was received.
      console.log('event DownloadProgress => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.Response) {
      //The full response including the body was received.
      let smartResponse = <SmartResponse>event.body;
      this.eResponseSuccess(key, smartResponse);
    }
    if (event.type === HttpEventType.User) {
      //A custom event from an interceptor or a backend.
      console.log('event User => ' + key + '=>' + JSON.stringify(event, null, 4));
    }
  }
} 