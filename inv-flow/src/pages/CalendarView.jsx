import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useData } from '../contexts/DataContext';
import Modal from '../components/Modal';
import { FileText, DollarSign, User, Users, Calendar, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Process invoices and convert them to calendar events
  useEffect(() => {
    const openEvents = openInvoices.map(invoice => ({
      id: `open-${invoice.id}`,
      title: `${invoice.customer} (${invoice.services.map(s => s.service).join(', ')})`,
      start: invoice.date,
      allDay: true,
      extendedProps: {
        status: 'open',
        invoice: invoice,
        type: 'invoice'
      },
      backgroundColor: '#ffc107', // Yellow for open invoices
      borderColor: '#e0a800',
      textColor: '#000'
    }));

    const closedEvents = closedInvoices.map(invoice => ({
      id: `closed-${invoice.id}`,
      title: `${invoice.customer} (${invoice.services.map(s => s.service).join(', ')})`,
      start: invoice.date,
      allDay: true,
      extendedProps: {
        status: 'closed',
        invoice: invoice,
        type: 'invoice'
      },
      backgroundColor: '#28a745', // Green for closed invoices
      borderColor: '#1e7e34',
      textColor: '#fff'
    }));

    setEvents([...openEvents, ...closedEvents]);
  }, [openInvoices, closedInvoices]);

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
    <div className="content-wrapper py-3 px-4">
      {/* Inject custom styles */}
      <style>{customStyles}</style>
      
      <div className="card shadow mb-4">
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
          <div className="calendar-legend d-flex justify-content-end p-2">
            <div className="d-flex align-items-center me-3">
              <span className="color-box bg-warning me-1" style={{ width: '15px', height: '15px', display: 'inline-block' }}></span>
              <span className="small">Open Invoices</span>
            </div>
            <div className="d-flex align-items-center">
              <span className="color-box bg-success me-1" style={{ width: '15px', height: '15px', display: 'inline-block' }}></span>
              <span className="small">Closed Invoices</span>
            </div>
          </div>
          <div className="p-2">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate="2025-10-15"
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
                <span className="badge bg-warning text-dark">Open Invoices</span>
                <span className="text-muted">({dateInvoices.open.length})</span>
              </h5>
              
              {dateInvoices.open.map(invoice => (
                <div className="card mb-3 border-warning" key={`open-${invoice.id}`}>
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">{invoice.number}</h6>
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
                          <strong>Persons:</strong>
                          <span className="ms-2">{invoice.persons}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <Truck size={16} className="me-2 text-primary" />
                          <strong>Driver:</strong>
                          <span className="ms-2">{invoice.driver || 'Not assigned'}</span>
                        </div>
                        <div className="d-flex align-items-center small text-muted">
                          <span className="ms-4">Contact: {getDriverContact(invoice)}</span>
                        </div>
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
                    <h6 className="mb-0 fw-bold">{invoice.number}</h6>
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
                          <strong>Persons:</strong>
                          <span className="ms-2">{invoice.persons}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <Truck size={16} className="me-2 text-primary" />
                          <strong>Driver:</strong>
                          <span className="ms-2">{invoice.driver || 'Not assigned'}</span>
                        </div>
                        <div className="d-flex align-items-center small text-muted">
                          <span className="ms-4">Contact: {getDriverContact(invoice)}</span>
                        </div>
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