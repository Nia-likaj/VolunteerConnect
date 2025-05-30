import React, { useState } from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { Grid } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import MainLayout from '../components/layouts/MainLayout';
import '../styles/Calendar.css'; // We'll create this file next

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Pastrimi i Liqenit',
      date: new Date(2025, 4, 28), // May 28, 2025
      description: 'Vullnetarizëm për pastrimin e liqenit artificial'
    },
    {
      id: '2',
      title: 'Dhurim Gjaku',
      date: new Date(2025, 4, 30), // May 30, 2025
      description: 'Fushatë për dhurimin e gjakut në Qendrën Shëndetësore'
    }
  ]);
  
  // Get calendar data for current month
  const daysInMonth = new Date(
    currentDate.getFullYear(), 
    currentDate.getMonth() + 1, 
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(), 
    currentDate.getMonth(), 
    1
  ).getDay();
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Format month name
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayEvents = events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
    
    const isToday = new Date().toDateString() === date.toDateString();
    
    calendarDays.push(
      <div key={`day-${day}`} className={`calendar-day ${isToday ? 'today' : ''}`}>
        <div className="day-number">{day}</div>
        {dayEvents.map(event => (
          <div key={event.id} className="calendar-event">
            {event.title}
          </div>
        ))}
      </div>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 2 }}>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
          <Box className="calendar-header" sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <IconButton onClick={prevMonth}>
              <ArrowBackIos />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {monthName} {currentDate.getFullYear()}
            </Typography>
            <IconButton onClick={nextMonth}>
              <ArrowForwardIos />
            </IconButton>
          </Box>
          
          {/* Replace Grid with Flexbox layout */}
          <Box 
            className="calendar-weekdays" 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 2, 
              pb: 1,
              borderBottom: '1px solid #e0e0e0'
            }}
          >
            <Typography sx={{ flex: 1, textAlign: 'center' }}>Sun</Typography>
            <Typography sx={{ flex: 1, textAlign: 'center' }}>Mon</Typography>
            <Typography sx={{ flex: 1, textAlign: 'center' }}>Tue</Typography>
            <Typography sx={{ flex: 1, textAlign: 'center' }}>Wed</Typography>
            <Typography sx={{ flex: 1, textAlign: 'center' }}>Thu</Typography>
            <Typography sx={{ flex: 1, textAlign: 'center' }}>Fri</Typography>
            <Typography sx={{ flex: 1, textAlign: 'center' }}>Sat</Typography>
          </Box>
          
          <Box className="calendar-days">
            {calendarDays}
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default Calendar;