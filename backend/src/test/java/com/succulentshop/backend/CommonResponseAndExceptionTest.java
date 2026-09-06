package com.succulentshop.backend;

import com.succulentshop.backend.dto.ApiResponse;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.PageResponse;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.exception.InsufficientStockException;
import com.succulentshop.backend.exception.ResourceNotFoundException;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class CommonResponseAndExceptionTest {

    @Test
    @DisplayName("Kiểm tra ErrorCode và AppException")
    void testErrorCodeAndAppException() {
        AppException ex = new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
        assertEquals("REQ_002", ex.getErrorCode().getCode());
        assertEquals("Vui lòng điền đầy đủ các thông tin bắt buộc", ex.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, ex.getErrorCode().getHttpStatus());

        AppException customEx = new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy user cụ thể");
        assertEquals("AUTH_004", customEx.getErrorCode().getCode());
        assertEquals("Không tìm thấy user cụ thể", customEx.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, customEx.getErrorCode().getHttpStatus());
    }

    @Test
    @DisplayName("Kiểm tra ResourceNotFoundException và InsufficientStockException kế thừa AppException")
    void testSpecializedExceptions() {
        ResourceNotFoundException rnf = new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Sản phẩm không tồn tại");
        assertTrue(rnf instanceof AppException);
        assertEquals("PROD_001", rnf.getErrorCode().getCode());
        assertEquals("Sản phẩm không tồn tại", rnf.getMessage());

        InsufficientStockException ise = new InsufficientStockException(ErrorCode.INSUFFICIENT_STOCK, "Kho chỉ còn 2 cây");
        assertTrue(ise instanceof AppException);
        assertEquals("PROD_002", ise.getErrorCode().getCode());
        assertEquals("Kho chỉ còn 2 cây", ise.getMessage());
    }

    @Test
    @DisplayName("Kiểm tra ApiResponse với các factory methods")
    void testApiResponse() {
        ApiResponse<String> successResp = ApiResponse.ok("Dữ liệu thử nghiệm");
        assertTrue(successResp.isSuccess());
        assertEquals("SUCCESS", successResp.getCode());
        assertEquals("Thành công", successResp.getMessage());
        assertEquals("Dữ liệu thử nghiệm", successResp.getData());
        assertNotNull(successResp.getTimestamp());

        ApiResponse<Void> errResp = ApiResponse.error(ErrorCode.REQUIRED_FIELD_MISSING);
        assertFalse(errResp.isSuccess());
        assertEquals("REQ_002", errResp.getCode());
        assertEquals("Vui lòng điền đầy đủ các thông tin bắt buộc", errResp.getMessage());
        assertNull(errResp.getData());
    }

    @Test
    @DisplayName("Kiểm tra ApiResult kế thừa ApiResponse")
    void testApiResult() {
        ApiResult<String> result = ApiResult.ok("Dữ liệu ApiResult");
        assertTrue(result.isSuccess());
        assertEquals("SUCCESS", result.getCode());
        assertEquals("Thành công", result.getMessage());
        assertEquals("Dữ liệu ApiResult", result.getData());

        ApiResult<Void> err = ApiResult.error(ErrorCode.PRODUCT_NOT_FOUND);
        assertFalse(err.isSuccess());
        assertEquals("PROD_001", err.getCode());
        assertEquals("Không tìm thấy sản phẩm yêu cầu", err.getMessage());
    }

    @Test
    @DisplayName("Kiểm tra PageResponse phân trang và tính toán số trang")
    void testPageResponse() {
        List<String> items = List.of("Cây 1", "Cây 2", "Cây 3");
        PageResponse<String> pageResp = PageResponse.of(items, 0, 10, 25);

        assertEquals(3, pageResp.getContent().size());
        assertEquals(0, pageResp.getPageNumber());
        assertEquals(10, pageResp.getPageSize());
        assertEquals(25, pageResp.getTotalElements());
        assertEquals(3, pageResp.getTotalPages()); // ceil(25 / 10) = 3
        assertTrue(pageResp.isFirst());
        assertFalse(pageResp.isLast());
        assertFalse(pageResp.isEmpty());

        // Test Spring Data Page conversion
        Page<String> springPage = new PageImpl<>(items, PageRequest.of(1, 3), 10);
        PageResponse<String> fromSpring = PageResponse.from(springPage);
        assertEquals(1, fromSpring.getPageNumber());
        assertEquals(3, fromSpring.getPageSize());
        assertEquals(10, fromSpring.getTotalElements());
        assertEquals(4, fromSpring.getTotalPages());
    }

    @Test
    @DisplayName("Kiểm tra AuthService ném AppException(REQUIRED_FIELD_MISSING) khi đăng ký thiếu thông tin")
    void testAuthServiceThrowsAppException() {
        UserRepository userRepository = mock(UserRepository.class);
        AuthService authService = new AuthService(userRepository);

        AppException ex = assertThrows(AppException.class, () -> {
            authService.register(null, "test@gmail.com", "0900000000", "123456", "Hà Nội");
        });

        assertEquals(ErrorCode.REQUIRED_FIELD_MISSING, ex.getErrorCode());
        assertEquals("Vui lòng điền đầy đủ các thông tin bắt buộc", ex.getMessage());
    }
}
