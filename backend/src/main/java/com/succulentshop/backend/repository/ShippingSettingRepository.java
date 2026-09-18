package com.succulentshop.backend.repository;

import com.succulentshop.backend.entity.ShippingSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingSettingRepository extends JpaRepository<ShippingSetting, Integer> {
}
