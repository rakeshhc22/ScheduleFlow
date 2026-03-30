import mongoose from "mongoose";

const DayAvailabilitySchema = new mongoose.Schema(
    {
        day: {
            type: String,
            required: true,
            enum: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
            ],
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        startTime: {
            type: String,
            default: "09:00",
        },
        endTime: {
            type: String,
            default: "17:00",
        },
    },
    { _id: false }
);

const AvailabilitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        timezone: {
            type: String,
            default: "Asia/Kolkata",
        },
        weeklyAvailability: {
            type: [DayAvailabilitySchema],
            default: [
                { day: "monday", isActive: true, startTime: "09:00", endTime: "17:00" },
                { day: "tuesday", isActive: true, startTime: "09:00", endTime: "17:00" },
                { day: "wednesday", isActive: true, startTime: "09:00", endTime: "17:00" },
                { day: "thursday", isActive: true, startTime: "09:00", endTime: "17:00" },
                { day: "friday", isActive: true, startTime: "09:00", endTime: "17:00" },
                { day: "saturday", isActive: false, startTime: "09:00", endTime: "17:00" },
                { day: "sunday", isActive: false, startTime: "09:00", endTime: "17:00" },
            ],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Availability ||
    mongoose.model("Availability", AvailabilitySchema);
