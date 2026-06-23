/**
 * @author Mohammad Zidan
 * <a href="mailto:mohamed.zidan@esmartsoft.com.eg">mohamed.zidan@esmartsoft.com.eg</a>
 */
import { ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { DataProvider } from '../../providers/DataProvider';
import { I18N } from '../../providers/i18n.provider';
import { UIService } from '../../providers/ui.service';
import { MatDialog } from '@angular/material/dialog';
import { MediaMatcher } from '@angular/cdk/layout';
import { Constants } from '../../providers/Constants';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Manipulate } from '../../model/data-manipulate';
import { SmartResponse } from '../../model/smart-communication';
import { RegistrationInstructions } from '../../model/registrationInstructions';
import { StudentRequest, StudentRequestSiblings } from '../../model/studentRequest';
import { StudentRequestContacts } from '../../model/studentRequestContacts';
import { ComboBoxRec, WherePart } from '../../model/combobox';
import { SessionProvider } from 'src/app/providers/session.provider';
import { PlatformLocation } from '@angular/common';
import { StudentRequestWishes } from 'src/app/model/studentRequestWishes';
import { FawryPayHistory } from 'src/app/model/fawrySettings';
import { StudentStepStatus } from 'src/app/model/studentStepStatus';
import { StudentApplicationFormComponent } from '../student-application-form/student-application-form.component';
import { ReportViwerComponent } from 'src/app/common/report-viwer/report-viwer.component';
import { Q } from 'src/app/providers/q';
import { ThanksMessage } from 'src/app/model/thanksMessage';
import { MessageDialogComponent } from '../../common/message-dialog/message-dialog.component';
import { InterviewSlotes } from 'src/app/model/interviewPeriodsSetting';
import { Discounts } from 'src/app/model/discounts';
import { LazyLoaderService } from 'src/app/providers/lazy-loader.service';
import { AnalyticsService } from 'src/app/providers/analytics/analytics.service';

@Component({
  selector: 'page-view-registration',
  templateUrl: 'view-registration.page.html',
  styleUrls: ['view-registration.page.scss'],
})
export class ViewRegistrationPage implements OnInit, OnDestroy {

  sublang: Subscription;
  lang: string = "en";
  direction: boolean = true;
  activeMask: boolean = false;

  registrationInstructionsArr: RegistrationInstructions[] = [];

  studentAc: StudentRequest = new StudentRequest();
  studentContactData: StudentRequestContacts = new StudentRequestContacts();
  parentContactData1: StudentRequestContacts = new StudentRequestContacts();

  wishesArray: StudentRequestWishes[] = [];
  siblingsArr: StudentRequestSiblings[] = [];

  fawryPayHistoryArray: FawryPayHistory[] = [];
  fawryPayHistoryFirstSemesterArray: FawryPayHistory[] = [];
  fawryPayHistoryViewArray: FawryPayHistory[] = [];

  studentStepStatusArr: StudentStepStatus[] = [];

  comboxArrAcademy: ComboBoxRec[] = [];
  comboxArr_relative_relation_id: ComboBoxRec[] = [];

  returnUrl: string = "";

  interviewSlotes: InterviewSlotes = new InterviewSlotes();
  refreshSub: Subscription;
  lastRefresh: Date = new Date();

  mobileQuery: MediaQueryList;
  _mobileQueryListener: () => void;

  enable_payment: boolean = false;
  paramList: any;
  isFawryMessageDailogShow: boolean = false;

  discount: Discounts = new Discounts();
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  private countdownInterval: any;

  enable_efinance_admission_fees: boolean = false;
  enable_fawry_admission_fees: boolean = false;
  enable_efinance_first_semester_fees: boolean = false;
  enable_fawry_first_semester_fees: boolean = false;
  enable_print_first_semester_fees: boolean = false;

  paymentClosed: boolean = false;

