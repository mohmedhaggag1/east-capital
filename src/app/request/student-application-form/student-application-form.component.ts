import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SmartResponse } from 'src/app/model/smart-communication';
import { StudentRequest } from 'src/app/model/studentRequest';
import { Constants } from 'src/app/providers/Constants';
import { DataProvider } from 'src/app/providers/DataProvider';
import { I18N } from 'src/app/providers/i18n.provider';
import { CurrentDoc } from 'src/app/model/attachmentsRec';
import { ComboBoxRec, WherePart } from 'src/app/model/combobox';
import { Manipulate } from 'src/app/model/data-manipulate';
import { StudentRequestWishes } from 'src/app/model/studentRequestWishes';
import { StudentRequestContacts } from 'src/app/model/studentRequestContacts';
import { StudentRequestAchievements } from 'src/app/model/studentRequestAchievements';
import { TransformerUniversities } from 'src/app/model/transformerUniversities';
import * as html2pdf from 'html2pdf.js';


@Component({
  selector: 'app-student-application-form',
  templateUrl: './student-application-form.component.html',
  styleUrls: ['./student-application-form.component.scss'],
})
export class StudentApplicationFormComponent implements OnInit {

  sublang: Subscription;
  lang: string = "en";
  direction: boolean = true;

  logo: string = "";
  moduleName: string = "";
  studentAc: StudentRequest = new StudentRequest();
  studentContactData: StudentRequestContacts = new StudentRequestContacts();
  parentContactData1: StudentRequestContacts = new StudentRequestContacts();
  parentContactData2: StudentRequestContacts = new StudentRequestContacts();
  parentContactData3: StudentRequestContacts = new StudentRequestContacts();
  wishesArray: StudentRequestWishes[] = [];
  transformerUniversitiesArr: TransformerUniversities[] = [];
  studentRequestAchievementsArr: StudentRequestAchievements[] = [];

  attachmentList: CurrentDoc[] = [];

  comboxArrOpenSemester: ComboBoxRec[] = [];
  comboxArrNationality: ComboBoxRec[] = [];
  comboxArrAcademy: ComboBoxRec[] = [];
  comboxArr_relative_relation_id: ComboBoxRec[] = [];
  comboxArr_school_id: ComboBoxRec[] = [];
  comboxArrDegreeType: ComboBoxRec[] = [];
  comboxArr_achievement: ComboBoxRec[] = [];
  comboxArr_recognized_universities: ComboBoxRec[] = [];
  comboxArr_recognized_collages: ComboBoxRec[] = [];
  constructor(public dialogRef: MatDialogRef<StudentApplicationFormComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data,
    private provider: DataProvider,
    private httpClient: HttpClient,
    public i18n: I18N) {

  }

  ngOnInit() {
    if (Constants.company === "BADYA") {
      this.logo = "logo-BADYA.png";
    } else {
      this.logo = "logo2-" + Constants.company + ".png";
    }
    this.getRegistrationData();
    this.populatecomboxArrOpenSemester();
    this.populatecomboxArrNationally();
    this.populatecomboxArr_academyCode();
    this.populateRelativeRelationComboxArr();
    this.populateSchoolComboxArr();
    this.populateAchievementType();
    this.populateRecognizedUniversitiesComboxArr();
    this.populateRecognizedCollagesComboxArr();
  }

  ngOnDestroy() {
    if (this.sublang) {
      this.sublang.unsubscribe();
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

  populatecomboxArr_academyCode() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_all_academy_code_select');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_all_academy_code_select', servletUrl, formData);
  }

