using System;
using WebApiDto.Attributes;
using WebApiDto.Enum;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class RiskQuestionDependency
    {
        public int Id { get; set; }

        public string PrimaryRiskQuestionTag { get; set; }

        public string DependentRiskQuestionTag { get; set; }

        public Guid RiskQuestionOptionUid { get; set; }

        public decimal ComparisonValue { get; set; }

        public Operator Operator { get; set; }
    }
}
