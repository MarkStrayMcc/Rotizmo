using System.Collections.Immutable;
using System.Text.Json;
using Hero.Integration.Aspose.MultipleProperties;
using Microsoft.Extensions.FileProviders;

namespace Hero.Integration.Aspose;

internal sealed class ColumnConfigurations
{
    public IReadOnlyList<ExtractorColumn> CommonColumns { get; init; } = ImmutableList<ExtractorColumn>.Empty;

    public IReadOnlyList<ColumnConfiguration> WordingVersionColumnConfigurations { get; init; } = ImmutableList<ColumnConfiguration>.Empty;

    internal IReadOnlyDictionary<int, ExtractorColumnConfiguration> Flatten()
    {
        var flattenedConfigurations = new Dictionary<int, ExtractorColumnConfiguration>();

        foreach (ColumnConfiguration columnConfiguration in WordingVersionColumnConfigurations)
        {
            ImmutableList<ExtractorColumn> columns = CommonColumns
                .Concat(columnConfiguration.ExtractorColumnConfiguration.Columns)
                .ToImmutableList();

            var extractorColumnConfiguration = new ExtractorColumnConfiguration(
                columns,
                columnConfiguration.ExtractorColumnConfiguration.InitialRowIndex);

            foreach (int wordingVersion in columnConfiguration.WordingVersions)
                flattenedConfigurations[wordingVersion] = extractorColumnConfiguration;
        }

        return flattenedConfigurations.ToImmutableDictionary();
    }

    internal static IReadOnlyDictionary<int, ExtractorColumnConfiguration> LoadFromConfig(
        IConfiguration configuration,
        IWebHostEnvironment env)
    {
        var validationConfig = configuration
            .GetSection(TemplateValidationConfig.ConfigurationSectionName)
            .Get<TemplateValidationConfig>();

        IFileInfo fileInfo = env.ContentRootFileProvider.GetFileInfo(validationConfig.Filename);

        if (!fileInfo.Exists)
            throw new FileNotFoundException("Template validation configuration file not found", validationConfig.Filename);

        using Stream stream = fileInfo.CreateReadStream();
        var columnSettings = JsonSerializer.Deserialize<ColumnConfigurations>(
            stream,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        return columnSettings?.Flatten()
            ?? throw new InvalidOperationException($"{TemplateValidationConfig.ConfigurationSectionName} section is missing or invalid.");
    }
}
