import { Injectable } from '@angular/core';
import { Enquiry } from '@app/quote/models/enquiry/Enquiry';

@Injectable()
export class EnquiryValidationService {
    ValidateHeroEnquiry(enquiry: Enquiry): boolean {
        return enquiry && enquiry.nerdVersion === 3;
    }
}
