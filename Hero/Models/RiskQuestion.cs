using System.Collections.Generic;
using WebApiDto.Attributes;
using WebApiDto.Enum;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class RiskQuestion 
    {
        public string Tag { get; set; }

        public string Label { get; set; }

        public bool IsMandatory { get; set; }

        public RiskQuestionType Type { get; set; }

        public string TooltipText { get; set; }

        public int DisplayOrder { get; set; }

        public QuoteStep ShowOnStep { get; set; }

        public bool IsVisible { get; set; }

        public RiskQuestionDefaultAnswer DefaultAnswer { get; set; }

        public ICollection<RiskQuestionDependency> Dependencies { get; set; }

        public ICollection<RiskQuestionOption> Options { get; set; }
    }
}