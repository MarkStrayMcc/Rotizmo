using System.Collections.Generic;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public  class OutstandingFundsTransferRequest
    {
        public ICollection<long> OutstandingFundIds { get; set; }
    }
}