  constructor(
    private provider: DataProvider,
    public i18n: I18N,
    private ui: UIService,
    public dialog: MatDialog,
    private router: Router,
    private platformLocation: PlatformLocation,
    private session: SessionProvider,
    private httpClient: HttpClient,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2,
    private lazyLoader: LazyLoaderService,
    private analytics: AnalyticsService) {
    this.mobileQuery = media.matchMedia('(max-width: 800px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  async ngOnInit() {
    if (Constants.enable_payment) {
      await this.lazyLoader.loadScript(Constants.fawry_url_script);
      await this.lazyLoader.loadStyle(Constants.fawry_url_style);
    }
    this.enable_payment = Constants.enable_payment;
    this.enable_efinance_admission_fees = Constants.enable_efinance_admission_fees;
    this.enable_fawry_admission_fees = Constants.enable_fawry_admission_fees;
    this.enable_efinance_first_semester_fees = Constants.enable_efinance_first_semester_fees;
    this.enable_fawry_first_semester_fees = Constants.enable_fawry_first_semester_fees;
    this.enable_print_first_semester_fees = Constants.enable_print_first_semester_fees;

    this.returnUrl = this.getCurrentLocation() + "#view"; //https://localhost:5673/#/view
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
      if ((paramList['statusCode']) && ('' + paramList['statusCode'] === "200")) {
        this.paramList = paramList;
        this.ui.success('Fawry Payment ' + paramList['statusDescription']);

        if (paramList['paymentStatus']?.toUpperCase() === 'PAID') {

          this.analytics.paymentCompleted({
            transaction_id: paramList['fawryRefNumber'],
            value: paramList['paymentAmount'],
            currency: 'EGP',
            user_data: {
              email_address: paramList['customerMail'],
              phone_number: paramList['customerMobile'],
              address: {
                first_name: this.getFirstName(paramList['customerName']),
                last_name: this.getLastName(paramList['customerName'])
              }
            }
          });
        }

        this.updatefawryLogStatus();
      } else if (paramList['statusCode']) {
        this.paramList = paramList;
        this.ui.warning(paramList['statusDescription']);
        this.updatefawryLogStatus();
      }
    });
    this.getDiscounts();
    this.getRegistrationInstructions();
    this.getRegistrationData();
    this.populatecomboxArr_academyCode();
    this.populateRelativeRelationComboxArr();
  }

  ngOnDestroy() {
    if (this.sublang) {
      this.sublang.unsubscribe();
    }
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private getFirstName(fullName: string): string {
    return fullName?.split(' ')[0] || 'Unknown';
  }

  private getLastName(fullName: string): string {
    if (!fullName) return 'Unknown';
    const parts = fullName.trim().split(' ');
    return parts.slice(1).join(' ') || 'Unknown';
  }

  showStep(selected: StudentStepStatus) {
    if (selected.sys_type === 1) {
      if (this.studentAc.due_value === 0) {
        return false;
      }
    } else if (selected.sys_type === 2) {
      if (this.studentAc.remain_value <= 0) {
        return false;
      }
    }
    return true;
  }

  openStepUrl(selected: StudentStepStatus) {
    if (selected.sys_type === 5) {
      this.joinInterview();
    } else if (selected.step_url) {
      if (selected.sys_type === 1) { // Pay Admmision Fees; 
        if (selected.step_url.startsWith('document.getElementById')) {
          if (selected.step_url.includes("fawry-payment-btn") && this.paymentClosed === true) {
            this.ui.warning(this.i18n.get("corr.payment_is_closed", "Payment is closed"));
            return;
          }
          if (!selected.step_status) {
            this.executeDOMCommand(selected.step_url);
          }
        }
      } else if (selected.sys_type === 6) { //Pay Online The First Semester Fees;
        if (selected.step_url.startsWith('document.getElementById')) {
          if (!selected.step_status) {
            this.executeDOMCommand(selected.step_url);
          }
        }
      } else {
        if (selected.step_url === "print_1") {
          this.printRequest("1");
        } else if (selected.step_url === "print_2") {
          this.printRequest("3");
        } else if (selected.step_url === "print_3") {
          this.openStudentApplicationForm();
        } else {
          this.router.navigate([selected.step_url], { replaceUrl: true });
        }
      }
    }
  }

  private executeDOMCommand(command: string) {
    // Extract the element ID from the command
    const elementIdMatch = command.match(/document\.getElementById\('([^']+)'\)\.click\(\);/);
    if (elementIdMatch) {
      const elementId = elementIdMatch[1];
      if (document.getElementById(elementId)) {
        document.getElementById(elementId).click();
      }
    }
  }

  getDiscounts() {
    let servletUrl: string = Constants.baseUrl + '/crd/discounts';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'get_discounts', servletUrl, formData);
  }

  printRequest(revenueType: string) {
    let title = "";
    if (revenueType === "1") {
      title = this.i18n.get("corr.print_1", "corr.print_1");
    } else if (revenueType === "3") {
      title = this.i18n.get("corr.print_2", "corr.print_2");
    }
    let servletUrl: string = "";
    if (revenueType === "3") { // first_semester_fees // Stop this || (revenueType === "1")
      servletUrl = Constants.baseUrl + "/paymentOrderBankTaaleem?";
      servletUrl += encodeURIComponent(Q.i('transaction')) + "=" + encodeURIComponent(Q.i('select_list'));
      // servletUrl += "&" + encodeURIComponent(Q.i('revenue_type')) + "=" + encodeURIComponent(Q.i(revenueType));
      servletUrl += "&" + encodeURIComponent(Q.i('lang')) + "=" + encodeURIComponent(Q.i(this.lang));
    }
    const dialogRef = this.dialog.open(ReportViwerComponent, {
      data: { 'pdfSrc': servletUrl, 'title': title, disableClose: true, width: "100vw", maxWidth: '100vw', height: "100vh" }
    });
  }

  openStudentApplicationForm() {
    const dialogRef = this.dialog.open(StudentApplicationFormComponent, { width: "80vw", disableClose: true });
  }

  getCurrentLocation(): string {
    const host = this.platformLocation.hostname;
    const port = this.platformLocation.port;
    const path = this.platformLocation.pathname;
    return `https://${host}:${port}${path}`;
  }

  populatecomboxArr_academyCode() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_all_academy_code_select');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_all_academy_code_select', servletUrl, formData);
  }


  populatecomboxArr_academyCode_check_is_close() {
    if (this.studentAc.open_semester_id) {
      let servletUrl: string = Constants.baseUrl + '/combboxview';
      const formData = new FormData();
      formData.append('viewCode', 'populate_academy_code_select');
      formData.append('conType', 'academic_central');
      let values: WherePart[] = [];
      values.push(new WherePart({ value: this.studentAc.open_semester_id, type: "number" }));
      formData.append('values', JSON.stringify(values));
      formData.append('transaction', 'select_list');
      this.eSendForm(this, 'populate_academyCode_check_is_close', servletUrl, formData);
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

  getRegistrationInstructions() {
    let servletUrl: string = Constants.baseUrl + '/registration/instructions';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'select_registration_instructions', servletUrl, formData);
  }

  getRegistrationData() {
    let servletUrl: string = Constants.baseUrl + '/registration';
    const formData = new FormData();
    formData.append('transaction', 'select');
    this.eSendForm(this, 'select_registration_data', servletUrl, formData);
  }

  updatefawryLogStatus() {
    let servletUrl: string = Constants.baseUrl + '/crd/requestfawrypaymentlog';
    const formData = new FormData();
    formData.append('transaction', 'update');
    formData.append('paramList', JSON.stringify(this.paramList));
    this.eSendForm(this, 'update_fawry_log', servletUrl, formData);
  }


  getstudentstepstatus() {
    let servletUrl: string = Constants.baseUrl + '/crd/studentstepstatus';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    formData.append('requestId', '' + this.studentAc.id);
    this.eSendForm(this, 'get_student_step_status', servletUrl, formData);
  }

  viewFawryPayHistory(templateRef: TemplateRef<any>, requestScreenName: string): void {
    this.fawryPayHistoryViewArray = [];
    this.dialog.open(templateRef, { disableClose: true });
    if (requestScreenName === 'RegistrtionFees') {
      this.getFawryPayHistoryRegistrtionFees();
    } else {
      this.getFawryPayHistoryFirstSemesterFees();
    }
  }

  getFawryPayHistoryRegistrtionFees() {
    let servletUrl: string = Constants.baseUrl + '/crd/requestfawrypaymentlog';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    formData.append('requestId', '' + this.studentAc.id);
    formData.append('requestScreenName', 'RegistrtionFees');
    this.eSendForm(this, 'get_fawry_log_registrtion_fees', servletUrl, formData);
  }

  getFawryPayHistoryFirstSemesterFees() {
    let servletUrl: string = Constants.baseUrl + '/crd/requestfawrypaymentlog';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    formData.append('requestId', '' + this.studentAc.id);
    formData.append('requestScreenName', 'FirstSemesterFees');
    this.eSendForm(this, 'get_fawry_log_first_semester_fees', servletUrl, formData);
  }

  getFawryPayMessage() {
    if (!this.isFawryMessageDailogShow && this.studentAc.remain_value > 0) {
      let servletUrl: string = Constants.baseUrl + '/crd/thanks_message';
      const formData = new FormData();
      formData.append('transaction', 'select_list');
      formData.append('messageType', '4');
      this.eSendForm(this, 'get_fawry_pay_message', servletUrl, formData);
    }
  }


  getFawryPayMessageFirstSemester() {
    if (!this.isFawryMessageDailogShow && this.studentAc.first_semester_remain_value > 0) {
      let servletUrl: string = Constants.baseUrl + '/crd/thanks_message';
      const formData = new FormData();
      formData.append('transaction', 'select_list');
      formData.append('messageType', '5');
      this.eSendForm(this, 'get_fawry_pay_message_first_semester', servletUrl, formData);
    }
  }

  getInterviewSlotes() {
    let servletUrl: string = Constants.baseUrl + '/interview';
    const formData = new FormData();
    formData.append('transaction', 'select_tree');
    this.eSendForm(this, 'select_interview_data', servletUrl, formData);
  }

  joinInterview() {
    if (this.interviewSlotes.meeting_details) {
      let meetingDetails = JSON.parse(this.interviewSlotes.meeting_details);
      let servletUrl: string = meetingDetails.joinWebUrl;
      let pwa = window.open(servletUrl);
      if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        this.ui.error('Please disable your Pop-up blocker and try again.');
      }
    }
  }

  efinancePayment() {
    this.analytics.paymentStarted();
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true
    }
    let url: string = Constants.baseUrl + '/efinance';
    let formData = new FormData();
    formData.append('request_id', '' + this.studentAc.id);
    formData.append('request_screen_name', 'RegistrtionFees');
    formData.append('request_value', '' + this.studentAc.remain_value);
    formData.append('request_description', 'Admission fees');
    formData.append('email', '' + this.studentContactData.email);
    formData.append('mobile_number', '' + this.studentContactData.mobile);
    formData.append('payment_confirmation_url', '' + Constants.baseUrl + '/efinance/payment');
    formData.append('payment_confirmation_redirect_url', '' + this.returnUrl);
    this.httpClient.post(url, formData, options)
      .toPromise()
      .then(async response => {
        if ((response != null) && (response['status'] == 200)) {
          let gateway_url = response['body']['gateway_url'];
          const paylinkData = {
            SenderID: response['body']['SenderID'],
            LanguageId: response['body']['LanguageId'],
            RandomSecret: response['body']['RandomSecret'],
            HashedRequestObject: response['body']['HashedRequestObject'],
            RequestObject: response['body']['RequestObject']
          };
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = gateway_url;
          form.hidden = true;
          for (const key in paylinkData) {
            if (paylinkData.hasOwnProperty(key)) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = paylinkData[key];
              form.appendChild(input);
            }
          }
          document.body.appendChild(form);
          form.submit();
          // let SenderID = response['body']['SenderID'];
          // let RandomSecret = response['body']['RandomSecret'];
          // let HashedRequestObject = response['body']['HashedRequestObject'];
          // let RequestObject = response['body']['RequestObject'];
          // let LanguageId = response['body']['LanguageId'];

          // let paylink = gateway_url + "?SenderID=" + SenderID + "&LanguageId=" + LanguageId + "&RandomSecret=" + RandomSecret + "&HashedRequestObject=" + HashedRequestObject + "&RequestObject=" + RequestObject;
          // window.open(paylink, '_self');
        }
      }).catch(error => {
        console.log(error);
        this.ui.error(error);
      });
  }


  efinancePaymentFirstSemesterFees() {
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true
    }
    let url: string = Constants.baseUrl + '/efinance';
    let formData = new FormData();
    formData.append('request_id', '' + this.studentAc.id);
    formData.append('request_screen_name', 'FirstSemesterFees');
    formData.append('request_value', '' + this.studentAc.first_semester_remain_value);
    formData.append('request_description', 'First Semester fees');
    formData.append('email', '' + this.studentContactData.email);
    formData.append('mobile_number', '' + this.studentContactData.mobile);
    formData.append('payment_confirmation_url', '' + Constants.baseUrl + '/efinance/payment');
    formData.append('payment_confirmation_redirect_url', '' + this.returnUrl);
    this.httpClient.post(url, formData, options)
      .toPromise()
      .then(async response => {
        if ((response != null) && (response['status'] == 200)) {
          let gateway_url = response['body']['gateway_url'];
          const paylinkData = {
            SenderID: response['body']['SenderID'],
            LanguageId: response['body']['LanguageId'],
            RandomSecret: response['body']['RandomSecret'],
            HashedRequestObject: response['body']['HashedRequestObject'],
            RequestObject: response['body']['RequestObject']
          };
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = gateway_url;
          form.hidden = true;
          for (const key in paylinkData) {
            if (paylinkData.hasOwnProperty(key)) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = paylinkData[key];
              form.appendChild(input);
            }
          }
          document.body.appendChild(form);
          form.submit();
          // let SenderID = response['body']['SenderID'];
          // let RandomSecret = response['body']['RandomSecret'];
          // let HashedRequestObject = response['body']['HashedRequestObject'];
          // let RequestObject = response['body']['RequestObject'];
          // let LanguageId = response['body']['LanguageId'];

          // let paylink = gateway_url + "?SenderID=" + SenderID + "&LanguageId=" + LanguageId + "&RandomSecret=" + RandomSecret + "&HashedRequestObject=" + HashedRequestObject + "&RequestObject=" + RequestObject;
          // window.open(paylink, '_self');
        }
      }).catch(error => {
        console.log(error);
        this.ui.error(error);
      });
  }

  viewHelp(templateRef: TemplateRef<any>): void {
    this.dialog.open(templateRef);
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




  eSendForm(handler: any, key: string, backendURL: string, formData: FormData) {
    formData.append('lang', this.lang);
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true,
    };
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
    if (key === "select_registration_instructions") {
      this.registrationInstructionsArr = Manipulate.set_fill(new RegistrationInstructions(), smartResponse.resultset);
    } else if (key === "select_registration_data") {
      this.lastRefresh = new Date();
      let data = smartResponse.resultset[0];
      this.studentAc = data['masterRecordData'];
      this.wishesArray = data['wishesArray'];
      this.siblingsArr = data['siblingsArr'];
      let contactArr: StudentRequestContacts[] = data['studentContactArr'];
      for (let row of contactArr) {
        if (row.relation_type === 1) {
          this.studentContactData = row;
        } else if (row.relation_type === 2) {
          this.parentContactData1 = row;
        }
      }
      this.populatecomboxArr_academyCode_check_is_close();

      this.getstudentstepstatus();
      this.getInterviewSlotes();
      if (this.refreshSub) {
        this.refreshSub.unsubscribe();
      }
      // if (this.studentAc.remain_value > 0 || this.studentAc.first_semester_remain_value > 0) {
      this.refreshSub = interval(60000).subscribe((x => {
        this.lastRefresh = new Date();
        //console.log('Start -- > refresh ... ');
        this.getRegistrationData();
      }));
      // }
    } else if (key === "populate_all_academy_code_select") {
      this.comboxArrAcademy = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "populate_academyCode_check_is_close") {
      let comboxArrAcademy = <ComboBoxRec[]>Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
      if (comboxArrAcademy.filter(x => x.id === this.wishesArray[0].academy_code).length === 0) {
        this.paymentClosed = true;
      }
      this.getFawryPayHistoryRegistrtionFees();
      this.getFawryPayHistoryFirstSemesterFees();
    } else if (key === "get_discounts") {
      let discountsArr = Manipulate.set_fill(new Discounts(), smartResponse.resultset);
      if (discountsArr.length > 0) {
        this.discount = discountsArr[0];
        this.initializeCountdown(new Date(this.discount.valid_till_date));
      }
    } else if (key === "populate_relative_relation_id_select") {
      this.comboxArr_relative_relation_id = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "update_fawry_log") {
      this.router.navigate(["view"], { replaceUrl: true });
      this.getRegistrationData();
    } else if (key === "get_fawry_log_registrtion_fees") {
      this.fawryPayHistoryArray = Manipulate.set_fill(new FawryPayHistory(), smartResponse.resultset);
      this.fawryPayHistoryViewArray = Manipulate.set_fill(new FawryPayHistory(), smartResponse.resultset);
      let isPaid: boolean = false;
      if (this.studentAc.is_paid_registration_fees === 1) {
        isPaid = true;
      } else {
        for (let row of this.fawryPayHistoryArray) {
          if ((row.orderStatus) && (row.orderStatus === "PAID")) {
            isPaid = true;
            break;
          }
        }
      }
      if (!isPaid) {
        this.getFawryPayMessage();
      }
    } else if (key === "get_fawry_log_first_semester_fees") {
      this.fawryPayHistoryFirstSemesterArray = Manipulate.set_fill(new FawryPayHistory(), smartResponse.resultset);
      this.fawryPayHistoryViewArray = Manipulate.set_fill(new FawryPayHistory(), smartResponse.resultset);
      let isPaid: boolean = false;
      if (this.studentAc.is_paid_first_semester_fees === 1) {
        isPaid = true;
      } else {
        for (let row of this.fawryPayHistoryFirstSemesterArray) {
          if ((row.orderStatus) && (row.orderStatus === "PAID")) {
            isPaid = true;
            break;
          }
        }
      }
      if (!isPaid) {
        this.getFawryPayMessageFirstSemester();
      }
    } else if (key === "get_student_step_status") {
      this.studentStepStatusArr = Manipulate.set_fill(new StudentStepStatus(), smartResponse.resultset);
      if (this.studentAc.first_semester_due_value === 0 && this.studentStepStatusArr.filter(x => x.sys_type === 6).length > 0) {
        this.studentStepStatusArr = this.studentStepStatusArr.filter(x => x.sys_type !== 6);
      }
    } else if (key === "get_fawry_pay_message") {
      let fawryMessageArr = Manipulate.set_fill(new ThanksMessage(), smartResponse.resultset);
      if (fawryMessageArr.length > 0 && this.paymentClosed === false) {
        this.isFawryMessageDailogShow = true;
        fawryMessageArr[0].message_ar = fawryMessageArr[0].message_ar.replace("KEY_REMAIN_VALUE", this.studentAc.due_value.toString());
        fawryMessageArr[0].message_en = fawryMessageArr[0].message_en.replace("KEY_REMAIN_VALUE", this.studentAc.due_value.toString());
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          data: {
            thanksMessage: fawryMessageArr[0],
            yes: this.i18n.get("corr.fawry_proceed_payment", "Proceed To Payment")
          }, width: "40rem", disableClose: true
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result == true && this.paymentClosed === false) {
            if (document.getElementById('fawry-payment-btn')) {
              document.getElementById('fawry-payment-btn').click();
            }
          } else {
            if (this.paymentClosed === true) {
              this.ui.warning(this.i18n.get("corr.payment_is_closed", "Payment is closed"));
            }
          }
        });
      }
    } else if (key === "get_fawry_pay_message_first_semester") {
      let fawryMessageArr = <ThanksMessage[]>Manipulate.set_fill(new ThanksMessage(), smartResponse.resultset);
      if (fawryMessageArr.length > 0 && this.paymentClosed === false) {
        this.isFawryMessageDailogShow = true;
        fawryMessageArr[0].message_ar = fawryMessageArr[0].message_ar.replace("KEY_FIRST_SEMESTER_REMAIN_VALUE", this.studentAc.first_semester_due_value.toString());
        fawryMessageArr[0].message_en = fawryMessageArr[0].message_en.replace("KEY_FIRST_SEMESTER_REMAIN_VALUE", this.studentAc.first_semester_due_value.toString());
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          data: {
            thanksMessage: fawryMessageArr[0],
            yes: this.i18n.get("corr.fawry_proceed_payment", "Proceed To Payment")
          }, width: "40rem", disableClose: true
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result == true && this.paymentClosed === false) {
            if (document.getElementById('fawry-payment-first-semester-btn')) {
              document.getElementById('fawry-payment-first-semester-btn').click();
            }
          } else {
            if (this.paymentClosed === true) {
              this.ui.warning(this.i18n.get("corr.payment_is_closed", "Payment is closed"));
            }
          }
        });
      }
    } else if (key === "select_interview_data") {
      if (smartResponse.response.code == 200) {
        this.interviewSlotes = smartResponse['interviewSlotes'];
      }
    }
  }

  eResponseSuccess(key: string, smartResponse: SmartResponse) {
    try {
      this.eResponse(key, smartResponse);
    } catch (error) {
      console.error(
        "Response is success but 'response' implementation in component  throws error => " +
        error
      );
    }
  }

  eFailure(key: string, exception: any) {
    console.log('key >> ' + key + ' ,  exception ' + JSON.stringify(exception, null, 4));
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