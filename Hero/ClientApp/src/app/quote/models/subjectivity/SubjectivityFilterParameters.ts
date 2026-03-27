import { SubjectivityAuthorisationState } from "@app/enums";

export class SubjectivityFilterParameters {  
    public productId: number;
    public countryId: number;
    public languageId: number;
    public surplusLineBrokerId: number;
    public authState: SubjectivityAuthorisationState; 
    public isAdmitted: boolean;
}
