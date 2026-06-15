import React from "react";
export default function BeautifulInvoice({ booking, bookingId, bookingDate,invoiceNumber }) {
  // Helper for formatting
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB");
  };

  // Extract booking details
  const guest = booking || {};
  const hotel = {
    name: "Hotel Mahadev Rishikesh",
    address: "Rishikesh, Uttarakhand 249201, India",
    phone: "+91 9927677716",
    email: "hotelmahadev.rishikesh@gmail.com",
  };

  // Example: you may want to adjust these fields to match your backend
  const items = [
    {
      name: guest.packageName || guest.roomName || "Package/Room Name",
      days: `${guest.days || 1} Nights`,
      numPersons: guest.numPersons || guest.numPerson || 1,
      amount: booking?.finalAmount || 0,
    },
    ...(booking?.priceBreakdown?.extraBed
      ? [
          {
            name: "Extra Bed",
            days: `Rs.${booking?.priceBreakdown?.extraBed?.amount}`,
            numPersons: '',
            amount: booking?.priceBreakdown?.extraBed?.amount,
          },
        ]
      : [])
  ];
  return (
    <div style={{ fontFamily: 'Barlow, Arial, sans-serif', background: '#fff', color: '#222', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 24px #0001', maxWidth: 600, margin: '0 auto', border: '1px solid #e5e7eb' }}>
      {/* Header */}
      <div style={{ background: 'white', color: 'black', padding: 24, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',gap:"5px" }}>
          <div> 
            <img src="https://www.hotelmahadevrishikesh.com/logo.png" alt="Logo" style={{ height: 40, marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>HOTEL MAHDEV RISHIKESH</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{hotel.phone}</div> 
             <div style={{ fontSize: 13, marginTop: 4 }}>{hotel.email}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 14 }}>
            <div><b>Invoice No:</b> <span style={{ color: '#3be0a9' }}>{invoiceNumber}</span></div>
            <div><b>Invoice Date:</b> {formatDate(bookingDate)}</div>
          </div>
        </div>
      </div>
      {/* Guest & Hotel Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', fontSize: 15 }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Guest Info</div>
          <div style={{ fontWeight: 600 }}>{guest.firstName} {guest.lastName}</div>
          <div>Phone: {guest.callNo}</div>
          <div>Email: {guest.email}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Hotel Details</div>
          <div style={{ fontWeight: 600 }}>{hotel.name}</div>
          <div>{hotel.address}</div>
        </div>
      </div>
      {/* Booking Details */}
      <div style={{ display: 'flex', flexDirection:"column", justifyContent: 'space-between', padding: '24px', fontSize: 14 }}>
        <div>
          <div><b>Booking ID:</b> {bookingId}</div>
        </div>
        <br/>
        <div>
          <div><b>Check In:</b> {formatDate(guest.arrival)}</div>
        </div>
      </div>
      {/* Items Table */}
      <div style={{ padding: '16px 24px 0 24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f7f7f7', color: '#222' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
             {guest.days &&(
              <th style={{ textAlign: 'right', padding: 8 }}>Days</th>
              )}
              {guest.numPersons &&(
              <th style={{ textAlign: 'right', padding: 8 }}>No of Person</th>
              )}
              <th style={{ textAlign: 'right', padding: 8 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderTop: '1px solid #ececec' }}>
                <td style={{ padding: 8 }}>{item.name}</td>
                {guest.days &&(
                <td style={{ padding: 8, textAlign: 'right' }}>{item.days}</td>
                )}
                {guest.numPersons &&(
                <td style={{ padding: 8, textAlign: 'right' }}>{item.numPersons}</td>
                )}
                <td style={{ padding: 8, textAlign: 'right' }}>{item.amount < 0 ? '-' : ''}₹{Math.abs(item.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      {/* Additional Info */}
      <div style={{ padding: '16px 24px 0 24px', fontSize: 15, fontWeight: 600, color: '#666' }}>
        <div><b>Additional Information:</b></div>
        <div>{guest.specialReq || 'No special requirements.'}</div>
      </div>
      </div>   
      {/* Note */}
      <div style={{ background: '#181a22', color: '#fff', fontSize: 13, padding: 12, textAlign: 'center', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
        <span style={{ color: '#00e3a9', fontWeight: 600 }}>Note:</span> This is a computer generated receipt and does not require physical signature.
      </div>
    </div>
  );
}
