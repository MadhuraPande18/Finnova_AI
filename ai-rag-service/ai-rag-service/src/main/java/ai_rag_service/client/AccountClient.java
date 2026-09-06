package com.javatodev.finance.ai_rag_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "core-banking-service")
public interface AccountClient {

    @GetMapping("/accounts")
    List<AccountResponse> getAccounts();

    record AccountResponse(
            Long id,
            String accountNumber,
            String accountHolderName,
            double balance,
            String username
    ) {}
}