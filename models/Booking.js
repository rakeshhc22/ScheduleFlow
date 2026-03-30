import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
    {
        eventType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EventType",
            required: true,
        },
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        guestName: {
            type: String,
            required: [true, "Guest name is required"],
            trim: true,
        },
        guestEmail: {
            type: String,
            required: [true, "Guest email is required"],
            lowercase: true,
            trim: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        timezone: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
            default: "",
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: ["confirmed", "cancelled", "completed"],
            default: "confirmed",
        },
        googleEventId: {
            type: String,
            default: null, // Filled after Google Calendar event is created
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
        cancelReason: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast lookup of a host's upcoming bookings
BookingSchema.index({ host: 1, startTime: 1 });
BookingSchema.index({ guestEmail: 1 });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);