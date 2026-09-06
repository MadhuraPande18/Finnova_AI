package core_banking_service.service;

import core_banking_service.entity.Account;
import core_banking_service.repository.AccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class AccountService {
    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public Account createAccount(Account account) {
        if (account.getAccountNumber() == null || account.getAccountNumber().isBlank()) {
            // Auto-generate so callers (e.g. auth-service provisioning a
            // brand-new user's first account) don't have to invent one.
            account.setAccountNumber("AC" + UUID.randomUUID().toString()
                    .replace("-", "").substring(0, 10).toUpperCase());
        }
        return accountRepository.save(account);
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public List<Account> getAccountsByUsername(String username) {
        return accountRepository.findByUsername(username);
    }

    public Account getAccountById(Long id) {
        return accountRepository.findById(id).orElse(null);
    }

    public Account updateAccount(Long id, Account updatedAccount) {
        Account existingAccount = accountRepository.findById(id).orElse(null);
        if (existingAccount == null) return null;

        existingAccount.setAccountNumber(updatedAccount.getAccountNumber());
        existingAccount.setAccountHolderName(updatedAccount.getAccountHolderName());
        existingAccount.setBalance(updatedAccount.getBalance());

        return accountRepository.save(existingAccount);
    }

    public void deleteAccount(Long id) {
        accountRepository.deleteById(id);
    }

    public Account withdraw(Long accountId, double amount) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found: " + accountId));

        if (amount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Withdrawal amount must be positive");
        }
        // This check used to silently return null on failure, which meant
        // callers (fund-transfer-service, utility-payment-service) recorded
        // the transaction as successful even when the debit never happened.
        // Throwing here turns that into a proper error response instead.
        if (account.getBalance() < amount) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient balance in account " + accountId);
        }

        account.setBalance(account.getBalance() - amount);
        return accountRepository.save(account);
    }

    public Account deposit(Long accountId, double amount) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found: " + accountId));

        if (amount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deposit amount must be positive");
        }

        account.setBalance(account.getBalance() + amount);
        return accountRepository.save(account);
    }
}
