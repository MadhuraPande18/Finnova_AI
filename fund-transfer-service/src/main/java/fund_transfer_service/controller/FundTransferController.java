package fund_transfer_service.controller;

import fund_transfer_service.entity.FundTransfer;
import fund_transfer_service.service.FundTransferService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transfers")
public class FundTransferController {

    private final FundTransferService fundTransferService;

    public FundTransferController(FundTransferService fundTransferService) {
        this.fundTransferService = fundTransferService;
    }

    // CREATE TRANSFER
    @PostMapping
    public FundTransfer createTransfer(@RequestBody FundTransfer transfer) {
        return fundTransferService.createTransfer(transfer);
    }

    // GET ALL TRANSFERS
    @GetMapping
    public List<FundTransfer> getAllTransfers() {
        return fundTransferService.getAllTransfers();
    }

    // GET ONE TRANSFER
    @GetMapping("/{id}")
    public FundTransfer getTransferById(@PathVariable Long id) {
        return fundTransferService.getTransferById(id);
    }

    // DELETE TRANSFER
    @DeleteMapping("/{id}")
    public String deleteTransfer(@PathVariable Long id) {
        fundTransferService.deleteTransfer(id);
        return "Transfer deleted successfully";
    }
}