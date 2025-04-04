using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Data
{
    public class SurveyAppDbContext : DbContext
    {
        public SurveyAppDbContext(DbContextOptions<SurveyAppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Form> Forms { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<Control> Controls { get; set; }
        public DbSet<ControlOption> ControlOptions { get; set; }
        public DbSet<ControlConfiguration> ControlConfigurations { get; set; }
        public DbSet<ControlCondition> ControlConditions { get; set; }
        public DbSet<ControlSortOrder> ControlSortOrders { get; set; }
        public DbSet<FormSubmission> FormSubmissions { get; set; }
        public DbSet<ControlResponse> ControlResponses { get; set; }
        public DbSet<FormAssignment> FormAssignments { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Form entity configuration
            modelBuilder.Entity<Form>()
                .HasMany(f => f.Sections)
                .WithOne(s => s.Form)
                .HasForeignKey(s => s.FormId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Form>()
                .HasMany(f => f.Submissions)
                .WithOne(s => s.Form)
                .HasForeignKey(s => s.FormId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Form>()
                .HasMany(f => f.Assignments)
                .WithOne(a => a.Form)
                .HasForeignKey(a => a.FormId)
                .OnDelete(DeleteBehavior.Cascade);

            // Section entity configuration
            modelBuilder.Entity<Section>()
                .HasMany(s => s.Controls)
                .WithOne(c => c.Section)
                .HasForeignKey(c => c.SectionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Control entity configuration
            modelBuilder.Entity<Control>()
                .HasOne(c => c.Configuration)
                .WithOne(cc => cc.Control)
                .HasForeignKey<ControlConfiguration>(cc => cc.ControlId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Control>()
                .HasMany(c => c.Options)
                .WithOne(o => o.Control)
                .HasForeignKey(o => o.ControlId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Control>()
                .HasMany(c => c.Conditions)
                .WithOne(cc => cc.Control)
                .HasForeignKey(cc => cc.ControlId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Control>()
                .HasMany(c => c.Responses)
                .WithOne(r => r.Control)
                .HasForeignKey(r => r.ControlId)
                .OnDelete(DeleteBehavior.NoAction);

            // ControlCondition entity configuration
            modelBuilder.Entity<ControlCondition>()
                .HasOne(cc => cc.SourceControl)
                .WithMany()
                .HasForeignKey(cc => cc.SourceControlId)
                .OnDelete(DeleteBehavior.NoAction);

            // FormSubmission entity configuration
            modelBuilder.Entity<FormSubmission>()
                .HasMany(fs => fs.Responses)
                .WithOne(r => r.Submission)
                .HasForeignKey(r => r.SubmissionId)
                .OnDelete(DeleteBehavior.Cascade);

            // FormAssignment entity configuration
            modelBuilder.Entity<FormAssignment>()
                .HasOne(fa => fa.User)
                .WithMany(u => u.Assignments)
                .HasForeignKey(fa => fa.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Add seed data for demo users
            modelBuilder.Entity<User>().HasData(
                new User { Id = "user1", Name = "John Doe", Email = "john.doe@example.com" },
                new User { Id = "user2", Name = "Jane Smith", Email = "jane.smith@example.com" },
                new User { Id = "user3", Name = "Bob Johnson", Email = "bob.johnson@example.com" }
            );
        }
    }
}
