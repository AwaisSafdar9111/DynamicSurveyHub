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
    public class SubmissionRepository : ISubmissionRepository
    {
        private readonly SurveyAppDbContext _context;

        public SubmissionRepository(SurveyAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FormSubmission>> GetAllSubmissionsAsync()
        {
            return await _context.FormSubmissions
                .Include(s => s.Form)
                .ToListAsync();
        }

        public async Task<IEnumerable<FormSubmission>> GetSubmissionsByFormIdAsync(int formId)
        {
            return await _context.FormSubmissions
                .Where(s => s.FormId == formId)
                .Include(s => s.Form)
                .ToListAsync();
        }

        public async Task<FormSubmission> GetSubmissionByIdAsync(int id)
        {
            return await _context.FormSubmissions
                .Include(s => s.Form)
                .Include(s => s.Responses)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<FormSubmission> CreateSubmissionAsync(FormSubmission submission)
        {
            submission.SubmittedDate = DateTime.UtcNow;
            
            _context.FormSubmissions.Add(submission);
            await _context.SaveChangesAsync();
            
            return submission;
        }

        public async Task<FormSubmission> UpdateSubmissionAsync(FormSubmission submission)
        {
            _context.Entry(submission).State = EntityState.Modified;
            
            // Don't modify submitted date
            _context.Entry(submission).Property(x => x.SubmittedDate).IsModified = false;
            
            await _context.SaveChangesAsync();
            
            return submission;
        }

        public async Task DeleteSubmissionAsync(int id)
        {
            var submission = await _context.FormSubmissions.FindAsync(id);
            if (submission != null)
            {
                _context.FormSubmissions.Remove(submission);
                await _context.SaveChangesAsync();
            }
        }

        // Control Response operations
        public async Task<IEnumerable<ControlResponse>> GetResponsesBySubmissionIdAsync(int submissionId)
        {
            return await _context.ControlResponses
                .Where(r => r.SubmissionId == submissionId)
                .Include(r => r.Control)
                .ToListAsync();
        }

        public async Task<ControlResponse> CreateControlResponseAsync(ControlResponse response)
        {
            _context.ControlResponses.Add(response);
            await _context.SaveChangesAsync();
            
            return response;
        }

        public async Task<ControlResponse> UpdateControlResponseAsync(ControlResponse response)
        {
            _context.Entry(response).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            
            return response;
        }

        public async Task DeleteControlResponseAsync(int id)
        {
            var response = await _context.ControlResponses.FindAsync(id);
            if (response != null)
            {
                _context.ControlResponses.Remove(response);
                await _context.SaveChangesAsync();
            }
        }
    }
}
