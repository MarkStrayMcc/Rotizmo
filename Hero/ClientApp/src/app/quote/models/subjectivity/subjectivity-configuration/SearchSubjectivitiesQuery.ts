import {RiskQuestionAnswer} from "@app/quote/models/subjectivity/subjectivity-configuration/RiskQuestionAnswer";

export class SearchSubjectivitiesQuery {
    public LanguageIsoCode: string;
    public HasLocalBroker: boolean;
    public InceptionDate: string;
    public ProductCode: string;
    public CountryIsoCode: string;
    public StateIsoCode: string;
    public BusinessLines: string[];
    public RiskQuestionAnswers: RiskQuestionAnswer[];
}
