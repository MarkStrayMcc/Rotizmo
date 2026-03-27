using System.Collections.Generic;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class OutstandingFundsTransferResponse
    {
        public ICollection<long> Successes { get; set; }
    }
}
