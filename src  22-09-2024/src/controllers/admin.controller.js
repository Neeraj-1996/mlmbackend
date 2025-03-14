// Import required modules and utilities
import { asyncHandler } from '../utils/asyncHandler.js'; // Handles async errors
import { ApiResponse } from '../utils/ApiResponse.js'; // Standard API response format
import { Admin, Events, Slider } from '../models/admin.model.js'; // Admin and Events model imports
import { User, withdrawalRequestAmount } from '../models/user.model.js'; // User model import
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Utility for uploading images to Cloudinary
import { ApiError } from '../utils/ApiError.js';

// Create an instance of ApiResponse to handle response formatting
const createResponse = new ApiResponse();

/**
 * @desc Get home data by user ID
 * @route GET /api/admin/home/:user_id
 * @access Public
 */
const getHomeData = asyncHandler(async (req, res) => {
	const { user_id: userId } = req.params;
	return createResponse.success(res, userId, 'Admin API successfully fetched');
});

/**
 * @desc Add a new product
 * @route POST /api/admin/product
 * @access Public
 */
const addProduct = asyncHandler(async (req, res) => {
	const { product_name: productName, level, ratio_between: ratioBetween, price } = req.body;

	// Validate required fields
	if ([productName, level, ratioBetween].some((field) => typeof field === 'string' && field.trim() === "")) {
		return res.status(400).json(400, {}, 'All fields are required');
	}

	// Check for product image in the request
	const productImgPath = req.files?.productImg?.[0]?.path;

	if (!productImgPath) {
		return res.status(401).json(401, {}, 'Image path Required');
		// throw new ApiError(400, "Product Image is required");
	}

	// Upload product image to Cloudinary
	const productImgObj = await uploadOnCloudinary(productImgPath);

	if (!productImgObj) {
		return res.status(401).json(401, {}, 'erron in updlading file');
		// throw new ApiError(400, "Avatar file is required");
	}

	// Create new product in the database
	const product = await Admin.create({ productName, level, ratioBetween, price, productImg: productImgObj.url });
	const addedProduct = await Admin.findById(product._id).select();

	// Return success response with the added product
	return res.status(200).json(
		new ApiResponse(200, addedProduct, 'Product added successfully')
	);
});


/**
 * @desc Add a new event
 * @route POST /api/admin/event
 * @access Public
 */
const addEvent = asyncHandler(async (req, res) => {
	const { title, start_date: startDate, end_date: endDate, description } = req.body;
	// Check for product image in the request
	const eventImgPath = req.files?.eventImg?.[0]?.path;

	// Validate required fields
	if ([title, startDate, endDate, description].some((field) => typeof field === 'string' && field.trim() === "")) {
		return res.status(400).json(400, {}, 'All fields are required');
	}

	if (!eventImgPath) {
		throw new ApiError(400, "Event Image is required");
	}

	// Upload product image to Cloudinary
	const eventImgObj = await uploadOnCloudinary(eventImgPath);

	if (!eventImgObj) {
		throw new ApiError(400, "Event file is required");
	}

	// Create new event in the database
	const event = await Events.create({ title, startDate, endDate, description, eventImg: eventImgObj.url });
	const addedEvent = await Events.findById(event._id).select();

	// Return success response with the added event
	return res.status(200).json(
		new ApiResponse(200, addedEvent, 'Event added successfully')
	);
});

const uploadSliderImage = asyncHandler(async (req, res) => {
	// Check for slider image in the request
	// const sliderImgPath = req.files?.sliderImg?.[0]?.path;
	const sliderImgPath = req.files?.sliderImg?.[0]?.path;
	console.log("sliderImgPath", sliderImgPath);

	// Validate that an image has been uploaded
	if (!sliderImgPath) {
		throw new ApiError(400, "Slider Image is required");
	}

	// Upload slider image to Cloudinary (or your preferred image service)
	const sliderImgObj = await uploadOnCloudinary(sliderImgPath);

	if (!sliderImgObj) {
		throw new ApiError(400, "Slider file is required");
	}

	// Optionally store the image URL in a database if required
	const slider = await Slider.create({ sliderImg: sliderImgObj.url });

	// Return success response with the uploaded image details
	return res.status(200).json(
		new ApiResponse(200, slider, 'Slider image uploaded successfully')
	);
});

