// server/VolunteerConnect.Core/Services/IEventService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using VolunteerConnect.Core.Models;

namespace VolunteerConnect.Core.Services
{
    public interface IEventService
    {
        Task<List<Event>> GetUpcomingEventsAsync();
        Task<List<Event>> GetRecommendedEventsAsync(string userId);
        Task<Event> GetEventByIdAsync(string id);
        Task<bool> SaveEventAsync(string userId, string eventId);
        Task<bool> FollowOrganizerAsync(string userId, string organizerId);
    }
}