using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;

namespace SurveyApp.API.Controllers
{
    [ApiController]
    [Route("api/workflow")]
    public class WorkflowController : ControllerBase
    {
        private readonly WorkflowService _workflowService;

        public WorkflowController(WorkflowService workflowService)
        {
            _workflowService = workflowService;
        }

        [HttpGet("assignments")]
        public async Task<ActionResult<IEnumerable<FormAssignmentDto>>> GetAssignments([FromQuery] string userId, [FromQuery] int? formId)
        {
            try
            {
                if (!string.IsNullOrEmpty(userId))
                {
                    var assignments = await _workflowService.GetAssignmentsByUserIdAsync(userId);
                    return Ok(assignments);
                }
                else if (formId.HasValue)
                {
                    var assignments = await _workflowService.GetAssignmentsByFormIdAsync(formId.Value);
                    return Ok(assignments);
                }
                else
                {
                    var assignments = await _workflowService.GetAllAssignmentsAsync();
                    return Ok(assignments);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("assignments/{id}")]
        public async Task<ActionResult<FormAssignmentDto>> GetAssignment(int id)
        {
            try
            {
                var assignment = await _workflowService.GetAssignmentByIdAsync(id);
                if (assignment == null)
                {
                    return NotFound($"Assignment with id {id} not found.");
                }
                
                return Ok(assignment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("assignments")]
        public async Task<ActionResult<FormAssignmentDto>> CreateAssignment(CreateFormAssignmentDto createDto)
        {
            try
            {
                var createdAssignment = await _workflowService.CreateAssignmentAsync(createDto);
                return CreatedAtAction(nameof(GetAssignment), new { id = createdAssignment.Id }, createdAssignment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("assignments/{id}")]
        public async Task<ActionResult<FormAssignmentDto>> UpdateAssignment(int id, FormAssignmentDto assignmentDto)
        {
            try
            {
                if (id != assignmentDto.Id)
                {
                    return BadRequest("Id in route does not match id in assignment.");
                }
                
                var updatedAssignment = await _workflowService.UpdateAssignmentAsync(assignmentDto);
                if (updatedAssignment == null)
                {
                    return NotFound($"Assignment with id {id} not found.");
                }
                
                return Ok(updatedAssignment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("assignments/{id}/complete")]
        public async Task<ActionResult<FormAssignmentDto>> CompleteAssignment(int id)
        {
            try
            {
                var completedAssignment = await _workflowService.CompleteAssignmentAsync(id);
                if (completedAssignment == null)
                {
                    return NotFound($"Assignment with id {id} not found.");
                }
                
                return Ok(completedAssignment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("assignments/{id}")]
        public async Task<ActionResult> DeleteAssignment(int id)
        {
            try
            {
                await _workflowService.DeleteAssignmentAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            try
            {
                var users = await _workflowService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
