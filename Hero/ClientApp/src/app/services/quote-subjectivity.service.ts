import {Injectable} from "@angular/core";
import {QuoteSubjectivity} from "@app/models";

@Injectable()
export class QuoteSubjectivityService {
    public formatSubjectivityDisplayText(subjectivity: QuoteSubjectivity): string {
        const postPriorToText = subjectivity.isPost ? `${subjectivity.days} days after` : "prior to";
        let subjectivityText;
        if (subjectivity.text) {
            subjectivityText = subjectivity.text
        } else {
            subjectivityText = subjectivity.subjectivity.text
        }
        console.log(subjectivityText)
        return `${subjectivityText} (${postPriorToText} binding)`;
    }
}
