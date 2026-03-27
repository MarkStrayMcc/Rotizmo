using System.Collections.Generic;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class FeeResponse
    {
        public List<BusinessLineFee> BusinessLineFees { get; set; }
        public decimal TotalFee { get; set; }
        public string CurrencyIsoCode { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class BusinessLineFee
    {
        public string BusinessLineCode { get; set; }
        public decimal Fee { get; set; }
    }
}
