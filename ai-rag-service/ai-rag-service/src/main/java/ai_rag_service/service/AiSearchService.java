package com.javatodev.finance.ai_rag_service.service;

import com.javatodev.finance.ai_rag_service.client.AccountClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiSearchService {

    private final VectorStore vectorStore;
    private final AiChatService aiChatService;
    private final AccountClient accountClient;

    public AiSearchService(
            VectorStore vectorStore,
            AiChatService aiChatService,
            AccountClient accountClient) {

        this.vectorStore = vectorStore;
        this.aiChatService = aiChatService;
        this.accountClient = accountClient;
    }

    public List<Document> search(String question) {

        return vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(3)
                        .build()
        );
    }

    public String askWithRag(String question, String askingUsername) {

        // Try to get a live, authoritative snapshot of ONLY the asking
        // user's own account(s) from core-banking-service first.
        List<AccountClient.AccountResponse> ownAccounts = List.of();
        try {
            List<AccountClient.AccountResponse> liveAccounts = accountClient.getAccounts();
            ownAccounts = liveAccounts.stream()
                    .filter(a -> askingUsername != null && askingUsername.equalsIgnoreCase(a.username()))
                    .toList();
        } catch (Exception e) {
            System.out.println("Could not fetch live account data for the AI assistant: " + e.getMessage());
        }

        StringBuilder context = new StringBuilder();

        if (!ownAccounts.isEmpty()) {
            // We have the real thing for this specific user — use ONLY
            // this. Deliberately do NOT also include the vector store's
            // general similarity search results here: that store was
            // seeded from every account in the system at startup, and
            // mixing another user's data into the context at all is a
            // real leak risk in a banking app, even with an instruction
            // telling the model to ignore it — a small local model isn't
            // reliable enough at following that instruction to depend on
            // it. Scoping the actual data is the real fix.
            context.append("Current live account data for this user ")
                    .append("(authoritative — always accurate as of right now):\n");
            for (AccountClient.AccountResponse account : ownAccounts) {
                context.append("Account ").append(account.accountNumber())
                        .append(" belongs to ").append(account.accountHolderName())
                        .append(". The current account balance is ").append(account.balance())
                        .append(" rupees.\n");
            }
        } else {
            // Fallback only: no live account found for this user (e.g.
            // core-banking-service unreachable, or username wasn't passed
            // through). Fall back to the general vector store so the
            // assistant can still answer generic banking questions, but
            // this path never contains a specific balance to mis-attribute.
            List<Document> documents = search(question);
            for (Document document : documents) {
                context.append(document.getText()).append("\n");
            }
        }

        // Two instructions matter here for a small local model, which
        // otherwise tends to just recite whatever data is in context
        // regardless of what was actually asked:
        // (a) never invent or mention any account not shown above, and
        // (b) for greetings/small talk, respond naturally instead of
        //     dumping account data nobody asked for.
        String prompt =
                "You are a helpful banking assistant for a single logged-in user.\n\n" +
                        "Rules:\n" +
                        "1. Only ever mention the account/balance details explicitly given to you below. " +
                        "Never invent details, and never claim to know about any other person's account.\n" +
                        "2. If the question is a greeting or general question (e.g. \"hello\", \"how can you help me\") " +
                        "and is not actually asking for account/balance/transaction information, respond naturally and " +
                        "briefly without reciting any account numbers or balances.\n" +
                        "3. If no account data is shown below and the user asks about their balance, say plainly that " +
                        "you couldn't find their account rather than guessing.\n\n" +
                        "Context:\n" +
                        context +
                        "\nQuestion:\n" +
                        question +
                        "\n\nAnswer clearly and briefly, following the rules above.";

        return aiChatService.ask(prompt);
    }
}
