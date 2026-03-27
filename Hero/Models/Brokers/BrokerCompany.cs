namespace Hero.Models.Brokers
{
    public class BrokerCompany
    {
        public string Name { get; set; }

        public int Id { get; set; }

        public string City { get; set; }

        public Country Country { get; set; }
    }
}
