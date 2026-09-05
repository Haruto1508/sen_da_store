package com.succulentshop.backend.repository;

import com.succulentshop.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    List<Product> findByCategory(String category);

    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR :category = 'all' OR p.category = :category) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.scientificName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:light IS NULL OR :light = 'all' OR p.lightType = :light) AND " +
           "(:difficulty IS NULL OR :difficulty = 'all' OR " +
           " (:difficulty = 'easy' AND p.difficultyLevel = 1) OR " +
           " (:difficulty = 'medium' AND p.difficultyLevel >= 2))")
    List<Product> filterProducts(
        @Param("category") String category,
        @Param("search") String search,
        @Param("light") String light,
        @Param("difficulty") String difficulty
    );
}
