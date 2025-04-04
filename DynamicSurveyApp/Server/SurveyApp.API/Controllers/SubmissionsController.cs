using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;

namespace SurveyApp.API.Controllers
{
    [ApiController]
    [Route("api/submissions")]
    public class SubmissionsController : ControllerBase
    {
        private readonly SubmissionService _submissionService;

        public SubmissionsController(SubmissionService submissionService)
        {
            _submissionService = submissionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FormSubmissionDto>>> GetSubmissions([FromQuery] int? formId)
        {
            try
            {
                if (formId.HasValue)
                {
                    var submissions = await _submissionService.GetSubmissionsByFormIdAsync(formId.Value);
                    return Ok(submissions);
                }
                else
                {
                    var submissions = await _submissionService.GetAllSubmissionsAsync();
                    return Ok(submissions);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FormSubmissionDto>> GetSubmission(int id)
        {
            try
            {
                var submission = await _submissionService.GetSubmissionByIdAsync(id);
                if (submission == null)
                {
                    return NotFound($"Submission with id {id} not found.");
                }
                
                return Ok(submission);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<FormSubmissionDto>> CreateSubmission(FormSubmissionDto submissionDto)
        {
            try
            {
                // Set default values for new submission
                submissionDto.Id = 0;
                submissionDto.SubmittedDate = DateTime.UtcNow;
                
                // Set submission ID for all responses
                if (submissionDto.Responses != null)
                {
                    foreach (var response in submissionDto.Responses)
                    {
                        response.Id = 0;
                        response.SubmissionId = 0; // Will be set by the database
                    }
                }
                
                var createdSubmission = await _submissionService.CreateSubmissionAsync(submissionDto);
                return CreatedAtAction(nameof(GetSubmission), new { id = createdSubmission.Id }, createdSubmission);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<FormSubmissionDto>> UpdateSubmission(int id, FormSubmissionDto submissionDto)
        {
            try
            {
                if (id != submissionDto.Id)
                {
                    return BadRequest("Id in route does not match id in submission.");
                }
                
                var updatedSubmission = await _submissionService.UpdateSubmissionAsync(submissionDto);
                if (updatedSubmission == null)
                {
                    return NotFound($"Submission with id {id} not found.");
                }
                
                return Ok(updatedSubmission);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSubmission(int id)
        {
            try
            {
                await _submissionService.DeleteSubmissionAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
