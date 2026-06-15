import connectDB from '@/lib/connectDB';
import NewsLetter from '@/models/NewsLetter';

export async function GET() {
  await connectDB();
  try {
    const all = await NewsLetter.find({}, { email: 1, _id: 0 });
    return new Response(JSON.stringify({ success: true, emails: all.map(e => e.email) }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: 'Server error.' }), { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  try {
    const { email } = await req.json();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid email.' }), { status: 400 });
    }
    // Prevent duplicate
    const exists = await NewsLetter.findOne({ email });
    if (exists) {
      return new Response(JSON.stringify({ success: false, message: 'Email already subscribed.' }), { status: 409 });
    }
    await NewsLetter.create({ email });

    // Send welcome email via Brevo
    try {
      const apiKey = process.env.BREVO_API_KEY;
      if (apiKey) {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'Hotel Mahadev', email: 'hotelmahadev.rishikesh@gmail.com' },
            to: [{ email }],
            subject: 'Thank You for Subscribing – Get Ready for Exclusive Deals!',
            htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">

  <!-- Green Header -->
  <div style="background: #4caf50; padding: 40px 20px; text-align: center; color: white;">
    <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">Escape. Relax. Reconnect</h1>
    <p style="margin: 0; font-size: 16px;">Stay Where Nature Meets Comfort</p>
  </div>

  <!-- Welcome Message -->
  <div style="padding: 30px 20px;">
    <p style="font-size: 14px; color: #333333; font-weight: bold; line-height: 1.6;">
      Thank you for subscribing to our newsletter! You're now part of a community that values tranquility, luxury, and heartfelt hospitality.
      Nestled amidst nature’s beauty, our hotel offers more than just a place to stay — it's an experience.
    </p>

    <p style="font-size: 14px; color: #333333; font-weight: bold; line-height: 1.6;">
      Wake up to serene views, unwind with our modern amenities, and enjoy the warmth of our personalized hospitality.
    </p>

    <h3 style="font-size: 16px;color: #333333; font-weight: bold; margin-top: 20px;">What to expect from us:</h3>
    <ul style="padding-left: 20px; font-size: 14px; color: #555555;">
      <li>✅ Exclusive Offers & Seasonal Discounts</li>
      <li>✅ Travel Tips & Local Experiences</li>
      <li>✅ Special Retreat Packages</li>
      <li>✅ Early Access to Bookings & Events</li>
    </ul>

    <p style="font-size: 14px; color: #333333; font-weight: bold; line-height: 1.6; margin-top: 20px;">
      Whether you're planning a family getaway, a couple’s retreat, or a solo escape — we’re here to make every moment memorable.
      Let the journey to comfort and calm begin. Stay tuned for your first exclusive offer — coming soon!
    </p>
  </div>

  <!-- Contact Section -->
  <div style="background: #f5f5f5; border-radius: 4px; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 100%;">
    <tr>
      <!-- Logo Cell -->
      <td width="120" align="center" valign="middle" style="background: #d9d9d9; padding: 10px;">
        <span style="color: #555; font-size: 16px;">
        <img src="https://hotelmahadevrishikesh.com/logo.png" width="100" height="80" alt="Logo">
        </span>
      </td>

      <!-- Contact Info -->
      <td style="padding-left: 20px; font-family: Arial, sans-serif;">
        <div style="font-size: 16px; font-weight: bold; color: #333;">Hotel Mahadev</div>

        <table style="margin-top: 10px;">
          <tr>
            <td>
              <img src="https://cdn-icons-png.flaticon.com/512/597/597177.png" width="20" style="vertical-align: middle; margin-right: 5px;">
              <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" width="20" style="vertical-align: middle; margin-right: 5px;">
            </td>
            <td style="font-size: 14px; color: #555;">
              https://hotelmahadevrishikesh.com<br>
              <span style="font-size: 18px; font-weight: bold; color: #4a3f00;">9897515305</span>
            </td>
          </tr>
        </table>

        <div style="font-size: 13px; color: #000; margin-top: 5px; font-weight: 600;">
          Hotel Address: NH-7, Rishikesh Delhi Highway
Above Reliance Store, Adjacent to Neem Karoli Temple Rishikesh 249203 (Uttarakhand)
        </div>
      </td>
    </tr>
  </table>
</div>

<!-- Footer -->
<div style="background: #cccccc; padding: 20px 20px; text-align: center; font-family: Arial, sans-serif;">
  <div style="font-size: 14px; color: #000; font-weight: 600; margin-bottom: 5px;">
    www.hotelmahadevrishikesh.com
  </div>
  <div style="font-size: 12px; color: #333; margin-bottom: 15px;">
    You’re receiving this email because you subscribed to updates from Us.<br>
    We respect your inbox and promise only to send valuable updates.
  </div>
</div>
</div>
`
          })
        });
      } else {
        console.warn('BREVO_API_KEY not set. Email not sent.');
      }
    } catch (err) {
      // Don't fail subscription if email fails
      console.error('Failed to send welcome email:', err);
    }

    return new Response(JSON.stringify({ success: true, message: 'Subscribed successfully.' }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: 'Server error.' }), { status: 500 });
  }
}
