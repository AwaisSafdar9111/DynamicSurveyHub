namespace SurveyApp.Domain.Entities
{
    public class ControlResponse
    {
        public int Id { get; set; }
        public int SubmissionId { get; set; }
        public int ControlId { get; set; }
        public string Value { get; set; }
        public string OptionIds { get; set; } // Stored as comma-separated values
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string FileUrls { get; set; } // Stored as comma-separated values
        public string SignatureUrl { get; set; }

        // Navigation properties
        public FormSubmission Submission { get; set; }
        public Control Control { get; set; }
    }
}
