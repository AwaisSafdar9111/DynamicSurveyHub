using System;
using System.Collections.Generic;

namespace SurveyApp.Domain.Entities
{
    public class Form
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public bool IsPublished { get; set; }

        // Navigation properties
        public ICollection<Section> Sections { get; set; } = new List<Section>();
        public ICollection<FormSubmission> Submissions { get; set; } = new List<FormSubmission>();
        public ICollection<FormAssignment> Assignments { get; set; } = new List<FormAssignment>();
    }
}
