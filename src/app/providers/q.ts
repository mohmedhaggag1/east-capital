/**
 * @author Mohammad Nabil Mostafa
 * <a href="mailto:m.nabil@esmartsoft.com.eg">m.nabil@esmartsoft.com.eg</a>
 */

import * as CryptoJS from 'crypto-js';

export class Q {
    public static k: string = "";
    public static v: string = "";
    public static md128: number = 0x30;
    public static sha256: number = 0x3A;

    public static f(k: string, v: string) {
        Q.k = CryptoJS.enc.Utf8.parse(k);
        Q.v = CryptoJS.enc.Utf8.parse(v);
    }

    public static j(b: any): any {
        return Q.z(JSON.stringify(b));
    }

    public static i(b: string): any {
        return Q.z(b);
    }

    /*public static n(b: any): any {
        return Q.x(JSON.stringify(b));
    }

    public static m(b: string): any {
        return Q.x(b);
    }*/

    public static z(has: string): string {
        let w: string = CryptoJS.AES.encrypt(
            CryptoJS.enc.Utf8.parse(has),
            Q.k, {
            keySize: 0x80 / 8,
            iv: Q.v,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
        return encodeURIComponent(w);
    }

    /*public static x(has: string): string {
        let w: string = CryptoJS.AES.encrypt(
            CryptoJS.enc.Utf8.parse(has),
            Q.k, {
            keySize: 0x80 / 8,
            iv: Q.v,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
        return encodeURI(w);
    }*/


    public static l(g: string): string {
        let w: string = CryptoJS.AES.decrypt(
            decodeURIComponent(g),
            Q.k, {
            keySize: 0x80 / 8,
            iv: Q.v,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8);
        return w;
    }

    public static n(g: string): string {
        let lol: string[] = g.split('~');
        let lul: string = "";
        for (let i: number = 0; i < lol.length; i++) {
            let l: string = lol[i];
            lul += Q.l(l);
        }
        return lul;
    }

    public static h(z: string): string {
        const w = z.split('');
        let q = w.length;
        let e: string;
        let y: number;

        while (q !== 0) {
            y = Math.floor(Math.random() * q);
            q -= 1;

            e = w[q];
            w[q] = w[y];
            w[y] = e;
        }

        return w.join('');
    }

    public static t(md: number, mk: string) {
        let k: string = "";
        let v: string = "";
        for (let i: number = 0; i < 128; i += 8) {
            let u: number = parseInt(Q.e(mk.substring(i, i + 5)));
            let p: number = parseInt(Q.e(mk.substring(i + 5, i + 8)));
            //let u: number = parseInt(mk.substring(i, i+5));
            //let p: number = parseInt(mk.substring(i+5, i+8));
            if (i / 8 % 2 == 0) {
                k += String.fromCharCode(p);
                v += String.fromCharCode(u / p);
            } else {
                v += String.fromCharCode(p);
                k += String.fromCharCode(u / p);
            }
        }

        Q.f(k, v);
    }

    public static e(q: string): string {
        let u: string = "";
        for (let i: number = 0; i < q.length; i++) {
            u += q.charCodeAt(i) >= Q.sha256 ? String.fromCharCode(Q.md128) : q.charAt(i);
        }
        return u;
    }

    // Add by Zidan 17-10-2023
    public static ck(): boolean {
        if ((typeof Q.k !== "undefined") && (typeof Q.v !== "undefined") && (Q.k !== null) && (Q.v !== null) && (Q.k !== "") && (Q.v !== "")) {
            return true;
        } else {
            return false;
        }
    } 
}