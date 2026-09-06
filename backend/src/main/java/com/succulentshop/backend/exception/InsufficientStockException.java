package com.succulentshop.backend.exception;

public class InsufficientStockException extends AppException {

    public InsufficientStockException(String message) {
        super(ErrorCode.INSUFFICIENT_STOCK, message);
    }

    public InsufficientStockException(ErrorCode errorCode) {
        super(errorCode);
    }

    public InsufficientStockException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
