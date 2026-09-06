package com.javatodev.finance.auth_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "core-banking-service")
public interface AccountClient {

    @PostMapping("/accounts")
    AccountResponse createAccount(@RequestBody NewAccountRequest request);

    record NewAccountRequest(
            String accountNumber,
            String accountHolderName,
            double balance,
            String username
    ) {}

    record AccountResponse(
            Long id,
            String accountNumber,
            String accountHolderName,
            double balance,
            String username
    ) {}
}
