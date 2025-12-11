import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { invoicesAPI } from '../services/api';
import Modal from '../components/Modal';
import { FileText, User, Users, Calendar, Truck, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Custom CSS to override FullCalendar defaults
const customStyles = `
  .fc .fc-day-today {
    background-color: transparent !important;
    border: 2px solid #2c7be5 !important;
  }
  
  .fc .fc-toolbar.fc-header-toolbar {
    display: none !important;
  }
  
  .fc-event {
    cursor: pointer;
  }
`;

const DriverSchedule = () => {
  const [events, setEvents] = useState([]);
  const [driverSchedule, setDriverSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState(null);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [calendarApi, setCalendarApi] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('');

  // Load driver schedule when component mounts
  useEffect(() => {
    loadDriverSchedule();
  }, []);

  const loadDriverSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const data = await invoicesAPI.getDriverSchedule();
      setDriverSchedule(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading driver schedule:', error);
      console.error('Error details:', error.response || error.message);
      setDriverSchedule([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Format amount to AED
  const formatCurrency = (amount) => {
    return `AED ${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Format date for FullCalendar (YYYY-MM-DD)
  const formatDateForCalendar = (dateOnly) => {
    if (typeof dateOnly === 'string') {
      return dateOnly;
    }
    // If it's a DateOnly object or similar, convert to string
    const date = new Date(dateOnly);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Update calendar title when view changes
  useEffect(() => {
    if (calendarApi) {
      setCurrentTitle(calendarApi.view.title);
    }
  }, [calendarApi, currentView]);

  // Helper function to create event start/end times based on trip type
  const getEventTimes = (tripType, dateStr, viewType) => {
    const isDayWeekView = viewType === 'timeGridDay' || viewType === 'timeGridWeek';
    
    if (!isDayWeekView || !tripType) {
      return { allDay: true, start: dateStr, end: undefined };
    }

    if (tripType === 'Evening') {
      // Evening trip: 6:00 PM - 12:00 AM (18:00 - 00:00 next day)
      const date = new Date(dateStr);
      date.setDate(date.getDate() + 1);
      const nextDayStr = date.toISOString().split('T')[0];
      return {
        allDay: false,
        start: `${dateStr}T18:00:00`,
        end: `${nextDayStr}T00:00:00`
      };
    } else {
      // Morning trip: 12:00 PM - 6:00 PM (12:00 - 18:00)
      return {
        allDay: false,
        start: `${dateStr}T12:00:00`,
        end: `${dateStr}T18:00:00`
      };
    }
  };

  // Process driver schedule and convert them to calendar events
  // Using schedule.date (service date from invoice.Date) for calendar display
  // Split by trip type (morning/evening) to show separate events
  useEffect(() => {
    if (!driverSchedule || driverSchedule.length === 0) {
      setEvents([]);
      return;
    }
    
    const driverEvents = [];
    
    driverSchedule.forEach(schedule => {
      if (!schedule || !schedule.date) {
        console.warn('Invalid schedule item:', schedule);
        return;
      }
      
      const dateStr = formatDateForCalendar(schedule.date);
      const invoices = schedule.invoices || [];
      
      // Group invoices by trip type
      const morningInvoices = invoices.filter(inv => inv.tripType === 'Morning');
      const eveningInvoices = invoices.filter(inv => inv.tripType === 'Evening');
      const unknownInvoices = invoices.filter(inv => !inv.tripType || (inv.tripType !== 'Morning' && inv.tripType !== 'Evening'));
      
      // Create event for morning trips
      if (morningInvoices.length > 0) {
        const times = getEventTimes('Morning', dateStr, currentView);
        const event = {
          id: `driver-${schedule.driverId}-${dateStr}-morning`,
          title: `☀️ ${schedule.driverName || 'Unknown'} (${morningInvoices.length} ${morningInvoices.length === 1 ? 'invoice' : 'invoices'})`,
          start: times.start,
          allDay: times.allDay,
          extendedProps: {
            schedule: { ...schedule, invoices: morningInvoices },
            type: 'driver',
            tripType: 'Morning'
          },
          backgroundColor: '#17a2b8', // Blue for driver schedule
          borderColor: '#138496',
          textColor: '#fff'
        };
        if (times.end) {
          event.end = times.end;
        }
        driverEvents.push(event);
      }

      // Create event for evening trips
      if (eveningInvoices.length > 0) {
        const times = getEventTimes('Evening', dateStr, currentView);
        const event = {
          id: `driver-${schedule.driverId}-${dateStr}-evening`,
          title: `🌙 ${schedule.driverName || 'Unknown'} (${eveningInvoices.length} ${eveningInvoices.length === 1 ? 'invoice' : 'invoices'})`,
          start: times.start,
          allDay: times.allDay,
          extendedProps: {
            schedule: { ...schedule, invoices: eveningInvoices },
            type: 'driver',
            tripType: 'Evening'
          },
          backgroundColor: '#6c757d', // Darker blue/gray for evening trips
          borderColor: '#5a6268',
          textColor: '#fff'
        };
        if (times.end) {
          event.end = times.end;
        }
        driverEvents.push(event);
      }
      
      // Create event for invoices without trip type (fallback)
      if (unknownInvoices.length > 0) {
        const event = {
          id: `driver-${schedule.driverId}-${dateStr}-unknown`,
          title: `${schedule.driverName || 'Unknown'} (${unknownInvoices.length} ${unknownInvoices.length === 1 ? 'invoice' : 'invoices'})`,
          start: dateStr,
          allDay: true,
          extendedProps: {
            schedule: { ...schedule, invoices: unknownInvoices },
            type: 'driver',
            tripType: null
          },
          backgroundColor: '#17a2b8',
          borderColor: '#138496',
          textColor: '#fff'
        };
        driverEvents.push(event);
      }
    });

    setEvents(driverEvents);
  }, [driverSchedule, currentView]);

  // Handle date click to show all driver schedules for that day
  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    setSelectedDate(clickedDate);
    
    // Find all driver schedules for this date
    const schedulesForDate = driverSchedule.filter(s => {
      if (!s || !s.date) return false;
      const scheduleDate = formatDateForCalendar(s.date);
      return scheduleDate === clickedDate;
    });
    
    if (schedulesForDate.length > 0) {
      // Show all drivers for this date
      setSelectedDateSchedules(schedulesForDate);
      setSelectedScheduleItem(null); // Clear single item selection
      setShowModal(true);
    }
  };

  // Handle event click to show specific driver schedule details
  const handleEventClick = (info) => {
    const event = info.event;
    const schedule = event.extendedProps.schedule;
    setSelectedScheduleItem(schedule);
    setSelectedDateSchedules([]); // Clear date selection
    if (schedule && schedule.date) {
      setSelectedDate(formatDateForCalendar(schedule.date));
    }
    setShowModal(true);
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Navigation handlers
  const handlePrev = () => {
    calendarApi?.prev();
    setCurrentTitle(calendarApi.view.title);
  };

  const handleNext = () => {
    calendarApi?.next();
    setCurrentTitle(calendarApi.view.title);
  };

  const handleToday = () => {
    calendarApi?.today();
    setCurrentTitle(calendarApi.view.title);
  };

  const changeView = (viewName) => {
    if (calendarApi) {
      calendarApi.changeView(viewName);
      setCurrentView(viewName);
    }
  };

  if (loadingSchedule) {
    return (
      <div className="content-wrapper">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading driver schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      {/* Inject custom styles */}
      <style>{customStyles}</style>
      
      <div className="card shadow">
        <div className="card-header bg-light py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h3 className="h5 fw-bold text-primary mb-0">Driver Schedule</h3>
              {currentTitle && <span className="ms-3 text-muted">{currentTitle}</span>}
            </div>
            <div className="d-flex align-items-center">
              <div className="btn-group me-3">
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handlePrev}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleToday}
                >
                  Today
                </button>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleNext}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="btn-group">
                <button 
                  className={`btn btn-sm ${currentView === 'dayGridMonth' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => changeView('dayGridMonth')}
                >
                  Month
                </button>
                <button 
                  className={`btn btn-sm ${currentView === 'timeGridWeek' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => changeView('timeGridWeek')}
                >
                  Week
                </button>
                <button 
                  className={`btn btn-sm ${currentView === 'timeGridDay' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => changeView('timeGridDay')}
                >
                  Day
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="calendar-legend d-flex justify-content-between align-items-center p-2 flex-wrap gap-2">
            <div className="d-flex align-items-center">
              <span className="color-box bg-info me-1" style={{ width: '15px', height: '15px', display: 'inline-block' }}></span>
              <span className="small">Driver Assignments</span>
            </div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-1">
                <Sun size={14} className="text-info" />
                <span className="small">Morning Trip (12 PM - 6 PM)</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <Moon size={14} className="text-secondary" />
                <span className="small">Evening Trip (6 PM - 12 AM)</span>
              </div>
            </div>
          </div>
          <div className="p-2">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={false}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
              }}
              height="auto"
              viewDidMount={(info) => {
                setCurrentView(info.view.type);
                setCalendarApi(info.view.calendar);
                setCurrentTitle(info.view.title);
              }}
              datesSet={(dateInfo) => {
                if (calendarApi) {
                  setCurrentView(calendarApi.view.type);
                  setCurrentTitle(calendarApi.view.title);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal for showing driver schedule details */}
      <Modal 
        show={showModal} 
        onClose={() => {
          setShowModal(false);
          setSelectedScheduleItem(null);
          setSelectedDateSchedules([]);
          setSelectedDate(null);
        }} 
        title={
          selectedDate
            ? `Driver Schedule - ${formatDate(selectedDate)}`
            : selectedScheduleItem && selectedScheduleItem.date
            ? `Driver Schedule - ${formatDate(formatDateForCalendar(selectedScheduleItem.date))}`
            : 'Driver Schedule'
        } 
        size="lg"
      >
        <div className="container-fluid">
          {/* Show all drivers for selected date */}
          {selectedDateSchedules.length > 0 && (
            <>
              {selectedDateSchedules.map((schedule, scheduleIdx) => (
                <div key={scheduleIdx} className="card mb-3 border-info">
                  <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">
                      <Truck size={18} className="me-2" />
                      {schedule.driverName}
                    </h6>
                    {schedule.driverPhone && (
                      <span className="small">Phone: {schedule.driverPhone}</span>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <strong>Total Invoices:</strong> {schedule.invoices.length}
                    </div>
                    
                    {schedule.invoices.map((invoice, idx) => (
                      <div key={idx} className="card mb-2 border">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <h6 className="mb-0 fw-bold">{invoice.invoiceNumber}</h6>
                                {invoice.tripType && (
                                  <span className={`badge d-flex align-items-center gap-1 text-white`} style={{ backgroundColor: invoice.tripType === 'Evening' ? '#6c757d' : '#17a2b8' }}>
                                    {invoice.tripType === 'Evening' ? (
                                      <>
                                        <Moon size={12} />
                                        Evening
                                      </>
                                    ) : (
                                      <>
                                        <Sun size={12} />
                                        Morning
                                      </>
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className="small">
                                <User size={14} className="me-1" />
                                <strong>Customer:</strong> {invoice.customer}
                              </div>
                              <div className="small">
                                <Users size={14} className="me-1" />
                                <strong>Guests:</strong> {invoice.adults ?? 0}A / {invoice.children ?? 0}C
                              </div>
                              {invoice.tripMode && (
                                <div className="small mt-1">
                                  <strong>Driver:</strong> {schedule.driverName} [{invoice.tripMode}] [{(invoice.adults ?? 0) + (invoice.children ?? 0)} pax]
                                </div>
                              )}
                            </div>
                            <span className={`badge ${
                              invoice.status === 'paid' ? 'bg-success' :
                              invoice.status === 'partial' ? 'bg-warning text-dark' : 'bg-danger'
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <strong>Services:</strong>
                            <ul className="list-unstyled ms-3 mb-0">
                              {invoice.services.map((service, sIdx) => (
                                <li key={sIdx} className="small">• {service}</li>
                              ))}
                            </ul>
                          </div>
                          {invoice.driverNotes && (
                            <div className="alert alert-info py-2 px-3 mb-0 small">
                              <strong>Notes:</strong> {invoice.driverNotes}
                            </div>
                          )}
                          <div className="mt-2 text-end">
                            <strong className="text-primary">Total: {formatCurrency(invoice.total)}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Show single driver schedule (when clicking on event) */}
          {selectedScheduleItem && selectedDateSchedules.length === 0 && (
            <div>
              <div className="card mb-3 border-info">
                <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">
                    <Truck size={18} className="me-2" />
                    {selectedScheduleItem.driverName}
                  </h6>
                  {selectedScheduleItem.driverPhone && (
                    <span className="small">Phone: {selectedScheduleItem.driverPhone}</span>
                  )}
                </div>
                <div className="card-body">
                  {selectedScheduleItem.date && (
                    <div className="mb-3">
                      <strong>Date:</strong> {formatDate(formatDateForCalendar(selectedScheduleItem.date))}
                    </div>
                  )}
                  <div className="mb-3">
                    <strong>Total Invoices:</strong> {selectedScheduleItem.invoices.length}
                  </div>
                  
                  {selectedScheduleItem.invoices.map((invoice, idx) => (
                    <div key={idx} className="card mb-2 border">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <h6 className="mb-0 fw-bold">{invoice.invoiceNumber}</h6>
                              {invoice.tripType && (
                                <span className={`badge d-flex align-items-center gap-1 text-white`} style={{ backgroundColor: invoice.tripType === 'Evening' ? '#6c757d' : '#17a2b8' }}>
                                  {invoice.tripType === 'Evening' ? (
                                    <>
                                      <Moon size={12} />
                                      Evening
                                    </>
                                  ) : (
                                    <>
                                      <Sun size={12} />
                                      Morning
                                    </>
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="small">
                              <User size={14} className="me-1" />
                              <strong>Customer:</strong> {invoice.customer}
                            </div>
                            <div className="small">
                              <Users size={14} className="me-1" />
                              <strong>Guests:</strong> {invoice.adults ?? 0}A / {invoice.children ?? 0}C
                            </div>
                            {invoice.tripMode && (
                              <div className="small mt-1">
                                <strong>Driver:</strong> {selectedScheduleItem.driverName} [{invoice.tripMode}] [{(invoice.adults ?? 0) + (invoice.children ?? 0)} pax]
                              </div>
                            )}
                          </div>
                          <span className={`badge ${
                            invoice.status === 'paid' ? 'bg-success' :
                            invoice.status === 'partial' ? 'bg-warning text-dark' : 'bg-danger'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </div>
                        <div className="mb-2">
                          <strong>Services:</strong>
                          <ul className="list-unstyled ms-3 mb-0">
                            {invoice.services.map((service, sIdx) => (
                              <li key={sIdx} className="small">• {service}</li>
                            ))}
                          </ul>
                        </div>
                        {invoice.driverNotes && (
                          <div className="alert alert-info py-2 px-3 mb-0 small">
                            <strong>Notes:</strong> {invoice.driverNotes}
                          </div>
                        )}
                        <div className="mt-2 text-end">
                          <strong className="text-primary">Total: {formatCurrency(invoice.total)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedDateSchedules.length === 0 && !selectedScheduleItem && (
            <div className="text-center p-4 text-muted">
              <Calendar size={48} className="mb-3 opacity-50" />
              <h5>No driver schedules for this date</h5>
              <p>There are no drivers assigned to invoices on the selected date.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DriverSchedule;

