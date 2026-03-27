using System.Collections;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

namespace Hero.Infrastructure
{
    public static class Extensions
    {
        public static StringContent AsJson(this object o) => new StringContent(JsonConvert.SerializeObject(o), Encoding.UTF8, "application/json");
        public static IDictionary ParseSeparatedUri(this string uri)
        {
            var items = uri.Split(";");
            var parsedValues = new Dictionary<string, string>();
            if (items == null || items.Length <= 1)
            {
                return new Dictionary<string, string>();
            }

            foreach(var item in items)
            {
                var splitValPairs = item.Split("=");
                if (splitValPairs.Length > 1)
                {
                    parsedValues.Add(splitValPairs[0], splitValPairs[1]);
                }
            }

            return parsedValues;
        }
    }
}
