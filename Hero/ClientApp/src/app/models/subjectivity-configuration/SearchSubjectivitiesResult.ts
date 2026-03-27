export class SearchSubjectivitiesResult {
    id: string;
    texts: SubjectivityText[];
    type: string;
    isAutoAttaching: boolean;
    daysToResolve: number;
}

export interface SubjectivityText {
    text: string;
    languageIsoCode: string;
}
