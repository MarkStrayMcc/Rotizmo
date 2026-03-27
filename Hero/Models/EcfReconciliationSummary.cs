using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class EcfReconciliationSummary : WebApiDto.Dto.ClaimsFinance.EcfReconciliationSummary
    {
        public string CompletedDateFormattedString { get; set; }
    }
}
