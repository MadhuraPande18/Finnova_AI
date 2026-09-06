package core_banking_service.controller;

import core_banking_service.entity.Account;
import core_banking_service.service.AccountService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountService.createAccount(account);
    }

    @GetMapping
    public List<Account> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    @GetMapping("/{id}")
    public Account getAccountById(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }

    // Used by the frontend dashboard so a logged-in user only ever sees
    // their own accounts instead of everyone's (getAllAccounts()).
    @GetMapping("/user/{username}")
    public List<Account> getAccountsByUsername(@PathVariable String username) {
        return accountService.getAccountsByUsername(username);
    }

    @PutMapping("/{id}")
    public Account updateAccount(@PathVariable Long id, @RequestBody Account account) {
        return accountService.updateAccount(id, account);
    }

    @DeleteMapping("/{id}")
    public String deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return "Account deleted successfully";
    }

    @PutMapping("/{id}/withdraw")
    public Account withdraw(@PathVariable Long id, @RequestParam double amount) {
        return accountService.withdraw(id, amount);
    }

    @PutMapping("/{id}/deposit")
    public Account deposit(@PathVariable Long id, @RequestParam double amount) {
        return accountService.deposit(id, amount);
    }
}
