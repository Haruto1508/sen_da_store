package com.succulentshop.backend;

import com.succulentshop.backend.constant.MessageCode;
import com.succulentshop.backend.dto.ApiResponse;
import com.succulentshop.backend.dto.ApiResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MessageCodeTest {

    @Test
    @DisplayName("Kiểm tra các giá trị trong MessageCode enum có code và message hợp lệ")
    void testMessageCodeEnumValues() {
        for (MessageCode mc : MessageCode.values()) {
            assertNotNull(mc.getCode(), "Mã code không được null: " + mc.name());
            assertFalse(mc.getCode().isBlank(), "Mã code không được rỗng: " + mc.name());
            assertNotNull(mc.getMessage(), "Message không được null: " + mc.name());
            assertFalse(mc.getMessage().isBlank(), "Message không được rỗng: " + mc.name());
        }
    }

    @Test
    @DisplayName("Kiểm tra MessageCode đặc thù cho các nghiệp vụ chính")
    void testSpecificMessageCodes() {
        assertEquals("SUCCESS", MessageCode.SUCCESS.getCode());
        assertEquals("Thành công", MessageCode.SUCCESS.getMessage());

        assertEquals("AUTH_MSG_001", MessageCode.LOGIN_SUCCESS.getCode());
        assertEquals("Đăng nhập thành công!", MessageCode.LOGIN_SUCCESS.getMessage());

        assertEquals("PROD_MSG_001", MessageCode.PRODUCT_LIST_SUCCESS.getCode());
        assertEquals("Lấy danh sách sản phẩm thành công", MessageCode.PRODUCT_LIST_SUCCESS.getMessage());

        assertEquals("ORD_MSG_001", MessageCode.ORDER_CREATED.getCode());
        assertEquals("Đặt hàng thành công!", MessageCode.ORDER_CREATED.getMessage());

        assertEquals("CPN_MSG_001", MessageCode.COUPON_APPLIED.getCode());
        assertEquals("SHIP_MSG_001", MessageCode.SHIPPING_CONFIG_RETRIEVED.getCode());
        assertEquals("UPLOAD_MSG_001", MessageCode.IMAGE_UPLOADED.getCode());
        assertEquals("STAT_MSG_001", MessageCode.ADMIN_STATS_SUCCESS.getCode());
        assertEquals("SYS_MSG_001", MessageCode.HEALTH_CHECK_OK.getCode());
        assertEquals("CART_MSG_001", MessageCode.CART_VALIDATED.getCode());
    }

    @Test
    @DisplayName("Kiểm tra ApiResponse.ok với MessageCode")
    void testApiResponseWithMessageCode() {
        ApiResponse<Void> respWithoutData = ApiResponse.ok(MessageCode.OPERATION_SUCCESS);
        assertTrue(respWithoutData.isSuccess());
        assertEquals("MSG_002", respWithoutData.getCode());
        assertEquals("Thao tác thực hiện thành công", respWithoutData.getMessage());
        assertNull(respWithoutData.getData());

        ApiResponse<String> respWithData = ApiResponse.ok(MessageCode.ORDER_CREATED, "Mã đơn SX-12345");
        assertTrue(respWithData.isSuccess());
        assertEquals("ORD_MSG_001", respWithData.getCode());
        assertEquals("Đặt hàng thành công!", respWithData.getMessage());
        assertEquals("Mã đơn SX-12345", respWithData.getData());
    }

    @Test
    @DisplayName("Kiểm tra ApiResult.ok với MessageCode")
    void testApiResultWithMessageCode() {
        ApiResult<Void> resultWithoutData = ApiResult.ok(MessageCode.PRODUCT_DELETED);
        assertTrue(resultWithoutData.isSuccess());
        assertEquals("PROD_MSG_006", resultWithoutData.getCode());
        assertEquals("Đã xóa sản phẩm thành công (Soft Delete)", resultWithoutData.getMessage());
        assertNull(resultWithoutData.getData());

        ApiResult<Integer> resultWithData = ApiResult.ok(MessageCode.PRODUCT_STOCK_UPDATED, 42);
        assertTrue(resultWithData.isSuccess());
        assertEquals("PROD_MSG_005", resultWithData.getCode());
        assertEquals("Cập nhật tồn kho thành công", resultWithData.getMessage());
        assertEquals(42, resultWithData.getData());
    }
}
