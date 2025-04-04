using System.Collections.Generic;
using System.Threading.Tasks;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Interfaces
{
    public interface ISubmissionRepository
    {
        Task<IEnumerable<FormSubmission>> GetAllSubmissionsAsync();
        Task<IEnumerable<FormSubmission>> GetSubmissionsByFormIdAsync(int formId);
        Task<FormSubmission> GetSubmissionByIdAsync(int id);
        Task<FormSubmission> CreateSubmissionAsync(FormSubmission submission);
        Task<FormSubmission> UpdateSubmissionAsync(FormSubmission submission);
        Task DeleteSubmissionAsync(int id);
        
        // Control Response operations
        Task<IEnumerable<ControlResponse>> GetResponsesBySubmissionIdAsync(int submissionId);
        Task<ControlResponse> CreateControlResponseAsync(ControlResponse response);
        Task<ControlResponse> UpdateControlResponseAsync(ControlResponse response);
        Task DeleteControlResponseAsync(int id);
    }
}
