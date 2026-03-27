using WebApiDto.Attributes;
using System.Collections.Generic;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class Carrier
    {
        public string CarrierName { get; set; }
        public decimal ParticipationPercent { get; set; }
        public List<Syndicate> Syndicates { get; set; }
    }
}
