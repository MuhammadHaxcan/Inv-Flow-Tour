import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useData } from '../contexts/DataContext';
import Modal from '../components/Modal';
import { FileText, DollarSign, User, Users, Calendar, Truck, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
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

const CalendarView = () => {
  const { openInvoices, closedInvoices, drivers, loadOpenInvoices, loadClosedInvoices, loadDrivers, loadingStates } = useData();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Load only needed data when component mounts
  useEffect(() => {
    loadOpenInvoices();
    loadClosedInvoices();
    loadDrivers();
  }, [loadOpenInvoices, loadClosedInvoices, loadDrivers]);

  const [dateInvoices, setDateInvoices] = useState({ open: [], closed: [] });
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [calendarApi, setCalendarApi] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('');

  // Format amount to AED
  const formatCurrency = (amount) => {
    return `AED ${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Calculate total expenses for an invoice
  const calculateExpensesTotal = (expenses) => {
    return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  };

  // Calculate VAT as 5% of the invoice total
  const calculateVAT = (invoice) => {
    const serviceVAT = invoice.services.reduce((sum, service) => {
      const rate = parseFloat(service.rate) || 0;
      return sum + (rate * 0.05 / 1.05);
    }, 0);

    const paymentVAT = invoice.payments.reduce((sum, payment) => {
      return sum + (payment.vat || 0);
    }, 0);

    return serviceVAT + paymentVAT;
  };

  // Get driver contact information
  const getDriverContact = (invoice) => {
    if (!invoice.driver || !drivers) return 'Not assigned';
    const driver = drivers.find(d => d.name === invoice.driver);
    return driver ? driver.phone : 'No contact information';
  };

  // Update calendar title when view changes
  useEffect(() => {
    if (calendarApi) {
      setCurrentTitle(calendarApi.view.title);
    }
  }, [calendarApi, currentView]);

  // Helper function to create event start/end times based on trip type
  const getEventTimes = (invoice, viewType) => {
    const isDayWeekView = viewType === 'timeGridDay' || viewType === 'timeGridWeek';
    
    if (!isDayWeekView || !invoice.tripType) {
      return { allDay: true, start: invoice.date, end: undefined };
    }

    const dateStr = invoice.date;
    if (invoice.tripType === 'Night') {
      // Night trip: 6:00 PM - 12:00 AM (18:00 - 00:00 next day)
      // Calculate next day for end time
      const date = new Date(dateStr);
      date.setDate(date.getDate() + 1);
      const nextDayStr = date.toISOString().split('T')[0];
      return {
        allDay: false,
        start: `${dateStr}T18:00:00`,
        end: `${nextDayStr}T00:00:00`
      };
    } else {
      // Day trip: 12:00 PM - 6:00 PM (12:00 - 18:00)
      return {
        allDay: false,
        start: `${dateStr}T12:00:00`,
        end: `${dateStr}T18:00:00`
      };
    }
  };

  // Process invoices and convert them to calendar events
  // Using invoice.date (service date) for calendar display
  useEffect(() => {
    const createEventTitle = (invoice) => {
      const tripIcon = invoice.tripType === 'Night' ? '🌙' : invoice.tripType === 'Day' ? '☀️' : '';
      const tripText = tripIcon ? ` ${tripIcon} ` : '';
      return `${invoice.customer}${tripText}(${invoice.services.map(s => s.service).join(', ')})`;
    };

    const openEvents = openInvoices.map(invoice => {
      const times = getEventTimes(invoice, currentView);
      const event = {
        id: `open-${invoice.id}`,
        title: createEventTitle(invoice),
        start: times.start,
        allDay: times.allDay,
        extendedProps: {
          status: 'open',
          invoice: invoice,
          type: 'invoice'
        },
        backgroundColor: invoice.tripType === 'Night' ? '#e65100' : '#ff9800', // Dark orange for night, Orange for day/open
        borderColor: invoice.tripType === 'Night' ? '#bf360c' : '#f57c00',
        textColor: '#fff'
      };
      if (times.end) {
        event.end = times.end;
      }
      return event;
    });

    const closedEvents = closedInvoices.map(invoice => {
      const times = getEventTimes(invoice, currentView);
      const event = {
        id: `closed-${invoice.id}`,
        title: createEventTitle(invoice),
        start: times.start,
        allDay: times.allDay,
        extendedProps: {
          status: 'closed',
          invoice: invoice,
          type: 'invoice'
        },
        backgroundColor: '#28a745', // Green for all closed invoices
        borderColor: '#1e7e34',
        textColor: '#fff'
      };
      if (times.end) {
        event.end = times.end;
      }
      return event;
    });

    setEvents([...openEvents, ...closedEvents]);
  }, [openInvoices, closedInvoices, currentView]);

  // Handle date click to show invoices for that day
  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    setSelectedDate(clickedDate);

    // Find invoices for this date
    const openForDate = openInvoices.filter(invoice => invoice.date === clickedDate);
    const closedForDate = closedInvoices.filter(invoice => invoice.date === clickedDate);

    setDateInvoices({
      open: openForDate,
      closed: closedForDate
    });

    setShowModal(true);
  };

  // Handle event click to show invoice details
  const handleEventClick = (info) => {
    const event = info.event;
    const invoice = event.extendedProps.invoice;
    const status = event.extendedProps.status;
    
    setSelectedDate(invoice.date);
    
    if (status === 'open') {
      setDateInvoices({
        open: [invoice],
        closed: []
      });
    } else {
      setDateInvoices({
        open: [],
        closed: [invoice]
      });
    }
    
    setShowModal(true);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return 'bg-success';
      case 'partial': return 'bg-warning text-dark';
      case 'unpaid': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
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

  return (
    <div className="content-wrapper">
      {/* Inject custom styles */}
      <style>{customStyles}</style>
      
      <div className="card shadow">
        <div className="card-header bg-light py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h3 className="h5 fw-bold text-primary mb-0">Invoice Calendar</h3>
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
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex align-items-center">
                <span className="color-box me-1" style={{ width: '15px', height: '15px', display: 'inline-block', backgroundColor: '#ff9800' }}></span>
                <span className="small">Open Invoices</span>
              </div>
              <div className="d-flex align-items-center">
                <span className="color-box bg-success me-1" style={{ width: '15px', height: '15px', display: 'inline-block' }}></span>
                <span className="small">Closed Invoices</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-1">
                <Sun size={14} className="text-warning" />
                <span className="small">Day Trip (12 PM - 6 PM)</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <Moon size={14} className="text-dark" />
                <span className="small">Night Trip (6 PM - 12 AM)</span>
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

      {/* Modal for showing invoices on selected date */}
      <Modal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedDate ? `Invoices for ${formatDate(selectedDate)}` : 'Invoices'} 
        size="lg"
      >
        <div className="container-fluid">
          {/* Display open invoices */}
          {dateInvoices.open.length > 0 && (
            <div className="mb-4">
              <h5 className="d-flex align-items-center gap-2 mb-3">
                <span className="badge" style={{ backgroundColor: '#ff9800', color: '#fff' }}>Open Invoices</span>
                <span className="text-muted">({dateInvoices.open.length})</span>
              </h5>
              
              {dateInvoices.open.map(invoice => (
                <div className="card mb-3" key={`open-${invoice.id}`} style={{ borderColor: invoice.tripType === 'Night' ? '#e65100' : '#ff9800', borderWidth: '2px' }}>
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="mb-0 fw-bold">{invoice.number}</h6>
                      {invoice.tripType && (
                        <span className="badge d-flex align-items-center gap-1 text-white" style={{ backgroundColor: invoice.tripType === 'Night' ? '#e65100' : '#ff9800' }}>
                          {invoice.tripType === 'Night' ? (
                            <>
                              <Moon size={14} />
                              Night Trip
                            </>
                          ) : (
                            <>
                              <Sun size={14} />
                              Day Trip
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <span className={`badge ${getStatusBadge(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                          <User size={16} className="me-2 text-primary" />
                          <strong>Customer:</strong>
                          <span className="ms-2">{invoice.customer}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <Users size={16} className="me-2 text-primary" />
                          <strong>Guests:</strong>
                          <span className="ms-2">{(invoice.adults ?? 0) + (invoice.children ?? 0)}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <Truck size={16} className="me-2 text-primary" />
                          <strong>Driver:</strong>
                          <span className="ms-2">{invoice.driver || 'Not assigned'}</span>
                        </div>
                        <div className="d-flex align-items-center small text-muted">
                          <span className="ms-4">Contact: {getDriverContact(invoice)}</span>
                        </div>
                        {invoice.tripMode && (
                          <div className="d-flex align-items-center mb-2 mt-2">
                            <strong>Trip Mode:</strong>
                            <span className={`badge ms-2 ${invoice.tripMode === 'Private' ? 'bg-primary' : 'bg-secondary'}`}>
                              {invoice.tripMode}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                          <FileText size={16} className="me-2 text-primary" />
                          <strong>Services:</strong>
                        </div>
                        <ul className="list-unstyled ms-4 mb-2">
                          {invoice.services.map((service, idx) => (
                            <li key={idx} className="small">
                              <div className="d-flex justify-content-between">
                                <span>{service.service}</span>
                                <span>{formatCurrency(service.rate)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="border-top pt-2 mt-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <strong className="text-primary">Total:</strong>
                            <span className="fw-bold">{formatCurrency(invoice.total)}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">Paid:</span>
                            <span className="text-success">{formatCurrency(invoice.paid)}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">Outstanding:</span>
                            <span className="text-danger">{formatCurrency(invoice.total - invoice.paid)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Display closed invoices */}
          {dateInvoices.closed.length > 0 && (
            <div>
              <h5 className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-success">Closed Invoices</span>
                <span className="text-muted">({dateInvoices.closed.length})</span>
              </h5>
              
              {dateInvoices.closed.map(invoice => (
                <div className="card mb-3 border-success" key={`closed-${invoice.id}`}>
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="mb-0 fw-bold">{invoice.number}</h6>
                      {invoice.tripType && (
                        <span className={`badge d-flex align-items-center gap-1 ${invoice.tripType === 'Night' ? 'bg-dark' : 'bg-warning text-dark'}`}>
                          {invoice.tripType === 'Night' ? (
                            <>
                              <Moon size={14} />
                              Night Trip
                            </>
                          ) : (
                            <>
                              <Sun size={14} />
                              Day Trip
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <span className="badge bg-success">Paid</span>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                          <User size={16} className="me-2 text-primary" />
                          <strong>Customer:</strong>
                          <span className="ms-2">{invoice.customer}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <Users size={16} className="me-2 text-primary" />
                          <strong>Guests:</strong>
                          <span className="ms-2">{(invoice.adults ?? 0) + (invoice.children ?? 0)}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <Truck size={16} className="me-2 text-primary" />
                          <strong>Driver:</strong>
                          <span className="ms-2">{invoice.driver || 'Not assigned'}</span>
                        </div>
                        <div className="d-flex align-items-center small text-muted">
                          <span className="ms-4">Contact: {getDriverContact(invoice)}</span>
                        </div>
                        {invoice.tripMode && (
                          <div className="d-flex align-items-center mb-2 mt-2">
                            <strong>Trip Mode:</strong>
                            <span className={`badge ms-2 ${invoice.tripMode === 'Private' ? 'bg-primary' : 'bg-secondary'}`}>
                              {invoice.tripMode}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                          <FileText size={16} className="me-2 text-primary" />
                          <strong>Services:</strong>
                        </div>
                        <ul className="list-unstyled ms-4 mb-2">
                          {invoice.services.map((service, idx) => (
                            <li key={idx} className="small">
                              <div className="d-flex justify-content-between">
                                <span>{service.service}</span>
                                <span>{formatCurrency(service.rate)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="border-top pt-2 mt-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <strong className="text-primary">Total:</strong>
                            <span className="fw-bold">{formatCurrency(invoice.total)}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">VAT (5%):</span>
                            <span>{formatCurrency(calculateVAT(invoice))}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">Expenses:</span>
                            <span>{formatCurrency(calculateExpensesTotal(invoice.expenses))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {dateInvoices.open.length === 0 && dateInvoices.closed.length === 0 && (
            <div className="text-center p-4 text-muted">
              <Calendar size={48} className="mb-3 opacity-50" />
              <h5>No invoices for this date</h5>
              <p>There are no open or closed invoices scheduled for the selected date.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CalendarView;