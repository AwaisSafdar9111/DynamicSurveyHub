using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Services
{
    public class SubmissionService
    {
        private readonly ISubmissionRepository _submissionRepository;

        public SubmissionService(ISubmissionRepository submissionRepository)
        {
            _submissionRepository = submissionRepository;
        }

        public async Task<IEnumerable<FormSubmissionDto>> GetAllSubmissionsAsync()
        {
            var submissions = await _submissionRepository.GetAllSubmissionsAsync();
            return submissions.Select(MapToFormSubmissionDto);
        }

        public async Task<IEnumerable<FormSubmissionDto>> GetSubmissionsByFormIdAsync(int formId)
        {
            var submissions = await _submissionRepository.GetSubmissionsByFormIdAsync(formId);
            return submissions.Select(MapToFormSubmissionDto);
        }

        public async Task<FormSubmissionDto> GetSubmissionByIdAsync(int id)
        {
            var submission = await _submissionRepository.GetSubmissionByIdAsync(id);
            if (submission == null)
                return null;

            return MapToFormSubmissionDto(submission);
        }

        public async Task<FormSubmissionDto> CreateSubmissionAsync(FormSubmissionDto submissionDto)
        {
            var submission = MapToFormSubmission(submissionDto);
            var result = await _submissionRepository.CreateSubmissionAsync(submission);
            return MapToFormSubmissionDto(result);
        }

        public async Task<FormSubmissionDto> UpdateSubmissionAsync(FormSubmissionDto submissionDto)
        {
            var submission = MapToFormSubmission(submissionDto);
            var result = await _submissionRepository.UpdateSubmissionAsync(submission);
            return MapToFormSubmissionDto(result);
        }

        public async Task DeleteSubmissionAsync(int id)
        {
            await _submissionRepository.DeleteSubmissionAsync(id);
        }

        // Mapping methods
        private FormSubmissionDto MapToFormSubmissionDto(FormSubmission submission)
        {
            if (submission == null) return null;

            return new FormSubmissionDto
            {
                Id = submission.Id,
                FormId = submission.FormId,
                SubmittedBy = submission.SubmittedBy,
                SubmittedDate = submission.SubmittedDate,
                Responses = submission.Responses?.Select(MapToControlResponseDto).ToList() ?? new List<ControlResponseDto>()
            };
        }

        private ControlResponseDto MapToControlResponseDto(ControlResponse response)
        {
            if (response == null) return null;

            return new ControlResponseDto
            {
                Id = response.Id,
                SubmissionId = response.SubmissionId,
                ControlId = response.ControlId,
                Value = response.Value,
                OptionIds = !string.IsNullOrEmpty(response.OptionIds) 
                    ? response.OptionIds.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() 
                    : new List<string>(),
                Latitude = response.Latitude,
                Longitude = response.Longitude,
                FileUrls = !string.IsNullOrEmpty(response.FileUrls) 
                    ? response.FileUrls.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() 
                    : new List<string>(),
                SignatureUrl = response.SignatureUrl
            };
        }

        private FormSubmission MapToFormSubmission(FormSubmissionDto submissionDto)
        {
            if (submissionDto == null) return null;

            return new FormSubmission
            {
                Id = submissionDto.Id,
                FormId = submissionDto.FormId,
                SubmittedBy = submissionDto.SubmittedBy,
                SubmittedDate = submissionDto.SubmittedDate,
                Responses = submissionDto.Responses?.Select(MapToControlResponse).ToList() ?? new List<ControlResponse>()
            };
        }

        private ControlResponse MapToControlResponse(ControlResponseDto responseDto)
        {
            if (responseDto == null) return null;

            return new ControlResponse
            {
                Id = responseDto.Id,
                SubmissionId = responseDto.SubmissionId,
                ControlId = responseDto.ControlId,
                Value = responseDto.Value,
                OptionIds = responseDto.OptionIds != null && responseDto.OptionIds.Any()
                    ? string.Join(",", responseDto.OptionIds)
                    : null,
                Latitude = responseDto.Latitude,
                Longitude = responseDto.Longitude,
                FileUrls = responseDto.FileUrls != null && responseDto.FileUrls.Any()
                    ? string.Join(",", responseDto.FileUrls)
                    : null,
                SignatureUrl = responseDto.SignatureUrl
            };
        }
    }
}
