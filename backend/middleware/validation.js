const { body, param, query, validationResult } = require("express-validator");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

// User validation rules
const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("phone")
    .matches(/^\+977[0-9]{10}$/)
    .withMessage("Please provide a valid Nepali phone number (+977 followed by 10 digits)"),

  body("role")
    .isIn(["VENDOR", "CENTER"])
    .withMessage("Role must be either VENDOR or CENTER"),

  // Vendor-specific validations
  body("businessName")
    .if(body("role").equals("VENDOR"))
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Business name must be between 2 and 100 characters"),

  body("panNumber")
    .if(body("role").equals("VENDOR"))
    .matches(/^[0-9]{9}$/)
    .withMessage("Please provide a valid Nepal PAN number (9 digits)"),

  // GST validation removed as per requirement
  body("gstNumber")
    .if(body("role").equals("VENDOR"))
    .optional(), // Made optional, will be verified by admin instead of real-time validation

  handleValidationErrors,
];

const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),

  // Add optional remember me field
  body("rememberMe")
    .optional()
    .isBoolean()
    .withMessage("Remember me must be a boolean value"),

  handleValidationErrors,
];

// Product validation rules
const validateProduct = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Product name must be between 2 and 200 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("category")
    .isIn([
      "Electronics",
      "Furniture",
      "Stationery",
      "Wearables",
      "Accessories",
      "Books",
      "Sports",
      "Home & Garden",
      "Automotive",
      "Health & Beauty",
    ])
    .withMessage("Please select a valid category"),

  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number"),

  body("availability")
    .isArray({ min: 1 })
    .withMessage("At least one distribution center must be specified"),

  body("availability.*.centerId")
    .isMongoId()
    .withMessage("Invalid distribution center ID"),

  body("availability.*.stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  handleValidationErrors,
];

// Order validation rules
const validateOrder = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),

  body("items.*.productId").isMongoId().withMessage("Invalid product ID"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  body("deliveryDetails.expectedDate")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid delivery date"),

  body("payment.method")
    .isIn([
      "UPI",
      "Bank Transfer",
      "Credit Card",
      "Debit Card",
      "Net Banking",
      "Cash on Delivery",
    ])
    .withMessage("Please select a valid payment method"),

  handleValidationErrors,
];

// Message validation rules
const validateMessage = [
  body("receiver").isMongoId().withMessage("Invalid receiver ID"),

  body("content")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message content must be between 1 and 2000 characters"),

  body("messageType")
    .optional()
    .isIn(["text", "image", "file", "order_update", "system"])
    .withMessage("Invalid message type"),

  handleValidationErrors,
];

// Distribution Center validation rules
const validateDistributionCenter = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Center name must be between 2 and 100 characters"),

  body("code")
    .trim()
    .isLength({ min: 2, max: 10 })
    .isAlphanumeric()
    .withMessage("Center code must be 2-10 alphanumeric characters"),

  body("location")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),

  body("region")
    .isIn([
      "North India",
      "South India",
      "East India",
      "West India",
      "Central India",
      "Northeast India",
    ])
    .withMessage("Please select a valid region"),

  body("contactPerson.name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Contact person name must be between 2 and 50 characters"),

  body("contactPerson.email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email for contact person"),

  body("contactPerson.phone")
    .isMobilePhone("en-IN")
    .withMessage("Please provide a valid phone number for contact person"),

  body("operationalDetails.capacity")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),

  handleValidationErrors,
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),

  handleValidationErrors,
];

// Query validation
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProduct,
  validateOrder,
  validateMessage,
  validateDistributionCenter,
  validateObjectId,
  validatePagination,
};