const updateSliderImage = asyncHandler(async (req, res) => {
	const { id } = req.body;  // Get slider ID from request body

	// Ensure the slider ID is provided
	if (!id) {
		throw new ApiError(400, "Slider ID is required");
	}

	// Check for the new slider image in the request
	const sliderImgPath = req.files?.sliderImg?.[0]?.path;
	console.log("sliderImgPath", sliderImgPath);

	// Validate that a new image has been uploaded
	if (!sliderImgPath) {
		throw new ApiError(400, "Slider Image is required for update");
	}

	// Upload new slider image to Cloudinary
	const sliderImgObj = await uploadOnCloudinary(sliderImgPath);

	if (!sliderImgObj) {
		throw new ApiError(400, "Slider file upload failed");
	}

	// Find and update the slider image URL in the database
	const updatedSlider = await Slider.findByIdAndUpdate(
		id,
		{ sliderImg: sliderImgObj.url },
		{ new: true }  // Return the updated document
	);

	if (!updatedSlider) {
		throw new ApiError(404, "Slider image not found");
	}

	// Return success response with the updated slider details
	return res.status(200).json(
		new ApiResponse(200, updatedSlider, 'Slider image updated successfully')
	);
});

const getSliderImages = asyncHandler(async (req, res) => {
	const sliderImages = await Slider.find().select('sliderImg');

	// Return all slider images
	return res.status(200).json(
		new ApiResponse(200, sliderImages, 'Slider images retrieved successfully')
	);
});


const deleteSliderImage = asyncHandler(async (req, res) => {
	const { id } = req.body;  // Taking ID from the request body

	// Check if ID is provided
	if (!id) {
		throw new ApiError(400, "Slider ID is required");
	}

	// Find and delete the slider image from the database
	const deletedSlider = await Slider.findByIdAndDelete(id);

	if (!deletedSlider) {
		throw new ApiError(404, "Slider image not found");
	}

	// Optionally, delete the image from Cloudinary as well
	// await deleteFromCloudinary(deletedSlider.imageUrl);

	// Return success response
	return res.status(200).json(
		new ApiResponse(200, {}, 'Slider image deleted successfully')
	);
});



// Controller to update Events Data
const updateEvent = asyncHandler(async (req, res) => {
	const { event_id: eventId, title, start_date: startDate, end_date: endDate, description } = req.body;
	const eventImgPath = req.files?.eventImg?.[0]?.path;

	if (!eventId) {
		throw new ApiError(400, "Event id not found");
	}

	if (!startDate || !endDate || !description || !title) {
		throw new ApiError(400, "All Fields are required");
	}

	if (!eventImgPath) {
		throw new ApiError(400, "Event image is missing");
	}

	// Upload new Event Image to Cloudinary
	const eventImgObj = await uploadOnCloudinary(eventImgPath);
	if (!eventImgObj.url) {
		throw new ApiError(400, "Error while uploading Event Image");
	}

	// Update the Events Data
	const updatedEvent = await Events.findByIdAndUpdate(eventId, { $set: { title, startDate, endDate, description, eventImg: eventImgObj.url } }, { new: true }).select();

	// Return success response
	return res.status(200).json(new ApiResponse(200, updatedEvent, "Event Details updated successfully"));
});


/**
 * @desc Get all products
 * @route GET /api/admin/products
 * @access Public
 */
const getAllProduct = asyncHandler(async (req, res) => {
	// Fetch all products from the database
	const allProducts = await Admin.find();

	// Check if there are no products fetched
	if (!allProducts) {
		return res.status(200).json(
			new ApiResponse(401, {}, "Something went wrong")
		);
	}

	// Return success response with all products
	return res.status(200).json(
		new ApiResponse(200, allProducts, "Data fetched successfully")
	);
});

