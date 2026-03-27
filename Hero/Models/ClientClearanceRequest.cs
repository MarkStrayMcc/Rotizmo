using System;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class ClientClearanceRequest
    {
        public Guid ClientId { get; set; }

        public int BrokerCompanyId { get; set; }
    }
}
