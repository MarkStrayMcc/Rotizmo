using System;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class BordereauClosedDateResponse
    {
        public DateTime? DateClosed { get; set; }
    }
}
