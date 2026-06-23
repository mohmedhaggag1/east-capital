import { Injectable } from '@angular/core';
import { ApplicationSubmittedParams, PaymentCompletedParams } from './analytics.types';
import { Constants } from '../Constants';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {

    constructor() {
        this.initDataLayer();
    }

    private initDataLayer(): void {
        if (typeof window !== 'undefined') {
            (window as any).dataLayer = (window as any).dataLayer || [];
        }
    }

    private pushToDataLayer(eventData: Record<string, any>): void {
        try {
            if (typeof window !== 'undefined' && Constants.enable_google_tag_manager === true) {
                const dataLayer = (window as any).dataLayer;
                dataLayer.push(eventData);
                console.log('Analytics pushed:', eventData);
            }
        } catch (error) {
            console.error("Error pushing to dataLayer: ", error);
        }
    }

    // 1. Admission Started
    admissionStarted(): void {
        this.pushToDataLayer({ event: 'admission_started' });
    }

    // 2. Personal Information Completed
    personalInfoCompleted(): void {
        this.pushToDataLayer({ event: 'personal_info_completed' });
    }

    // 3. Guardian Details Completed
    guardianDetailsCompleted(): void {
        this.pushToDataLayer({ event: 'guardian_details_completed' });
    }

    // 4. OTP Sent
    otpSent(): void {
        this.pushToDataLayer({ event: 'otp_sent' });
    }

    // 5. Email Verification Successful
    emailVerified(): void {
        this.pushToDataLayer({ event: 'email_verified' });
    }

    // 6. Application Submitted
    applicationSubmitted(params: ApplicationSubmittedParams): void {
        this.pushToDataLayer({
            event: 'application_submitted',
            ...params
        });
    }

    // 7. Payment Started
    paymentStarted(): void {
        this.pushToDataLayer({ event: 'payment_started' });
    }

    // 8. Payment Completed
    paymentCompleted(params: PaymentCompletedParams): void {
        this.pushToDataLayer({
            event: 'payment_completed',
            ...params
        });
    }
}