using WebApiDto.Dto;

namespace Hero.Infrastructure
{
    public interface ICanBeDropDownData
    {
        DropDownData ToDropDownData();
    }
}
