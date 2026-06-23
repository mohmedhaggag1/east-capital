import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from './Constants';
import { DatePipe } from '@angular/common';
import { I18N } from './i18n.provider';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import * as cryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { UIService } from './ui.service';
import { WebsocketService } from './websocket.service';
import { SessionProvider } from './session.provider';
import { Q } from './q';
import { Users } from '../model/users';
import { EssaySettings } from '../model/essaySettings';
import disableDevtool from 'disable-devtool';

@Injectable({
    providedIn: "root"
})
export class DataProvider implements Resolve<any> {

    private initialized!: boolean;
    private initialPromise!: Promise<boolean>;
    public static isSessionBackCalled: boolean = false;
    public static isEssaySettingsLoaded: boolean = false;
    private maxRetries: number = 5;

    public options: any[] = [
        { value: "+93", label: "+93", src: "./assets/images/flags/af.svg", name_ar: "أفغانستان", name_en: "Afghanistan" },
        { value: "+355", label: "+355", src: "./assets/images/flags/al.svg", name_ar: "ألبانيا", name_en: "Albania" },
        { value: "+213", label: "+213", src: "./assets/images/flags/dz.svg", name_ar: "الجزائر", name_en: "Algeria" },
        { value: "+1684", label: "+1684", src: "./assets/images/flags/as.svg", name_ar: "ساموا الأمريكية", name_en: "American Samoa" },
        { value: "+376", label: "+376", src: "./assets/images/flags/ad.svg", name_ar: "أندورا", name_en: "Andorra" },
        { value: "+244", label: "+244", src: "./assets/images/flags/ao.svg", name_ar: "أنغولا", name_en: "Angola" },
        { value: "+1264", label: "+1264", src: "./assets/images/flags/ag.svg", name_ar: "أنغويلا", name_en: "Anguilla" },
        { value: "+1268", label: "+1268", src: "./assets/images/flags/ag.svg", name_ar: "أنتيغوا وبربودا", name_en: "Antigua and Barbuda" },
        { value: "+54", label: "+54", src: "./assets/images/flags/ar.svg", name_ar: "الأرجنتين", name_en: "Argentina" },
        { value: "+374", label: "+374", src: "./assets/images/flags/am.svg", name_ar: "أرمينيا", name_en: "Armenia" },
        { value: "+297", label: "+297", src: "./assets/images/flags/aw.svg", name_ar: "أروبا", name_en: "Aruba" },
        { value: "+61", label: "+61", src: "./assets/images/flags/au.svg", name_ar: "أستراليا", name_en: "Australia" },
        { value: "+43", label: "+43", src: "./assets/images/flags/at.svg", name_ar: "النمسا", name_en: "Austria" },
        { value: "+994", label: "+994", src: "./assets/images/flags/az.svg", name_ar: "أذربيجان", name_en: "Azerbaijan" },
        { value: "+1242", label: "+1242", src: "./assets/images/flags/bs.svg", name_ar: "باهاماس", name_en: "Bahamas" },
        { value: "+973", label: "+973", src: "./assets/images/flags/bh.svg", name_ar: "البحرين", name_en: "Bahrain" },
        { value: "+880", label: "+880", src: "./assets/images/flags/bd.svg", name_ar: "بنغلاديش", name_en: "Bangladesh" },
        { value: "+1246", label: "+1246", src: "./assets/images/flags/bb.svg", name_ar: "بربادوس", name_en: "Barbados" },
        { value: "+375", label: "+375", src: "./assets/images/flags/by.svg", name_ar: "بيلاروسيا", name_en: "Belarus" },
        { value: "+32", label: "+32", src: "./assets/images/flags/be.svg", name_ar: "بلجيكا", name_en: "Belgium" },
        { value: "+501", label: "+501", src: "./assets/images/flags/bz.svg", name_ar: "بليز", name_en: "Belize" },
        { value: "+229", label: "+229", src: "./assets/images/flags/bj.svg", name_ar: "بنين", name_en: "Benin" },
        { value: "+1441", label: "+1441", src: "./assets/images/flags/bm.svg", name_ar: "برمودا", name_en: "Bermuda" },
        { value: "+975", label: "+975", src: "./assets/images/flags/bt.svg", name_ar: "بوتان", name_en: "Bhutan" },
        { value: "+591", label: "+591", src: "./assets/images/flags/bo.svg", name_ar: "بوليفيا", name_en: "Bolivia" },
        { value: "+387", label: "+387", src: "./assets/images/flags/ba.svg", name_ar: "البوسنة والهرسك", name_en: "Bosnia and Herzegovina" },
        { value: "+267", label: "+267", src: "./assets/images/flags/bw.svg", name_ar: "بوتسوانا", name_en: "Botswana" },
        { value: "+55", label: "+55", src: "./assets/images/flags/br.svg", name_ar: "البرازيل", name_en: "Brazil" },
        { value: "+246", label: "+246", src: "./assets/images/flags/io.svg", name_ar: "المحيط الهندي البريطاني", name_en: "British Indian Ocean Territory" },
        { value: "+673", label: "+673", src: "./assets/images/flags/bn.svg", name_ar: "بروناي", name_en: "Brunei" },
        { value: "+359", label: "+359", src: "./assets/images/flags/bg.svg", name_ar: "بلغاريا", name_en: "Bulgaria" },
        { value: "+226", label: "+226", src: "./assets/images/flags/bf.svg", name_ar: "بوركينا فاسو", name_en: "Burkina Faso" },
        { value: "+257", label: "+257", src: "./assets/images/flags/bi.svg", name_ar: "بوروندي", name_en: "Burundi" },
        { value: "+855", label: "+855", src: "./assets/images/flags/kh.svg", name_ar: "كمبوديا", name_en: "Cambodia" },
        { value: "+237", label: "+237", src: "./assets/images/flags/cm.svg", name_ar: "الكاميرون", name_en: "Cameroon" },
        { value: "+1", label: "+1", src: "./assets/images/flags/ca.svg", name_ar: "كندا", name_en: "Canada" },
        { value: "+238", label: "+238", src: "./assets/images/flags/cv.svg", name_ar: "الرأس الأخضر", name_en: "Cape Verde" },
        { value: "+1345", label: "+1345", src: "./assets/images/flags/ky.svg", name_ar: "جزر كايمان", name_en: "Cayman Islands" },
        { value: "+236", label: "+236", src: "./assets/images/flags/cf.svg", name_ar: "جمهورية أفريقيا الوسطى", name_en: "Central African Republic" },
        { value: "+235", label: "+235", src: "./assets/images/flags/td.svg", name_ar: "تشاد", name_en: "Chad" },
        { value: "+56", label: "+56", src: "./assets/images/flags/cl.svg", name_ar: "تشيلي", name_en: "Chile" },
        { value: "+86", label: "+86", src: "./assets/images/flags/cn.svg", name_ar: "الصين", name_en: "China" },
        { value: "+57", label: "+57", src: "./assets/images/flags/co.svg", name_ar: "كولومبيا", name_en: "Colombia" },
        { value: "+269", label: "+269", src: "./assets/images/flags/km.svg", name_ar: "جزر القمر", name_en: "Comoros" },
        { value: "+242", label: "+242", src: "./assets/images/flags/cg.svg", name_ar: "الكونغو", name_en: "Congo" },
        { value: "+682", label: "+682", src: "./assets/images/flags/ck.svg", name_ar: "جزر كوك", name_en: "Cook Islands" },
        { value: "+506", label: "+506", src: "./assets/images/flags/cr.svg", name_ar: "كوستاريكا", name_en: "Costa Rica" },
        { value: "+225", label: "+225", src: "./assets/images/flags/ci.svg", name_ar: "ساحل العاج", name_en: "Ivory Coast" },
        { value: "+385", label: "+385", src: "./assets/images/flags/hr.svg", name_ar: "كرواتيا", name_en: "Croatia" },
        { value: "+53", label: "+53", src: "./assets/images/flags/cu.svg", name_ar: "كوبا", name_en: "Cuba" },
        { value: "+357", label: "+357", src: "./assets/images/flags/cy.svg", name_ar: "قبرص", name_en: "Cyprus" },
        { value: "+420", label: "+420", src: "./assets/images/flags/cz.svg", name_ar: "جمهورية التشيك", name_en: "Czech Republic" },
        { value: "+45", label: "+45", src: "./assets/images/flags/dk.svg", name_ar: "الدنمارك", name_en: "Denmark" },
        { value: "+253", label: "+253", src: "./assets/images/flags/dj.svg", name_ar: "جيبوتي", name_en: "Djibouti" },
        { value: "+1767", label: "+1767", src: "./assets/images/flags/dm.svg", name_ar: "دومينيكا", name_en: "Dominica" },
        { value: "+1809", label: "+1809", src: "./assets/images/flags/do.svg", name_ar: "جمهورية الدومينيكان", name_en: "Dominican Republic" },
        { value: "+593", label: "+593", src: "./assets/images/flags/ec.svg", name_ar: "الإكوادور", name_en: "Ecuador" },
        { value: "+2", label: "+2", src: "./assets/images/flags/eg.svg", name_ar: "مصر", name_en: "Egypt" },
        { value: "+503", label: "+503", src: "./assets/images/flags/sv.svg", name_ar: "السلفادور", name_en: "El Salvador" },
        { value: "+240", label: "+240", src: "./assets/images/flags/gq.svg", name_ar: "غينيا الاستوائية", name_en: "Equatorial Guinea" },
        { value: "+291", label: "+291", src: "./assets/images/flags/er.svg", name_ar: "إريتريا", name_en: "Eritrea" },
        { value: "+372", label: "+372", src: "./assets/images/flags/ee.svg", name_ar: "إستونيا", name_en: "Estonia" },
        { value: "+251", label: "+251", src: "./assets/images/flags/et.svg", name_ar: "إثيوبيا", name_en: "Ethiopia" },
        { value: "+500", label: "+500", src: "./assets/images/flags/fk.svg", name_ar: "جزر فوكلاند", name_en: "Falkland Islands" },
        { value: "+298", label: "+298", src: "./assets/images/flags/fo.svg", name_ar: "جزر فارو", name_en: "Faroe Islands" },
        { value: "+679", label: "+679", src: "./assets/images/flags/fj.svg", name_ar: "فيجي", name_en: "Fiji" },
        { value: "+358", label: "+358", src: "./assets/images/flags/fi.svg", name_ar: "فنلندا", name_en: "Finland" },
        { value: "+33", label: "+33", src: "./assets/images/flags/fr.svg", name_ar: "فرنسا", name_en: "France" },
        { value: "+594", label: "+594", src: "./assets/images/flags/gf.svg", name_ar: "غويانا الفرنسية", name_en: "French Guiana" },
        { value: "+689", label: "+689", src: "./assets/images/flags/pf.svg", name_ar: "بولينزيا الفرنسية", name_en: "French Polynesia" },
        { value: "+241", label: "+241", src: "./assets/images/flags/ga.svg", name_ar: "الغابون", name_en: "Gabon" },
        { value: "+220", label: "+220", src: "./assets/images/flags/gm.svg", name_ar: "غامبيا", name_en: "Gambia" },
        { value: "+995", label: "+995", src: "./assets/images/flags/ge.svg", name_ar: "جورجيا", name_en: "Georgia" },
        { value: "+49", label: "+49", src: "./assets/images/flags/de.svg", name_ar: "ألمانيا", name_en: "Germany" },
        { value: "+233", label: "+233", src: "./assets/images/flags/gh.svg", name_ar: "غانا", name_en: "Ghana" },
        { value: "+350", label: "+350", src: "./assets/images/flags/gi.svg", name_ar: "جبل طارق", name_en: "Gibraltar" },
        { value: "+30", label: "+30", src: "./assets/images/flags/gr.svg", name_ar: "اليونان", name_en: "Greece" },
        { value: "+299", label: "+299", src: "./assets/images/flags/gl.svg", name_ar: "غرينلاند", name_en: "Greenland" },
        { value: "+1473", label: "+1473", src: "./assets/images/flags/gd.svg", name_ar: "غرينادا", name_en: "Grenada" },
        { value: "+590", label: "+590", src: "./assets/images/flags/gp.svg", name_ar: "غوادلوب", name_en: "Guadeloupe" },
        { value: "+1671", label: "+1671", src: "./assets/images/flags/gu.svg", name_ar: "غوام", name_en: "Guam" },
        { value: "+502", label: "+502", src: "./assets/images/flags/gt.svg", name_ar: "غواتيمالا", name_en: "Guatemala" },
        { value: "+224", label: "+224", src: "./assets/images/flags/gn.svg", name_ar: "غينيا", name_en: "Guinea" },
        { value: "+245", label: "+245", src: "./assets/images/flags/gw.svg", name_ar: "غينيا بيساو", name_en: "Guinea-Bissau" },
        { value: "+592", label: "+592", src: "./assets/images/flags/gy.svg", name_ar: "غيانا", name_en: "Guyana" },
        { value: "+509", label: "+509", src: "./assets/images/flags/ht.svg", name_ar: "هايتي", name_en: "Haiti" },
        { value: "+504", label: "+504", src: "./assets/images/flags/hn.svg", name_ar: "هندوراس", name_en: "Honduras" },
        { value: "+852", label: "+852", src: "./assets/images/flags/hk.svg", name_ar: "هونغ كونغ", name_en: "Hong Kong" },
        { value: "+36", label: "+36", src: "./assets/images/flags/hu.svg", name_ar: "المجر", name_en: "Hungary" },
        { value: "+354", label: "+354", src: "./assets/images/flags/is.svg", name_ar: "آيسلندا", name_en: "Iceland" },
        { value: "+91", label: "+91", src: "./assets/images/flags/in.svg", name_ar: "الهند", name_en: "India" },
        { value: "+62", label: "+62", src: "./assets/images/flags/id.svg", name_ar: "إندونيسيا", name_en: "Indonesia" },
        { value: "+98", label: "+98", src: "./assets/images/flags/ir.svg", name_ar: "إيران", name_en: "Iran" },
        { value: "+964", label: "+964", src: "./assets/images/flags/iq.svg", name_ar: "العراق", name_en: "Iraq" },
        { value: "+353", label: "+353", src: "./assets/images/flags/ie.svg", name_ar: "أيرلندا", name_en: "Ireland" },
        { value: "+972", label: "+972", src: "./assets/images/flags/il.svg", name_ar: "إسرائيل", name_en: "Israel" },
        { value: "+39", label: "+39", src: "./assets/images/flags/it.svg", name_ar: "إيطاليا", name_en: "Italy" },
        { value: "+1876", label: "+1876", src: "./assets/images/flags/jm.svg", name_ar: "جامايكا", name_en: "Jamaica" },
        { value: "+81", label: "+81", src: "./assets/images/flags/jp.svg", name_ar: "اليابان", name_en: "Japan" },
        { value: "+962", label: "+962", src: "./assets/images/flags/jo.svg", name_ar: "الأردن", name_en: "Jordan" },
        { value: "+7", label: "+7", src: "./assets/images/flags/ru.svg", name_ar: "كازاخستان / روسيا", name_en: "Kazakhstan / Russia" },
        { value: "+254", label: "+254", src: "./assets/images/flags/ke.svg", name_ar: "كينيا", name_en: "Kenya" },
        { value: "+686", label: "+686", src: "./assets/images/flags/ki.svg", name_ar: "كيريباتي", name_en: "Kiribati" },
        { value: "+850", label: "+850", src: "./assets/images/flags/kp.svg", name_ar: "كوريا الشمالية", name_en: "North Korea" },
        { value: "+82", label: "+82", src: "./assets/images/flags/kr.svg", name_ar: "كوريا الجنوبية", name_en: "South Korea" },
        { value: "+965", label: "+965", src: "./assets/images/flags/kw.svg", name_ar: "الكويت", name_en: "Kuwait" },
        { value: "+996", label: "+996", src: "./assets/images/flags/kg.svg", name_ar: "قيرغيزستان", name_en: "Kyrgyzstan" },
        { value: "+856", label: "+856", src: "./assets/images/flags/la.svg", name_ar: "لاوس", name_en: "Laos" },
        { value: "+371", label: "+371", src: "./assets/images/flags/lv.svg", name_ar: "لاتفيا", name_en: "Latvia" },
        { value: "+961", label: "+961", src: "./assets/images/flags/lb.svg", name_ar: "لبنان", name_en: "Lebanon" },
        { value: "+266", label: "+266", src: "./assets/images/flags/ls.svg", name_ar: "ليسوتو", name_en: "Lesotho" },
        { value: "+231", label: "+231", src: "./assets/images/flags/lr.svg", name_ar: "ليبيريا", name_en: "Liberia" },
        { value: "+218", label: "+218", src: "./assets/images/flags/ly.svg", name_ar: "ليبيا", name_en: "Libya" },
        { value: "+423", label: "+423", src: "./assets/images/flags/li.svg", name_ar: "ليختنشتاين", name_en: "Liechtenstein" },
        { value: "+370", label: "+370", src: "./assets/images/flags/lt.svg", name_ar: "ليتوانيا", name_en: "Lithuania" },
        { value: "+352", label: "+352", src: "./assets/images/flags/lu.svg", name_ar: "لوكسمبورغ", name_en: "Luxembourg" },
        { value: "+853", label: "+853", src: "./assets/images/flags/mo.svg", name_ar: "ماكاو", name_en: "Macao" },
        { value: "+389", label: "+389", src: "./assets/images/flags/mk.svg", name_ar: "مقدونيا الشمالية", name_en: "North Macedonia" },
        { value: "+261", label: "+261", src: "./assets/images/flags/mg.svg", name_ar: "مدغشقر", name_en: "Madagascar" },
        { value: "+265", label: "+265", src: "./assets/images/flags/mw.svg", name_ar: "مالاوي", name_en: "Malawi" },
        { value: "+60", label: "+60", src: "./assets/images/flags/my.svg", name_ar: "ماليزيا", name_en: "Malaysia" },
        { value: "+960", label: "+960", src: "./assets/images/flags/mv.svg", name_ar: "جزر المالديف", name_en: "Maldives" },
        { value: "+223", label: "+223", src: "./assets/images/flags/ml.svg", name_ar: "مالي", name_en: "Mali" },
        { value: "+356", label: "+356", src: "./assets/images/flags/mt.svg", name_ar: "مالطا", name_en: "Malta" },
        { value: "+692", label: "+692", src: "./assets/images/flags/mh.svg", name_ar: "جزر مارشال", name_en: "Marshall Islands" },
        { value: "+596", label: "+596", src: "./assets/images/flags/mq.svg", name_ar: "مارتينيك", name_en: "Martinique" },
        { value: "+222", label: "+222", src: "./assets/images/flags/mr.svg", name_ar: "موريتانيا", name_en: "Mauritania" },
        { value: "+230", label: "+230", src: "./assets/images/flags/mu.svg", name_ar: "موريشيوس", name_en: "Mauritius" },
        { value: "+52", label: "+52", src: "./assets/images/flags/mx.svg", name_ar: "المكسيك", name_en: "Mexico" },
        { value: "+691", label: "+691", src: "./assets/images/flags/fm.svg", name_ar: "ميكرونيزيا", name_en: "Micronesia" },
        { value: "+373", label: "+373", src: "./assets/images/flags/md.svg", name_ar: "مولدوفا", name_en: "Moldova" },
        { value: "+377", label: "+377", src: "./assets/images/flags/mc.svg", name_ar: "موناكو", name_en: "Monaco" },
        { value: "+976", label: "+976", src: "./assets/images/flags/mn.svg", name_ar: "منغوليا", name_en: "Mongolia" },
        { value: "+1664", label: "+1664", src: "./assets/images/flags/ms.svg", name_ar: "مونتسرات", name_en: "Montserrat" },
        { value: "+258", label: "+258", src: "./assets/images/flags/mz.svg", name_ar: "موزمبيق", name_en: "Mozambique" },
        { value: "+95", label: "+95", src: "./assets/images/flags/mm.svg", name_ar: "ميانمار", name_en: "Myanmar" },
        { value: "+264", label: "+264", src: "./assets/images/flags/na.svg", name_ar: "ناميبيا", name_en: "Namibia" },
        { value: "+674", label: "+674", src: "./assets/images/flags/nr.svg", name_ar: "ناورو", name_en: "Nauru" },
        { value: "+977", label: "+977", src: "./assets/images/flags/np.svg", name_ar: "نيبال", name_en: "Nepal" },
        { value: "+31", label: "+31", src: "./assets/images/flags/nl.svg", name_ar: "هولندا", name_en: "Netherlands" },
        { value: "+599", label: "+599", src: "./assets/images/flags/an.svg", name_ar: "جزر الأنتيل الهولندية", name_en: "Netherlands Antilles" },
        { value: "+687", label: "+687", src: "./assets/images/flags/nc.svg", name_ar: "كاليدونيا الجديدة", name_en: "New Caledonia" },
        { value: "+64", label: "+64", src: "./assets/images/flags/nz.svg", name_ar: "نيوزيلندا", name_en: "New Zealand" },
        { value: "+505", label: "+505", src: "./assets/images/flags/ni.svg", name_ar: "نيكاراغوا", name_en: "Nicaragua" },
        { value: "+227", label: "+227", src: "./assets/images/flags/ne.svg", name_ar: "النيجر", name_en: "Niger" },
        { value: "+234", label: "+234", src: "./assets/images/flags/ng.svg", name_ar: "نيجيريا", name_en: "Nigeria" },
        { value: "+683", label: "+683", src: "./assets/images/flags/nu.svg", name_ar: "نييوي", name_en: "Niue" },
        { value: "+672", label: "+672", src: "./assets/images/flags/nf.svg", name_ar: "جزيرة نورفولك", name_en: "Norfolk Island" },
        { value: "+1670", label: "+1670", src: "./assets/images/flags/mp.svg", name_ar: "جزر ماريانا الشمالية", name_en: "Northern Mariana Islands" },
        { value: "+968", label: "+968", src: "./assets/images/flags/om.svg", name_ar: "عمان", name_en: "Oman" },
        { value: "+92", label: "+92", src: "./assets/images/flags/pk.svg", name_ar: "باكستان", name_en: "Pakistan" },
        { value: "+970", label: "+970", src: "./assets/images/flags/ps.svg", name_ar: "فلسطين", name_en: "Palestine" },
        { value: "+507", label: "+507", src: "./assets/images/flags/pa.svg", name_ar: "بنما", name_en: "Panama" },
        { value: "+675", label: "+675", src: "./assets/images/flags/pg.svg", name_ar: "بابوا غينيا الجديدة", name_en: "Papua New Guinea" },
        { value: "+595", label: "+595", src: "./assets/images/flags/py.svg", name_ar: "باراغواي", name_en: "Paraguay" },
        { value: "+51", label: "+51", src: "./assets/images/flags/pe.svg", name_ar: "بيرو", name_en: "Peru" },
        { value: "+63", label: "+63", src: "./assets/images/flags/ph.svg", name_ar: "الفلبين", name_en: "Philippines" },
        { value: "+48", label: "+48", src: "./assets/images/flags/pl.svg", name_ar: "بولندا", name_en: "Poland" },
        { value: "+351", label: "+351", src: "./assets/images/flags/pt.svg", name_ar: "البرتغال", name_en: "Portugal" },
        { value: "+1787", label: "+1787", src: "./assets/images/flags/pr.svg", name_ar: "بورتوريكو", name_en: "Puerto Rico" },
        { value: "+974", label: "+974", src: "./assets/images/flags/qa.svg", name_ar: "قطر", name_en: "Qatar" },
        { value: "+262", label: "+262", src: "./assets/images/flags/re.svg", name_ar: "لا ريونيون", name_en: "Réunion" },
        { value: "+40", label: "+40", src: "./assets/images/flags/ro.svg", name_ar: "رومانيا", name_en: "Romania" },
        { value: "+250", label: "+250", src: "./assets/images/flags/rw.svg", name_ar: "رواندا", name_en: "Rwanda" },
        { value: "+290", label: "+290", src: "./assets/images/flags/sh.svg", name_ar: "سانت هيلينا", name_en: "Saint Helena" },
        { value: "+1869", label: "+1869", src: "./assets/images/flags/kn.svg", name_ar: "سانت كيتس ونيفيس", name_en: "Saint Kitts and Nevis" },
        { value: "+1758", label: "+1758", src: "./assets/images/flags/lc.svg", name_ar: "سانت لوسيا", name_en: "Saint Lucia" },
        { value: "+508", label: "+508", src: "./assets/images/flags/pm.svg", name_ar: "سان بيير وميكلون", name_en: "Saint Pierre and Miquelon" },
        { value: "+1784", label: "+1784", src: "./assets/images/flags/vc.svg", name_ar: "سانت فينسنت والغرينادين", name_en: "Saint Vincent and the Grenadines" },
        { value: "+684", label: "+684", src: "./assets/images/flags/ws.svg", name_ar: "ساموا", name_en: "Samoa" },
        { value: "+378", label: "+378", src: "./assets/images/flags/sm.svg", name_ar: "سان مارينو", name_en: "San Marino" },
        { value: "+239", label: "+239", src: "./assets/images/flags/st.svg", name_ar: "ساو تومي وبرينسيب", name_en: "Sao Tome and Principe" },
        { value: "+966", label: "+966", src: "./assets/images/flags/sa.svg", name_ar: "السعودية", name_en: "Saudi Arabia" },
        { value: "+221", label: "+221", src: "./assets/images/flags/sn.svg", name_ar: "السنغال", name_en: "Senegal" },
        { value: "+381", label: "+381", src: "./assets/images/flags/rs.svg", name_ar: "صربيا", name_en: "Serbia" },
        { value: "+248", label: "+248", src: "./assets/images/flags/sc.svg", name_ar: "سيشل", name_en: "Seychelles" },
        { value: "+232", label: "+232", src: "./assets/images/flags/sl.svg", name_ar: "سيراليون", name_en: "Sierra Leone" },
        { value: "+65", label: "+65", src: "./assets/images/flags/sg.svg", name_ar: "سنغافورة", name_en: "Singapore" },
        { value: "+421", label: "+421", src: "./assets/images/flags/sk.svg", name_ar: "سلوفاكيا", name_en: "Slovakia" },
        { value: "+386", label: "+386", src: "./assets/images/flags/si.svg", name_ar: "سلوفينيا", name_en: "Slovenia" },
        { value: "+677", label: "+677", src: "./assets/images/flags/sb.svg", name_ar: "جزر سليمان", name_en: "Solomon Islands" },
        { value: "+252", label: "+252", src: "./assets/images/flags/so.svg", name_ar: "الصومال", name_en: "Somalia" },
        { value: "+27", label: "+27", src: "./assets/images/flags/za.svg", name_ar: "جنوب أفريقيا", name_en: "South Africa" },
        { value: "+34", label: "+34", src: "./assets/images/flags/es.svg", name_ar: "إسبانيا", name_en: "Spain" },
        { value: "+94", label: "+94", src: "./assets/images/flags/lk.svg", name_ar: "سريلانكا", name_en: "Sri Lanka" },
        { value: "+249", label: "+249", src: "./assets/images/flags/sd.svg", name_ar: "السودان", name_en: "Sudan" },
        { value: "+597", label: "+597", src: "./assets/images/flags/sr.svg", name_ar: "سورينام", name_en: "Suriname" },
        { value: "+47", label: "+47", src: "./assets/images/flags/sj.svg", name_ar: "سفالبارد ويان ماين", name_en: "Svalbard and Jan Mayen" },
        { value: "+268", label: "+268", src: "./assets/images/flags/sz.svg", name_ar: "إسواتيني", name_en: "Eswatini" },
        { value: "+46", label: "+46", src: "./assets/images/flags/se.svg", name_ar: "السويد", name_en: "Sweden" },
        { value: "+41", label: "+41", src: "./assets/images/flags/ch.svg", name_ar: "سويسرا", name_en: "Switzerland" },
        { value: "+963", label: "+963", src: "./assets/images/flags/sy.svg", name_ar: "سوريا", name_en: "Syria" },
        { value: "+886", label: "+886", src: "./assets/images/flags/tw.svg", name_ar: "تايوان", name_en: "Taiwan" },
        { value: "+992", label: "+992", src: "./assets/images/flags/tj.svg", name_ar: "طاجيكستان", name_en: "Tajikistan" },
        { value: "+255", label: "+255", src: "./assets/images/flags/tz.svg", name_ar: "تنزانيا", name_en: "Tanzania" },
        { value: "+66", label: "+66", src: "./assets/images/flags/th.svg", name_ar: "تايلاند", name_en: "Thailand" },
        { value: "+670", label: "+670", src: "./assets/images/flags/tl.svg", name_ar: "تيمور الشرقية", name_en: "Timor-Leste" },
        { value: "+228", label: "+228", src: "./assets/images/flags/tg.svg", name_ar: "توغو", name_en: "Togo" },
        { value: "+690", label: "+690", src: "./assets/images/flags/to.svg", name_ar: "تونغا", name_en: "Tonga" },
        { value: "+676", label: "+676", src: "./assets/images/flags/to.svg", name_ar: "تونس", name_en: "Tunisia" },
        { value: "+90", label: "+90", src: "./assets/images/flags/tr.svg", name_ar: "تركيا", name_en: "Turkey" },
        { value: "+993", label: "+993", src: "./assets/images/flags/tm.svg", name_ar: "تركمانستان", name_en: "Turkmenistan" },
        { value: "+1649", label: "+1649", src: "./assets/images/flags/tc.svg", name_ar: "جزر توركس وكايكوس", name_en: "Turks and Caicos Islands" },
        { value: "+688", label: "+688", src: "./assets/images/flags/tv.svg", name_ar: "توفالو", name_en: "Tuvalu" },
        { value: "+256", label: "+256", src: "./assets/images/flags/ug.svg", name_ar: "أوغندا", name_en: "Uganda" },
        { value: "+380", label: "+380", src: "./assets/images/flags/ua.svg", name_ar: "أوكرانيا", name_en: "Ukraine" },
        { value: "+971", label: "+971", src: "./assets/images/flags/ae.svg", name_ar: "الإمارات العربية المتحدة", name_en: "United Arab Emirates" },
        { value: "+44", label: "+44", src: "./assets/images/flags/gb.svg", name_ar: "المملكة المتحدة", name_en: "United Kingdom" },
        { value: "+1", label: "+1", src: "./assets/images/flags/us.svg", name_ar: "الولايات المتحدة", name_en: "United States" },
        { value: "+598", label: "+598", src: "./assets/images/flags/uy.svg", name_ar: "أوروغواي", name_en: "Uruguay" },
        { value: "+998", label: "+998", src: "./assets/images/flags/uz.svg", name_ar: "أوزبكستان", name_en: "Uzbekistan" },
        { value: "+678", label: "+678", src: "./assets/images/flags/vu.svg", name_ar: "فانواتو", name_en: "Vanuatu" },
        { value: "+58", label: "+58", src: "./assets/images/flags/ve.svg", name_ar: "فنزويلا", name_en: "Venezuela" },
        { value: "+84", label: "+84", src: "./assets/images/flags/vn.svg", name_ar: "فيتنام", name_en: "Vietnam" },
        { value: "+1284", label: "+1284", src: "./assets/images/flags/vg.svg", name_ar: "جزر العذراء البريطانية", name_en: "Virgin Islands (British)" },
        { value: "+1340", label: "+1340", src: "./assets/images/flags/vi.svg", name_ar: "جزر العذراء الأمريكية", name_en: "Virgin Islands (U.S.)" },
        { value: "+681", label: "+681", src: "./assets/images/flags/wf.svg", name_ar: "واليس وفوتونا", name_en: "Wallis and Futuna" },
        { value: "+967", label: "+967", src: "./assets/images/flags/ye.svg", name_ar: "اليمن", name_en: "Yemen" },
        { value: "+260", label: "+260", src: "./assets/images/flags/zm.svg", name_ar: "زامبيا", name_en: "Zambia" },
        { value: "+263", label: "+263", src: "./assets/images/flags/zw.svg", name_ar: "زيمبابوي", name_en: "Zimbabwe" }
    ];


