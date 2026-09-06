package utility_payment_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "core-banking-service")
public interface AccountClient {
    @PutMapping("/accounts/{id}/withdraw")
    void withdraw(@PathVariable Long id, @RequestParam double amount);
}
