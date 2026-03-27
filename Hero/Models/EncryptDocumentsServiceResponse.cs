namespace Hero.Models
{
    public class EncryptDocumentsServiceResponse
    {
        public byte[] FileData { get; set; }
        public string Key { get; set; }
        public string FileName { get; set; }
    }
}
