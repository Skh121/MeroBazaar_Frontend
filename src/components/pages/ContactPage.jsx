import React, { useState } from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle,
  PlusIcon as Plus,
} from "lucide-react";
import axios from "axios";
import {
  contactFormSchema,
  validateForm,
  getFirstError,
} from "../../utils/validationSchemas";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Address",
    details: ["support@merobazaar.com", "info@merobazaar.com"],
    color: "#00D5BE",
  },
  {
    icon: Phone,
    title: "Phone Support",
    details: ["+977-1-4123456", "Mon-Fri: 9AM - 6PM"],
    color: "#7C86FF",
  },
  {
    icon: MapPin,
    title: "Our Location",
    details: ["Kathmandu, Nepal", "Head Office Location"],
    color: "#00D3F2",
  },
];

const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "Once your order is shipped, you will receive a tracking number via email. You can also track it directly from your 'Order History' in your profile section.",
  },
  {
    question: "What are the available payment methods?",
    answer:
      "Currently, we support eSewa for digital payments and Cash on Delivery (COD) for most locations across Nepal.",
  },
  {
    question: "How do I become a vendor on MeroBazaar?",
    answer:
      "You can click on the 'Become a Vendor' link in the footer, fill out the registration form, and our team will review your application within 2-3 business days.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return policy for most items if they are in their original packaging and unused. Check the specific product page for any exceptions.",
  },
];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  // State for Accordion
  const [openFaq, setOpenFaq] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm(contactFormSchema, formData);
    if (!validation.success) {
      setFormErrors(validation.errors);
      const firstError = getFirstError(validation.errors);
      setError(firstError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/contact`, formData);
      setSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        subject: "",
        message: "",
      });
      setFormErrors({});
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="grow bg-gray-50">
        {/* Header Section */}
        <section className="py-6">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
            <h1 className="text-3xl font-medium text-gray-900 mb-4">
              Connect With Us
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have questions about MeroBazaar, need support, or want to
              collaborate? Our dedicated team is ready to assist you.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl px-4 py-8 shadow-md border border-gray-100 border-t-4"
                  style={{ borderTopColor: info.color }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-3 border-2"
                    style={{
                      borderColor: info.color,
                      backgroundColor: `${info.color}15`,
                    }}
                  >
                    <info.icon
                      className="w-4 h-4"
                      style={{ color: info.color }}
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 text-lg mb-1">
                    {info.title}
                  </h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-xs text-gray-500">
                      {detail}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-8 pb-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-md border border-gray-100">
              <h2 className="text-xl font-medium text-gray-900 text-center mb-8">
                Send us a Message
              </h2>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <p className="text-green-700 text-sm">
                    Your message has been sent successfully! We will get back to
                    you soon.
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g., Jane Doe"
                      required
                      disabled={loading}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen focus:border-transparent transition-all disabled:bg-gray-100 ${
                        formErrors.fullName
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane.doe@example.com"
                      required
                      disabled={loading}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen focus:border-transparent transition-all disabled:bg-gray-100 ${
                        formErrors.email ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen focus:border-transparent transition-all disabled:bg-gray-100 ${
                      formErrors.subject ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {formErrors.subject && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your detailed message here..."
                    required
                    disabled={loading}
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen focus:border-transparent transition-all resize-none disabled:bg-gray-100 ${
                      formErrors.message ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {formErrors.message && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-merogreen hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-medium text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-800">
                      {faq.question}
                    </span>
                    <Plus
                      className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                        openFaq === index ? "rotate-45" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      openFaq === index
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-4 text-sm leading-relaxed text-gray-600 border-t border-gray-200 bg-white">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
