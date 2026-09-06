package fund_transfer_service.repository;

import fund_transfer_service.entity.FundTransfer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FundTransferRepository extends JpaRepository<FundTransfer, Long> {
}