import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeleteConfirmComponent } from 'src/app/common/delete-confirm/delete-confirm.component';
import { HlpFileUploadComponent } from 'src/app/common/hlp-file-upload/hlp-file-upload.component';
import { FileUploadSetting, CurrentDoc, NewDoc } from 'src/app/model/attachmentsRec';
import { EssaySettings } from 'src/app/model/essaySettings';
import { SmartResponse } from 'src/app/model/smart-communication';
import { StudentRequest } from 'src/app/model/studentRequest';
import { Constants } from 'src/app/providers/Constants';
import { DataProvider } from 'src/app/providers/DataProvider';
import { I18N } from 'src/app/providers/i18n.provider';
import { SessionProvider } from 'src/app/providers/session.provider';
import { UIService } from 'src/app/providers/ui.service';
import { CKEditorComponent } from 'ng2-ckeditor';
import { LazyLoaderService } from 'src/app/providers/lazy-loader.service';
var readonlyStatus;
@Component({
  selector: 'app-essay-writer',
  templateUrl: './essay-writer.component.html',
  styleUrls: ['./essay-writer.component.scss'],
})
export class EssayWriterComponent implements OnInit {

  activeMask: boolean = false;
  ttlRequest: number = 0;

  sublang: Subscription;
  lang: string = "en";
  direction: boolean = true;
  readonly: boolean = false;

  studentAc: StudentRequest = new StudentRequest();
  attachmentTableExpandedElement: CurrentDoc = new CurrentDoc();
  fileUploadSetting = new FileUploadSetting();
  attachmentList: CurrentDoc[] = [];
  showVideo: boolean = false;
  showAudio: boolean = false;
  showPdf: boolean = true;

  essaySettings: EssaySettings = new EssaySettings();
  essaySettingsSub!: Subscription;
  @ViewChild("myckeditor", { static: false }) ckeditor: CKEditorComponent;
  ckeConfig: any;

  resultInnerTextLength: number = 0;

  moduleName: string = "StudentEssay";
  constructor(
    private provider: DataProvider,
    public i18n: I18N,
    private ui: UIService,
    public dialog: MatDialog,
    private httpClient: HttpClient,
    private router: Router,
    private session: SessionProvider,
    private lazyLoader: LazyLoaderService) {

  }

