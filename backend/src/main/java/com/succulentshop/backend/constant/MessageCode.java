package com.succulentshop.backend.constant;

/**
 * Mã thông báo và thông điệp thành công/thông tin chuẩn hóa cho hệ thống Sen Xinh Garden.
 * Tương tự ErrorCode, MessageCode giúp quản lý tập trung toàn bộ message hiển thị
 * trong Controller, Service và phản hồi JSON về Client.
 */
public enum MessageCode {

    // Common & System Messages
    SUCCESS("SUCCESS", "Thành công"),
    DATA_RETRIEVED("MSG_001", "Lấy dữ liệu thành công"),
    OPERATION_SUCCESS("MSG_002", "Thao tác thực hiện thành công"),

    // Auth & User Messages
    LOGIN_SUCCESS("AUTH_MSG_001", "Đăng nhập thành công!"),
    REGISTER_SUCCESS("AUTH_MSG_002", "Đăng ký thành công! Chào mừng bạn đến với Sen Xinh Garden."),
    OTP_SENT("AUTH_MSG_003", "Mã xác thực OTP đã được gửi đến email. Quý khách vui lòng kiểm tra hộp thư!"),
    PROFILE_RETRIEVED("AUTH_MSG_004", "Lấy thông tin tài khoản thành công"),
    PROFILE_UPDATED("AUTH_MSG_005", "Cập nhật thông tin tài khoản thành công"),
    PASSWORD_CHANGED("AUTH_MSG_006", "Đổi mật khẩu tài khoản thành công!"),
    ADMIN_CREATED("AUTH_MSG_007", "Tạo tài khoản quản trị viên mới thành công!"),
    USER_ROLE_UPDATED("AUTH_MSG_008", "Cập nhật phân quyền khách hàng thành công"),
    USER_STATUS_UPDATED("AUTH_MSG_009", "Cập nhật trạng thái khách hàng thành công"),
    USER_DELETED("AUTH_MSG_010", "Đã vô hiệu hóa (xóa mềm) tài khoản khách hàng thành công"),
    GOOGLE_LOGIN_SUCCESS("AUTH_MSG_011", "Đăng nhập Google thành công!"),
    CUSTOMER_LIST_RETRIEVED("AUTH_MSG_012", "Lấy danh sách khách hàng thành công"),

    // Product Messages
    PRODUCT_LIST_SUCCESS("PROD_MSG_001", "Lấy danh sách sản phẩm thành công"),
    PRODUCT_DETAIL_SUCCESS("PROD_MSG_002", "Lấy chi tiết sản phẩm thành công"),
    PRODUCT_CREATED("PROD_MSG_003", "Thêm sen đá mới thành công"),
    PRODUCT_UPDATED("PROD_MSG_004", "Cập nhật sản phẩm thành công"),
    PRODUCT_STOCK_UPDATED("PROD_MSG_005", "Cập nhật tồn kho thành công"),
    PRODUCT_DELETED("PROD_MSG_006", "Đã xóa sản phẩm thành công (Soft Delete)"),
    REVIEW_SUBMITTED("PROD_MSG_007", "Gửi đánh giá thành công! Cảm ơn phản hồi của bạn."),

    // Order Messages
    ORDER_CREATED("ORD_MSG_001", "Đặt hàng thành công!"),
    ORDER_DETAIL_SUCCESS("ORD_MSG_002", "Lấy thông tin đơn hàng thành công"),
    ORDER_LIST_SUCCESS("ORD_MSG_003", "Tải danh sách đơn hàng thành công"),
    ORDER_STATUS_UPDATED("ORD_MSG_004", "Cập nhật trạng thái đơn hàng thành công"),
    ORDER_CANCELLED("ORD_MSG_005", "Đã hủy đơn hàng thành công"),
    ORDER_RECEIVED("ORD_MSG_006", "Xác nhận đã nhận hàng thành công!"),
    ORDER_DELETED("ORD_MSG_007", "Đã xóa đơn hàng thành công"),
    ORDERS_BULK_DELETED("ORD_MSG_008", "Đã xóa các đơn hàng được chọn thành công"),

    // Coupon Messages
    COUPON_APPLIED("CPN_MSG_001", "Áp dụng mã giảm giá thành công"),
    COUPON_LIST_SUCCESS("CPN_MSG_002", "Lấy danh sách mã giảm giá thành công"),
    COUPON_CREATED("CPN_MSG_003", "Tạo mã giảm giá mới thành công"),
    COUPON_TOGGLED("CPN_MSG_004", "Cập nhật trạng thái voucher thành công"),
    COUPON_DELETED("CPN_MSG_005", "Đã xóa mã voucher thành công"),

    // Shipping Messages
    SHIPPING_CONFIG_RETRIEVED("SHIP_MSG_001", "Lấy biểu phí vận chuyển thành công"),
    SHIPPING_CONFIG_UPDATED("SHIP_MSG_002", "Cập nhật biểu phí vận chuyển thành công"),
    SHIPPING_FEE_CALCULATED("SHIP_MSG_003", "Tính phí vận chuyển thành công"),

    // Upload Messages
    IMAGE_UPLOADED("UPLOAD_MSG_001", "Tải ảnh sản phẩm lên Cloud thành công"),
    IMAGE_DELETED("UPLOAD_MSG_002", "Xóa ảnh thành công"),
    IMAGE_NOT_FOUND("UPLOAD_MSG_003", "Ảnh đã được xóa hoặc không tồn tại"),

    // Realtime & Stats & Payment
    ADMIN_STATS_SUCCESS("STAT_MSG_001", "Lấy thống kê hệ thống thành công"),
    SSE_TICKET_ISSUED("SSE_MSG_001", "Cấp ticket SSE thành công"),
    PAYMENT_CONFIRMED("PAY_MSG_001", "Xác nhận thanh toán đơn hàng thành công"),
    PAYMENT_SIMULATED("PAY_MSG_002", "Mô phỏng thanh toán chuyển khoản thành công"),
    HEALTH_CHECK_OK("SYS_MSG_001", "Hệ thống hoạt động bình thường"),
    CART_VALIDATED("CART_MSG_001", "Kiểm tra giỏ hàng thành công");

    private final String code;
    private final String message;

    MessageCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
