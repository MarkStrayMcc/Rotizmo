using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class EcfReconciliationClaimFinancialItem : WebApiDto.Dto.ClaimsFinance.EcfReconciliationClaimFinancialItem
    {
        public string AccountingReferenceDateFormattedString { get; set; } 
        public string Description { get; set; }
        public bool IsReconciled { get; set; }
        public bool ShouldBeReconciled { get; set; }
    }
}