import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeleteConfirmComponent } from 'src/app/common/delete-confirm/delete-confirm.component';
import { Manipulate } from 'src/app/model/data-manipulate';
import { InterviewSlotesViews, InterviewSlotes } from 'src/app/model/interviewPeriodsSetting';
import { SmartResponse } from 'src/app/model/smart-communication';
import { StudentRequest } from 'src/app/model/studentRequest';
import { StudentRequestContacts } from 'src/app/model/studentRequestContacts';
import { Constants } from 'src/app/providers/Constants';
import { DataProvider } from 'src/app/providers/DataProvider';
import { I18N } from 'src/app/providers/i18n.provider';
import { SessionProvider } from 'src/app/providers/session.provider';
import { UIService } from 'src/app/providers/ui.service';

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss'],
})
export class InterviewComponent implements OnInit {

  activeMask: boolean = false;
  ttlRequest: number = 0;

  sublang: Subscription;
  lang: string = "en";
  direction: boolean = true;
  readonly: boolean = false;

  studentAc: StudentRequest = new StudentRequest();
  studentContactData: StudentRequestContacts = new StudentRequestContacts();
  interviewSlotesArr: InterviewSlotesViews[] = [];
  sloteArr: InterviewSlotes[] = [];
  sloteArrBak: InterviewSlotes[] = [];
  allow_period_to_edit: number = 0;
  isThereAppointment: boolean = false;

  selectedInterviewSlotes = new InterviewSlotes();

  @ViewChild('categoresList', { static: false }) categoresListElemnt: MatSelectionList;
  p1: number = 1;
  filterValue: string = "";
  selectedRow: InterviewSlotes;
  
  constructor(
    private provider: DataProvider,
    public i18n: I18N,
    private ui: UIService,
    public dialog: MatDialog,
    private httpClient: HttpClient,
    private router: Router,
    private session: SessionProvider) {

  }

  ngOnInit() {
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
    this.getRegistrationData();
  }

  getRegistrationData() {
    let servletUrl: string = Constants.baseUrl + '/registration';
    const formData = new FormData();
    formData.append('transaction', 'select');
    this.eSendForm(this, 'select_registration_data', servletUrl, formData);
  }

  getInterviewSlotes() {
    this.interviewSlotesArr = [];
    this.sloteArr = [];
    this.sloteArrBak = [];

    let servletUrl: string = Constants.baseUrl + '/interview';
    const formData = new FormData();
    formData.append('studentCode', this.studentAc.student_code);
    formData.append('semesterOpenId', this.studentAc.open_semester_id);
    formData.append('academyCode', this.studentAc.wish_academy_code_1);
    formData.append('isPublished', "true");
    formData.append('transaction', 'select');
    this.eSendForm(this, 'select_interview_data', servletUrl, formData);
  }

  selectAll() {
    this.categoresListElemnt.selectAll();
    this.onSelectionChange();
    this.p1 = 1;
  }

  deselectAll() {
    this.categoresListElemnt.selectedOptions.clear();
    this.onSelectionChange();
    this.p1 = 1;
  }

  onSelectionChange() {
    this.sloteArr = [];
    this.categoresListElemnt.selectedOptions.selected.forEach(element => {
      this.sloteArr.push(...this.sloteArrBak.filter(x => x.interview_date == element.value));
    });
    this.sloteArr.sort((a, b) => {
      const dateA = new Date(a.interview_date).getTime();
      const dateB = new Date(b.interview_date).getTime();
      return dateA - dateB;
    });
  }

  applyFilterSlotes() {
    this.p1 = 1;
    this.filterValue = this.filterValue.trim();
    this.filterValue = this.filterValue.toLowerCase();

    if (this.filterValue === "") {
      console.log('Filter is Empty');
      this.sloteArr = this.sloteArrBak;
    } else {
      let thisis = this;
      this.sloteArr = this.sloteArrBak.filter(function (data) {
        const listAsFlatString = (obj): string => {
          let returnVal = '';

          Object.values(obj).forEach((val) => {
            if (typeof val !== 'object') {
              returnVal = returnVal + ' ' + val;
            } else if (val !== null) {
              returnVal = returnVal + ' ' + listAsFlatString(val);
            }
          });

          return returnVal.trim().toLowerCase();
        };
        return listAsFlatString(data).includes(thisis.filterValue);
      });
    }
  }

