using System.Collections.Immutable;

namespace Hero.Integration.Aspose;

internal sealed record ExtractorColumnConfiguration
{
    private readonly int _hashCode;

    public ExtractorColumnConfiguration(IReadOnlyList<ExtractorColumn> columns, int initialRowIndex)
    {
        ArgumentNullException.ThrowIfNull(columns);

        InitialRowIndex = initialRowIndex;
        Columns = columns.ToImmutableList();

        _hashCode = CalculateHashCode();
    }

    public IReadOnlyList<ExtractorColumn> Columns { get; }

    public int InitialRowIndex { get; }

    internal int HeaderRowIndex => InitialRowIndex - 1;

    public bool Equals(ExtractorColumnConfiguration? other) => other is not null
        && other.Columns.SequenceEqual(Columns)
        && InitialRowIndex == other.InitialRowIndex;

    public override int GetHashCode() => _hashCode;

    private int CalculateHashCode()
    {
        var hashCode = default(HashCode);
        foreach (ExtractorColumn column in Columns)
            hashCode.Add(column);

        hashCode.Add(InitialRowIndex);
        return hashCode.ToHashCode();
    }
}
