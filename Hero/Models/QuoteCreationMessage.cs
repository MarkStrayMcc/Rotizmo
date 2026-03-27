using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class QuoteCreationMessage : WebApiDto.Dto.QuoteCreationMessage
    {
    }
}