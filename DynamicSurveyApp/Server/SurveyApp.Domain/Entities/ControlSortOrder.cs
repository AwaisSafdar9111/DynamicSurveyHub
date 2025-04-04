namespace SurveyApp.Domain.Entities
{
    public class ControlSortOrder
    {
        public int Id { get; set; }
        public int SectionId { get; set; }
        public int ControlId { get; set; }
        public int OrderIndex { get; set; }

        // Navigation properties
        public Section Section { get; set; }
        public Control Control { get; set; }
    }
}
