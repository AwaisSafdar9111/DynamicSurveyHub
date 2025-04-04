using System.Collections.Generic;

namespace SurveyApp.Domain.Entities
{
    public enum InputType
    {
        Text,
        Number,
        Email,
        Phone
    }

    public enum SelectionType
    {
        Single,
        Multiple
    }

    public class ControlConfiguration
    {
        public int Id { get; set; }
        public int ControlId { get; set; }
        
        // Text Configuration
        public InputType? InputType { get; set; }
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
        public bool? EnableCountryCode { get; set; }
        
        // Textarea Configuration
        public int? MaxLength { get; set; }
        
        // Radio/Checkbox/Dropdown Configuration
        public SelectionType? SelectionType { get; set; }
        public bool? Searchable { get; set; }
        
        // File Upload Configuration
        public string AcceptedFileTypes { get; set; }
        
        // Location Picker Configuration
        public bool? ShowMap { get; set; }
        
        // Note Configuration
        public string NoteText { get; set; }
        public string HtmlContent { get; set; }

        // Navigation property
        public Control Control { get; set; }
    }
}
