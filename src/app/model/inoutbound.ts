import { InoutBoundOrgSide } from './InoutBoundOrgSide';
import { inoutBoundDeptSide } from './inoutBoundDeptSide';
import { LkupSubject } from './lkupSubject';
export class InoutBound {
  entry_id: number = 0;
  doc_no: number = 0;
  msg_type: string = "3";
  msg_bar_code: string = "";
  site_id: string;
  priority_id: string = "1";
  lkupSubject?: LkupSubject = {
    name: { 'ar': '', 'en': '' },
    description: { 'ar': '', 'en': '' },
    name_ar: '',
    name_en: '',
    children: [],
    subject_id: 0,
    parent_subject_id: 0,
    subject_desc: { 'ar': '', 'en': '' },
    is_selected: false
  };
  outbound_number: string;
  entry_date: string;
  book_date: string;
  received_date: string;
  accrual_date: string;
  subject: string;
  comments: string;
  attachement_note: string;
  bcase_trn_id: number;
  bcase_trn_relative_id: number;
  need_respond: boolean;
  inoutBoundOrgSideArr?: InoutBoundOrgSide[] = [];
  inoutBoundDeptSideArr?: inoutBoundDeptSide[] = [];
}