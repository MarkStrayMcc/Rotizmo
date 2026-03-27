using Hero.Infrastructure;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class ClientNote : WebApiDto.Dto.ClientNote
    {
        public ClientNote() : this(new WebApiDto.Dto.ClientNote())
        {

        }

        public ClientNote(WebApiDto.Dto.ClientNote source)
        {
            this.Created = source.Created;
            this.ClientId = source.ClientId;
            this.ClientNoteId = source.ClientNoteId;
            this.AuthorName = source.AuthorName;
            this.AuthorInitials = source.AuthorInitials;
            this.ImageUrl = string.IsNullOrWhiteSpace(source.ImageUrl) ? "/img/staff/empty_profile.png" : source.ImageUrl;
            this.Note = source.Note;
            this.ParentClientNoteId = source.ParentClientNoteId;
        }

        public string FormattedCreatedDate
        {
            get
            {
                return string.Format(new DayEndingDateFormatter(), "{0}", Created);
            }
        }
    }
}
