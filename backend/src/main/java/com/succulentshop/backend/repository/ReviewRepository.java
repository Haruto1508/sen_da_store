package com.succulentshop.backend.repository;

import com.succulentshop.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdOrderByCreatedAtDesc(String productId);

    List<Review> findAllByOrderByCreatedAtDesc();

    long countByProductId(String productId);
}
