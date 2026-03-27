using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class CommissionRate
    {
        public decimal Rate { get; set; }
    }
}
