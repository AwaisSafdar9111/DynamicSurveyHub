using System.Collections.Generic;

namespace SurveyApp.Domain.Entities
{
    public enum ControlType
    {
        Text,
        Textarea,
        RadioGroup,
        CheckboxGroup,
        Dropdown,
        FileUpload,
        Signature,
        LocationPicker,
        Note
    }

    public class Control
    {
        public int Id { get; set; }
        public int SectionId { get; set; }
        public string Label { get; set; }
        public ControlType Type { get; set; }
        public bool IsRequired { get; set; }
        public int OrderIndex { get; set; }

        // Navigation properties
        public Section Section { get; set; }
        public ControlConfiguration Configuration { get; set; }
        public ICollection<ControlOption> Options { get; set; } = new List<ControlOption>();
        public ICollection<ControlCondition> Conditions { get; set; } = new List<ControlCondition>();
        public ICollection<ControlResponse> Responses { get; set; } = new List<ControlResponse>();
    }
}
