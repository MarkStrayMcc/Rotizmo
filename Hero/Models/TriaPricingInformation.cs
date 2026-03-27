using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class TriaPricingInformation
    {
        public string BusinessLine { get; set; }
        public decimal QuotedPremium { get; set; }
    }
}