using System.Collections.Generic;

namespace Hero.Models
{
    public class RiskQuestionValidationRulesSearchRequest
    {
        public string RiskQuestionTag { get; set; }

        public ICollection<string> ActivityCodes { get; set; }

        public int AuthorityRoleId { get; set; }

        public string ProductCode { get; set; }
    }
}