using System;
using System.Collections.Generic;

namespace Hero.Models.SubjectivityConfiguration;

public class SearchSubjectivitiesResult
{
    public Guid Id { get; set; }
    public ICollection<SubjectivityText> Texts { get; set; }
    public string Type { get; set; }
    public bool IsAutoAttaching { get; set; }
    public int DaysToResolve { get; set; }
}