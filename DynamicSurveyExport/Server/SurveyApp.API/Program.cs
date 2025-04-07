using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Text.Json.Serialization;
using SurveyApp.Infrastructure.Data;
using SurveyApp.Application.Interfaces;
using SurveyApp.Application.Services;
using SurveyApp.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext
builder.Services.AddDbContext<SurveyAppDbContext>(options =>
    options.UseSqlServer("Server=localhost;Database=SurveyAppDb;TrustServerCertificate=True;Trusted_Connection=True;"));

// Register repositories
builder.Services.AddScoped<IFormRepository, FormRepository>();
builder.Services.AddScoped<ISubmissionRepository, SubmissionRepository>();
builder.Services.AddScoped<IWorkflowRepository, WorkflowRepository>();

// Register services
builder.Services.AddScoped<FormService>();
builder.Services.AddScoped<SubmissionService>();
builder.Services.AddScoped<WorkflowService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://localhost:5000")
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

var app = builder.Build();

app.UseSwagger(); // Generates the Swagger JSON endpoint
app.UseSwaggerUI(c => // This configures the Swagger UI
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SurveyApp API v1");
    c.RoutePrefix = string.Empty;  // To access Swagger UI at root (/)
});

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

// Ensure database is created
//using (var scope = app.Services.CreateScope())
//{
//    var dataContext = scope.ServiceProvider.GetRequiredService<SurveyAppDbContext>();
//    dataContext.Database.EnsureCreated();
//}

app.Run();
