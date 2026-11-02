import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePan,
  maskPan,
  validateAadhaar,
  maskAadhaar,
  validateAccountNumber,
  maskAccountNumber,
  validateMobileNumber,
  maskMobile,
  validateEmployeeEmail,
  calculateEmi,
  calculateSlaDeadline,
  isRequestOverdue,
  getEstimatedWaitTime,
  calculatePaperAndCostSavings,
  generateReferenceNumber,
} from './banking';

test('PAN validation should correctly validate Indian PAN cards', () => {
  assert.equal(validatePan('ABCDE1234F'), true);
  assert.equal(validatePan('abcde1234f'), true); // case insensitive check
  assert.equal(validatePan('12345ABCDE'), false);
  assert.equal(validatePan('ABCD1234E'), false); // 9 characters
  assert.equal(validatePan(''), false);
});

test('PAN masking should mask middle characters', () => {
  assert.equal(maskPan('ABCDE1234F'), 'ABCDXXXX4F');
  assert.equal(maskPan(''), '');
});

test('Aadhaar validation and masking', () => {
  assert.equal(validateAadhaar('1234 5678 9012'), true);
  assert.equal(validateAadhaar('123456789012'), true);
  assert.equal(validateAadhaar('12345'), false);
  assert.equal(maskAadhaar('987654321098'), 'XXXX-XXXX-1098');
});

test('Account number validation and masking', () => {
  assert.equal(validateAccountNumber('501004829104'), true);
  assert.equal(validateAccountNumber('123456789'), true);
  assert.equal(validateAccountNumber('1234'), false);
  assert.equal(maskAccountNumber('501004829104'), '•••• •••• 9104');
  assert.equal(maskAccountNumber(''), '');
});

test('Indian mobile number validation and masking', () => {
  assert.equal(validateMobileNumber('9825088292'), true);
  assert.equal(validateMobileNumber('6234567890'), true);
  assert.equal(validateMobileNumber('1234567890'), false); // starts with 1
  assert.equal(validateMobileNumber('98250'), false);
  assert.equal(maskMobile('9825088292'), '+91 98250 •••92');
});

test('Bank employee email domain validation', () => {
  assert.equal(validateEmployeeEmail('suresh.rao@janatabank.in'), true);
  assert.equal(validateEmployeeEmail('officer@prathambank.co.in'), true);
  assert.equal(validateEmployeeEmail('admin@stateapexbank.org'), true);
  assert.equal(validateEmployeeEmail('john.doe@gmail.com'), false);
  assert.equal(validateEmployeeEmail('hacker@yahoo.com'), false);
});

test('EMI calculation yields accurate values', () => {
  // Principal: 100,000, 12% per annum, 12 months
  const res = calculateEmi(100000, 12, 12);
  assert.ok(res.emi > 8800 && res.emi < 8950);
  assert.equal(res.totalPayment, res.emi * 12);
  assert.equal(res.totalInterest, res.totalPayment - 100000);
});

test('Zero interest EMI calculation', () => {
  const zeroInterest = calculateEmi(120000, 0, 12);
  assert.equal(zeroInterest.emi, 10000);
  assert.equal(zeroInterest.totalInterest, 0);
});

test('SLA deadline and overdue checks', () => {
  const submitted = '2026-10-01T10:00:00.000Z';
  const deadline = calculateSlaDeadline(submitted, 3);
  const deadlineDate = new Date(deadline);
  assert.equal(deadlineDate.getDate(), 4);

  // Check overdue logic
  assert.equal(isRequestOverdue(deadline, '2026-10-02T00:00:00.000Z'), false);
  assert.equal(isRequestOverdue(deadline, '2026-10-05T00:00:00.000Z'), true);
});

test('Queue wait time calculations with senior citizen priority', () => {
  const standardWait = getEstimatedWaitTime(6, 10, false);
  assert.equal(standardWait, 60); // 6 * 10 mins

  const priorityWait = getEstimatedWaitTime(6, 10, true);
  assert.equal(priorityWait, 20); // 2 * 10 mins priority slot
});

test('Paperless impact metrics calculations', () => {
  const impact = calculatePaperAndCostSavings(50, 20);
  assert.equal(impact.paperSheetsSaved, 240);
  assert.ok(impact.branchHoursSaved > 0);
  assert.ok(impact.costSavingsInr > 0);
});

test('Reference number generation format', () => {
  const ref = generateReferenceNumber('REQ');
  assert.match(ref, /^REQ-\d{4}-\d{6}$/);
});
