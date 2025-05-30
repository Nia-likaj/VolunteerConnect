// server/VolunteerConnect.Data/Services/FirebaseService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Firebase.Auth;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using VolunteerConnect.Core.Models;

namespace VolunteerConnect.Data.Services
{
    public class FirebaseService
    {
        private readonly FirestoreDb _firestoreDb;
        
        public FirebaseService(string projectId)
        {
            _firestoreDb = FirestoreDb.Create(projectId);
        }
        
        public async Task<List<Event>> GetEventsAsync()
        {
            Query query = _firestoreDb.Collection("events");
            QuerySnapshot querySnapshot = await query.GetSnapshotAsync();
            
            var events = new List<Event>();
            foreach (DocumentSnapshot documentSnapshot in querySnapshot.Documents)
            {
                if (documentSnapshot.Exists)
                {
                    Event @event = documentSnapshot.ConvertTo<Event>();
                    @event.Id = documentSnapshot.Id;
                    events.Add(@event);
                }
            }
            
            return events;
        }
        
        public async Task<Event> GetEventByIdAsync(string id)
        {
            DocumentReference docRef = _firestoreDb.Collection("events").Document(id);
            DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();
            
            if (snapshot.Exists)
            {
                Event @event = snapshot.ConvertTo<Event>();
                @event.Id = snapshot.Id;
                return @event;
            }
            
            return null;
        }
        
        public async Task<bool> SaveEventAsync(string userId, string eventId)
        {
            try
            {
                await _firestoreDb.Collection("savedEvents").Document($"{userId}_{eventId}").SetAsync(
                    new Dictionary<string, object>
                    {
                        { "userId", userId },
                        { "eventId", eventId },
                        { "savedAt", Timestamp.GetCurrentTimestamp() }
                    });
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}