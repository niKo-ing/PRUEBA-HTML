export class SimulatedPaymentGateway {
    successRate = 0.8; // 80% success rate for simulation
    processingDelay = 2000; // 2 seconds processing time
    async processPayment(data) {
        // Simulate processing delay
        await this.simulateDelay();
        // Validate payment data
        const validation = this.validatePaymentData(data);
        if (!validation.isValid) {
            const resp = {
                success: false,
                message: validation.message,
            };
            if (validation.errorCode)
                resp.errorCode = validation.errorCode;
            return resp;
        }
        // Simulate random success/failure
        const isSuccessful = Math.random() < this.successRate;
        if (isSuccessful) {
            return {
                success: true,
                transactionId: this.generateTransactionId(),
                message: 'Pago procesado exitosamente'
            };
        }
        else {
            return {
                success: false,
                message: 'El pago fue rechazado por el banco emisor',
                errorCode: 'PAYMENT_REJECTED'
            };
        }
    }
    validateCard(cardNumber) {
        // Remove spaces and validate format
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        // Check if it's all digits and has valid length
        if (!/^\d{13,19}$/.test(cleanCardNumber)) {
            return false;
        }
        // Luhn algorithm for basic card validation
        return this.luhnCheck(cleanCardNumber);
    }
    validateExpiry(expiryDate) {
        const [month, year] = expiryDate.split('/');
        if (!month || !year) {
            return false;
        }
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
        const currentMonth = currentDate.getMonth() + 1;
        const expMonth = parseInt(month, 10);
        const expYear = parseInt(year, 10);
        // Validate month range
        if (expMonth < 1 || expMonth > 12) {
            return false;
        }
        // Validate year (not too far in the future)
        if (expYear < currentYear || expYear > currentYear + 20) {
            return false;
        }
        // Check if card is expired
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            return false;
        }
        return true;
    }
    validateCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }
    async simulateDelay() {
        return new Promise(resolve => setTimeout(resolve, this.processingDelay));
    }
    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `TXN-${timestamp}-${random}`;
    }
    luhnCheck(cardNumber) {
        let sum = 0;
        let isEven = false;
        // Process from right to left
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            const ch = cardNumber.charAt(i);
            let digit = parseInt(ch, 10);
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            isEven = !isEven;
        }
        return sum % 10 === 0;
    }
    validatePaymentData(data) {
        if (!this.validateCard(data.cardNumber)) {
            return {
                isValid: false,
                message: 'Número de tarjeta inválido',
                errorCode: 'INVALID_CARD_NUMBER'
            };
        }
        if (!this.validateExpiry(data.expiryDate)) {
            return {
                isValid: false,
                message: 'Fecha de expiración inválida',
                errorCode: 'INVALID_EXPIRY_DATE'
            };
        }
        if (!this.validateCVV(data.cvv)) {
            return {
                isValid: false,
                message: 'CVV inválido',
                errorCode: 'INVALID_CVV'
            };
        }
        if (!data.cardholderName || data.cardholderName.trim().length < 3) {
            return {
                isValid: false,
                message: 'Nombre del titular inválido',
                errorCode: 'INVALID_CARDHOLDER_NAME'
            };
        }
        if (!data.amount || data.amount <= 0) {
            return {
                isValid: false,
                message: 'Monto de pago inválido',
                errorCode: 'INVALID_AMOUNT'
            };
        }
        return { isValid: true, message: 'Validación exitosa' };
    }
}
// Factory function to create payment gateway instance
export const createPaymentGateway = () => {
    return new SimulatedPaymentGateway();
};
// Utility functions for payment processing
export const formatCardNumber = (cardNumber) => {
    // Remove all non-digit characters
    const digits = cardNumber.replace(/\D/g, '');
    // Format in groups of 4
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};
export const formatExpiryDate = (expiry) => {
    // Remove all non-digit characters
    const digits = expiry.replace(/\D/g, '');
    // Format as MM/YY
    if (digits.length >= 2) {
        return digits.substring(0, 2) + '/' + digits.substring(2, 4);
    }
    return digits;
};
export const detectCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (/^4/.test(cleanNumber)) {
        return 'visa';
    }
    else if (/^5[1-5]/.test(cleanNumber)) {
        return 'mastercard';
    }
    else if (/^3[47]/.test(cleanNumber)) {
        return 'amex';
    }
    else if (/^6(?:011|5)/.test(cleanNumber)) {
        return 'discover';
    }
    return 'unknown';
};
