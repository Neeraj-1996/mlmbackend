import { Router } from "express";
import { getHomeData, addProduct, getAllProduct, getUserRecords, addEvent, getEventRecords, updateEvent, deleteEventRecord, uploadSliderImage, getSliderImages, updateSliderImage, deleteSliderImage, getAllUserWithdrawalsForAdmin, updateWithdrawalStatusByAdmin } from "../controllers/admin.controller.js"; // Import controller functions

import { verifyJWT } from "../middlewares/auth.middleware.js"; // Import JWT verification middleware
import { upload } from "../middlewares/multer.middleware.js"; // Import multer middleware for handling file uploads

const router = new Router(); // Initialize express router

// Route to fetch home data, protected by JWT verification
router.route('/home').get(verifyJWT, getHomeData);

// Route to add a product, protected by JWT verification
// Uses multer to handle single file upload for product image ("productImg")
router.route('/addProduct').post(verifyJWT, upload.fields([{
	name: "productImg",
	maxCount: 1
}]),
	addProduct);

// Route to add an event, protected by JWT verification
router.route('/addEvent').post(verifyJWT, upload.fields([{
	name: "eventImg",
	maxCount: 1
}]), addEvent);

// Route to get all products, protected by JWT verification
router.route('/getAllProducts').get(verifyJWT, getAllProduct);
//route add slider
router.route("/addslider").post(upload.fields([{
	name: "sliderImg",
	maxCount: 1
}]), uploadSliderImage);

// Route to get slider
router.route('/getSliderImg').get(getSliderImages);


// Route to update slider 
router.route("/updateslider").post(upload.fields([{
	name: "sliderImg",
	maxCount: 1
}]), updateSliderImage);
// Route to delete event records, protected by JWT verification
router.delete('/deleteslider', deleteSliderImage);


// Route to get all event records, protected by JWT verification
router.route('/getEventRecords').get(verifyJWT, getEventRecords);
// Route to delete event records, protected by JWT verification
router.delete('/deleteEvent', deleteEventRecord);

// Route to get all event records, protected by JWT verification
router.route('/updateEvent').post(verifyJWT, upload.fields([{
	name: "eventImg",
	maxCount: 1
}]), updateEvent);

// Route to get user records, protected by JWT verification
router.route('/getUserRecords').get(verifyJWT, getUserRecords);

//withrequest  for admin routes 
router.route('/withdrawalrequests').get(verifyJWT, getAllUserWithdrawalsForAdmin);
//update status in withdral
router.route('/withdrawalrequest/status').post(verifyJWT, updateWithdrawalStatusByAdmin);



export default router; // Export the router for use in the app
