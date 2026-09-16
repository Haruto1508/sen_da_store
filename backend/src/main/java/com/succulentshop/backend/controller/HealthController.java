package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.HealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResult<HealthResponse>> healthCheck() {
        HealthResponse healthData = new HealthResponse();
        healthData.setStatus("ok");
        healthData.setService("Sen Xinh Garden - Java Spring Boot API");
        healthData.setFramework("Spring Boot 3 + Java 21");
        healthData.setDatabase("PostgreSQL Database (Local)");
        healthData.setTimestamp(LocalDateTime.now().toString());
        return ResponseEntity.ok(ApiResult.ok("Hệ thống hoạt động bình thường", healthData));
    }
}
