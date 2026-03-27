namespace Hero.Models
{
    public class QuoteFileData
    {
        public string FileName { get; set; }

        public string Name
        {
            get => FileName;
            set => FileName = value;
        }

        public string Extension { get; set; }

        public string Data { get; set; }

        public string Type { get; set; }
    }
}
