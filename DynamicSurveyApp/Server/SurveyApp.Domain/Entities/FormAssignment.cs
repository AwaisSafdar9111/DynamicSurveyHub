using System;

namespace SurveyApp.Domain.Entities
{
    public enum AssignmentStatus
    {
        Assigned,
        InProgress,
        Completed
    }

    public class FormAssignment
    {
        public int Id { get; set; }
        public int FormId { get; set; }
        public string UserId { get; set; }
        public DateTime AssignedDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public AssignmentStatus Status { get; set; }

        // Navigation properties
        public Form Form { get; set; }
        public User User { get; set; }
    }
}
