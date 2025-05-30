// server/VolunteerConnect.API/Controllers/EventsController.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VolunteerConnect.Core.Models;
using VolunteerConnect.Core.Services;

namespace VolunteerConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        
        public EventsController(IEventService eventService)
        {
            _eventService = eventService;
        }
        
        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<Event>>> GetUpcomingEvents()
        {
            var events = await _eventService.GetUpcomingEventsAsync();
            return Ok(events);
        }
        
        [HttpGet("recommended")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Event>>> GetRecommendedEvents()
        {
            var userId = User.Identity.Name; // Or use claims to get the user ID
            var events = await _eventService.GetRecommendedEventsAsync(userId);
            return Ok(events);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(string id)
        {
            var @event = await _eventService.GetEventByIdAsync(id);
            if (@event == null)
            {
                return NotFound();
            }
            return Ok(@event);
        }
        
        [HttpPost("{id}/save")]
        [Authorize]
        public async Task<IActionResult> SaveEvent(string id)
        {
            var userId = User.Identity.Name; // Or use claims to get the user ID
            var result = await _eventService.SaveEventAsync(userId, id);
            if (result)
            {
                return Ok();
            }
            return BadRequest();
        }
    }
}