using System;
using System.Collections.Generic;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.DTOs
{
    public class FormDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public bool IsPublished { get; set; }
        public List<SectionDto> Sections { get; set; } = new List<SectionDto>();
    }

    public class FormAssignmentDto
    {
        public int Id { get; set; }
        public int FormId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public DateTime AssignedDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string Status { get; set; }
        public string FormTitle { get; set; }
    }

    public class CreateFormAssignmentDto
    {
        public int FormId { get; set; }
        public string UserId { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class UserDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }
}
