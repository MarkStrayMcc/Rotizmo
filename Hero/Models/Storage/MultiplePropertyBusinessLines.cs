using System.Collections.Generic;

namespace Hero.Models.Storage
{
    public class MultiplePropertyBusinessLines
    {
        public string BusinessLine { get; set; }
        public List<Product> Products { get; set; }
    }
}
