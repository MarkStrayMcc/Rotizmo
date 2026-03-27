using System.Collections.Generic;
using WebApiDto.Enum;

namespace Hero.Models
{
    public class EndorsementRequest 
    {
        public int DocumentId { get; set; }

        public int DocumentVersionId { get; set; }

        public int? WordDocumentTemplateId { get; set; }

        public bool IsDraft { get; set; }

        public FileFormat FileFormat { get; set; }

        public IDictionary<string, string> MergeFields { get; set; }

        public IDictionary<string, byte[]> ImageFields { get; set; }

        public IDictionary<string, string> BookmarksToReplace { get; set; }

    }
}