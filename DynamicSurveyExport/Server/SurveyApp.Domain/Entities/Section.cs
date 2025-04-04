using System.Collections.Generic;

namespace SurveyApp.Domain.Entities
{
    public class Section
    {
        public int Id { get; set; }
        public int FormId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int OrderIndex { get; set; }

        // Navigation properties
        public Form Form { get; set; }
        public ICollection<Control> Controls { get; set; } = new List<Control>();
    }
}
