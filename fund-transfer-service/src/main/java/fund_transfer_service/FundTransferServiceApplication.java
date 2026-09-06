package fund_transfer_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class FundTransferServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(FundTransferServiceApplication.class, args);
    }
}