using System.Collections.Generic;

namespace Hero.Models
{
    public class Email
    {
        public List<EmailContact> To { get; set; }
        public List<EmailContact> Cc { get; set; }
        public List<EmailContact> Bcc { get; set; }
        public string Subject { get; set; }
        public string EmailBody { get; set; }
        public EmailContact Sender { get; set; }
        public Dictionary<string, string> MergeFields { get; set; }
        public ICollection<FileData> DataAttachments { get; set; }
        public ICollection<ServerSideFileData> ServerSideAttachments { get; set; }
        public EmailType EmailType { get; set; }
        public bool IsSent { get; set; }
    }
}