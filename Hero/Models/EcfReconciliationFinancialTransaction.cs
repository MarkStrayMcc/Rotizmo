using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class EcfReconciliationFinancialTransaction : WebApiDto.Dto.ClaimsFinance.EcfReconciliationFinancialTransaction
    {
        public string EntryDateFormattedString { get; set; }
        public string PaidDateFormattedString { get; set; }
        public string Description { get; set; }
        public bool IsReconciled { get; set; }
        public bool ShouldBeReconciled { get; set; } 
    }
}
