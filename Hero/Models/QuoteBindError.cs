using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class QuoteBindError : WebApiDto.Dto.QuoteBindResponse.QuoteBindError
    {
    }
}
