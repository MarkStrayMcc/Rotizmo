using System;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class RiskQuestionOption
    {
        public Guid Uid { get; set; }

        public string RiskQuestionTag { get; set; }

        public string Text { get; set; }

        public bool IsValid { get; set; } = true;
    }
}