package com.javatodev.finance.ai_rag_service.service;

import com.javatodev.finance.ai_rag_service.client.AccountClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class BankingDataLoader implements CommandLineRunner {

    private final VectorStore vectorStore;
    private final AccountClient accountClient;

    public BankingDataLoader(
            VectorStore vectorStore,
            AccountClient accountClient) {

        this.vectorStore = vectorStore;
        this.accountClient = accountClient;
    }

    @Override
    public void run(String... args) {

        // This only seeds the vector store for general semantic search —
        // AiSearchService already fetches live account data fresh on every
        // question regardless (see the earlier fix), so this step is a
        // nice-to-have, never something worth crashing the whole service
        // over. That distinction matters here specifically: a
        // CommandLineRunner that throws takes down the entire Spring
        // application, not just this one step — and at startup, this
        // service calling core-banking-service over Eureka can lose a real
        // race (Eureka clients only refresh their local registry roughly
        // every 30 seconds, and several services are often starting near-
        // simultaneously via start-all.bat). A short retry absorbs that
        // race; the outer catch guarantees this never brings the service down.
        int maxAttempts = 3;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                List<AccountClient.AccountResponse> accounts =
                        accountClient.getAccounts();

                List<Document> documents = new ArrayList<>();

                for (AccountClient.AccountResponse account : accounts) {

                    String text =
                            "Account " + account.accountNumber() +
                                    " belongs to " + account.accountHolderName() +
                                    ". The current account balance is " +
                                    account.balance() + " rupees.";

                    documents.add(new Document(text));
                }

                vectorStore.add(documents);

                System.out.println(
                        "Real banking data added to Vector Store."
                );
                return;

            } catch (Exception e) {
                System.out.println("Attempt " + attempt + "/" + maxAttempts +
                        " to seed the vector store failed (this is not fatal): " + e.getMessage());
                if (attempt < maxAttempts) {
                    try {
                        Thread.sleep(5000);
                    } catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            }
        }

        System.out.println("Could not seed the vector store after " + maxAttempts +
                " attempts. Continuing anyway — the AI assistant still works correctly " +
                "since it fetches live account data on every question.");
    }
}