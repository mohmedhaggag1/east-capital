export class InboxView {
    bcaseName?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    employeeName?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    employee_user_name?: string = "";
    msgTypeDesc?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    priorityDesc?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    stepStatusDescr?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    subjectDesc?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    actionName?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    title: string;
    comments: string;
    msgBarCode: string;
    insertTimeStamp: string;
    sentDate: string;
    sentTime: string;
    recordRef: number;
    bcaseId: number;
    isBcaseUserType: number;
    stepId: number;
    draftId?: number = 0;
    bcaseTrnId: string;
    bcaseTrnRelativeId: string;
    isRead: boolean;
    isCopy: boolean;
    isSend: boolean;
    ttlAttach: boolean;
    deliveryReportServlet: String;
    msgTypeCode: number;
    isTaskRow: number = 0;
    screenPhysicalName: string = "";

    color?:string="";
}