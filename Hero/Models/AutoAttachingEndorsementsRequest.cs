using Hero.Models.Enums;
using System.Collections.Generic;

namespace Hero.Models
{
    public class AutoAttachingEndorsementsRequest
    {
        public string ProductCode { get; set; } 
        public string CountryCode { get; set; }
        public string StateCode { get; set; }
        public int BrokerTeamId { get; set; }
        public int BrokerId { get; set; }
        public int BrokerGroupId { get; set; }
        public List<string> BusinessLineCodes { get; set; }
        public List<string> InsuringClauseCodes { get; set; }
        public List<string> InsuringClauseSectionCodes { get; set; }
        public List<string> ActivityCodes { get; set; }
        public bool HasSubjectivities { get; set; }
        public string LanguageCode { get; set; }
        public int WordingVersionId { get; set; }
        public InsuranceBasis BasisType { get; set; }
        public OriginSystem OriginSystem { get; set; }
        public Dictionary<string,string> RiskQuestionAnswers { get; set; }
        public string Coverholder { get; set; }
    }
}