  populateRelativeRelationComboxArr() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_relative_relation_id_select');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_relative_relation_id_select', servletUrl, formData);
  }

  populatecomboxArrNationally() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('viewCode', 'populate_nationally_select');
    formData.append('conType', 'academic_central');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_nationally_select', servletUrl, formData);
  }

  populateSchoolComboxArr() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('conType', 'academic_central');
    formData.append('viewCode', 'populate_all_schools');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_school_select', servletUrl, formData);
  }

  populateDegreeTypeComboxArr() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('conType', 'academic_central');
    let values: WherePart[] = [];
    if (this.studentAc.main_category_flag !== '') {
      formData.append('viewCode', 'populate_degree_type_code_select_by_category_flag');
      values.push(new WherePart({ value: this.studentAc.main_category_flag, type: "number" }));
    } else {
      formData.append('viewCode', 'populate_degree_type_code_select_all');
    }
    formData.append('values', JSON.stringify(values));
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_degree_type_code_select', servletUrl, formData);
  }

  populateAchievementType() {
    let servletUrl: string = Constants.baseUrl + '/combboxview';
    const formData = new FormData();
    formData.append('conType', 'academic_central');
    formData.append('viewCode', 'populate_all_achievement_select');
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'populate_achievement_select', servletUrl, formData);
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

  getRegistrationData() {
    let servletUrl: string = Constants.baseUrl + '/registration';
    const formData = new FormData();
    formData.append('transaction', 'select');
    this.eSendForm(this, 'select_registration_data', servletUrl, formData);
  }

  loadAttachments() {
    if (this.studentAc.attachment_reference_no) {
      let servletUrl: string = Constants.baseUrl + '/AttachmentsServlet';
      const formData = new FormData();
      formData.append('parentEntryId', this.studentAc.attachment_reference_no);
      formData.append('moduleName', this.moduleName);
      formData.append('transaction', 'select_list');
      this.eSendForm(this, 'load_attachments', servletUrl, formData);
    }
  }


  generatePdf() {
    // Select the element you want to convert to PDF
    const element = document.getElementById('print1');

    // Add the class to override styles
    element.classList.add('print-override');

    // Define options
    const options = {
      margin: [0, 0, 0, 0], // No margin
      filename: this.studentAc.username + '.pdf',
      html2canvas: { scale: 4, scrollX: 0, scrollY: 0 },
      jsPDF: { unit: 'in', format: 'A3', orientation: 'portrait' }
    };

    // Generate PDF
    html2pdf().from(element).set(options).save().then(() => {
      // Remove the class after PDF generation
      element.classList.remove('print-override');
    });
  }


  eSendForm(
    handler: any,
    key: string,
    backendURL: string,
    formData: FormData) {
    formData.append('lang', this.lang);
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true
    }
    this.httpClient.post<SmartResponse>(backendURL, formData, options)
      .subscribe((event) => {
        try {
          handler.eResponseEvent(key, event);
        } catch (error) {
          console.error("Response is success but 'responseEvent' implementation throws error => " + error);
        }
      }, (exception) => {
        handler.eResponseFailure(key, exception);
      });
  }

  /*Common Reselt between GET POST sendFORM*/
  eResponse(key: string, smartResponse: SmartResponse) {
    //console.log("Transaction '"+key+"' SUCCESS => \n" + JSON.stringify(smartResponse, null, 4));
    if (key === "select_registration_data") {
      let data = smartResponse.resultset[0];
      this.studentAc = data['masterRecordData'];
      this.wishesArray = data['wishesArray'];
      this.transformerUniversitiesArr = data['transformerUniversitiesArr'];
      this.studentRequestAchievementsArr = data['studentRequestAchievementsArr'];
      let contactArr: StudentRequestContacts[] = data['studentContactArr'];
      for (let i = 0; i < contactArr.length; i++) {
        let row = contactArr[i];
        if (i === 0) {
          this.studentContactData = row;
        } else if (i === 1) {
          this.parentContactData1 = row;
        } else if (i === 2) {
          this.parentContactData3 = row;
        }
      }
      this.moduleName = "studentReg";
      this.loadAttachments();
      this.populateDegreeTypeComboxArr();
    } else if (key === "load_attachments") {
      if (typeof smartResponse.resultset['inoutBoundFilesArr'] != 'undefined') {
        this.attachmentList = smartResponse.resultset['inoutBoundFilesArr'];
      } else {
        this.attachmentList = [];
      }
    } else if (key === 'populate_open_semester_select') {
      this.comboxArrOpenSemester = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_nationally_select') {
      this.comboxArrNationality = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "populate_all_academy_code_select") {
      this.comboxArrAcademy = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "populate_relative_relation_id_select") {
      this.comboxArr_relative_relation_id = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "populate_school_select") {
      this.comboxArr_school_id = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_degree_type_code_select') {
      this.comboxArrDegreeType = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === "populate_achievement_select") {
      this.comboxArr_achievement = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_recognized_universities_select') {
      this.comboxArr_recognized_universities = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    } else if (key === 'populate_recognized_collages_select') {
      this.comboxArr_recognized_collages = Manipulate.set_fill(new ComboBoxRec(), smartResponse.resultset);
    }
  }

  eResponseSuccess(key: string, smartResponse: SmartResponse) {
    try {
      this.eResponse(key, smartResponse);
    } catch (error) {
      console.error("Response is success but 'response' implementation in component  throws error => " + error);
    }
  }

  eFailure(key: string, exception: any) {
    console.log("key >> " + key + " ,  exception " + JSON.stringify(exception, null, 4));
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
      console.log("event Sent => " + key + "=>" + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.UploadProgress) {
      //An upload progress event was received.
      console.log("event UploadProgress => " + key + "=>" + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.ResponseHeader) {
      //The response status code and headers were received.
      console.log("event ResponseHeader => " + key + "=>" + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.DownloadProgress) {
      //A download progress event was received.
      console.log("event DownloadProgress => " + key + "=>" + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.Response) {
      //The full response including the body was received.
      let smartResponse = <SmartResponse>event.body;
      this.eResponseSuccess(key, smartResponse);
    }
    if (event.type === HttpEventType.User) {
      //A custom event from an interceptor or a backend.
      console.log("event User => " + key + "=>" + JSON.stringify(event, null, 4));
    }
  }
}