/**
 * @desc Get all event records
 * @route GET /api/admin/events
 * @access Public
 */
const getEventRecords = asyncHandler(async (req, res) => {
	// Fetch all event records from the database
	const userEventsRecords = await Events.find();

	// Check if there are no event records fetched
	if (!userEventsRecords) {
		return res.status(200).json(
			new ApiResponse(401, {}, "Something went wrong while getting user records")
		);
	}

	// Return success response with all event records
	return res.status(200).json(
		new ApiResponse(200, userEventsRecords, "Data fetched successfully")
	);
});

const deleteEventRecord = asyncHandler(async (req, res) => {
	const { id } = req.body;  // Get the ID from the request body

	// Validate if ID is provided
	if (!id) {
		return res.status(400).json(
			new ApiResponse(400, {}, 'Event ID is required')
		);
	}

	// Find the event by ID and delete it
	const deletedEvent = await Events.findByIdAndDelete(id);

	// If the event is not foundgit
	if (!deletedEvent) {
		return res.status(404).json(
			new ApiResponse(404, {}, 'Event not found')
		);
	}

	// Return success response
	return res.status(200).json(
		new ApiResponse(200, {}, 'Event deleted successfully')
	);
});

/**
 * @desc Get all user records
 * @route GET /api/admin/users
 * @access Public
 */
const getUserRecords = asyncHandler(async (req, res) => {
	// Fetch all user records from the database
	const userRecords = await User.find();

	// Check if there are no user records fetched
	if (!userRecords) {
		return res.status(200).json(
			new ApiResponse(401, {}, "Something went wrong while getting user records")
		);
	}

	// Return success response with all user records
	return res.status(200).json(
		new ApiResponse(200, userRecords, "Data fetched successfully")
	);
});

//all user withdrawal request 
const getAllUserWithdrawalsForAdmin = asyncHandler(async (req, res) => {
	try {
		// Fetch all withdrawal requests from the database
		const withdrawals = await withdrawalRequestAmount.find();

		// Check if there are any withdrawal requests
		if (!withdrawals || withdrawals.length === 0) {
			return res.status(404).json(new ApiResponse(404, [], 'No withdrawal requests found'));
		}

		// Send success response with the list of withdrawal requests
		return res.status(200).json(new ApiResponse(200, withdrawals, 'Withdrawal requests retrieved successfully'));
	} catch (error) {
		// Handle errors
		return res.status(500).json(new ApiResponse(500, null, 'Server error'));
	}
});

const updateWithdrawalStatusByAdmin = asyncHandler(async (req, res) => {
	const { id, status } = req.body; // Get the withdrawal request ID and status from the request body

	// Validate fields
	if (!id) {
		throw new ApiError(400, 'Withdrawal request ID is required');
	}
	if (!status) {
		throw new ApiError(400, 'Status is required');
	}

	// Only allow 'Rejected' or 'Cancelled by Admin' status for admin
	if (status !== 'Approved' && status !== 'Cancelled by Admin') {
		throw new ApiError(400, 'Invalid status value. Status must be either "Rejected" or "Cancelled by Admin"');
	}

	// Find the withdrawal request by ID and update the status
	const withdrawalRequest = await withdrawalRequestAmount.findByIdAndUpdate(
		id,
		{ status },
		{ new: true } // Return the updated document
	);

	if (!withdrawalRequest) {
		throw new ApiError(404, 'Withdrawal request not found');
	}

	// Send success response with the updated withdrawal request
	return res.status(200).json(new ApiResponse(200, withdrawalRequest, `Withdrawal request ${status} successfully`));
});


// Export the functions for use in routes
export {
	getHomeData,
	addProduct,
	getAllProduct,
	getUserRecords,
	addEvent,
	getEventRecords,
	updateEvent,
	deleteEventRecord,
	uploadSliderImage,
	getSliderImages,
	updateSliderImage,
	deleteSliderImage,
	getAllUserWithdrawalsForAdmin,
	updateWithdrawalStatusByAdmin

};
