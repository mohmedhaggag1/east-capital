/**
 * @author Mohammad Zidan
 * <a href="mailto:mohamed.zidan@esmartsoft.com.eg">mohamed.zidan@esmartsoft.com.eg</a>
 */
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Q } from './q';

@Injectable({
    providedIn: 'root'
})
export class EncryptDecryptAuthInterceptor implements HttpInterceptor {

    constructor() { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // FormData's value instanceof File, something along the lines of
        if (req.body instanceof File) {
            return next.handle(req);
        } else if (req.body instanceof FormData) {
            const formData = new FormData();

            let isThereData: boolean = true;

            for (let [key, value] of req.body.entries()) {
                if (key == 'ess_sys_req' && value == "false") { //|| ((typeof value['size'] !== 'undefined') && (value['size'] > 0))
                    isThereData = false;
                    break;
                }
            }
            for (let [key, value] of req.body.entries()) {
                if (isThereData == false || ((typeof value['size'] !== 'undefined') && (value['size'] > 0))) {
                    formData.append(key, value);
                } else {
                    isThereData = true;
                    //formData.append(key, this.encryptDecryptService.encryptUsingAES256(value));//.replace(/\+/g, "%20")
                    formData.append(Q.i('' + key), Q.i('' + value));//.replace(/\+/g, "%20")
                    //## formData.append(key, Q.i('' + value));//.replace(/\+/g, "%20")
                }
            }

            if (isThereData) {
                //formData.append("ess_sys_req", this.encryptDecryptService.encryptUsingAES256("true"));//.replace(/\+/g, "%20")
                formData.append(Q.i('ess_sys_req'), Q.i("true"));//.replace(/\+/g, "%20")
                //## formData.append('ess_sys_req', Q.i("true"));//.replace(/\+/g, "%20")
            } else {
                formData.delete("ess_sys_req");
            }

            return next.handle(req.clone({ body: formData }));
        } else if (req.urlWithParams.includes('?')) {
            let isThereData: boolean = true;
            let parts = decodeURIComponent(req.urlWithParams).split('?');//req.urlWithParams.split('?');
            let path = parts[0];
            let params: any = {};
            let query = parts[1];
            let pairs = query.split('&');
            for (let pair of pairs) {
                parts = pair.split('=');
                if (parts[0] == 'ess_sys_req' && parts[1] == "false") {
                    isThereData = false;
                    break;
                }
            }
            for (let pair of pairs) {
                const firstEqualsIndex = pair.indexOf('=');
                const key = pair.substring(0, firstEqualsIndex); // Extract key
                const value = pair.substring(firstEqualsIndex + 1); // Extract value
                //parts = pair.split('=');
                if (isThereData === false) {
                    if (key != 'ess_sys_req' && value != "false") {
                        params[key] = value;
                    }
                } else {
                    params[Q.i(key)] = Q.i(value);//this.encryptDecryptService.encryptUsingAES256(parts[1]);//.replace(/\+/g, "%20")
                    //## params[parts[0]] = Q.i(parts[1]);//this.encryptDecryptService.encryptUsingAES256(parts[1]);//.replace(/\+/g, "%20")
                }
            }
            if (isThereData) {
                params[Q.i('ess_sys_req')] = Q.i("true");//this.encryptDecryptService.encryptUsingAES256("true");//.replace(/\+/g, "%20")
                //## params['ess_sys_req'] = Q.i("true");//this.encryptDecryptService.encryptUsingAES256("true");//.replace(/\+/g, "%20")
            }
            let x: HttpParams = new HttpParams();
            const cloneReq = req.clone({
                url: path,
                setParams: params,
                params: x
            });

            return next.handle(cloneReq);

        } else if ((typeof req.body === 'object') && (req.body !== null) && (req.body)) {
            if ((req.body.hasOwnProperty("ess_sys_req")) && (req.body['ess_sys_req'] === "false")) {
                delete req.body['ess_sys_req'];
                return next.handle(req.clone({ body: req.body }));
            } else {
                //req.body['ess_sys_req'] = Q.i("true");
                return next.handle(req.clone({ body: Q.i(JSON.stringify(req.body)) }));
            }
        }
        return next.handle(req);
    }
}