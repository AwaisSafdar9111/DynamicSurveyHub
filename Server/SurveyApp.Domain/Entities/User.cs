using System.Collections.Generic;

namespace SurveyApp.Domain.Entities
{
    public class User
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        
        // Navigation property
        public ICollection<FormAssignment> Assignments { get; set; } = new List<FormAssignment>();
    }
}
