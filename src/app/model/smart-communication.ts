/**
 * @author Mohammad Nabil Mostafa
 * <a href="mailto:m.nabil@esmartsoft.com.eg">m.nabil@esmartsoft.com.eg</a>
 */

import { HttpEvent } from '@angular/common/http';

export enum SmartRecordStatus {
  NEW = 'NEW',
  SAVED = 'SAVED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED'
}

export interface SmartRecord {
  old_id: number;
  record: [{}];
  status: SmartRecordStatus;
}

export interface SmartRequest {
  lang?: string;
  sessionID?: string;
  userCode?: string;
  userName?: string;
}

export interface SmartDBInsert extends SmartRequest {
  transaction: string;
  returns: 'id' | 'record';
  variable?: {};
  values: [{}],
  parameters?: {};
}
export interface SmartDBUpdate extends SmartRequest {
  transaction: string;
  values: [],
  where: {
    clause: string;
    fields: any[];
  };
  parameters?: {};
}
export interface SmartDBDelete extends SmartRequest {
  transaction: string,
  values: [],
  where: {
    clause: string;
    fields: []
  }
}
export interface SmartDBSelect extends SmartRequest {
  transaction: string;
  engine: string;
  view: string;
  variable?: {};
  select: string[];
  where: {
    clause: string;
    values: any[];
  };
  orderby: string[];
  parameters?: {};
}

export interface SmartResponse {
  session?: {
    sessionID: string;
    userCode: string;
    userName: string;
  };
  response: {
    transaction: string,
    view: string,
    status: string,
    code: number,
    message: string
  },
  errors?: {
  },
  exceptions?: [{ class: string, message: string }]
  process?: {
  },
  generated_id?: any,
  resultset?: [{}] | null,
  exec_parse?: number,
  exec_query?: number,
  exec_json?: number,
  tree?: [];
}

export interface SmartResponseHandler {
  responseSuccess(thisis: any, key: string, response: SmartResponse);
  responseEvent(thisis: any, key: string, event: HttpEvent<any>);
  responseFailure(thisis: any, key: string, exception: any);
}
