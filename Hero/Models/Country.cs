using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class Country: WebApiDto.Dto.Country
    {
    }
}
