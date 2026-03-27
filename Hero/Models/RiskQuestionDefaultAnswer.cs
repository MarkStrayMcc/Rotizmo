using System;
using System.Collections.Generic;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class RiskQuestionDefaultAnswer
    {
        public int Id { get; set; }

        public string RiskQuestionTag { get; set; }

        public string Text { get; set; }

        public int? Number { get; set; }

        public decimal? Percentage { get; set; }

        public DateTime? Date { get; set; }

        public decimal? Currency { get; set; }

        public Guid RiskQuestionOptionUid { get; set; }

        public Dictionary<Guid, string> Options { get; set; }
    }
}
