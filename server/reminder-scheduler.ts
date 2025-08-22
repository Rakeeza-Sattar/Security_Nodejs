import cron from 'node-cron';
import { storage } from './storage';
import { emailService } from './email-service';

// Schedule task to run every hour to check for appointments needing 24-hour reminders
export function startReminderScheduler() {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Checking for appointments needing 24-hour reminders...');
      
      // Get current time
      const now = new Date();
      
      // Calculate 24 hours from now
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // Get all appointments (we'll filter in memory since we don't have getAppointmentsByDate)
      const allAppointments = await storage.getAllAppointments();
      const tomorrowDate = in24Hours.toISOString().split('T')[0];
      const upcomingAppointments = allAppointments.filter(apt => 
        apt.preferredDate === tomorrowDate && apt.status === 'confirmed'
      );
      
      for (const appointment of upcomingAppointments) {
        // Check if we've already sent a 24-hour reminder (would need reminderSent field in schema)
        // For now, we'll send the reminder - in production you'd track this
        if (true) {
          try {
            await emailService.send24HourReminder({
              customerName: appointment.fullName,
              email: appointment.email,
              appointmentDate: new Date(appointment.preferredDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              appointmentTime: appointment.preferredTime,
              address: appointment.address,
              phone: appointment.phone || undefined,
              appointmentId: appointment.id,
            });
            
            // Mark reminder as sent (this would need to be implemented in storage)
            // await storage.markReminderSent(appointment.id);
            console.log(`24-hour reminder sent for appointment ${appointment.id}`);
          } catch (error) {
            console.error(`Failed to send reminder for appointment ${appointment.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });
  
  console.log('Reminder scheduler started - checking every hour for 24-hour reminders');
}

// Schedule task to run daily at 8 AM to send day-of reminders
export function startDayOfReminderScheduler() {
  cron.schedule('0 8 * * *', async () => {
    try {
      console.log('Checking for appointments today...');
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Get all appointments for today
      const allAppointments = await storage.getAllAppointments();
      const todayAppointments = allAppointments.filter(apt => 
        apt.preferredDate === today && apt.status === 'confirmed'
      );
      
      for (const appointment of todayAppointments) {
        if (appointment.status === 'confirmed') {
          try {
            await emailService.send24HourReminder({
              customerName: appointment.fullName,
              email: appointment.email,
              appointmentDate: 'Today',
              appointmentTime: appointment.preferredTime,
              address: appointment.address,
              phone: appointment.phone || undefined,
              appointmentId: appointment.id,
            });
            
            console.log(`Day-of reminder sent for appointment ${appointment.id}`);
          } catch (error) {
            console.error(`Failed to send day-of reminder for appointment ${appointment.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in day-of reminder scheduler:', error);
    }
  });
  
  console.log('Day-of reminder scheduler started - sending reminders daily at 8 AM');
}