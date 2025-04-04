using System.Collections.Generic;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.DTOs
{
    public class ControlDto
    {
        public int Id { get; set; }
        public int SectionId { get; set; }
        public string Label { get; set; }
        public string Type { get; set; }
        public bool IsRequired { get; set; }
        public int OrderIndex { get; set; }
        public ControlConfigurationDto Configuration { get; set; }
        public List<ControlOptionDto> Options { get; set; } = new List<ControlOptionDto>();
        public List<ControlConditionDto> Conditions { get; set; } = new List<ControlConditionDto>();
    }

    public class ControlOptionDto
    {
        public int Id { get; set; }
        public int ControlId { get; set; }
        public string Value { get; set; }
        public string Text { get; set; }
        public double? Score { get; set; }
        public int OrderIndex { get; set; }
    }

    public class ControlConditionDto
    {
        public int Id { get; set; }
        public int ControlId { get; set; }
        public int SourceControlId { get; set; }
        public string Operator { get; set; }
        public string Value { get; set; }
        public string Action { get; set; }
    }

    public class ControlConfigurationDto
    {
        public int Id { get; set; }
        public int ControlId { get; set; }
        
        // Text Configuration
        public string InputType { get; set; }
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
        public bool? EnableCountryCode { get; set; }
        
        // Textarea Configuration
        public int? MaxLength { get; set; }
        
        // Radio/Checkbox/Dropdown Configuration
        public string SelectionType { get; set; }
        public bool? Searchable { get; set; }
        
        // File Upload Configuration
        public List<string> AcceptedFileTypes { get; set; }
        
        // Location Picker Configuration
        public bool? ShowMap { get; set; }
        
        // Note Configuration
        public string NoteText { get; set; }
        public string HtmlContent { get; set; }
    }

    public class ControlResponseDto
    {
        public int Id { get; set; }
        public int SubmissionId { get; set; }
        public int ControlId { get; set; }
        public string Value { get; set; }
        public List<string> OptionIds { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public List<string> FileUrls { get; set; }
        public string SignatureUrl { get; set; }
    }

    public class FormSubmissionDto
    {
        public int Id { get; set; }
        public int FormId { get; set; }
        public string SubmittedBy { get; set; }
        public System.DateTime SubmittedDate { get; set; }
        public List<ControlResponseDto> Responses { get; set; } = new List<ControlResponseDto>();
    }
}
