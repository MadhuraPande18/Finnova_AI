package utility_payment_service.service;

import feign.FeignException;
import utility_payment_service.client.AccountClient;
import utility_payment_service.entity.Payment;
import utility_payment_service.repository.PaymentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final AccountClient accountClient;

    public PaymentService(PaymentRepository paymentRepository, AccountClient accountClient) {
        this.paymentRepository = paymentRepository;
        this.accountClient = accountClient;
    }

    public Payment makePayment(Payment payment) {
        // Same bug class as fund-transfer-service: withdraw()'s result was
        // being ignored, so a bill payment got marked SUCCESS and saved even
        // if the account didn't actually have the funds to cover it.
        try {
            accountClient.withdraw(payment.getAccountId(), payment.getAmount());
        } catch (FeignException e) {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Payment failed: " + e.contentUTF8());
        }
        payment.setStatus("SUCCESS");
        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id).orElse(null);
    }
}
