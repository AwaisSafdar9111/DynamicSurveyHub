using System.Collections.Generic;

namespace SurveyApp.Application.DTOs
{
    public class SectionDto
    {
        public int Id { get; set; }
        public int FormId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int OrderIndex { get; set; }
        public List<ControlDto> Controls { get; set; } = new List<ControlDto>();
    }
}
