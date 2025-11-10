/// <reference types="jasmine" />
import { 
  createPaymentGateway, 
  formatCardNumber, 
  formatExpiryDate, 
  detectCardType,
  SimulatedPaymentGateway
} from '../../services/payment.service';
import type { PaymentData } from '../../services/payment.service';

describe('PaymentService', () => {
  let paymentGateway: SimulatedPaymentGateway;

  beforeEach(() => {
    paymentGateway = createPaymentGateway() as SimulatedPaymentGateway;
  });

  describe('Card Number Validation', () => {
    it('should validate correct Visa card numbers', () => {
      expect(paymentGateway.validateCard('4111111111111111')).toBe(true);
      expect(paymentGateway.validateCard('4532015112830366')).toBe(true);
    });

    it('should validate correct Mastercard card numbers', () => {
      expect(paymentGateway.validateCardNumber('5555555555554444')).toBe(true);
      expect(paymentGateway.validateCardNumber('5105105105105100')).toBe(true);
    });

    it('should reject invalid card numbers', () => {
      expect(paymentGateway.validateCardNumber('1234567890123456')).toBe(false);
      expect(paymentGateway.validateCardNumber('4111111111111112')).toBe(false);
      expect(paymentGateway.validateCardNumber('')).toBe(false);
      expect(paymentGateway.validateCardNumber('123')).toBe(false);
    });

    it('should reject card numbers with invalid length', () => {
      expect(paymentGateway.validateCardNumber('411111111111111')).toBe(false); // 15 digits
      expect(paymentGateway.validateCardNumber('41111111111111111')).toBe(false); // 17 digits
    });
  });

  describe('Expiry Date Validation', () => {
    it('should validate future expiry dates', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6); // 6 months from now
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const year = String(futureDate.getFullYear()).slice(-2);
      
      expect(paymentGateway.validateExpiryDate(`${month}/${year}`)).toBe(true);
    });

    it('should reject past expiry dates', () => {
      expect(paymentGateway.validateExpiryDate('01/20')).toBe(false);
      expect(paymentGateway.validateExpiryDate('12/21')).toBe(false);
    });

    it('should reject invalid date formats', () => {
      expect(paymentGateway.validateExpiryDate('13/25')).toBe(false); // Invalid month
      expect(paymentGateway.validateExpiryDate('00/25')).toBe(false); // Invalid month
      expect(paymentGateway.validateExpiryDate('1/25')).toBe(false); // Single digit month
      expect(paymentGateway.validateExpiryDate('01/5')).toBe(false); // Single digit year
      expect(paymentGateway.validateExpiryDate('01-25')).toBe(false); // Wrong separator
    });
  });

  describe('CVV Validation', () => {
    it('should validate correct CVV numbers', () => {
      expect(paymentGateway.validateCVV('123')).toBe(true);
      expect(paymentGateway.validateCVV('456')).toBe(true);
      expect(paymentGateway.validateCVV('789')).toBe(true);
    });

    it('should reject invalid CVV numbers', () => {
      expect(paymentGateway.validateCVV('12')).toBe(false); // Too short
      expect(paymentGateway.validateCVV('1234')).toBe(false); // Too long
      expect(paymentGateway.validateCVV('abc')).toBe(false); // Non-numeric
      expect(paymentGateway.validateCVV('')).toBe(false); // Empty
    });
  });

  describe('Card Type Detection', () => {
    it('should detect Visa cards', () => {
      expect(detectCardType('4111111111111111')).toBe('Visa');
      expect(detectCardType('4532015112830366')).toBe('Visa');
    });

    it('should detect Mastercard cards', () => {
      expect(detectCardType('5555555555554444')).toBe('Mastercard');
      expect(detectCardType('5105105105105100')).toBe('Mastercard');
    });

    it('should return Unknown for other cards', () => {
      expect(detectCardType('378282246310005')).toBe('Unknown'); // Amex
      expect(detectCardType('1234567890123456')).toBe('Unknown');
    });
  });

  describe('Card Number Formatting', () => {
    it('should format card numbers correctly', () => {
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
      expect(formatCardNumber('4111 1111 1111 1111')).toBe('4111 1111 1111 1111');
      expect(formatCardNumber('4111111111111111extra')).toBe('4111 1111 1111 1111');
    });

    it('should handle empty and short inputs', () => {
      expect(formatCardNumber('')).toBe('');
      expect(formatCardNumber('4111')).toBe('4111');
      expect(formatCardNumber('41111')).toBe('4111 1');
    });
  });

  describe('Expiry Date Formatting', () => {
    it('should format expiry dates correctly', () => {
      expect(formatExpiryDate('1225')).toBe('12/25');
      expect(formatExpiryDate('0125')).toBe('01/25');
      expect(formatExpiryDate('1')).toBe('1');
      expect(formatExpiryDate('12')).toBe('12');
    });

    it('should handle empty input', () => {
      expect(formatExpiryDate('')).toBe('');
    });
  });

  describe('Payment Processing', () => {
    it('should process valid payments successfully', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const year = String(futureDate.getFullYear()).slice(-2);

      const paymentData: PaymentData = {
        cardNumber: '4111111111111111',
        expiryDate: `${month}/${year}`,
        cvv: '123',
        cardholderName: 'John Doe',
        amount: 10000,
        currency: 'CLP',
        description: 'Test payment'
      };

      const response = await paymentGateway.processPayment(paymentData);
      
      expect(response.success).toBe(true);
      expect(response.transactionId).toMatch(/^TXN-\d+$/);
      expect(response.message).toBe('Payment processed successfully');
    });

    it('should fail with invalid card data', async () => {
      const paymentData: PaymentData = {
        cardNumber: '1234567890123456', // Invalid card
        expiryDate: '12/25',
        cvv: '123',
        cardholderName: 'John Doe',
        amount: 10000,
        currency: 'CLP',
        description: 'Test payment'
      };

      const response = await paymentGateway.processPayment(paymentData);
      
      expect(response.success).toBe(false);
      expect(response.errorCode).toBe('INVALID_CARD');
      expect(response.message).toContain('Invalid card number');
    });

    it('should simulate random failures', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const year = String(futureDate.getFullYear()).slice(-2);

      const paymentData: PaymentData = {
        cardNumber: '4111111111111111',
        expiryDate: `${month}/${year}`,
        cvv: '123',
        cardholderName: 'John Doe',
        amount: 10000,
        currency: 'CLP',
        description: 'Test payment'
      };

      // Run multiple times to test random failure
      let successCount = 0;
      let failureCount = 0;
      
      for (let i = 0; i < 20; i++) {
        const response = await paymentGateway.processPayment(paymentData);
        if (response.success) {
          successCount++;
        } else {
          failureCount++;
        }
      }

      // Should have both successes and failures (approximately 80% success rate)
      expect(successCount).toBeGreaterThan(0);
      expect(failureCount).toBeGreaterThan(0);
      expect(successCount).toBeGreaterThan(failureCount); // More successes than failures
    });

    it('should have processing delay', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const year = String(futureDate.getFullYear()).slice(-2);

      const paymentData: PaymentData = {
        cardNumber: '4111111111111111',
        expiryDate: `${month}/${year}`,
        cvv: '123',
        cardholderName: 'John Doe',
        amount: 10000,
        currency: 'CLP',
        description: 'Test payment'
      };

      const startTime = Date.now();
      await paymentGateway.processPayment(paymentData);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should take at least 1500ms (simulated delay is 2000ms)
      expect(processingTime).toBeGreaterThan(1500);
    });
  });
});