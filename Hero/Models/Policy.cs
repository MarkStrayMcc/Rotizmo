using System;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class Policy
    {
        public string Reference { get; set; }
        public string CompanyName { get; set; }
        public string BrokerName { get; set; }
        public string ProductName { get; set; }
        public string InceptionDate { get; set; }
        public string ExpirationDate { get; set; }
        public string PolicyType { get; set; }
        public Guid PolicyUid { get; set; }
        public int NerdVersion { get; set; }
        public Guid CompanyGuid { get; set; }
    }
}
