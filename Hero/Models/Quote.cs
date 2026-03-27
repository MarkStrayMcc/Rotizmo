using Hero.Models.Enums;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class Quote : WebApiDto.Dto.Quote
    {
        public bool ShouldRemoveUnapprovedSubjectivities { get; set; }

        public bool NeedsPricingRecalculation { get; set; }

        public SaveQuoteError Error { get; set; }

        public decimal GST { get; set; }

        public decimal TriaPremium { get; set; } = 0;

        public string InsuranceType { get; set; }

        public InsuranceBasis InsuranceBasis { get; set; }
    }
}