    constructor(
        private httpClient: HttpClient,
        private datepipe: DatePipe,
        private i18n: I18N,
        private router: Router,
        private ui: UIService,
        private ws: WebsocketService) {
    }

    async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        await this.initCache();
        await this.initializeApp();
        await this.backWithNewSession();
        await this.checkEssySettings();
    }

    public async initCache(): Promise<boolean> {
        if (!Constants.loaded) {
            await this.httpClient.get('assets/settings.json?r=' + (new Date()).getTime())
                .toPromise()
                .then((settings: any) => {
                    if (settings) {
                        Constants.protocol = settings.protocol || Constants.protocol;
                        Constants.baseUrl = settings.baseUrl || Constants.baseUrl;
                        Constants.baseUrl = Constants.protocol + Constants.baseUrl;
                        Constants.defualtUploadSys = settings.defualtUploadSys;
                        Constants.contactUsUrl = settings.contactUsUrl;
                        Constants.mainHomeUrl = settings.mainHomeUrl;
                        Constants.enable_payment = settings.enable_payment || Constants.enable_payment;
                        Constants.enable_add_more_wishs = settings.enable_add_more_wishs || Constants.enable_add_more_wishs;
                        Constants.enable_attachments = settings.enable_attachments || Constants.enable_attachments;
                        Constants.loaded = true;
                        Constants.dt = settings.dt || Constants.dt;
                        Constants.max_age = settings.max_age || Constants.max_age;
                        Constants.min_age = settings.min_age || Constants.min_age;

                        Constants.max_heard_about_us_no = settings.max_heard_about_us_no || Constants.max_heard_about_us_no;
                        Constants.min_heard_about_us_no = settings.min_heard_about_us_no || Constants.min_heard_about_us_no;
                        Constants.initial_wishs_no = settings.initial_wishs_no || Constants.initial_wishs_no;


                        Constants.max_wishs = settings.max_wishs || Constants.max_wishs;
                        Constants.mandatory_wishs_no = settings.mandatory_wishs_no || Constants.mandatory_wishs_no;
                        Constants.file_uploade_max_size = settings.file_uploade_max_size || Constants.file_uploade_max_size;
                        Constants.enable_efinance_admission_fees = settings.enable_efinance_admission_fees;
                        Constants.enable_fawry_admission_fees = settings.enable_fawry_admission_fees;
                        Constants.enable_efinance_first_semester_fees = settings.enable_efinance_first_semester_fees;
                        Constants.enable_fawry_first_semester_fees = settings.enable_fawry_first_semester_fees;
                        Constants.enable_print_first_semester_fees = settings.enable_print_first_semester_fees;

                        Constants.company = settings.company;
                        Constants.populate_academyCode_way = settings.populate_academyCode_way || Constants.populate_academyCode_way;
                        Constants.terms_conditions_url = settings.terms_conditions_url;
                        Constants.privacy_policy_url = settings.privacy_policy_url;
                        Constants.refund_policy_url = settings.refund_policy_url;
                        Constants.social_media = settings.social_media;

                        Constants.fawry_url_script = settings.fawry_url_script;
                        Constants.fawry_url_style = settings.fawry_url_style;

                        Constants.enable_google_tag_manager = settings.enable_google_tag_manager;
                        Constants.enable_email_verification = settings.enable_email_verification;
                        Constants.enable_switch_lang = settings.enable_switch_lang;
                        Constants.default_lang = settings.default_lang;
                        Constants.contact_university = settings.contact_university || [];
                        Constants.hidden_flds = settings.hidden_flds || [];
                        Constants.min_address_length = settings.min_address_length || Constants.min_address_length;
                        if ((typeof Constants.dt === "undefined") || (Constants.dt === null) || (Constants.dt === "") || (Constants.dt === "true")) {
                            disableDevtool({
                                disableSelect: false,
                                disableCopy: false,
                                disableCut: false,
                                disableMenu: false,
                                clearLog: true,
                                ondevtoolopen: () => {
                                    window.location.href = '\u0061\u0062\u006f\u0075\u0074\u003a\u0062\u006c\u0061\u006e\u006b';
                                },
                                ondevtoolclose: () => {
                                    window.location.href = '\u0061\u0062\u006f\u0075\u0074\u003a\u0062\u006c\u0061\u006e\u006b';
                                },
                            });
                        }
                    }
                })
                .catch((err) => {
                    console.log("Failed to load settings from settings.json");
                });

            await this.loadI18N();
        }

        if (this.initialized) {
            return new Promise((resolve) => { resolve(true) });
        }

        if (this.initialPromise) {
            return this.initialPromise;
        }

        this.initialPromise = Promise.all([
            //this.fetchDepartment()
        ])
            .then(() => {
                this.initialized = true;
                this.initialPromise = new Promise((resolve) => { resolve(false) });
                return true;
            })
            .catch(err => {
                this.initialPromise = new Promise((resolve) => { resolve(false) });
                return false;
            });

        return this.initialPromise;
    }


    public getDirection(lang: string): boolean {
        if (lang === "ar") {
            return (true);
        } else {
            return (false);
        }
    }

    public getGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    convertStringToDate(strDate: any): string {
        if (!strDate) {
            return '';
        }
        let date: Date;
        if (strDate instanceof Date) {
            date = strDate;
        } else if (typeof strDate === 'string') {
            date = new Date(strDate.trim());
            if (isNaN(date.getTime())) {
                return strDate;
            }
        } else {
            return '';
        }
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}/${month}/${day}`;
    }
    /*
        convertStringToDate(strDate): string {
            if (typeof strDate === 'undefined') {
                return ('');
            }
            if (strDate === '') {
                return ('');
            }
            const event = new Date(strDate);
            event.toISOString();
            let new_date = "" + event;
            new_date = this.datepipe.transform(new_date, 'yyyy/MM/dd');
            return (new_date);
        }
    */
    timeString(hr: number, min: number): string {
        if (min < 10) {
            return hr + ':0' + min;
        } else {
            return hr + ':' + min;
        }
    }


    localize(target: any[], fields?: string[]) {
        if (!target || !target.length) return;

        if (!fields) fields = ['name'];

        let lang = I18N.lang;

        target.map((item: any) => {
            if (!item) return;

            if ('load' in item && typeof (item.load) === 'function') {
                // Handle objects that can localize themselves..
                item.load(item)
            }
            else if ('name' in item && 'value' in item) {
                // Handle DataItem instances..
                item.name = this.getName(item.value, fields[0], lang) || item.name;
                // and their children recursively..
                if ('children' in item && Array.isArray(item.children)) {
                    this.localize(item.children, fields);
                }
            }
            else {
                // Handle records with possibly multiple fields..
                for (let fld of fields) {
                    item[fld + '_local'] = this.getName(item, fld, lang)
                }
            }
        })
    }

    getName(item: any, field: string, lang: string) {
        return item[field + '_' + lang] || item[field + '_en'] || item[field];
    }

    async loadI18N() {
        let url = 'assets/i18.json?rand=' + new Date().getTime();
        await this.httpClient.get(url)
            .toPromise()
            .then((response: any) => {
                if (response) {
                    this.i18n.load(response);
                    this.i18n.switch(I18N.lang);
                } else {
                }
            })
    }
    public getAttachmentSerial(): number {
        const date = new Date();
        return <number><unknown>(date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate() + '' + date.getHours() + '' + date.getMinutes() + '' + date.getSeconds() + '' + date.getMilliseconds());
    }

    getCurrentTimestamp(): string {
        const now = new Date();
        const year = now.getFullYear().toString().padStart(4, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }


    encrypt(text): any {
        var encrypted = cryptoJS.AES.encrypt(cryptoJS.enc.Utf8.parse(text), environment.KEY, {
            keySize: 128 / 8,
            mode: cryptoJS.mode.CBC,
            padding: cryptoJS.pad.Pkcs7
        });
        return encodeURIComponent(encrypted.toString());
    }

    decrypt(decString) {
        var decrypted = cryptoJS.AES.decrypt(decodeURIComponent(decString), environment.KEY, {
            keySize: 128 / 8,
            mode: cryptoJS.mode.CBC,
            padding: cryptoJS.pad.Pkcs7
        });
        return decrypted.toString(cryptoJS.enc.Utf8);
    }

    async initializeApp(): Promise<boolean> {
        if (Constants.default_lang) {
            I18N.lang = Constants.default_lang;
            this.i18n.switch(I18N.lang);
        }
        if (this.maxRetries <= 0) {
            return false;
        }
        let url = Constants.baseUrl + '/i/k/r';
        try {
            const options = {
                reportProgress: true as const,
                observe: 'events' as const,
                withCredentials: true
            }
            await this.httpClient.post(url, "", options).toPromise().
                then((result: any) => {
                    this.maxRetries = 0;
                    localStorage.setItem('cloud-session', result['body']['s']);
                    SessionProvider.s = result['body']['s'];
                    //W.initK((this.unicodeToChar(result['body']['i']).replace(/[^0-9]/g, '').replace('//', '/')));
                    Q.t(1, result['body']['i']);
                });

        } catch (err) {
            console.trace(err);
            await this.delay(1000); // Retry after 1 second.
            this.maxRetries = this.maxRetries - 1;
            await this.initializeApp();
        }
        return false; // If we reach max retries, return false.
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async backWithNewSession() {
        if (DataProvider.isSessionBackCalled === false) {
            DataProvider.isSessionBackCalled = true;
            let userStorage = "";
            if ((localStorage.getItem('user') != null) && (localStorage.getItem('user') != "")) {
                userStorage = this.decrypt(localStorage.getItem('user'));
            }
            if ((typeof userStorage !== "undefined") && (userStorage !== null) && (userStorage !== '')) {
                try {
                    let userOld: Users = JSON.parse(userStorage);
                    let servletUrl = Constants.baseUrl + '/c/n/s?u=' + userOld.username + '&id=' + localStorage.getItem('login_guid');
                    const options = {
                        reportProgress: true as const,
                        observe: 'events' as const,
                        withCredentials: true
                    }
                    let response = await this.httpClient.post(servletUrl, "", options).toPromise();
                    response = response['body'];
                    SessionProvider.user = response['user'];
                    Constants.httpOptions.headers['cloud-session'] = response['JSESSIONID'];
                    Constants.httpOptions.headers['un'] = SessionProvider.user.username;

                    Q.t(1, SessionProvider.user[""]);

                    localStorage.removeItem('user');
                    localStorage.removeItem('cloud-session');
                    localStorage.removeItem('login_guid');

                    localStorage.setItem('cloud-session', response['JSESSIONID']);
                    localStorage.setItem('login_guid', response['login_guid']);
                    localStorage.setItem('user', this.encrypt(JSON.stringify(SessionProvider.user)));

                    SessionProvider.subject_user.next(SessionProvider.user);
                    this.ws.checkUserSession();
                    if ((document.URL.includes('/registration')) || (document.URL.includes('/login'))) {
                        this.router.navigate(['view'], { replaceUrl: true });
                    }
                    return true; // Resolve the promise with true
                } catch (err) {
                    DataProvider.isSessionBackCalled = false;
                    this.ui.warning('Sorry, Your Session is Expired', 'Please Login agin');
                    this.ws.logout();
                }
            }
        }
    }
    async checkEssySettings() {
        if (DataProvider.isEssaySettingsLoaded === false) {
            let subUrl = Constants.baseUrl + "/crd/essaysettings";
            let formDataSub = new FormData();
            formDataSub.append('transaction', 'select');
            const options = {
                reportProgress: true as const,
                observe: 'events' as const,
                withCredentials: true
            }
            try {
                let responseSub = await this.httpClient.post(subUrl, formDataSub, options).toPromise();
                if ((responseSub != null) && (responseSub['status'] == 200)) {
                    let resultset = <EssaySettings>responseSub['body']['resultset'][0];
                    if (resultset) {
                        Constants.essaySettings = resultset;
                        Constants.subject_essaySettings.next(resultset);
                        DataProvider.isEssaySettingsLoaded = true;
                    }
                }
            } catch (error) {
                DataProvider.isEssaySettingsLoaded = false;
                console.log(error);
            }
        }
    }
}
/*
  <!-- Test -->
  <link rel="stylesheet"
    href="https://atfawry.fawrystaging.com/atfawry/plugin/assets/payments/css/fawrypay-payments.css">
  <script type="text/javascript"
    src="https://atfawry.fawrystaging.com/atfawry/plugin/assets/payments/js/fawrypay-payments.js"></script>

  <!-- Production-->
  <link rel="stylesheet" href="https://www.atfawry.com/atfawry/plugin/assets/payments/css/fawrypay-payments.css">
  <script type="text/javascript" src="https://www.atfawry.com/atfawry/plugin/assets/payments/js/fawrypay-payments.js"></script> 
  */