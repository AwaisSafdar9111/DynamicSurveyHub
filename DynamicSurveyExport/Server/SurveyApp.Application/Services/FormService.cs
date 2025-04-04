using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Services
{
    public class FormService
    {
        private readonly IFormRepository _formRepository;

        public FormService(IFormRepository formRepository)
        {
            _formRepository = formRepository;
        }

        public async Task<IEnumerable<FormDto>> GetAllFormsAsync()
        {
            var forms = await _formRepository.GetAllFormsAsync();
            return forms.Select(MapToFormDto);
        }

        public async Task<FormDto> GetFormByIdAsync(int id)
        {
            var form = await _formRepository.GetFormByIdAsync(id);
            if (form == null)
                return null;

            return MapToFormDto(form);
        }

        public async Task<FormDto> CreateFormAsync(FormDto formDto)
        {
            var form = MapToForm(formDto);
            var result = await _formRepository.CreateFormAsync(form);
            return MapToFormDto(result);
        }

        public async Task<FormDto> UpdateFormAsync(FormDto formDto)
        {
            var existingForm = await _formRepository.GetFormByIdAsync(formDto.Id);
            if (existingForm == null)
                return null;

            // Update basic properties
            existingForm.Title = formDto.Title;
            existingForm.Description = formDto.Description;
            existingForm.ModifiedDate = DateTime.UtcNow;

            // Update sections (create, update, delete)
            foreach (var sectionDto in formDto.Sections)
            {
                var existingSection = existingForm.Sections.FirstOrDefault(s => s.Id == sectionDto.Id);
                
                if (existingSection == null)
                {
                    // Create new section
                    var newSection = new Section
                    {
                        FormId = existingForm.Id,
                        Title = sectionDto.Title,
                        Description = sectionDto.Description,
                        OrderIndex = sectionDto.OrderIndex
                    };
                    
                    await _formRepository.CreateSectionAsync(newSection);
                    
                    // Add controls if any
                    foreach (var controlDto in sectionDto.Controls)
                    {
                        var newControl = MapToControl(controlDto);
                        newControl.SectionId = newSection.Id;
                        await _formRepository.CreateControlAsync(newControl);
                    }
                }
                else
                {
                    // Update existing section
                    existingSection.Title = sectionDto.Title;
                    existingSection.Description = sectionDto.Description;
                    existingSection.OrderIndex = sectionDto.OrderIndex;
                    
                    await _formRepository.UpdateSectionAsync(existingSection);
                    
                    // Update controls
                    foreach (var controlDto in sectionDto.Controls)
                    {
                        var existingControl = existingSection.Controls.FirstOrDefault(c => c.Id == controlDto.Id);
                        
                        if (existingControl == null)
                        {
                            // Create new control
                            var newControl = MapToControl(controlDto);
                            newControl.SectionId = existingSection.Id;
                            await _formRepository.CreateControlAsync(newControl);
                        }
                        else
                        {
                            // Update existing control
                            existingControl.Label = controlDto.Label;
                            existingControl.Type = Enum.Parse<ControlType>(controlDto.Type);
                            existingControl.IsRequired = controlDto.IsRequired;
                            existingControl.OrderIndex = controlDto.OrderIndex;
                            
                            // Update configuration
                            UpdateControlConfiguration(existingControl.Configuration, controlDto.Configuration);
                            
                            await _formRepository.UpdateControlAsync(existingControl);
                            
                            // Update options
                            await UpdateControlOptions(existingControl.Id, controlDto.Options);
                            
                            // Update conditions
                            await UpdateControlConditions(existingControl.Id, controlDto.Conditions);
                        }
                    }
                    
                    // Remove controls that are not in the updated form
                    var controlIdsToKeep = sectionDto.Controls.Select(c => c.Id).ToList();
                    var controlsToRemove = existingSection.Controls.Where(c => c.Id > 0 && !controlIdsToKeep.Contains(c.Id)).ToList();
                    
                    foreach (var controlToRemove in controlsToRemove)
                    {
                        await _formRepository.DeleteControlAsync(controlToRemove.Id);
                    }
                }
            }
            
            // Remove sections that are not in the updated form
            var sectionIdsToKeep = formDto.Sections.Select(s => s.Id).ToList();
            var sectionsToRemove = existingForm.Sections.Where(s => s.Id > 0 && !sectionIdsToKeep.Contains(s.Id)).ToList();
            
            foreach (var sectionToRemove in sectionsToRemove)
            {
                await _formRepository.DeleteSectionAsync(sectionToRemove.Id);
            }
            
            var updatedForm = await _formRepository.UpdateFormAsync(existingForm);
            return MapToFormDto(updatedForm);
        }

        public async Task DeleteFormAsync(int id)
        {
            await _formRepository.DeleteFormAsync(id);
        }

        public async Task<FormDto> PublishFormAsync(int id)
        {
            var form = await _formRepository.PublishFormAsync(id);
            return MapToFormDto(form);
        }

        // Control operations
        public async Task<ControlDto> GetControlByIdAsync(int id)
        {
            var control = await _formRepository.GetControlByIdAsync(id);
            if (control == null)
                return null;

            return MapToControlDto(control);
        }

        public async Task<IEnumerable<ControlDto>> GetControlsBySectionIdAsync(int sectionId)
        {
            var controls = await _formRepository.GetControlsBySectionIdAsync(sectionId);
            return controls.Select(MapToControlDto);
        }

        public async Task<ControlDto> CreateControlAsync(ControlDto controlDto)
        {
            var control = MapToControl(controlDto);
            var result = await _formRepository.CreateControlAsync(control);
            return MapToControlDto(result);
        }

        public async Task<ControlDto> UpdateControlAsync(ControlDto controlDto)
        {
            var control = MapToControl(controlDto);
            var result = await _formRepository.UpdateControlAsync(control);
            return MapToControlDto(result);
        }

        public async Task DeleteControlAsync(int id)
        {
            await _formRepository.DeleteControlAsync(id);
        }

        public async Task UpdateControlOrderAsync(int sectionId, List<int> controlIds)
        {
            await _formRepository.UpdateControlOrderAsync(sectionId, controlIds);
        }

        // Control Option operations
        public async Task<IEnumerable<ControlOptionDto>> GetControlOptionsAsync(int controlId)
        {
            var options = await _formRepository.GetControlOptionsAsync(controlId);
            return options.Select(MapToControlOptionDto);
        }

        public async Task<ControlOptionDto> CreateControlOptionAsync(ControlOptionDto optionDto)
        {
            var option = MapToControlOption(optionDto);
            var result = await _formRepository.CreateControlOptionAsync(option);
            return MapToControlOptionDto(result);
        }

        public async Task<ControlOptionDto> UpdateControlOptionAsync(ControlOptionDto optionDto)
        {
            var option = MapToControlOption(optionDto);
            var result = await _formRepository.UpdateControlOptionAsync(option);
            return MapToControlOptionDto(result);
        }

        public async Task DeleteControlOptionAsync(int id)
        {
            await _formRepository.DeleteControlOptionAsync(id);
        }

        // Control Condition operations
        public async Task<IEnumerable<ControlConditionDto>> GetControlConditionsAsync(int controlId)
        {
            var conditions = await _formRepository.GetControlConditionsAsync(controlId);
            return conditions.Select(MapToControlConditionDto);
        }

        public async Task<ControlConditionDto> CreateControlConditionAsync(ControlConditionDto conditionDto)
        {
            var condition = MapToControlCondition(conditionDto);
            var result = await _formRepository.CreateControlConditionAsync(condition);
            return MapToControlConditionDto(result);
        }

        public async Task<ControlConditionDto> UpdateControlConditionAsync(ControlConditionDto conditionDto)
        {
            var condition = MapToControlCondition(conditionDto);
            var result = await _formRepository.UpdateControlConditionAsync(condition);
            return MapToControlConditionDto(result);
        }

        public async Task DeleteControlConditionAsync(int id)
        {
            await _formRepository.DeleteControlConditionAsync(id);
        }

        // Helper methods
        private async Task UpdateControlOptions(int controlId, List<ControlOptionDto> optionDtos)
        {
            var existingOptions = await _formRepository.GetControlOptionsAsync(controlId);
            
            foreach (var optionDto in optionDtos)
            {
                var existingOption = existingOptions.FirstOrDefault(o => o.Id == optionDto.Id);
                
                if (existingOption == null)
                {
                    // Create new option
                    var newOption = MapToControlOption(optionDto);
                    newOption.ControlId = controlId;
                    await _formRepository.CreateControlOptionAsync(newOption);
                }
                else
                {
                    // Update existing option
                    existingOption.Value = optionDto.Value;
                    existingOption.Text = optionDto.Text;
                    existingOption.Score = optionDto.Score;
                    existingOption.OrderIndex = optionDto.OrderIndex;
                    
                    await _formRepository.UpdateControlOptionAsync(existingOption);
                }
            }
            
            // Remove options that are not in the updated control
            var optionIdsToKeep = optionDtos.Select(o => o.Id).ToList();
            var optionsToRemove = existingOptions.Where(o => o.Id > 0 && !optionIdsToKeep.Contains(o.Id)).ToList();
            
            foreach (var optionToRemove in optionsToRemove)
            {
                await _formRepository.DeleteControlOptionAsync(optionToRemove.Id);
            }
        }

        private async Task UpdateControlConditions(int controlId, List<ControlConditionDto> conditionDtos)
        {
            var existingConditions = await _formRepository.GetControlConditionsAsync(controlId);
            
            foreach (var conditionDto in conditionDtos)
            {
                var existingCondition = existingConditions.FirstOrDefault(c => c.Id == conditionDto.Id);
                
                if (existingCondition == null)
                {
                    // Create new condition
                    var newCondition = MapToControlCondition(conditionDto);
                    newCondition.ControlId = controlId;
                    await _formRepository.CreateControlConditionAsync(newCondition);
                }
                else
                {
                    // Update existing condition
                    existingCondition.SourceControlId = conditionDto.SourceControlId;
                    existingCondition.Operator = Enum.Parse<ConditionOperator>(conditionDto.Operator);
                    existingCondition.Value = conditionDto.Value;
                    existingCondition.Action = Enum.Parse<ConditionAction>(conditionDto.Action);
                    
                    await _formRepository.UpdateControlConditionAsync(existingCondition);
                }
            }
            
            // Remove conditions that are not in the updated control
            var conditionIdsToKeep = conditionDtos.Select(c => c.Id).ToList();
            var conditionsToRemove = existingConditions.Where(c => c.Id > 0 && !conditionIdsToKeep.Contains(c.Id)).ToList();
            
            foreach (var conditionToRemove in conditionsToRemove)
            {
                await _formRepository.DeleteControlConditionAsync(conditionToRemove.Id);
            }
        }

        private void UpdateControlConfiguration(ControlConfiguration config, ControlConfigurationDto configDto)
        {
            if (config == null || configDto == null) return;
            
            // Update common properties
            config.Id = configDto.Id;
            
            // Update type-specific properties based on control type
            config.InputType = configDto.InputType != null ? Enum.Parse<InputType>(configDto.InputType) : null;
            config.MinValue = configDto.MinValue;
            config.MaxValue = configDto.MaxValue;
            config.EnableCountryCode = configDto.EnableCountryCode;
            config.MaxLength = configDto.MaxLength;
            config.SelectionType = configDto.SelectionType != null ? Enum.Parse<SelectionType>(configDto.SelectionType) : null;
            config.Searchable = configDto.Searchable;
            
            // Handle accepted file types (convert List<string> to comma-separated string)
            config.AcceptedFileTypes = configDto.AcceptedFileTypes != null 
                ? string.Join(",", configDto.AcceptedFileTypes) 
                : null;
            
            config.ShowMap = configDto.ShowMap;
            config.NoteText = configDto.NoteText;
            config.HtmlContent = configDto.HtmlContent;
        }

        // Mapping methods
        private FormDto MapToFormDto(Form form)
        {
            if (form == null) return null;

            return new FormDto
            {
                Id = form.Id,
                Title = form.Title,
                Description = form.Description,
                CreatedBy = form.CreatedBy,
                CreatedDate = form.CreatedDate,
                ModifiedDate = form.ModifiedDate,
                IsPublished = form.IsPublished,
                Sections = form.Sections?.Select(MapToSectionDto).ToList() ?? new List<SectionDto>()
            };
        }

        private SectionDto MapToSectionDto(Section section)
        {
            if (section == null) return null;

            return new SectionDto
            {
                Id = section.Id,
                FormId = section.FormId,
                Title = section.Title,
                Description = section.Description,
                OrderIndex = section.OrderIndex,
                Controls = section.Controls?.Select(MapToControlDto).ToList() ?? new List<ControlDto>()
            };
        }

        private ControlDto MapToControlDto(Control control)
        {
            if (control == null) return null;

            return new ControlDto
            {
                Id = control.Id,
                SectionId = control.SectionId,
                Label = control.Label,
                Type = control.Type.ToString(),
                IsRequired = control.IsRequired,
                OrderIndex = control.OrderIndex,
                Configuration = MapToControlConfigurationDto(control.Configuration),
                Options = control.Options?.Select(MapToControlOptionDto).ToList() ?? new List<ControlOptionDto>(),
                Conditions = control.Conditions?.Select(MapToControlConditionDto).ToList() ?? new List<ControlConditionDto>()
            };
        }

        private ControlConfigurationDto MapToControlConfigurationDto(ControlConfiguration config)
        {
            if (config == null) return new ControlConfigurationDto();

            return new ControlConfigurationDto
            {
                Id = config.Id,
                ControlId = config.ControlId,
                InputType = config.InputType?.ToString(),
                MinValue = config.MinValue,
                MaxValue = config.MaxValue,
                EnableCountryCode = config.EnableCountryCode,
                MaxLength = config.MaxLength,
                SelectionType = config.SelectionType?.ToString(),
                Searchable = config.Searchable,
                AcceptedFileTypes = config.AcceptedFileTypes?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                ShowMap = config.ShowMap,
                NoteText = config.NoteText,
                HtmlContent = config.HtmlContent
            };
        }

        private ControlOptionDto MapToControlOptionDto(ControlOption option)
        {
            if (option == null) return null;

            return new ControlOptionDto
            {
                Id = option.Id,
                ControlId = option.ControlId,
                Value = option.Value,
                Text = option.Text,
                Score = option.Score,
                OrderIndex = option.OrderIndex
            };
        }

        private ControlConditionDto MapToControlConditionDto(ControlCondition condition)
        {
            if (condition == null) return null;

            return new ControlConditionDto
            {
                Id = condition.Id,
                ControlId = condition.ControlId,
                SourceControlId = condition.SourceControlId,
                Operator = condition.Operator.ToString(),
                Value = condition.Value,
                Action = condition.Action.ToString()
            };
        }

        private Form MapToForm(FormDto formDto)
        {
            if (formDto == null) return null;

            return new Form
            {
                Id = formDto.Id,
                Title = formDto.Title,
                Description = formDto.Description,
                CreatedBy = formDto.CreatedBy,
                CreatedDate = formDto.CreatedDate,
                ModifiedDate = formDto.ModifiedDate,
                IsPublished = formDto.IsPublished,
                Sections = formDto.Sections?.Select(MapToSection).ToList() ?? new List<Section>()
            };
        }

        private Section MapToSection(SectionDto sectionDto)
        {
            if (sectionDto == null) return null;

            return new Section
            {
                Id = sectionDto.Id,
                FormId = sectionDto.FormId,
                Title = sectionDto.Title,
                Description = sectionDto.Description,
                OrderIndex = sectionDto.OrderIndex,
                Controls = sectionDto.Controls?.Select(MapToControl).ToList() ?? new List<Control>()
            };
        }

        private Control MapToControl(ControlDto controlDto)
        {
            if (controlDto == null) return null;

            return new Control
            {
                Id = controlDto.Id,
                SectionId = controlDto.SectionId,
                Label = controlDto.Label,
                Type = Enum.Parse<ControlType>(controlDto.Type),
                IsRequired = controlDto.IsRequired,
                OrderIndex = controlDto.OrderIndex,
                Configuration = MapToControlConfiguration(controlDto.Configuration),
                Options = controlDto.Options?.Select(MapToControlOption).ToList() ?? new List<ControlOption>(),
                Conditions = controlDto.Conditions?.Select(MapToControlCondition).ToList() ?? new List<ControlCondition>()
            };
        }

        private ControlConfiguration MapToControlConfiguration(ControlConfigurationDto configDto)
        {
            if (configDto == null) return new ControlConfiguration();

            return new ControlConfiguration
            {
                Id = configDto.Id,
                ControlId = configDto.ControlId,
                InputType = configDto.InputType != null ? Enum.Parse<InputType>(configDto.InputType) : null,
                MinValue = configDto.MinValue,
                MaxValue = configDto.MaxValue,
                EnableCountryCode = configDto.EnableCountryCode,
                MaxLength = configDto.MaxLength,
                SelectionType = configDto.SelectionType != null ? Enum.Parse<SelectionType>(configDto.SelectionType) : null,
                Searchable = configDto.Searchable,
                AcceptedFileTypes = configDto.AcceptedFileTypes != null ? string.Join(",", configDto.AcceptedFileTypes) : null,
                ShowMap = configDto.ShowMap,
                NoteText = configDto.NoteText,
                HtmlContent = configDto.HtmlContent
            };
        }

        private ControlOption MapToControlOption(ControlOptionDto optionDto)
        {
            if (optionDto == null) return null;

            return new ControlOption
            {
                Id = optionDto.Id,
                ControlId = optionDto.ControlId,
                Value = optionDto.Value,
                Text = optionDto.Text,
                Score = optionDto.Score,
                OrderIndex = optionDto.OrderIndex
            };
        }

        private ControlCondition MapToControlCondition(ControlConditionDto conditionDto)
        {
            if (conditionDto == null) return null;

            return new ControlCondition
            {
                Id = conditionDto.Id,
                ControlId = conditionDto.ControlId,
                SourceControlId = conditionDto.SourceControlId,
                Operator = Enum.Parse<ConditionOperator>(conditionDto.Operator),
                Value = conditionDto.Value,
                Action = Enum.Parse<ConditionAction>(conditionDto.Action)
            };
        }
    }
}
