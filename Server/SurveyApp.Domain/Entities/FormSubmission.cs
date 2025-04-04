using System;
using System.Collections.Generic;

namespace SurveyApp.Domain.Entities
{
    public class FormSubmission
    {
        public int Id { get; set; }
        public int FormId { get; set; }
        public string SubmittedBy { get; set; }
        public DateTime SubmittedDate { get; set; }
        
        // Navigation properties
        public Form Form { get; set; }
        public ICollection<ControlResponse> Responses { get; set; } = new List<ControlResponse>();
    }
}
