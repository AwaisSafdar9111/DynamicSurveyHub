using System.Collections.Generic;
using System.Threading.Tasks;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Interfaces
{
    public interface IWorkflowRepository
    {
        Task<IEnumerable<FormAssignment>> GetAllAssignmentsAsync();
        Task<IEnumerable<FormAssignment>> GetAssignmentsByUserIdAsync(string userId);
        Task<IEnumerable<FormAssignment>> GetAssignmentsByFormIdAsync(int formId);
        Task<FormAssignment> GetAssignmentByIdAsync(int id);
        Task<FormAssignment> CreateAssignmentAsync(FormAssignment assignment);
        Task<FormAssignment> UpdateAssignmentAsync(FormAssignment assignment);
        Task<FormAssignment> CompleteAssignmentAsync(int id);
        Task DeleteAssignmentAsync(int id);
        
        // User operations
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(string id);
    }
}
