package com.succulentshop.backend.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Tiện ích chuyển đổi chuỗi tiếng Việt thành URL slug không dấu chuẩn SEO.
 */
public final class SlugUtil {

    private static final Pattern DIACRITICAL_MARKS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    private SlugUtil() {
        // Utility class
    }

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String nfdNormalizedString = Normalizer.normalize(input.trim(), Normalizer.Form.NFD);
        String noDiacritics = DIACRITICAL_MARKS.matcher(nfdNormalizedString).replaceAll("");
        return noDiacritics.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-");
    }

    public static String generateProductSlug(String name) {
        String baseSlug = toSlug(name);
        return baseSlug + "-" + (System.currentTimeMillis() % 10000);
    }
}
