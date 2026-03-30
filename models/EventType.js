import mongoose from "mongoose";

const EventTypeSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: 100,
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            maxlength: 500,
        },
        duration: {
            type: Number,
            required: true,
            enum: [15, 30, 45, 60, 90, 120], // minutes
            default: 30,
        },
        color: {
            type: String,
            default: "#7c3aed",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        location: {
            type: String,
            default: "Google Meet / Video Call",
            maxlength: 200,
        },
        questions: [
            // Custom questions to ask the guest when booking
            {
                label: { type: String, required: true },
                required: { type: Boolean, default: false },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Each owner can only have one event type per slug
EventTypeSchema.index({ owner: 1, slug: 1 }, { unique: true });

export default mongoose.models.EventType || mongoose.model("EventType", EventTypeSchema);