using System;
using Newtonsoft.Json.Linq;

namespace Hero.Models
{
    public class EnquiryServiceEnquiry
    {
        public Guid Id { get; set; }
        public int EnquiryReference { get; set; }
        public JObject RiskData { get; set; }
        public JObject MetaData { get; set; }
        public string ExpiringPolicyNumber { get; set; }
    }
}
