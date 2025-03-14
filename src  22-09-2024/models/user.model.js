import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define the schema for the User model
const userSchema = new Schema(
	{
		// Username field: must be unique, lowercase, and indexed for faster searches
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true
		},
		// Email field: must be unique, lowercase, and trimmed
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		// Full name of the user, indexed for better search performance
		fullName: {
			type: String,
			required: true,
			trim: true,
			index: true
		},
		// Mobile number is required
		mobileNo: {
			type: Number,
			required: true
		},
		// Password field: required and needs validation message when missing
		password: {
			type: String,
			required: [true, 'Password is required']
		},
		// Shared ID, required for some logic in the application
		sharedId: {
			type: String,
			require: true,
			trim: true
		},
		// Field for storing the refresh token (used for authentication)
		refreshToken: {
			type: String
		},
		// Avatar URL (e.g., from Cloudinary) to store the user's profile picture
		avatar: {
			type: String,
		},
		otp: {
			type: Number,
			default: null,
		},
		// Field for storing the expiration time of the OTP
		otp_validity: {
			type: Date,
			default: null,
		},
		currency: {
			type: String,
			require: true,
			trim: true
		}
	},
	{
		// Automatically add timestamps (createdAt and updatedAt) to the model
		timestamps: true
	}
);

const withdrawalRequestSchema = new Schema({
	address: {
		type: String,
		required: true
	},
	amount: {
		type: Number,
		required: true
	},
	finalAmount: {
		type: Number,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	mobile: {
		type: String,
		required: true
	},
	dateTime: {
		type: Date,
		default: Date.now
	},
	status: {
		type: String,
		enum: ['Pending', 'Approved', 'Rejected'],
		default: 'Pending'
	}
});


// Pre-save middleware to hash the user's password before saving it to the database
userSchema.pre("save", async function (next) {
	// If the password is not modified, skip hashing and proceed
	if (!this.isModified("password")) return next();

	// Hash the password with bcrypt and a salt of 10 rounds
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Method to check if the provided password matches the stored hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
	// Compare the input password with the hashed password
	return await bcrypt.compare(password, this.password);
};

// Method to generate a JWT access token for the user
userSchema.methods.generateAccessToken = function () {
	// Sign a JWT with the user's basic information and secret key, with an expiration time
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			fullName: this.fullName
		},
		process.env.ACCESS_TOKEN_SECRET, // Secret key for signing the access token
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Access token expiry duration (from environment variable)
		}
	);
};

// Method to generate a JWT refresh token for the user
userSchema.methods.generateRefreshToken = function () {
	// Sign a refresh token with the user's ID and a separate secret key, with an expiration time
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET, // Secret key for signing the refresh token
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Refresh token expiry duration (from environment variable)
		}
	);
};




// Export the User model, which will be used to interact with the 'users' collection in MongoDB
export const User = mongoose.model("User", userSchema);
export const withdrawalRequestAmount = mongoose.model("withdrawalRequestAmount", withdrawalRequestSchema);
