namespace SurveyApp.Domain.Entities
{
    public enum ConditionOperator
    {
        Equals,
        NotEquals,
        Contains,
        GreaterThan,
        LessThan
    }

    public enum ConditionAction
    {
        Show,
        Hide,
        Enable,
        Disable
    }

    public class ControlCondition
    {
        public int Id { get; set; }
        public int ControlId { get; set; }
        public int SourceControlId { get; set; }
        public ConditionOperator Operator { get; set; }
        public string Value { get; set; }
        public ConditionAction Action { get; set; }

        // Navigation properties
        public Control Control { get; set; }
        public Control SourceControl { get; set; }
    }
}