  takeAppointment(selectedRow: InterviewSlotes) {
    let servletUrl: string = Constants.baseUrl + '/interview';
    const formData = new FormData();
    formData.append('masterRecordData', JSON.stringify(selectedRow));
    formData.append('studentCode', this.studentAc.student_code);
    formData.append('studentEmail', this.studentContactData.email);
    formData.append('transaction', 'insert');
    this.eSendForm(this, 'take_interview', servletUrl, formData);
  }

  deleteAppointment(selectedRow: InterviewSlotes) {

    const dialogRef = this.dialog.open(DeleteConfirmComponent, {
      data: {
        title: this.i18n.get("corr.deleteAppointmentTitle", "Delete"),
        message: this.i18n.get("corr.deleteAppointmentMsg", "Do you want to cancel this appointment?") + " " + selectedRow.interview_date,
        yes: this.i18n.get("corr.global.yes", "Yes"),
        no: this.i18n.get("corr.global.no", "No"),
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        let servletUrl: string = Constants.baseUrl + '/interview';
        const formData = new FormData();
        formData.append('masterRecordData', JSON.stringify(selectedRow));
        formData.append('studentCode', this.studentAc.student_code);
        formData.append('transaction', 'delete');
        this.eSendForm(this, 'clear_interview', servletUrl, formData);
      }
    });

  }

  joinInterview(viewRec: InterviewSlotes) {
    this.selectedRow = viewRec;
    if (this.selectedRow.meeting_details) {
      let meetingDetails = JSON.parse(this.selectedRow.meeting_details);
      let servletUrl: string = meetingDetails.joinWebUrl;
      let pwa = window.open(servletUrl);
      if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        this.ui.error('Please disable your Pop-up blocker and try again.');
      }
    }
  }

  eSendForm(handler: any, key: string, backendURL: string, formData: FormData) {
    formData.append('lang', this.lang);
    this.ttlRequest += 1;
    this.activeMask = true;
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
    if (key === "select_registration_data") {
      let data = smartResponse.resultset[0];
      this.studentAc = data['masterRecordData'];
      let contactArr: StudentRequestContacts[] = data['studentContactArr'];
      for (let row of contactArr) {
        if (row.relative_relation_id === "1") {
          this.studentContactData = row;
        }
      }
      this.getInterviewSlotes();
    } else if (key === "select_interview_data") {
      this.selectedInterviewSlotes = new InterviewSlotes();
      this.interviewSlotesArr = [];
      this.sloteArr = Manipulate.set_fill(new InterviewSlotes(), smartResponse.resultset);
      this.sloteArrBak = Manipulate.set_fill(new InterviewSlotes(), smartResponse.resultset);
      this.allow_period_to_edit = smartResponse['allow_period_to_edit'];
      this.isThereAppointment = false;

      for (let row of this.sloteArr) {
        if (row.taken_by_student_code === this.studentAc.student_code) {
          this.isThereAppointment = true;
          this.selectedInterviewSlotes = row;
        }
        if (this.interviewSlotesArr.filter(x => x.interview_date == row.interview_date).length === 0) {
          let interviewSlotesViews = new InterviewSlotesViews();
          interviewSlotesViews.interview_date = row.interview_date;
          interviewSlotesViews.sloteArr = this.sloteArr.filter(x => x.interview_date == row.interview_date);
          this.interviewSlotesArr.push(interviewSlotesViews);
        }
      }
      setTimeout(() => {
        this.selectAll();
      }, 1000);
    } else if (key === "take_interview") {
      this.ui.success(this.i18n.get("corr.appointmentReservedSuccessfully", "appointment Has been Reserved successfully"));
      this.getInterviewSlotes();
    } else if (key === "clear_interview") {
      this.ui.success(this.i18n.get("corr.cancelAppointmentSuccessfully", "appointment Has been Canceled successfully"));
      this.getInterviewSlotes();
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
    if (key === 'select_interview_data') {
      let error = exception['error'];
      let errorKey = error['errors'][0];
      this.ui.error(this.i18n.get('corr.' + errorKey, errorKey));
    } else if (key === "take_interview") {
      let error = exception['error'];
      let errorKey = error['errors'][0];
      this.ui.error(this.i18n.get('corr.' + errorKey, errorKey));
    } else if (key === "clear_interview") {
      let error = exception['error'];
      let errorKey = error['errors'][0];
      this.ui.error(this.i18n.get('corr.' + errorKey, errorKey));
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