  async ngOnInit() {
    if (!this.session.isLoggedIn()) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
    await this.lazyLoader.loadScript('./assets/js/ckeditor/ckeditor.js');
    this.sublang = this.i18n.observeLanguage().subscribe({
      next: (lang) => {
        this.lang = lang;
        this.direction = this.provider.getDirection(this.lang);
      }
    });
    this.lang = I18N.lang;
    this.direction = this.provider.getDirection(this.lang);

    this.essaySettingsSub = Constants.subject_essaySettings.subscribe({
      next: (val) => {
        this.essaySettings = val;
      }
    });
    this.essaySettings = Constants.essaySettings;
    this.ckeConfig = {
      allowedContent: true,
      id: "editor1",
      extraPlugins: ['justify', 'scayt', 'divarea', 'autocorrect', 'format', 'wordcount', 'notification', 'wysiwygarea', 'panelbutton', 'colordialog', 'colorbutton', 'font'],
      removePlugins: 'ckeditor_wiris,',
      removeButtons: 'Maximize',
      toolbarGroups: [
        { name: 'document', groups: ['mode', 'document', 'doctools'] },
        { name: 'clipboard', groups: ['clipboard', 'undo'] },
        { name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
        { name: 'forms', groups: ['forms'] },
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
        { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
        { name: 'links', groups: ['links'] },
        { name: 'insert', groups: ['insert'] },
        { name: 'styles', groups: ['styles'] },
        { name: 'colors', groups: ['colors'] },
        { name: 'tools', groups: ['tools'] },
        { name: 'others', groups: ['others'] }
      ],
      removeDialogTabs: 'link:advanced',
      shouldNotGroupWhenFull: true
    };
    this.getRegistrationData();
  }

  ngOnDestroy() {
    if (this.sublang) {
      this.sublang.unsubscribe();
    }
    if (this.essaySettingsSub) {
      this.essaySettingsSub.unsubscribe();
    }
    if (readonlyStatus) {
      clearInterval(readonlyStatus);
    }
  }

  getRegistrationData() {
    let servletUrl: string = Constants.baseUrl + '/registration';
    const formData = new FormData();
    formData.append('transaction', 'select');
    this.eSendForm(this, 'select_registration_data', servletUrl, formData);
  }

  uploadFileData() {
    const dialogRef = this.dialog.open(HlpFileUploadComponent, {
      data: { moduleName: this.moduleName, isUploadMultiple: true, attach_type_id: null }
    });

    // listen to response
    dialogRef.afterClosed().subscribe(dialogResult => {
      if ((typeof dialogResult !== 'undefined') && (dialogResult !== null)) {
        try {
          if (dialogResult.length > 0) {
            this.saveAttachments(dialogResult);
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
  }
  loadAttachments() {
    let servletUrl: string = Constants.baseUrl + "/AttachmentsServlet";
    const formData = new FormData();
    formData.append("lang", this.lang);
    formData.append("parentEntryId", "" + this.studentAc.attachment_reference_no);
    formData.append("moduleName", this.moduleName);
    formData.append("transaction", "select_list");
    this.eSendForm(this, "load_attachments", servletUrl, formData);
  }

  saveAttachments(dialogResult: NewDoc[]) {
    let servletUrl: string = Constants.baseUrl + "/AttachmentsServlet";
    const formData = new FormData();
    formData.append("copyFileWithAnnotations", "false");
    formData.append("parentEntryId", "" + this.studentAc.attachment_reference_no);
    formData.append("moduleName", this.moduleName);
    formData.append("new_docs", JSON.stringify(dialogResult));
    formData.append("transaction", "insert");
    this.eSendForm(this, "save_attachments", servletUrl, formData);
  }

  viewDocumentRecord(selectedRow: CurrentDoc, templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef);

    this.attachmentTableExpandedElement = selectedRow;
    if (selectedRow.main_file_type.includes("audio")) {
      this.showVideo = false;
      this.showAudio = true;
      this.showPdf = false;
    } else if (selectedRow.main_file_type.includes("video")) {
      this.showVideo = true;
      this.showAudio = false;
      this.showPdf = false;
      console.log(selectedRow);
    } else {
      this.showVideo = false;
      this.showAudio = false;
      this.showPdf = true;
    }

  }

  downloadRecord(selectedRow: CurrentDoc) {
    if (typeof selectedRow.download_pdf === 'undefined') {
      this.ui.error(this.i18n.get("corr.noDocument", "No Document"));
    } else {
      let servletUrl: string = selectedRow.download_pdf;
      let pwa = window.open(servletUrl);
      if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {

        this.ui.error(this.i18n.get("corr.disablePopUp", "Please disable your Pop-up blocker and try again."));
      }
    }
  }

  deleteAttachment(selectedRow: CurrentDoc) {
    this.attachmentTableExpandedElement = selectedRow;
    const dialogRef = this.dialog.open(DeleteConfirmComponent, {
      data: {
        title: this.i18n.get("corr.global.deleteTitle", "Delete"),
        message: this.i18n.get("corr.global.deleteMsgConfirm", "Delete this record?"),
        yes: this.i18n.get("corr.global.yes", "Yes"),
        no: this.i18n.get("corr.global.no", "No"),
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        let servletUrl: string = Constants.baseUrl + '/AttachmentsServlet';
        const formData = new FormData();
        formData.append('lang', this.lang);
        formData.append('fileId', '' + selectedRow.file_id);
        formData.append('moduleName', this.moduleName);
        formData.append('transaction', 'delete');
        this.eSendForm(this, 'attachment_delete', servletUrl, formData);
      }
    });
  }

  doSave() {
    let servletUrl: string = Constants.baseUrl + '/registration';
    const formData = new FormData();
    formData.append('studentRequest', '' + JSON.stringify(this.studentAc));
    formData.append('transaction', 'update_list');
    this.eSendForm(this, 'update_essay_data', servletUrl, formData);
  }

  doSaveAndLock() {
    const dialogRef = this.dialog.open(DeleteConfirmComponent, {
      data: {
        title: this.i18n.get("corr.global.close_edit", "close_edit"),
        message: this.i18n.get("corr.global.ask_save_send", "ask_save_send"),
        yes: this.i18n.get("corr.global.yes", "Yes"),
        no: this.i18n.get("corr.global.no", "No"),
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.resultInnerTextLength = 0;
        var temporalDivElement = document.createElement("div");
        temporalDivElement.innerHTML = this.ckeditor.value;
        let resultInnerText = temporalDivElement.textContent || temporalDivElement.innerText || "";
        if ((typeof resultInnerText !== 'undefined') && (resultInnerText !== '')) {
          if (this.essaySettings.text_max_length > 0) {
            if (this.countWords(resultInnerText) < this.essaySettings.text_max_length) {
              this.ui.error(this.i18n.get("corr.global.err_max_text_length", "err_max_text_length"));
              return;
            }
          }
        }
        if ((this.attachmentList.length === 0) && ((typeof resultInnerText === 'undefined') || (resultInnerText === ''))) {
          this.ui.error(this.i18n.get("corr.global.err_write_essay_or_upload_file", "err_write_essay_or_upload_file"));
          return;
        }

        let servletUrl: string = Constants.baseUrl + '/registration';
        const formData = new FormData();
        formData.append('studentRequest', '' + JSON.stringify(this.studentAc));
        formData.append('lock', 'true');
        formData.append('transaction', 'update_list');
        this.eSendForm(this, 'update_essay_data', servletUrl, formData);
      }
    });
  }

  getInnerTextLength() {
    setTimeout(() => {
      this.resultInnerTextLength = 0;
      var temporalDivElement = document.createElement("div");
      temporalDivElement.innerHTML = this.ckeditor.value;
      let resultInnerText = temporalDivElement.textContent || temporalDivElement.innerText || "";
      this.resultInnerTextLength = this.countWords(resultInnerText);// resultInnerText.length;
    }, 1000);
  }

  countWords(str: string): number {
    // Use regex to split the string into words
    const words = str.split(/\s+/);
    // Return the number of words
    return words.length - 1;
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
      this.getInnerTextLength();
      this.loadAttachments();
      if (readonlyStatus) {
        clearInterval(readonlyStatus);
      }
      readonlyStatus = setInterval(() => {
        if (this.studentAc.lock_essay === 1) {
          this.readonly = true;
        } else {
          this.readonly = false;
        }
      }, 500);
    } else if (key === "load_attachments") {
      let inoutBoundFilesArr = smartResponse.resultset["inoutBoundFilesArr"];
      this.attachmentList.splice(0);
      for (let i = 0; i < inoutBoundFilesArr.length; i++) {
        this.attachmentList.push(inoutBoundFilesArr[i]);
      }
    } else if (key === "save_attachments") {
      this.ui.success(this.i18n.get("corr.uploadSuccess", "The File has been Uploaded successfully"));
      this.loadAttachments();
    } else if (key === "attachment_delete") {
      this.attachmentList.splice(this.attachmentList.indexOf(this.attachmentTableExpandedElement), 1);
    } else if (key === "update_essay_data") {
      this.ui.success(this.i18n.get("corr.update", "The File has been Uploaded successfully"));
      this.getRegistrationData();
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
    if (key === 'update_essay_data') {
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
