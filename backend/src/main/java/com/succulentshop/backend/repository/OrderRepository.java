package com.succulentshop.backend.repository;

import com.succulentshop.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);
    Optional<Order> findByPublicId(String publicId);

    List<Order> findByStatusOrderByCreatedAtDesc(String status);

    List<Order> findByStatusAndCreatedAtBefore(String status, Instant cutoff);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);
    org.springframework.data.domain.Page<Order> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone, org.springframework.data.domain.Pageable pageable);

    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
    org.springframework.data.domain.Page<Order> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail, org.springframework.data.domain.Pageable pageable);

    List<Order> findByCustomerPhoneOrCustomerEmailOrderByCreatedAtDesc(String customerPhone, String customerEmail);
    org.springframework.data.domain.Page<Order> findByCustomerPhoneOrCustomerEmailOrderByCreatedAtDesc(String customerPhone, String customerEmail, org.springframework.data.domain.Pageable pageable);

    List<Order> findByCustomerPhoneContainingOrCustomerNameContainingOrderByCreatedAtDesc(String phone, String name);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE (o.customerPhone = :phone OR o.customerEmail = :email) AND (:status IS NULL OR o.status = :status) ORDER BY o.createdAt DESC")
    org.springframework.data.domain.Page<Order> findByCustomerAndStatus(@org.springframework.data.repository.query.Param("phone") String phone, @org.springframework.data.repository.query.Param("email") String email, @org.springframework.data.repository.query.Param("status") String status, org.springframework.data.domain.Pageable pageable);

    long countByStatus(String status);
}
