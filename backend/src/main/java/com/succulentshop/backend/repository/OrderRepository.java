package com.succulentshop.backend.repository;

import com.succulentshop.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);
    Optional<Order> findByPublicId(String publicId);

    List<Order> findByStatusOrderByCreatedAtDesc(String status);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);

    List<Order> findByCustomerPhoneContainingOrCustomerNameContainingOrderByCreatedAtDesc(String phone, String name);

    long countByStatus(String status);
}
