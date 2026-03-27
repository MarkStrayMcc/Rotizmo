using System;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class AddressChangeMtaRequest
    {
        public string PolicyNumber { get; set; }

        public string EffectiveDate { get; set; }

        public string AddressLine1 { get; set; }

        public string AddressLine2 { get; set; }

        public string AddressLine3 { get; set; }

        public string City { get; set; }

        public string PostCode { get; set; }

        public string County { get; set; }

        public string StateProvince { get; set; }

        public Guid CfcUserId { get; set; }

        public string ChangeType { get; set; }
    }
}
