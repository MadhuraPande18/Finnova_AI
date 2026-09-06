package com.javatodev.finance.ai_rag_service.controller;

import com.javatodev.finance.ai_rag_service.service.AiChatService;
import com.javatodev.finance.ai_rag_service.service.AiSearchService;
import org.springframework.ai.document.Document;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiChatService aiChatService;
    private final AiSearchService aiSearchService;

    public AiController(
            AiChatService aiChatService,
            AiSearchService aiSearchService) {

        this.aiChatService = aiChatService;
        this.aiSearchService = aiSearchService;
    }

    @GetMapping("/hello")
    public String hello() {
        return "AI RAG Service is working!";
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String question) {
        return aiChatService.ask(question);
    }

    @GetMapping("/search")
    public List<Document> search(@RequestParam String question) {
        return aiSearchService.search(question);
    }

    @GetMapping("/rag")
    public String rag(@RequestParam String question, @RequestParam(required = false) String username) {
        return aiSearchService.askWithRag(question, username);
    }
}