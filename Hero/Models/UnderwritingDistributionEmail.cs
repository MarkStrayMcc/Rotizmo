using System;
using System.Collections.Generic;

namespace Hero.Models
{
    public class UnderwritingDistributionEmail
    {
        public Guid QuoteUid { get; set; }
        public int QuoteId { get; set; }
        public bool IsPublished { get; set; }
        public bool IsBindable { get; set; }
        public int WordingVersionId { get; set; }
        public string CountryIsoCode { get; set; }
        public string StateProvinceCode { get; set; }
        public string ProductCode { get; set; }
        public Email Email { get; set; }
        public List<int> QuoteIds { get; set; }
        public string PolicyNumber { get; set; }
        public int BrokerId { get; set; }
        public Guid ClientUid { get; set; }
        public string ContactEmail => Email?.Sender?.Email;
    }
}

