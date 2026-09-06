package com.javatodev.finance.ai_rag_service.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AiChatService {

    private final ChatClient chatClient;

    public AiChatService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String ask(String question) {

        return chatClient
                .prompt()
                .user(question)
                .call()
                .content();
    }
}