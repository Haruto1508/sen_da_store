package com.succulentshop.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(BackendApplication.class, args);
	}

	/**
	 * Tự động nạp cấu hình từ file .env vào System Properties
	 * Giúp Spring Boot đọc được CLOUDINARY_CLOUD_NAME, SEPAY_API_KEY... mà không cần cài thêm plugin
	 */
	private static void loadDotEnv() {
		File[] possiblePaths = new File[] {
			new File(".env"),
			new File("backend/.env"),
			new File("../backend/.env")
		};

		for (File file : possiblePaths) {
			if (file.exists() && file.isFile()) {
				try (BufferedReader reader = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
					String line;
					while ((line = reader.readLine()) != null) {
						line = line.trim();
						if (line.isEmpty() || line.startsWith("#")) continue;
						int eqIdx = line.indexOf('=');
						if (eqIdx > 0) {
							String key = line.substring(0, eqIdx).trim();
							String val = line.substring(eqIdx + 1).trim();
							if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
								val = val.substring(1, val.length() - 1);
							}
							if (System.getProperty(key) == null) {
								System.setProperty(key, val);
							}
						}
					}
					System.out.println("✅ [DotEnv] Đã tự động nạp cấu hình môi trường từ: " + file.getAbsolutePath());
					break;
				} catch (Exception e) {
					System.err.println("⚠️ [DotEnv] Lỗi đọc file .env: " + e.getMessage());
				}
			}
		}
	}
}
