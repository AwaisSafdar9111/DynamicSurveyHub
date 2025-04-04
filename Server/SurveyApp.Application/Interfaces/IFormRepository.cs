using System.Collections.Generic;
using System.Threading.Tasks;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Interfaces
{
    public interface IFormRepository
    {
        Task<IEnumerable<Form>> GetAllFormsAsync();
        Task<Form> GetFormByIdAsync(int id);
        Task<Form> CreateFormAsync(Form form);
        Task<Form> UpdateFormAsync(Form form);
        Task DeleteFormAsync(int id);
        Task<Form> PublishFormAsync(int id);
        
        // Section operations
        Task<Section> CreateSectionAsync(Section section);
        Task<Section> UpdateSectionAsync(Section section);
        Task DeleteSectionAsync(int id);
        
        // Control operations
        Task<Control> GetControlByIdAsync(int id);
        Task<IEnumerable<Control>> GetControlsBySectionIdAsync(int sectionId);
        Task<Control> CreateControlAsync(Control control);
        Task<Control> UpdateControlAsync(Control control);
        Task DeleteControlAsync(int id);
        Task UpdateControlOrderAsync(int sectionId, List<int> controlIds);
        
        // Control Option operations
        Task<IEnumerable<ControlOption>> GetControlOptionsAsync(int controlId);
        Task<ControlOption> CreateControlOptionAsync(ControlOption option);
        Task<ControlOption> UpdateControlOptionAsync(ControlOption option);
        Task DeleteControlOptionAsync(int id);
        
        // Control Condition operations
        Task<IEnumerable<ControlCondition>> GetControlConditionsAsync(int controlId);
        Task<ControlCondition> CreateControlConditionAsync(ControlCondition condition);
        Task<ControlCondition> UpdateControlConditionAsync(ControlCondition condition);
        Task DeleteControlConditionAsync(int id);
    }
}
