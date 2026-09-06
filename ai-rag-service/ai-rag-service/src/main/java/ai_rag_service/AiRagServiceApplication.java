package com.javatodev.finance.ai_rag_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class AiRagServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiRagServiceApplication.class, args);
    }
}