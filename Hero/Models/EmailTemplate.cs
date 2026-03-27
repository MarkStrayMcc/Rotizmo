using System.Collections.Generic;

namespace Hero.Models
{
    public class EmailTemplate
    {
        public int EmailTemplateId { get; set; }

        public string Name { get; set; }

        public string Subject { get; set; }

        public string Template { get; set; }

        public string PlainTextTemplate { get; set; }

        public EmailType EmailType { get; set; }

        public List<ServerSideFileData> DefaultAttachments { get; set; }
    }
}
