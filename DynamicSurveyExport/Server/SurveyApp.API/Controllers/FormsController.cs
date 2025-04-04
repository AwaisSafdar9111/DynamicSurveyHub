using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;

namespace SurveyApp.API.Controllers
{
    [ApiController]
    [Route("api/forms")]
    public class FormsController : ControllerBase
    {
        private readonly FormService _formService;

        public FormsController(FormService formService)
        {
            _formService = formService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FormDto>>> GetForms()
        {
            try
            {
                var forms = await _formService.GetAllFormsAsync();
                return Ok(forms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FormDto>> GetForm(int id)
        {
            try
            {
                var form = await _formService.GetFormByIdAsync(id);
                if (form == null)
                {
                    return NotFound($"Form with id {id} not found.");
                }
                
                return Ok(form);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<FormDto>> CreateForm(FormDto formDto)
        {
            try
            {
                // Set default values for new form
                formDto.Id = 0;
                formDto.CreatedDate = DateTime.UtcNow;
                formDto.ModifiedDate = DateTime.UtcNow;
                formDto.IsPublished = false;
                formDto.CreatedBy = "current-user"; // In a real app, get from auth service
                
                var createdForm = await _formService.CreateFormAsync(formDto);
                return CreatedAtAction(nameof(GetForm), new { id = createdForm.Id }, createdForm);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<FormDto>> UpdateForm(int id, FormDto formDto)
        {
            try
            {
                if (id != formDto.Id)
                {
                    return BadRequest("Id in route does not match id in form.");
                }
                
                var updatedForm = await _formService.UpdateFormAsync(formDto);
                if (updatedForm == null)
                {
                    return NotFound($"Form with id {id} not found.");
                }
                
                return Ok(updatedForm);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteForm(int id)
        {
            try
            {
                await _formService.DeleteFormAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/publish")]
        public async Task<ActionResult<FormDto>> PublishForm(int id)
        {
            try
            {
                var form = await _formService.PublishFormAsync(id);
                if (form == null)
                {
                    return NotFound($"Form with id {id} not found.");
                }
                
                return Ok(form);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Control operations
        [HttpGet("controls/{id}")]
        public async Task<ActionResult<ControlDto>> GetControl(int id)
        {
            try
            {
                var control = await _formService.GetControlByIdAsync(id);
                if (control == null)
                {
                    return NotFound($"Control with id {id} not found.");
                }
                
                return Ok(control);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("sections/{sectionId}/controls")]
        public async Task<ActionResult<IEnumerable<ControlDto>>> GetControlsBySection(int sectionId)
        {
            try
            {
                var controls = await _formService.GetControlsBySectionIdAsync(sectionId);
                return Ok(controls);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("sections/{sectionId}/controls")]
        public async Task<ActionResult<ControlDto>> CreateControl(int sectionId, ControlDto controlDto)
        {
            try
            {
                if (sectionId != controlDto.SectionId)
                {
                    return BadRequest("SectionId in route does not match sectionId in control.");
                }
                
                var createdControl = await _formService.CreateControlAsync(controlDto);
                return CreatedAtAction(nameof(GetControl), new { id = createdControl.Id }, createdControl);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("controls/{id}")]
        public async Task<ActionResult<ControlDto>> UpdateControl(int id, ControlDto controlDto)
        {
            try
            {
                if (id != controlDto.Id)
                {
                    return BadRequest("Id in route does not match id in control.");
                }
                
                var updatedControl = await _formService.UpdateControlAsync(controlDto);
                return Ok(updatedControl);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("controls/{id}")]
        public async Task<ActionResult> DeleteControl(int id)
        {
            try
            {
                await _formService.DeleteControlAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("sections/{sectionId}/controls/order")]
        public async Task<ActionResult> UpdateControlOrder(int sectionId, [FromBody] List<int> controlIds)
        {
            try
            {
                await _formService.UpdateControlOrderAsync(sectionId, controlIds);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Control Options operations
        [HttpGet("controls/{controlId}/options")]
        public async Task<ActionResult<IEnumerable<ControlOptionDto>>> GetControlOptions(int controlId)
        {
            try
            {
                var options = await _formService.GetControlOptionsAsync(controlId);
                return Ok(options);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("controls/{controlId}/options")]
        public async Task<ActionResult<ControlOptionDto>> CreateControlOption(int controlId, ControlOptionDto optionDto)
        {
            try
            {
                if (controlId != optionDto.ControlId)
                {
                    return BadRequest("ControlId in route does not match controlId in option.");
                }
                
                var createdOption = await _formService.CreateControlOptionAsync(optionDto);
                return CreatedAtAction(nameof(GetControlOptions), new { controlId = createdOption.ControlId }, createdOption);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("controloptions/{id}")]
        public async Task<ActionResult<ControlOptionDto>> UpdateControlOption(int id, ControlOptionDto optionDto)
        {
            try
            {
                if (id != optionDto.Id)
                {
                    return BadRequest("Id in route does not match id in option.");
                }
                
                var updatedOption = await _formService.UpdateControlOptionAsync(optionDto);
                return Ok(updatedOption);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("controloptions/{id}")]
        public async Task<ActionResult> DeleteControlOption(int id)
        {
            try
            {
                await _formService.DeleteControlOptionAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Control Conditions operations
        [HttpGet("controls/{controlId}/conditions")]
        public async Task<ActionResult<IEnumerable<ControlConditionDto>>> GetControlConditions(int controlId)
        {
            try
            {
                var conditions = await _formService.GetControlConditionsAsync(controlId);
                return Ok(conditions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("controls/{controlId}/conditions")]
        public async Task<ActionResult<ControlConditionDto>> CreateControlCondition(int controlId, ControlConditionDto conditionDto)
        {
            try
            {
                if (controlId != conditionDto.ControlId)
                {
                    return BadRequest("ControlId in route does not match controlId in condition.");
                }
                
                var createdCondition = await _formService.CreateControlConditionAsync(conditionDto);
                return CreatedAtAction(nameof(GetControlConditions), new { controlId = createdCondition.ControlId }, createdCondition);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("controlconditions/{id}")]
        public async Task<ActionResult<ControlConditionDto>> UpdateControlCondition(int id, ControlConditionDto conditionDto)
        {
            try
            {
                if (id != conditionDto.Id)
                {
                    return BadRequest("Id in route does not match id in condition.");
                }
                
                var updatedCondition = await _formService.UpdateControlConditionAsync(conditionDto);
                return Ok(updatedCondition);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("controlconditions/{id}")]
        public async Task<ActionResult> DeleteControlCondition(int id)
        {
            try
            {
                await _formService.DeleteControlConditionAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
