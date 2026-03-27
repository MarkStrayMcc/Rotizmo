using System;
using System.Collections.Generic;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class FinancialTransactionsResult 
    {
        public Decimal SumBankAccountAmount { get; set; }
        public List<FinancialTransactionDetail> FinancialTransactionDetails { get; set; }
    }
}
