using System.Collections.Immutable;

namespace Hero.Integration.Aspose;

internal sealed class ColumnConfiguration
{
    public IReadOnlyList<int> WordingVersions { get; init; } = ImmutableList<int>.Empty;

    public ExtractorColumnConfiguration ExtractorColumnConfiguration { get; init; }
}
