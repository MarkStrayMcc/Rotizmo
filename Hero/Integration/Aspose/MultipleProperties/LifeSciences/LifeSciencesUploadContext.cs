using WebApiDto.Dto;

namespace Hero.Integration.Aspose.MultipleProperties.LifeSciences;

internal sealed class LifeSciencesUploadContext
{
    public PropertyLimitFloatingValues? FloatingValues { get; init; }
    public int? FirstLossLimit { get; init; }
    public bool HasFloatingValues { get; init; }
}
