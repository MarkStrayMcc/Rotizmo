using System;
using System.Collections.Generic;

namespace Hero.Models
{
    public class EncryptDocumentRequest
    {
        public string ProductName { get; set; }
        public string CountryIsoCode { get; set; }
        public int BrokerId { get; set; }
        public string PolicyNumber { get; set; }
        public Guid ClientUid { get; set; }
        public List<FileData> PolicyDocuments { get; set; } = new List<FileData>();
    }
}
