import React from 'react'

const RefundCancellation = () => {
  return (
    <section className="bg-[#fffaf3] py-10 px-4 md:px-12 w-full mx-auto rounded-lg shadow-sm">
      <div className="border border-black p-4 rounded-xl shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-start">Cancellation & Refund Policy</h2>
        <p className="mb-4">
          Guests are requested to cancel reservation within the stipulated period as mentioned below to avoid
          any cancellation charges.
        </p>

        <div className="space-y-6 text-justify">
          {/* 1. Cancellation Policy */}
          <div>
            <strong>1. Cancellation Policy</strong>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Free Cancellation:</strong> Cancellations made 7 days prior to check-in are eligible for a full refund.</li>
              <li><strong>Partial Refund:</strong> Cancellations made within 3–6 days prior to check-in will incur a 50% charge of the total booking amount.</li>
              <li><strong>No Refund:</strong> Cancellations made less than 72 hours prior to check-in or in case of a no-show will not be eligible for a refund.</li>
            </ul>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>No refunds for unused nights or early check-out.</li>
              <li>No refunds for cancellation during peak season period.</li>
              <li>No refund in case the booking is cancelled due to cancellation of flights/trains/ferries or road blocks due to climatic changes/natural calamities/political disturbances, etc.</li>
              <li>The cancellation policy for some rates/offers and room category may differ from the standard cancellation policy of the hotel.</li>
            </ul>
          </div>
          <div className="mt-5">
            <strong>2. Refund Timeline </strong>
            <p className="mt-2">
           At Hotel Mahadev, we ensure a fair and transparent process for all cancellations and refunds. Eligible refunds (as per booking and cancellation terms) are processed within 2 working days of approval and credited to the original mode of payment. Depending on the bank or payment gateway, the amount may reflect in your account within 24 hours once processed.
              <br/>
            Once processed, the refund will be credited back through the original mode of payment. Please note, depending on the bank or payment gateway, the refunded amount may reflect in your account within 3 to 4 business working days.
            </p>
          </div>

          {/* 2. Arrival and Departure Policy */}
          <div>
            <strong>3. Arrival and Departure Policy</strong>
            <p className="mt-2">
              A recent Government notification requires guests to present proof of identity at the time of check in.
              Guests are requested to carry with them the required document during their travel.
            </p>
            <div className="mt-5">
              <strong>Early Arrivals and Late Departures:</strong>
              <p className="mt-2">
                If you expect to arrive early in the day and would like immediate access to your room, we recommend booking the room for the prior night to guarantee immediate access. Similarly, for late departures, reserving an additional night will guarantee access to your guest room until you depart. If you choose not to reserve, we will be glad to store your luggage while you relax in the lobby.
              </p>
            </div>
          </div>

          {/* 4. Guarantee Policy */}
          <div>
            <strong>4. Guarantee Policy</strong>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>All bookings must be guaranteed at time of reservation by Credit Card or Travel Agency. All major credit cards are accepted.</li>
              <li>At Hotel Mahadev Rishikesh, a guaranteed reservation assures you of a room even if you check in late (after 6:00 pm), on receipt of advance payment. All reservations made through the website must be guaranteed by a major credit card. Deposits are required for confirmed bookings only. Please check for full deposit requirements at time of booking.</li>
            </ul>
          </div>

          {/* 5. Credit Cards */}
          <div>
            <strong>5. Credit Cards</strong>
            <ul className="list-disc pl-6 mt-2">
              <li>Visa and MasterCard</li>
            </ul>
          </div>

          {/* 5. Child Policy */}
          <div>
            <strong>6. Child Policy</strong>
            <p className="mt-2">
              Hotel Mahadev Rishikesh charges no additional fee for children 5 years of age and younger occupying the same room as their parents or guardians (space permitting). Special rates may be available for children between 6–12 years occupying the same room as their parents or guardians. Meals for children can be availed on extra charges.
            </p>
          </div>

          {/* 6. Banking Policy */}
          <div>
            <strong>7. Banking Policy</strong>
            <p className="mt-2">
              We as a merchant shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring Bank from time to time.
            </p>
          </div>

          {/* 7. Disclaimer – Hotel Mahadev */}
          <div>
            <strong>8. Disclaimer – Hotel Mahadev</strong>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>All bookings at Hotel Mahadev are subject to availability and confirmation.</li>
              <li>The hotel reserves the right to modify, amend, or update the cancellation and refund policy without prior notice.</li>
              <li>Guests are responsible for providing accurate contact details at the time of booking. The hotel will not be held liable for any communication failure due to incorrect information.</li>
              <li>Refunds, where applicable, are processed only through the original payment method used during booking. Transaction or processing fees (if any) charged by banks/payment gateways are non-refundable.</li>
              <li>The hotel shall not be held responsible for cancellations arising due to circumstances beyond its control, including but not limited to natural disasters, pandemics, government restrictions, or transportation delays. In such cases, alternate solutions such as date changes or credit vouchers may be offered at the hotel’s discretion.</li>
              <li>By confirming a booking, guests acknowledge and agree to abide by the hotel’s policies, house rules, and terms of stay.</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <strong>Contact Information for Refund and Cancellation Related Queries:</strong>
            <p className="mt-2">
              “http://www.hotelmahadevrishikesh.com (Website)” is a registered trade mark.<br />
              <strong>PAN Number:</strong> AOPPA3234H <br />
              <strong>GST Registration Number:</strong> 05AOPPA3234H3Z7 <br />
              <strong>Phone Number:</strong> +91 1354053504, +91 9557701203, +91 9927677716 <br />
              <strong>Working Hours:</strong> 8:30 am - 18:30 pm <br />
              <strong>Email:</strong> <a href="mailto:hotelmahadev.rishikesh@gmail.com" className="text-blue-600 underline font-semibold">hotelmahadev.rishikesh@gmail.com</a> <br />
              <strong>Web:</strong> <a href="https://hotelmahadevrishikesh.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">https://hotelmahadevrishikesh.com</a> <br />
              <strong>Hotel Address:</strong> NH-7, Rishikesh Delhi Highway, Above Reliance Store, Adjacent to Neem Karoli Temple, Rishikesh 249203 (Uttarakhand)
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RefundCancellation
