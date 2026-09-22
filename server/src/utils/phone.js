// 10-digit number with an optional country code: "9876543210", "+91 9876543210", "+91-9876543210"
const PHONE_REGEX = /^(\+\d{1,3}[-\s]?)?\d{10}$/;

const PHONE_MESSAGE = 'Enter a 10-digit phone number (with an optional country code, e.g. +91 9876543210)';

module.exports = { PHONE_REGEX, PHONE_MESSAGE };
