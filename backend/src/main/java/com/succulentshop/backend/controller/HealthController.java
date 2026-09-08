package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResult<Map<String, Object>>> healthCheck() {
        Map<String, Object> healthData = Map.of(
            "status", "ok",
            "service", "Sen Xinh Garden - Java Spring Boot API",
            "framework", "Spring Boot 3 + Java 21",
            "database", "PostgreSQL Database (Local)",
            "timestamp", LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(ApiResult.ok("Hệ thống hoạt động bình thường", healthData));
    }
}
