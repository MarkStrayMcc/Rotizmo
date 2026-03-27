using Azure.Data.Tables;
using System;
using Azure;

namespace Hero.Models.Storage
{
    public class MultiplePropertyBusinessLinesEntity : ITableEntity
    {
        public string Products { get; set; }
        public string PartitionKey { get; set; }
        public string RowKey { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; } = ETag.All;
    }
}
