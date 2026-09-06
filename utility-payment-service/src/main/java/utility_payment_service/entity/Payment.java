package utility_payment_service.entity;

import jakarta.persistence.*;

@Entity
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long accountId;
    private String billerName;
    private String billNumber;
    private double amount;
    private String status;

    public Payment() {}

    public Payment(Long accountId, String billerName, String billNumber, double amount, String status) {
        this.accountId = accountId;
        this.billerName = billerName;
        this.billNumber = billNumber;
        this.amount = amount;
        this.status = status;
    }

    public Long getId() { return id; }
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public String getBillerName() { return billerName; }
    public void setBillerName(String billerName) { this.billerName = billerName; }
    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
