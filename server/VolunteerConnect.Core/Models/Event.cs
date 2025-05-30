using System;
using System.Collections.Generic;

namespace VolunteerConnect.Core.Models
{
    public class Event
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime Date { get; set; }
        public string ImageUrl { get; set; }
        public string Price { get; set; }
        public string OrganizerName { get; set; }
        public string OrganizerImageUrl { get; set; }
        public int AttendeeCount { get; set; }
        public List<string> AttendeeProfileImages { get; set; }
    }
}