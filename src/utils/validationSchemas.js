import { z } from "zod";

// Helper function to format price to max 2 decimal places
export const formatPrice = (value) => {
  if (!value && value !== 0) return "";
  const num = parseFloat(value);
  if (isNaN(num)) return "";
  // Round to 2 decimal places
  return Math.round(num * 100) / 100;
};

// Helper function to validate and format price input
export const sanitizePriceInput = (value) => {
  if (!value) return "";
  // Remove any non-numeric characters except decimal point
  let sanitized = value.toString().replace(/[^\d.]/g, "");
  // Ensure only one decimal point
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    sanitized = parts[0] + "." + parts.slice(1).join("");
  }
  // Limit to 2 decimal places
  if (parts.length === 2 && parts[1].length > 2) {
    sanitized = parts[0] + "." + parts[1].substring(0, 2);
  }
  return sanitized;
};

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(/^[+]?[\d\s-]+$/, "Please enter a valid phone number");

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name is too long");

// Price schema - ensures valid price format with max 2 decimal places
export const priceSchema = z
  .string()
  .min(1, "Price is required")
  .refine((val) => !isNaN(parseFloat(val)), "Please enter a valid number")
  .refine((val) => parseFloat(val) >= 0, "Price cannot be negative")
  .refine((val) => {
    const parts = val.split(".");
    return parts.length === 1 || parts[1].length <= 2;
  }, "Price can have maximum 2 decimal places")
  .transform((val) => formatPrice(val));

export const optionalPriceSchema = z
  .string()
  .refine((val) => !val || !isNaN(parseFloat(val)), "Please enter a valid number")
  .refine((val) => !val || parseFloat(val) >= 0, "Price cannot be negative")
  .refine((val) => {
    if (!val) return true;
    const parts = val.split(".");
    return parts.length === 1 || parts[1].length <= 2;
  }, "Price can have maximum 2 decimal places")
  .transform((val) => (val ? formatPrice(val) : null));

// Stock/quantity schema - positive integers only
export const stockSchema = z
  .string()
  .min(1, "Stock is required")
  .refine((val) => !isNaN(parseInt(val)), "Please enter a valid number")
  .refine((val) => parseInt(val) >= 0, "Stock cannot be negative")
  .refine((val) => Number.isInteger(parseFloat(val)), "Stock must be a whole number");

export const quantitySchema = z
  .number()
  .int("Quantity must be a whole number")
  .min(1, "Quantity must be at least 1")
  .max(9999, "Quantity is too large");

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    fullName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreed: z.boolean().refine((val) => val === true, "You must agree to the Terms of Service"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordEmailSchema = z.object({
  email: emailSchema,
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Product schema with price validation
export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(200, "Product name is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description is too long"),
  price: priceSchema,
  comparePrice: optionalPriceSchema,
  category: z.string().min(1, "Please select a category"),
  stock: stockSchema,
  unit: z.string().min(1, "Please select a unit"),
  badge: z.string().optional(),
  isFeatured: z.boolean(),
  isRegionalSpecialty: z.boolean(),
  tags: z.string().optional(),
});

// Vendor signup schema (multi-step form)
export const vendorStep1Schema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  panNumber: z.string().min(9, "PAN Number must be at least 9 digits"),
  phone: phoneSchema,
});

export const vendorStep2Schema = z.object({
  ownerName: nameSchema,
  email: emailSchema,
});

export const vendorStep3Schema = z.object({
  province: z.string().min(1, "Please select a province"),
  district: z.string().min(2, "District is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

export const vendorStep4Schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreed: z.boolean().refine((val) => val === true, "You must agree to the Terms & Conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Shipping address schema
export const shippingAddressSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code must be at least 4 characters").regex(/^\d+$/, "Postal code must contain only numbers"),
});

// Contact form schema
export const contactFormSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message is too long"),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Helper function to validate and get first error
export const validateForm = (schema, data) => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }

  // Format errors into a simple object
  // Zod uses 'issues' not 'errors'
  const errors = {};
  result.error.issues.forEach((err) => {
    const field = err.path.join(".") || "_root";
    if (!errors[field]) {
      errors[field] = err.message;
    }
  });

  return { success: false, data: null, errors };
};

// Get first error message from validation result
export const getFirstError = (errors) => {
  if (!errors) return null;
  const firstKey = Object.keys(errors)[0];
  return errors[firstKey] || null;
};
