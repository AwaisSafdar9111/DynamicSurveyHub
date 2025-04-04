using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Services
{
    public class WorkflowService
    {
        private readonly IWorkflowRepository _workflowRepository;

        public WorkflowService(IWorkflowRepository workflowRepository)
        {
            _workflowRepository = workflowRepository;
        }

        public async Task<IEnumerable<FormAssignmentDto>> GetAllAssignmentsAsync()
        {
            var assignments = await _workflowRepository.GetAllAssignmentsAsync();
            return assignments.Select(MapToFormAssignmentDto);
        }

        public async Task<IEnumerable<FormAssignmentDto>> GetAssignmentsByUserIdAsync(string userId)
        {
            var assignments = await _workflowRepository.GetAssignmentsByUserIdAsync(userId);
            return assignments.Select(MapToFormAssignmentDto);
        }

        public async Task<IEnumerable<FormAssignmentDto>> GetAssignmentsByFormIdAsync(int formId)
        {
            var assignments = await _workflowRepository.GetAssignmentsByFormIdAsync(formId);
            return assignments.Select(MapToFormAssignmentDto);
        }

        public async Task<FormAssignmentDto> GetAssignmentByIdAsync(int id)
        {
            var assignment = await _workflowRepository.GetAssignmentByIdAsync(id);
            if (assignment == null)
                return null;

            return MapToFormAssignmentDto(assignment);
        }

        public async Task<FormAssignmentDto> CreateAssignmentAsync(CreateFormAssignmentDto createDto)
        {
            var assignment = new FormAssignment
            {
                FormId = createDto.FormId,
                UserId = createDto.UserId,
                AssignedDate = DateTime.UtcNow,
                DueDate = createDto.DueDate,
                Status = AssignmentStatus.Assigned
            };
            
            var result = await _workflowRepository.CreateAssignmentAsync(assignment);
            return MapToFormAssignmentDto(result);
        }

        public async Task<FormAssignmentDto> UpdateAssignmentAsync(FormAssignmentDto assignmentDto)
        {
            var assignment = MapToFormAssignment(assignmentDto);
            var result = await _workflowRepository.UpdateAssignmentAsync(assignment);
            return MapToFormAssignmentDto(result);
        }

        public async Task<FormAssignmentDto> CompleteAssignmentAsync(int id)
        {
            var result = await _workflowRepository.CompleteAssignmentAsync(id);
            return MapToFormAssignmentDto(result);
        }

        public async Task DeleteAssignmentAsync(int id)
        {
            await _workflowRepository.DeleteAssignmentAsync(id);
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _workflowRepository.GetAllUsersAsync();
            return users.Select(MapToUserDto);
        }

        // Mapping methods
        private FormAssignmentDto MapToFormAssignmentDto(FormAssignment assignment)
        {
            if (assignment == null) return null;

            return new FormAssignmentDto
            {
                Id = assignment.Id,
                FormId = assignment.FormId,
                UserId = assignment.UserId,
                UserName = assignment.User?.Name ?? assignment.UserId,
                AssignedDate = assignment.AssignedDate,
                DueDate = assignment.DueDate,
                CompletedDate = assignment.CompletedDate,
                Status = assignment.Status.ToString(),
                FormTitle = assignment.Form?.Title ?? $"Form #{assignment.FormId}"
            };
        }

        private FormAssignment MapToFormAssignment(FormAssignmentDto assignmentDto)
        {
            if (assignmentDto == null) return null;

            return new FormAssignment
            {
                Id = assignmentDto.Id,
                FormId = assignmentDto.FormId,
                UserId = assignmentDto.UserId,
                AssignedDate = assignmentDto.AssignedDate,
                DueDate = assignmentDto.DueDate,
                CompletedDate = assignmentDto.CompletedDate,
                Status = Enum.Parse<AssignmentStatus>(assignmentDto.Status)
            };
        }

        private UserDto MapToUserDto(User user)
        {
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            };
        }
    }
}
