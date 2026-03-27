using System;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class AddressChangeResult
    {
        public Guid MtaId { get; set; }
    }
}
