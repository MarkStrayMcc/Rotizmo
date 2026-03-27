using System.Collections.Generic;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class OutstandingFundsResponse
    {
        public ICollection<OutstandingFund> OutstandingFunds { get; set; }
    }
}
