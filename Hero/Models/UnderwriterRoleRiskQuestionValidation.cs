using WebApiDto.Attributes;
using WebApiDto.Enum;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class UnderwriterRoleRiskQuestionValidation
    {
        public string RiskQuestionTag { get; set; }

        public Operator Operator { get; set; }

        public string Value { get; set; }

        public string CurrencyIsoCode { get; set; }

        public string ActivityCode { get; set; }
    }
}