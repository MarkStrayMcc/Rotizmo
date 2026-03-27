
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class PricingGroup : WebApiDto.Dto.PricingGroup
    {
        public bool IsEditable { get; set; } 
        public string IncreasedLimitFactor { get; set; }        
        
    }
}
