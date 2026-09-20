package com.succulentshop.backend.service;

import com.succulentshop.backend.dto.ShippingConfigResponse;
import com.succulentshop.backend.dto.UpdateShippingConfigRequest;
import com.succulentshop.backend.entity.ShippingRate;
import com.succulentshop.backend.entity.ShippingSetting;
import com.succulentshop.backend.repository.ShippingRateRepository;
import com.succulentshop.backend.repository.ShippingSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShippingService {

    private final ShippingSettingRepository settingRepository;
    private final ShippingRateRepository rateRepository;

    public ShippingService(ShippingSettingRepository settingRepository,
                           ShippingRateRepository rateRepository) {
        this.settingRepository = settingRepository;
        this.rateRepository = rateRepository;
    }

    @Transactional
    public ShippingConfigResponse getShippingConfig() {
        ShippingSetting setting = getOrCreateShippingSetting();

        List<ShippingRate> rates = rateRepository.findAll();
        if (rates.isEmpty()) {
            rates = initDefaultRates();
            rateRepository.saveAll(rates);
        }

        List<ShippingConfigResponse.ShippingRateDto> rateDtos = rates.stream()
                .map(r -> new ShippingConfigResponse.ShippingRateDto(
                        r.getId(),
                        r.getProvince(),
                        r.getFee(),
                        r.getEstimatedDays(),
                        r.getNote()
                ))
                .collect(Collectors.toList());

        return new ShippingConfigResponse(
                setting.getFreeShippingEnabled(),
                setting.getFreeShippingThreshold(),
                setting.getDefaultShippingFee(),
                rateDtos
        );
    }

    @Transactional
    public ShippingConfigResponse updateShippingConfig(UpdateShippingConfigRequest req) {
        ShippingSetting setting = getOrCreateShippingSetting();

        if (req.getFreeShippingEnabled() != null) {
            setting.setFreeShippingEnabled(req.getFreeShippingEnabled());
        }
        if (req.getFreeShippingThreshold() != null) {
            setting.setFreeShippingThreshold(req.getFreeShippingThreshold());
        }
        if (req.getDefaultShippingFee() != null) {
            setting.setDefaultShippingFee(req.getDefaultShippingFee());
        }
        settingRepository.save(setting);

        if (req.getProvinceRates() != null) {
            rateRepository.deleteAll();
            List<ShippingRate> newRates = new ArrayList<>();
            for (ShippingConfigResponse.ShippingRateDto dto : req.getProvinceRates()) {
                String id = dto.getId() != null && !dto.getId().isBlank()
                        ? dto.getId()
                        : "rate_" + UUID.randomUUID().toString().substring(0, 8);
                newRates.add(new ShippingRate(
                        id,
                        dto.getProvince(),
                        dto.getFee() != null ? dto.getFee() : setting.getDefaultShippingFee(),
                        dto.getEstimatedDays(),
                        dto.getNote()
                ));
            }
            rateRepository.saveAll(newRates);
        }

        return getShippingConfig();
    }

    @Transactional(readOnly = true)
    public int calculateShippingFee(int subtotal, String city, String fullAddress) {
        ShippingSetting setting = getOrCreateShippingSetting();

        if (Boolean.TRUE.equals(setting.getFreeShippingEnabled()) && subtotal >= setting.getFreeShippingThreshold()) {
            return 0;
        }

        List<ShippingRate> rates = rateRepository.findAll();
        if (rates.isEmpty()) {
            return setting.getDefaultShippingFee() != null ? setting.getDefaultShippingFee() : 35000;
        }

        Integer matchedFee = findMatchingShippingRate(rates, city, fullAddress);
        return matchedFee != null ? matchedFee : (setting.getDefaultShippingFee() != null ? setting.getDefaultShippingFee() : 35000);
    }

    private ShippingSetting getOrCreateShippingSetting() {
        return settingRepository.findById(1).orElseGet(() -> {
            ShippingSetting defaultSetting = new ShippingSetting(1, true, 200000, 35000);
            return settingRepository.save(defaultSetting);
        });
    }

    private Integer findMatchingShippingRate(List<ShippingRate> rates, String city, String fullAddress) {
        String searchTarget = "";
        if (city != null && !city.isBlank()) {
            searchTarget += city.toLowerCase() + " ";
        }
        if (fullAddress != null && !fullAddress.isBlank()) {
            searchTarget += fullAddress.toLowerCase();
        }

        // Ưu tiên 1: Khớp chính xác tên tỉnh/thành
        for (ShippingRate rate : rates) {
            String prov = rate.getProvince().toLowerCase();
            if ("khác".equals(prov)) continue;
            if (city != null && prov.equalsIgnoreCase(city.trim())) {
                return rate.getFee();
            }
        }

        // Ưu tiên 2: Địa chỉ chứa tên tỉnh
        for (ShippingRate rate : rates) {
            String prov = rate.getProvince().toLowerCase();
            if ("khác".equals(prov)) continue;
            String cleanProv = prov.replace("tp.", "").replace("thành phố", "").replace("tỉnh", "").trim();
            if (searchTarget.contains(prov) || (!cleanProv.isEmpty() && searchTarget.contains(cleanProv))) {
                return rate.getFee();
            }
        }

        // Ưu tiên 3: Nếu có biểu phí "Khác", dùng biểu phí đó
        for (ShippingRate rate : rates) {
            if ("khác".equalsIgnoreCase(rate.getProvince().trim())) {
                return rate.getFee();
            }
        }

        return null;
    }

    private List<ShippingRate> initDefaultRates() {
        List<ShippingRate> list = new ArrayList<>();
        list.add(new ShippingRate("rate_hn", "Hà Nội", 25000, "1 - 2 ngày", "Nội & ngoại thành Hà Nội"));
        list.add(new ShippingRate("rate_hcm", "TP. Hồ Chí Minh", 30000, "2 - 3 ngày", "Toàn khu vực TP. Hồ Chí Minh"));
        list.add(new ShippingRate("rate_dl", "Đà Lạt - Lâm Đồng", 20000, "Trong ngày / 1 ngày", "Khu vực gần nhà vườn ươm"));
        list.add(new ShippingRate("rate_dn", "Đà Nẵng", 28000, "2 - 3 ngày", "Khu vực miền Trung"));
        list.add(new ShippingRate("rate_hp", "Hải Phòng", 26000, "1 - 2 ngày", "Khu vực duyên hải Bắc Bộ"));
        list.add(new ShippingRate("rate_ct", "Cần Thơ", 32000, "2 - 3 ngày", "Khu vực Tây Nam Bộ"));
        list.add(new ShippingRate("rate_bd", "Bình Dương", 28000, "2 ngày", "Khu vực Đông Nam Bộ"));
        list.add(new ShippingRate("rate_dna", "Đồng Nai", 28000, "2 ngày", "Khu vực Đông Nam Bộ"));
        list.add(new ShippingRate("rate_kh", "Khánh Hòa (Nha Trang)", 25000, "1 - 2 ngày", "Khu vực Nam Trung Bộ"));
        list.add(new ShippingRate("rate_other", "Khác", 35000, "2 - 4 ngày", "Áp dụng cho các tỉnh thành khác toàn quốc"));
        return list;
    }
}
