package com.succulentshop.backend.repository;

import com.succulentshop.backend.entity.ShippingRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShippingRateRepository extends JpaRepository<ShippingRate, String> {
    Optional<ShippingRate> findByProvinceIgnoreCase(String province);
}
