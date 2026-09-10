package com.succulentshop.backend.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    // Common & System Codes
    SUCCESS("SUCCESS", "Thành công", HttpStatus.OK),
    UNCATEGORIZED_EXCEPTION("SYS_001", "Đã xảy ra lỗi máy chủ nội bộ", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REQUEST("REQ_001", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    REQUIRED_FIELD_MISSING("REQ_002", "Vui lòng điền đầy đủ các thông tin bắt buộc", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND("REQ_003", "Không tìm thấy tài nguyên yêu cầu", HttpStatus.NOT_FOUND),

    // Auth & User Codes
    AUTH_CREDENTIALS_REQUIRED("AUTH_001", "Vui lòng cung cấp email/SĐT và mật khẩu", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS("AUTH_002", "Email/SĐT hoặc mật khẩu không chính xác!", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS("AUTH_003", "Email này đã được sử dụng!", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND("AUTH_004", "Không tìm thấy tài khoản người dùng", HttpStatus.NOT_FOUND),
    INVALID_OTP("AUTH_005", "Mã OTP xác thực không chính xác!", HttpStatus.BAD_REQUEST),
    CURRENT_PASSWORD_INCORRECT("AUTH_006", "Mật khẩu hiện tại không chính xác!", HttpStatus.BAD_REQUEST),
    USER_ROLE_REQUIRED("AUTH_007", "Vai trò không được để trống", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_SET("AUTH_008", "Tài khoản của bạn được tạo qua Google và chưa thiết lập mật khẩu. Vui lòng thiết lập mật khẩu trước khi đăng nhập bằng Email/Mật khẩu hoặc tiếp tục Đăng nhập bằng Google.", HttpStatus.BAD_REQUEST),
    ACCOUNT_LINKING_REQUIRED("AUTH_009", "Tài khoản này yêu cầu xác thực trước khi liên kết danh tính", HttpStatus.BAD_REQUEST),

    // Product Codes
    PRODUCT_NOT_FOUND("PROD_001", "Không tìm thấy sản phẩm yêu cầu", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK("PROD_002", "Số lượng sản phẩm trong kho không đủ", HttpStatus.BAD_REQUEST),
    PRODUCT_NAME_REQUIRED("PROD_003", "Tên sen đá không được để trống", HttpStatus.BAD_REQUEST),
    INVALID_RATING("PROD_004", "Số sao đánh giá phải từ 1 đến 5 sao", HttpStatus.BAD_REQUEST),
    PRODUCT_UNAVAILABLE("PROD_005", "Sản phẩm không còn được bán hoặc đã ngừng kinh doanh", HttpStatus.BAD_REQUEST),

    // Order Codes
    ORDER_NOT_FOUND("ORD_001", "Không tìm thấy thông tin đơn hàng", HttpStatus.NOT_FOUND),
    CART_EMPTY("ORD_002", "Giỏ hàng đang trống, không thể tạo đơn hàng", HttpStatus.BAD_REQUEST),
    ORDER_CUSTOMER_INFO_REQUIRED("ORD_003", "Vui lòng cung cấp đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng", HttpStatus.BAD_REQUEST),
    ORDER_STATUS_REQUIRED("ORD_004", "Trạng thái đơn hàng không được để trống", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_STATUS("ORD_005", "Trạng thái đơn hàng không hợp lệ", HttpStatus.BAD_REQUEST),

    // Coupon Codes
    COUPON_CODE_REQUIRED("CPN_001", "Vui lòng nhập mã giảm giá", HttpStatus.BAD_REQUEST),
    COUPON_NOT_FOUND("CPN_002", "Không tìm thấy mã giảm giá", HttpStatus.NOT_FOUND),
    COUPON_INVALID_OR_EXPIRED("CPN_003", "Mã giảm giá không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    COUPON_ALREADY_EXISTS("CPN_004", "Mã giảm giá này đã tồn tại trong hệ thống", HttpStatus.BAD_REQUEST),

    // Upload Codes
    FILE_TOO_LARGE("UPLOAD_001", "Dung lượng ảnh vượt quá giới hạn cho phép", HttpStatus.BAD_REQUEST),
    FILE_TYPE_NOT_SUPPORTED("UPLOAD_002", "Định dạng file không được hỗ trợ", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
