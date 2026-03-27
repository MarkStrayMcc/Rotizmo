namespace Hero.Models.SubjectivityConfiguration;

public class SearchSubjectivitiesQuery
{
    public string LanguageIsoCode { get; set; }
    public bool HasLocalBroker { get; set; }
    public string InceptionDate { get; set; }
    public string ProductCode { get; set; }
    public string CountryIsoCode { get; set; }
    public string StateIsoCode { get; set; }
    public string[] BusinessLines { get; set; }
    public RiskQuestionAnswer[] RiskQuestionAnswers { get; set; }
}