using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SurveyApp.Application.Interfaces;
using SurveyApp.Domain.Entities;
using SurveyApp.Infrastructure.Data;

namespace SurveyApp.Infrastructure.Repositories
{
    public class WorkflowRepository : IWorkflowRepository
    {
        private readonly SurveyAppDbContext _context;

        public WorkflowRepository(SurveyAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FormAssignment>> GetAllAssignmentsAsync()
        {
            return await _context.FormAssignments
                .Include(a => a.Form)
                .Include(a => a.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<FormAssignment>> GetAssignmentsByUserIdAsync(string userId)
        {
            return await _context.FormAssignments
                .Where(a => a.UserId == userId)
                .Include(a => a.Form)
                .ToListAsync();
        }

        public async Task<IEnumerable<FormAssignment>> GetAssignmentsByFormIdAsync(int formId)
        {
            return await _context.FormAssignments
                .Where(a => a.FormId == formId)
                .Include(a => a.User)
                .ToListAsync();
        }

        public async Task<FormAssignment> GetAssignmentByIdAsync(int id)
        {
            return await _context.FormAssignments
                .Include(a => a.Form)
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<FormAssignment> CreateAssignmentAsync(FormAssignment assignment)
        {
            assignment.AssignedDate = DateTime.UtcNow;
            assignment.Status = AssignmentStatus.Assigned;
            
            _context.FormAssignments.Add(assignment);
            await _context.SaveChangesAsync();
            
            return assignment;
        }

        public async Task<FormAssignment> UpdateAssignmentAsync(FormAssignment assignment)
        {
            _context.Entry(assignment).State = EntityState.Modified;
            
            // Don't modify assigned date
            _context.Entry(assignment).Property(x => x.AssignedDate).IsModified = false;
            
            await _context.SaveChangesAsync();
            
            return assignment;
        }

        public async Task<FormAssignment> CompleteAssignmentAsync(int id)
        {
            var assignment = await _context.FormAssignments.FindAsync(id);
            if (assignment != null)
            {
                assignment.Status = AssignmentStatus.Completed;
                assignment.CompletedDate = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
            }
            
            return assignment;
        }

        public async Task DeleteAssignmentAsync(int id)
        {
            var assignment = await _context.FormAssignments.FindAsync(id);
            if (assignment != null)
            {
                _context.FormAssignments.Remove(assignment);
                await _context.SaveChangesAsync();
            }
        }

        // User operations
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User> GetUserByIdAsync(string id)
        {
            return await _context.Users.FindAsync(id);
        }
    }
}
