package fund_transfer_service.service;
import feign.FeignException;
import fund_transfer_service.client.AccountClient;
import fund_transfer_service.entity.FundTransfer;
import fund_transfer_service.repository.FundTransferRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FundTransferService {

    private final FundTransferRepository fundTransferRepository;
    private final AccountClient accountClient;
    public FundTransferService(
            FundTransferRepository fundTransferRepository,
            AccountClient accountClient) {

        this.fundTransferRepository = fundTransferRepository;
        this.accountClient = accountClient;
    }
    // CREATE
    public FundTransfer createTransfer(FundTransfer transfer) {

        if (transfer.getFromAccountId() == null || transfer.getToAccountId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fromAccountId and toAccountId are required");
        }
        if (transfer.getFromAccountId().equals(transfer.getToAccountId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot transfer to the same account");
        }

        // Previously the return value of withdraw()/deposit() was ignored,
        // so a failed debit (e.g. insufficient balance) still resulted in
        // the transfer being saved as if it succeeded. core-banking-service
        // now returns a proper error status on failure, and we surface that
        // here instead of silently recording a transfer that never happened.
        try {
            accountClient.withdraw(transfer.getFromAccountId(), transfer.getAmount());
        } catch (FeignException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Transfer failed while debiting source account: " + e.contentUTF8());
        }

        try {
            accountClient.deposit(transfer.getToAccountId(), transfer.getAmount());
        } catch (FeignException e) {
            // Debit already happened — put the money back so we never lose funds.
            accountClient.deposit(transfer.getFromAccountId(), transfer.getAmount());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Transfer failed while crediting destination account, source was refunded: " + e.contentUTF8());
        }

        return fundTransferRepository.save(transfer);
    }

    // READ ALL
    public List<FundTransfer> getAllTransfers() {
        return fundTransferRepository.findAll();
    }

    // READ ONE
    public FundTransfer getTransferById(Long id) {
        return fundTransferRepository.findById(id).orElse(null);
    }

    // DELETE
    public void deleteTransfer(Long id) {
        fundTransferRepository.deleteById(id);
    }
}