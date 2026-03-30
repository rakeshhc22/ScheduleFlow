import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: 50,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
            match: [
                /^[a-z0-9_-]+$/,
                "Username can only contain letters, numbers, hyphens, and underscores",
            ],
        },

        password: {
            type: String,
            select: false, // never return by default
            minlength: 6,
        },

        image: {
            type: String,
            default: null,
        },

        bio: {
            type: String,
            maxlength: 200,
            default: "",
        },

        timezone: {
            type: String,
            default: "UTC",
        },

        googleId: {
            type: String,
            default: null,
        },

        accessToken: {
            type: String,
            default: null,
        },

        refreshToken: {
            type: String,
            default: null,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);


// ✅ FIXED PASSWORD HASHING (IMPORTANT)
UserSchema.pre("save", async function () {
    // Only hash if password is modified AND exists
    if (!this.isModified("password") || !this.password) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});


// ✅ Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


// ✅ Prevent model overwrite (Next.js hot reload fix)
export default mongoose.models.User || mongoose.model("User", UserSchema);