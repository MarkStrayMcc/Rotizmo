namespace Hero.Integration.Aspose.MultipleProperties;

internal sealed record TemplateValidationConfig
{
    internal const string ConfigurationSectionName = "TemplateValidation";

    public string Filename { get; init; }
}
