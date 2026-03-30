import { Resend } from "resend";
import { formatDate, formatTime } from "./utils";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "ScheduleFlow <no-reply@scheduleflow.app>";

/**
 * Send booking confirmation to both host and guest.
 *
 * @param {object} params
 * @param {object} params.booking   - Saved booking doc (has .guestName, .guestEmail, .startTime, .endTime, .timezone, .notes)
 * @param {object} params.eventType - EventType doc (has .title, .duration)
 * @param {string} params.hostName  - Display name of the host
 * @param {string} params.hostEmail - Email address of the host
 */
export async function sendBookingConfirmation({ booking, eventType, hostName, hostEmail }) {
  const startDate = formatDate(booking.startTime);
  const startTime = formatTime(booking.startTime);
  const endTime = formatTime(booking.endTime);

  // Email to the GUEST
  await resend.emails.send({
    from: FROM,
    to: booking.guestEmail,
    subject: `Confirmed: ${eventType.title} with ${hostName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#7c3aed">Your meeting is confirmed!</h2>
        <p>Hi ${booking.guestName},</p>
        <p>Your <strong>${eventType.title}</strong> with <strong>${hostName}</strong> is scheduled.</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:4px 0"><strong>Date:</strong> ${startDate}</p>
          <p style="margin:4px 0"><strong>Time:</strong> ${startTime} – ${endTime} (${booking.timezone})</p>
          <p style="margin:4px 0"><strong>Duration:</strong> ${eventType.duration} minutes</p>
        </div>
        ${booking.notes ? `<p><strong>Your notes:</strong> ${booking.notes}</p>` : ""}
        <p style="color:#6b7280;font-size:13px">Powered by ScheduleFlow</p>
      </div>
    `,
  });

  // Email to the HOST
  await resend.emails.send({
    from: FROM,
    to: hostEmail,
    subject: `New booking: ${eventType.title} with ${booking.guestName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#7c3aed">New booking received!</h2>
        <p>Hi ${hostName},</p>
        <p><strong>${booking.guestName}</strong> (${booking.guestEmail}) has booked a <strong>${eventType.title}</strong>.</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:4px 0"><strong>Date:</strong> ${startDate}</p>
          <p style="margin:4px 0"><strong>Time:</strong> ${startTime} – ${endTime}</p>
          <p style="margin:4px 0"><strong>Duration:</strong> ${eventType.duration} minutes</p>
        </div>
        ${booking.notes ? `<p><strong>Guest notes:</strong> ${booking.notes}</p>` : ""}
        <p style="color:#6b7280;font-size:13px">Powered by ScheduleFlow</p>
      </div>
    `,
  });
}

/**
 * Send cancellation emails to host and guest.
 *
 * @param {object} params
 * @param {object} params.booking   - Booking doc
 * @param {object} params.eventType - EventType doc
 * @param {string} params.hostName  - Display name of the host
 * @param {string} params.hostEmail - Email address of the host (unused here but kept for consistency)
 */
export async function sendCancellationEmail({ booking, eventType, hostName, hostEmail }) {
  const startDate = formatDate(booking.startTime);
  const startTime = formatTime(booking.startTime);

  await resend.emails.send({
    from: FROM,
    to: booking.guestEmail,
    subject: `Cancelled: ${eventType.title} with ${hostName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#ef4444">Your booking has been cancelled</h2>
        <p>Hi ${booking.guestName}, your <strong>${eventType.title}</strong> on <strong>${startDate}</strong> at <strong>${startTime}</strong> has been cancelled.</p>
        <p style="color:#6b7280;font-size:13px">Powered by ScheduleFlow</p>
      </div>
    `,
  });
}