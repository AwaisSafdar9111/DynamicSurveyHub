namespace SurveyApp.Domain.Entities
{
    public class ControlOption
    {
        public int Id { get; set; }
        public int ControlId { get; set; }
        public string Value { get; set; }
        public string Text { get; set; }
        public double? Score { get; set; }
        public int OrderIndex { get; set; }

        // Navigation property
        public Control Control { get; set; }
    }
}
