using System;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class EnquirySearchResult
    {
        public int EnquiryId { get; set; }

        public Guid EnquiryUid { get; set; }

        public DateTime? EnquiryReceivedDate { get; set; }

        public string AssignedUnderwriterInitials { get; set; }

        public int? BrokerContactId { get; set; }

        public string BrokerContactName { get; set; }

        public int? BrokerTeamId { get; set; }

        public string BrokerTeamName { get; set; }

        public int? BrokerCompanyId { get; set; }

        public string BrokerCompanyName { get; set; }
    }
}
