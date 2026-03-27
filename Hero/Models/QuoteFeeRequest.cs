using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class QuoteFeeRequest: WebApiDto.Dto.Connect.QuoteFeeRequest
    {
    }
}
