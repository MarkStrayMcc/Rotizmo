using System.Text.Json.Serialization;

namespace Hero.Integration.Aspose;

internal sealed record ExtractorColumn
{
    private readonly string? _displayName;

    public ExtractorColumn(string columnName, ExtractorDataType dataType, int? columnIndex = null)
    {
        if (string.IsNullOrWhiteSpace(columnName))
            throw new ArgumentException("Column name cannot be null, empty or whitespace.", nameof(columnName));

        ColumnName = columnName;
        DataType = dataType;
        ColumnIndex = columnIndex;
    }

    public string ColumnName { get; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ExtractorDataType DataType { get; }

    public string DisplayName
    {
        get => _displayName ?? ColumnName.Trim();
        init => _displayName = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    public int? ColumnIndex { get; init; }

    public bool Equals(ExtractorColumn? other) => other is not null
        && ColumnName.Equals(other.ColumnName, StringComparison.OrdinalIgnoreCase)
        && DataType == other.DataType
        && ColumnIndex == other.ColumnIndex;

    public override int GetHashCode() => HashCode.Combine(ColumnName.ToUpperInvariant(), (int)DataType, ColumnIndex);
}
