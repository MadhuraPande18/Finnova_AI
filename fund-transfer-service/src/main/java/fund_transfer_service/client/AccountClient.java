package fund_transfer_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "core-banking-service")
public interface AccountClient {

    @PutMapping("/accounts/{id}/withdraw")
    void withdraw(
            @PathVariable Long id,
            @RequestParam double amount
    );

    @PutMapping("/accounts/{id}/deposit")
    void deposit(
            @PathVariable Long id,
            @RequestParam double amount
    );
}