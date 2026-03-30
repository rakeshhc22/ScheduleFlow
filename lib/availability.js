import { addMinutes, format, isAfter, isBefore, parseISO, startOfDay, addDays } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

/**
 * Generate all available time slots for a given date.
 *
 * @param {Object}   availability  - Availability doc from MongoDB
 * @param {Object[]} busySlots     - Array of { start, end } from Google Calendar
 * @param {number}   duration      - Event duration in minutes
 * @param {string}   date          - ISO date string (YYYY-MM-DD) in the host's timezone
 * @param {string}   guestTimezone - IANA timezone of the guest viewing the page
 * @returns {string[]} Array of ISO datetime strings for available slots
 */
export function getAvailableSlots(availability, busySlots, duration, date, guestTimezone) {
    const hostTz = availability.timezone;
    const dayOfWeek = new Date(date + "T12:00:00").getDay(); // 0=Sun … 6=Sat

    // Find the host's working hours for this day
    const dayConfig = availability.weeklyHours.find((d) => d.day === dayOfWeek);
    if (!dayConfig || !dayConfig.isActive || dayConfig.slots.length === 0) {
        return [];
    }

    const slots = [];

    for (const timeRange of dayConfig.slots) {
        // Build start/end datetime in the host's timezone
        const rangeStart = fromZonedTime(`${date}T${timeRange.start}:00`, hostTz);
        const rangeEnd = fromZonedTime(`${date}T${timeRange.end}:00`, hostTz);

        let cursor = rangeStart;

        while (isBefore(addMinutes(cursor, duration), rangeEnd) ||
            +addMinutes(cursor, duration) === +rangeEnd) {
            const slotEnd = addMinutes(cursor, duration);

            // Skip slots in the past
            if (isBefore(cursor, new Date())) {
                cursor = addMinutes(cursor, 30);
                continue;
            }

            // Check against busy slots from Google Calendar
            const isOverlapping = busySlots.some((busy) => {
                const busyStart = new Date(busy.start);
                const busyEnd = new Date(busy.end);
                return isBefore(cursor, busyEnd) && isAfter(slotEnd, busyStart);
            });

            if (!isOverlapping) {
                // Convert the slot time to the guest's timezone before returning
                const zonedStart = toZonedTime(cursor, guestTimezone);
                slots.push(cursor.toISOString());
            }

            cursor = addMinutes(cursor, 30); // 30-minute slot grid
        }
    }

    return slots;
}

/**
 * Get all dates that have at least one available slot,
 * for the next `days` days — used to highlight calendar days.
 */
export function getAvailableDates(availability, busySlots, duration, days = 60) {
    const availableDates = [];

    for (let i = 0; i < days; i++) {
        const date = format(addDays(new Date(), i), "yyyy-MM-dd");
        const slots = getAvailableSlots(
            availability,
            busySlots,
            duration,
            date,
            availability.timezone
        );
        if (slots.length > 0) {
            availableDates.push(date);
        }
    }

    return availableDates;
}

/**
 * Convert an ISO datetime string to a display string in a given timezone.
 * e.g. "9:00 AM" in "America/New_York"
 */
export function toLocalTime(isoString, timezone) {
    const zoned = toZonedTime(new Date(isoString), timezone);
    return format(zoned, "h:mm a");
}

/**
 * Convert an ISO datetime string to a display date string.
 * e.g. "Monday, January 6, 2025"
 */
export function toLocalDate(isoString, timezone) {
    const zoned = toZonedTime(new Date(isoString), timezone);
    return format(zoned, "EEEE, MMMM d, yyyy");
}