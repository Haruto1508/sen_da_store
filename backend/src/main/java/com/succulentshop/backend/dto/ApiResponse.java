package com.succulentshop.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.succulentshop.backend.exception.ErrorCode;

import java.time.LocalDateTime;

public class ApiResponse<T> {

    private boolean success;
    private String code;
    private String message;
    private T data;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    public ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.code = success ? ErrorCode.SUCCESS.getCode() : ErrorCode.INVALID_REQUEST.getCode();
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public ApiResponse(boolean success, String code, String message, T data) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, ErrorCode.SUCCESS.getCode(), "Thành công", data);
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, ErrorCode.SUCCESS.getCode(), message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, ErrorCode.INVALID_REQUEST.getCode(), message, null);
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(false, code, message, null);
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return new ApiResponse<>(false, errorCode.getCode(), errorCode.getMessage(), null);
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, String customMessage) {
        String msg = (customMessage != null && !customMessage.isBlank()) ? customMessage : errorCode.getMessage();
        return new ApiResponse<>(false, errorCode.getCode(), msg, null);
    }

    public static <T> ApiResponse<PageResponse<T>> paged(PageResponse<T> pageResponse) {
        return new ApiResponse<>(true, ErrorCode.SUCCESS.getCode(), "Thành công", pageResponse);
    }

    public static <T> ApiResponse<PageResponse<T>> paged(String message, PageResponse<T> pageResponse) {
        return new ApiResponse<>(true, ErrorCode.SUCCESS.getCode(), message, pageResponse);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
