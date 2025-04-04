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
    public class FormRepository : IFormRepository
    {
        private readonly SurveyAppDbContext _context;

        public FormRepository(SurveyAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Form>> GetAllFormsAsync()
        {
            return await _context.Forms
                .Include(f => f.Sections)
                .ToListAsync();
        }

        public async Task<Form> GetFormByIdAsync(int id)
        {
            return await _context.Forms
                .Include(f => f.Sections)
                .ThenInclude(s => s.Controls)
                .ThenInclude(c => c.Configuration)
                .Include(f => f.Sections)
                .ThenInclude(s => s.Controls)
                .ThenInclude(c => c.Options)
                .Include(f => f.Sections)
                .ThenInclude(s => s.Controls)
                .ThenInclude(c => c.Conditions)
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<Form> CreateFormAsync(Form form)
        {
            form.CreatedDate = DateTime.UtcNow;
            form.ModifiedDate = DateTime.UtcNow;
            
            _context.Forms.Add(form);
            await _context.SaveChangesAsync();
            
            return form;
        }

        public async Task<Form> UpdateFormAsync(Form form)
        {
            form.ModifiedDate = DateTime.UtcNow;
            
            _context.Entry(form).State = EntityState.Modified;
            
            // Do not modify CreatedDate and CreatedBy
            _context.Entry(form).Property(x => x.CreatedDate).IsModified = false;
            _context.Entry(form).Property(x => x.CreatedBy).IsModified = false;
            
            await _context.SaveChangesAsync();
            
            return form;
        }

        public async Task DeleteFormAsync(int id)
        {
            var form = await _context.Forms.FindAsync(id);
            if (form != null)
            {
                _context.Forms.Remove(form);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Form> PublishFormAsync(int id)
        {
            var form = await _context.Forms.FindAsync(id);
            if (form != null)
            {
                form.IsPublished = true;
                form.ModifiedDate = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
            }
            
            return form;
        }

        // Section operations
        public async Task<Section> CreateSectionAsync(Section section)
        {
            _context.Sections.Add(section);
            await _context.SaveChangesAsync();
            
            return section;
        }

        public async Task<Section> UpdateSectionAsync(Section section)
        {
            _context.Entry(section).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            
            return section;
        }

        public async Task DeleteSectionAsync(int id)
        {
            var section = await _context.Sections.FindAsync(id);
            if (section != null)
            {
                _context.Sections.Remove(section);
                await _context.SaveChangesAsync();
            }
        }

        // Control operations
        public async Task<Control> GetControlByIdAsync(int id)
        {
            return await _context.Controls
                .Include(c => c.Configuration)
                .Include(c => c.Options)
                .Include(c => c.Conditions)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<Control>> GetControlsBySectionIdAsync(int sectionId)
        {
            return await _context.Controls
                .Include(c => c.Configuration)
                .Include(c => c.Options)
                .Include(c => c.Conditions)
                .Where(c => c.SectionId == sectionId)
                .OrderBy(c => c.OrderIndex)
                .ToListAsync();
        }

        public async Task<Control> CreateControlAsync(Control control)
        {
            // Set default order index if not provided
            if (control.OrderIndex == 0)
            {
                var maxOrderIndex = await _context.Controls
                    .Where(c => c.SectionId == control.SectionId)
                    .Select(c => (int?)c.OrderIndex)
                    .MaxAsync() ?? -1;
                
                control.OrderIndex = maxOrderIndex + 1;
            }
            
            _context.Controls.Add(control);
            await _context.SaveChangesAsync();
            
            return control;
        }

        public async Task<Control> UpdateControlAsync(Control control)
        {
            _context.Entry(control).State = EntityState.Modified;
            
            // Handle configurations
            if (control.Configuration != null)
            {
                if (control.Configuration.Id == 0)
                {
                    control.Configuration.ControlId = control.Id;
                    _context.ControlConfigurations.Add(control.Configuration);
                }
                else
                {
                    _context.Entry(control.Configuration).State = EntityState.Modified;
                }
            }
            
            await _context.SaveChangesAsync();
            
            return control;
        }

        public async Task DeleteControlAsync(int id)
        {
            var control = await _context.Controls.FindAsync(id);
            if (control != null)
            {
                _context.Controls.Remove(control);
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateControlOrderAsync(int sectionId, List<int> controlIds)
        {
            for (int i = 0; i < controlIds.Count; i++)
            {
                var control = await _context.Controls.FindAsync(controlIds[i]);
                if (control != null && control.SectionId == sectionId)
                {
                    control.OrderIndex = i;
                    _context.Entry(control).Property(x => x.OrderIndex).IsModified = true;
                }
            }
            
            await _context.SaveChangesAsync();
        }

        // Control Option operations
        public async Task<IEnumerable<ControlOption>> GetControlOptionsAsync(int controlId)
        {
            return await _context.ControlOptions
                .Where(o => o.ControlId == controlId)
                .OrderBy(o => o.OrderIndex)
                .ToListAsync();
        }

        public async Task<ControlOption> CreateControlOptionAsync(ControlOption option)
        {
            // Set default order index if not provided
            if (option.OrderIndex == 0)
            {
                var maxOrderIndex = await _context.ControlOptions
                    .Where(o => o.ControlId == option.ControlId)
                    .Select(o => (int?)o.OrderIndex)
                    .MaxAsync() ?? -1;
                
                option.OrderIndex = maxOrderIndex + 1;
            }
            
            _context.ControlOptions.Add(option);
            await _context.SaveChangesAsync();
            
            return option;
        }

        public async Task<ControlOption> UpdateControlOptionAsync(ControlOption option)
        {
            _context.Entry(option).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            
            return option;
        }

        public async Task DeleteControlOptionAsync(int id)
        {
            var option = await _context.ControlOptions.FindAsync(id);
            if (option != null)
            {
                _context.ControlOptions.Remove(option);
                await _context.SaveChangesAsync();
            }
        }

        // Control Condition operations
        public async Task<IEnumerable<ControlCondition>> GetControlConditionsAsync(int controlId)
        {
            return await _context.ControlConditions
                .Where(c => c.ControlId == controlId)
                .ToListAsync();
        }

        public async Task<ControlCondition> CreateControlConditionAsync(ControlCondition condition)
        {
            _context.ControlConditions.Add(condition);
            await _context.SaveChangesAsync();
            
            return condition;
        }

        public async Task<ControlCondition> UpdateControlConditionAsync(ControlCondition condition)
        {
            _context.Entry(condition).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            
            return condition;
        }

        public async Task DeleteControlConditionAsync(int id)
        {
            var condition = await _context.ControlConditions.FindAsync(id);
            if (condition != null)
            {
                _context.ControlConditions.Remove(condition);
                await _context.SaveChangesAsync();
            }
        }
    }
}
