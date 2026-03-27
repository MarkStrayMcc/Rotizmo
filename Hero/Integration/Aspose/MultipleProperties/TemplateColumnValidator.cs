using System.Collections.Immutable;
using Aspose.Cells;

namespace Hero.Integration.Aspose.MultipleProperties;

internal sealed partial class TemplateColumnValidator : ITemplateColumnValidator
{
    internal const string TemplateMismatch = "Template mismatch";

    private readonly ILogger<TemplateColumnValidator> _logger;

    public TemplateColumnValidator(ILogger<TemplateColumnValidator> logger) => _logger = logger;

    public (bool isValid, string error) Validate(Worksheet worksheet, ExtractorColumnConfiguration expectedConfig)
    {
        if (expectedConfig.HeaderRowIndex < 0)
            return (false, "Invalid configuration: header row index cannot be determined");

        IReadOnlyList<TemplateHeader> expectedColumns = expectedConfig.Columns
            .Select((column, index) => new TemplateHeader(column.DisplayName, column.ColumnIndex ?? index))
            .OrderBy(h => h.Index)
            .ToImmutableList();

        return Validate(worksheet, expectedConfig.HeaderRowIndex, expectedColumns);
    }

    private static IReadOnlyList<TemplateHeader> ReadHeaders(
        Worksheet worksheet,
        int headerRowIndex)
    {
        int maxHeaderColumnIndex = worksheet.Cells.MaxDataColumn;
        if (maxHeaderColumnIndex < 0)
            return ImmutableList<TemplateHeader>.Empty;

        var headers = new List<TemplateHeader>();

        for (int columnIndex = 0; columnIndex <= maxHeaderColumnIndex; columnIndex++)
        {
            Cell? cell = worksheet.Cells[headerRowIndex, columnIndex];
            TemplateHeader header = TemplateHeader.Normalized(cell.GetStringValue(CellValueFormatStrategy.None), columnIndex);

            headers.Add(header);
        }

        return headers.ToImmutableList();
    }

    private static string BuildErrorMessage(
        IReadOnlyCollection<TemplateHeader> expectedHeaders,
        IReadOnlyCollection<TemplateHeader> actualHeaders)
    {
        return $"Actual columns do not match expected columns; Expected: {ColumnText(expectedHeaders)}; Actual: {ColumnText(actualHeaders)}";

        static string ColumnText(IEnumerable<TemplateHeader> columns) =>
            string.Join(", ", columns.Select(h => $"\"{h.Text}\""));
    }

    private (bool isValid, string error) Validate(
        Worksheet worksheet,
        int headerRowIndex,
        IReadOnlyCollection<TemplateHeader> expectedColumns)
    {
        IReadOnlyList<TemplateHeader> actualHeaders = ReadHeaders(worksheet, headerRowIndex);

        if (expectedColumns.SequenceEqual(actualHeaders))
            return (true, string.Empty);

        LogTemplateMismatch(_logger, BuildErrorMessage(expectedColumns, actualHeaders));
        return (false, TemplateMismatch);
    }

    private sealed record TemplateHeader
    {
        internal TemplateHeader(string text, int index) => (Text, Index) = (text, index);

        public string Text { get; }

        public int Index { get; }

        public bool Equals(TemplateHeader? other)
        {
            if (other is null)
                return false;

            if (ReferenceEquals(this, other))
                return true;

            return IsTextEqual(other) && Index == other.Index;
        }

        public override int GetHashCode() => HashCode.Combine(Text.GetHashCode(StringComparison.OrdinalIgnoreCase), Index);

        internal static TemplateHeader Normalized(string? headerValue, int index)
        {
            string name = string.IsNullOrWhiteSpace(headerValue)
                ? string.Empty
                : headerValue.Replace("*", string.Empty, StringComparison.Ordinal).Trim();

            return new TemplateHeader(name, index);
        }

        private bool IsTextEqual(TemplateHeader? other) => Text.Equals(other?.Text, StringComparison.OrdinalIgnoreCase);
    }

    [LoggerMessage(0, LogLevel.Error, "Template mismatch; {Errors}")]
    static partial void LogTemplateMismatch(ILogger logger, string errors);
}
