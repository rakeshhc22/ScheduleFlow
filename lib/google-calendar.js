import { google } from "googleapis";

/**
 * Build an authenticated Google OAuth2 client for a user.
 */
export function getOAuthClient(accessToken, refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    return oauth2Client;
}

/**
 * Fetch busy time slots from Google Calendar for a date range.
 * Returns array of { start, end } objects.
 */
export async function getBusySlots(accessToken, refreshToken, timeMin, timeMax) {
    try {
        const auth = getOAuthClient(accessToken, refreshToken);
        const calendar = google.calendar({ version: "v3", auth });

        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin: new Date(timeMin).toISOString(),
                timeMax: new Date(timeMax).toISOString(),
                items: [{ id: "primary" }],
            },
        });

        const busy = response.data.calendars?.primary?.busy || [];
        return busy;
    } catch (error) {
        console.error("Google Calendar freebusy error:", error.message);
        return []; // Gracefully return empty — don't break booking page
    }
}

/**
 * Create a calendar event after a booking is confirmed.
 * Returns the created Google Calendar event ID.
 */
export async function createCalendarEvent({
    accessToken,
    refreshToken,
    title,
    description,
    startTime,
    endTime,
    guestName,
    guestEmail,
    hostEmail,
    timezone,
}) {
    try {
        const auth = getOAuthClient(accessToken, refreshToken);
        const calendar = google.calendar({ version: "v3", auth });

        const event = {
            summary: title,
            description: description || `Scheduled via ScheduleFlow`,
            start: {
                dateTime: new Date(startTime).toISOString(),
                timeZone: timezone,
            },
            end: {
                dateTime: new Date(endTime).toISOString(),
                timeZone: timezone,
            },
            attendees: [
                { email: hostEmail },
                { email: guestEmail, displayName: guestName },
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: "email", minutes: 24 * 60 }, // 1 day before
                    { method: "popup", minutes: 30 },       // 30 min before
                ],
            },
            conferenceData: undefined, // Add Google Meet link in future
        };

        const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: event,
            sendUpdates: "all", // Send invite emails to attendees
        });

        return response.data.id;
    } catch (error) {
        console.error("Google Calendar create event error:", error.message);
        throw error;
    }
}

/**
 * Delete a calendar event (used when a booking is cancelled).
 */
export async function deleteCalendarEvent(accessToken, refreshToken, googleEventId) {
    try {
        const auth = getOAuthClient(accessToken, refreshToken);
        const calendar = google.calendar({ version: "v3", auth });

        await calendar.events.delete({
            calendarId: "primary",
            eventId: googleEventId,
            sendUpdates: "all",
        });

        return true;
    } catch (error) {
        console.error("Google Calendar delete event error:", error.message);
        return false;
    }
}