import {SearchSubjectivitiesResult} from "@app/models/subjectivity-configuration/SearchSubjectivitiesResult";

export class SubjectivityConfiguration {
    public subjectivityId: string;
    public text: string;
    public languageIsoCode: string;
    public type: string;
    public daysToResolve: number;
    public isAutoAttaching: boolean;

    public static FromSearchSubjectivitiesResult(searchSubjectivitiesResult: SearchSubjectivitiesResult): SubjectivityConfiguration {
        let sub = new SubjectivityConfiguration();
        sub.text = searchSubjectivitiesResult.texts[0].text;
        sub.subjectivityId = searchSubjectivitiesResult.id;
        sub.type = searchSubjectivitiesResult.type;
        sub.daysToResolve = searchSubjectivitiesResult.daysToResolve;
        sub.isAutoAttaching = searchSubjectivitiesResult.isAutoAttaching;
        return sub;
    }
}
