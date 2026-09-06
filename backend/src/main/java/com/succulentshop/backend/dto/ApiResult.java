package com.succulentshop.backend.dto;

import com.succulentshop.backend.exception.ErrorCode;

/**
 * Common API Result wrapper (alias/extension of ApiResponse).
 * Provides consistent response structure across controllers.
 */
public class ApiResult<T> extends ApiResponse<T> {

    public ApiResult() {
        super();
    }

    public ApiResult(boolean success, String message, T data) {
        super(success, message, data);
    }

    public ApiResult(boolean success, String code, String message, T data) {
        super(success, code, message, data);
    }

    public static <T> ApiResult<T> ok(T data) {
        return new ApiResult<>(true, ErrorCode.SUCCESS.getCode(), "Thành công", data);
    }

    public static <T> ApiResult<T> ok(String message, T data) {
        return new ApiResult<>(true, ErrorCode.SUCCESS.getCode(), message, data);
    }

    public static <T> ApiResult<T> error(String message) {
        return new ApiResult<>(false, ErrorCode.INVALID_REQUEST.getCode(), message, null);
    }

    public static <T> ApiResult<T> error(String code, String message) {
        return new ApiResult<>(false, code, message, null);
    }

    public static <T> ApiResult<T> error(ErrorCode errorCode) {
        return new ApiResult<>(false, errorCode.getCode(), errorCode.getMessage(), null);
    }

    public static <T> ApiResult<T> error(ErrorCode errorCode, String customMessage) {
        String msg = (customMessage != null && !customMessage.isBlank()) ? customMessage : errorCode.getMessage();
        return new ApiResult<>(false, errorCode.getCode(), msg, null);
    }
}
