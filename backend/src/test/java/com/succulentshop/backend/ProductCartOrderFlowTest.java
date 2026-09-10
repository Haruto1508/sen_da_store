package com.succulentshop.backend;

import com.succulentshop.backend.controller.CartController;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.CartValidateRequest;
import com.succulentshop.backend.dto.CreateOrderRequest;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.entity.OrderItem;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.exception.InsufficientStockException;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.ProductRepository;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.service.CouponService;
import com.succulentshop.backend.service.OrderService;
import com.succulentshop.backend.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductCartOrderFlowTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CouponService couponService;

    @Mock
    private UserRepository userRepository;

    private ProductService productService;
    private OrderService orderService;
    private CartController cartController;

    @BeforeEach
    void setUp() {
        productService = new ProductService(productRepository);
        orderService = new OrderService(orderRepository, productService, couponService, userRepository);
        cartController = new CartController(productRepository);
    }

    @Test
    @DisplayName("Case 1: User thêm Product ACTIVE còn hàng vào Cart -> Validate Cart thành công, available = true")
    void testCase1_UserAddsActiveProductToCart() {
        Product p = new Product();
        p.setId("sen-da-kim-cuong");
        p.setName("Sen Đá Kim Cương");
        p.setPrice(65000);
        p.setInStock(15);
        p.setStatus("ACTIVE");

        when(productRepository.findById("sen-da-kim-cuong")).thenReturn(Optional.of(p));

        CartValidateRequest request = new CartValidateRequest();
        request.setItems(List.of(new CartValidateRequest.CartItemDto("sen-da-kim-cuong", 2)));

        ResponseEntity<ApiResult<Map<String, Object>>> response = cartController.validateCart(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        Map<String, Object> data = response.getBody().getData();
        assertNotNull(data);
        assertEquals(true, data.get("valid"));
        assertEquals(false, data.get("hasUnavailableItems"));
        assertEquals(false, data.get("hasOutOfStockItems"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
        assertEquals(1, items.size());
        assertEquals("sen-da-kim-cuong", items.get(0).get("productId"));
        assertEquals(true, items.get(0).get("available"));
        assertEquals("ACTIVE", items.get(0).get("status"));
    }

    @Test
    @DisplayName("Case 2: Product bị Admin deactivate sau khi đã vào Cart -> Cart load bình thường (không 500), available = false, status = DELETED")
    void testCase2_ProductDeactivatedAfterAddedToCart_CartHandlesGracefully() {
        Product p = new Product();
        p.setId("sen-da-mong-rong");
        p.setName("Sen Đá Móng Rồng");
        p.setPrice(45000);
        p.setInStock(10);
        p.setStatus("DELETED"); // Admin đã xóa mềm

        when(productRepository.findById("sen-da-mong-rong")).thenReturn(Optional.of(p));

        CartValidateRequest request = new CartValidateRequest();
        request.setItems(List.of(new CartValidateRequest.CartItemDto("sen-da-mong-rong", 1)));

        // Không được ném lỗi 500
        assertDoesNotThrow(() -> {
            ResponseEntity<ApiResult<Map<String, Object>>> response = cartController.validateCart(request);
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());

            Map<String, Object> data = response.getBody().getData();
            assertEquals(false, data.get("valid"));
            assertEquals(true, data.get("hasUnavailableItems"));

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
            assertEquals(1, items.size());
            assertEquals(false, items.get(0).get("available"));
            assertEquals("DELETED", items.get(0).get("status"));
            assertTrue(items.get(0).get("message").toString().contains("không còn được bán"));
        });
    }

    @Test
    @DisplayName("Case 3: User checkout Cart chứa Product đã bị deactivate -> Ném PRODUCT_UNAVAILABLE, không tạo Order")
    void testCase3_CheckoutFailsWhenProductDeactivated() {
        Product p = new Product();
        p.setId("sen-da-do");
        p.setName("Sen Đá Đỏ");
        p.setPrice(50000);
        p.setInStock(20);
        p.setStatus("DELETED"); // Admin đã xóa mềm

        when(productRepository.findById("sen-da-do")).thenReturn(Optional.of(p));

        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerName("Nguyễn Văn A");
        request.setCustomerPhone("0987654321");
        request.setCustomerAddress("123 Cầu Giấy, Hà Nội");

        CreateOrderRequest.OrderItemDto itemDto = new CreateOrderRequest.OrderItemDto();
        itemDto.setId("sen-da-do");
        itemDto.setQuantity(2);
        request.setItems(List.of(itemDto));

        AppException ex = assertThrows(AppException.class, () -> orderService.createOrder(request));

        assertEquals(ErrorCode.PRODUCT_UNAVAILABLE, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("không còn được bán"));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Case 4: Product hết stock (inStock = 0 hoặc inStock < quantity) -> Ném INSUFFICIENT_STOCK, không tạo Order")
    void testCase4_CheckoutFailsWhenOutOfStock() {
        Product p = new Product();
        p.setId("sen-da-ngoc");
        p.setName("Sen Đá Ngọc");
        p.setPrice(40000);
        p.setInStock(0); // Hết hàng hoàn toàn
        p.setStatus("ACTIVE");

        when(productRepository.findById("sen-da-ngoc")).thenReturn(Optional.of(p));

        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerName("Trần Thị B");
        request.setCustomerPhone("0912345678");
        request.setCustomerAddress("456 Lê Lợi, Đà Nẵng");

        CreateOrderRequest.OrderItemDto itemDto = new CreateOrderRequest.OrderItemDto();
        itemDto.setId("sen-da-ngoc");
        itemDto.setQuantity(1);
        request.setItems(List.of(itemDto));

        InsufficientStockException ex = assertThrows(InsufficientStockException.class, () -> orderService.createOrder(request));

        assertEquals(ErrorCode.INSUFFICIENT_STOCK, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("hết hàng"));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Case 5: Product đã được mua trước đó rồi Admin deactivate -> Order cũ vẫn hiển thị đúng productName và unitPrice snapshot")
    void testCase5_HistoricalOrderPreservesSnapshotEvenIfProductDeactivated() {
        // Đơn hàng trong quá khứ lưu snapshot trong OrderItem
        Order historicalOrder = new Order();
        historicalOrder.setOrderCode("SX999111");
        historicalOrder.setCustomerName("Lê Văn C");
        historicalOrder.setCustomerPhone("0909090909");
        historicalOrder.setTotalAmount(150000);
        historicalOrder.setStatus("COMPLETED");

        OrderItem snapshotItem = new OrderItem("sen-da-co-thu", "Sen Đá Cổ Thụ", 150000, 1, "https://image.com/cothu.jpg");
        historicalOrder.addItem(snapshotItem);

        when(orderRepository.findByOrderCode("SX999111")).thenReturn(Optional.of(historicalOrder));

        // Xem lại chi tiết đơn hàng
        Map<String, Object> orderDetail = orderService.getOrderByCode("SX999111");

        assertNotNull(orderDetail);
        assertEquals("SX999111", orderDetail.get("orderCode"));
        assertEquals("COMPLETED", orderDetail.get("status"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) orderDetail.get("items");
        assertEquals(1, items.size());
        assertEquals("sen-da-co-thu", items.get(0).get("productId"));
        assertEquals("Sen Đá Cổ Thụ", items.get(0).get("productName"));
        assertEquals(150000, items.get(0).get("price")); // unitPrice tại thời điểm mua được bảo toàn nguyên vẹn
        assertEquals(1, items.get(0).get("quantity"));
    }

    @Test
    @DisplayName("Case 6: Product ACTIVE và còn stock -> Checkout thành công, trừ kho và tạo Order bình thường")
    void testCase6_CheckoutSuccessWhenActiveAndInStock() {
        Product p = new Product();
        p.setId("sen-da-hoa-hong");
        p.setName("Sen Đá Hoa Hồng Đen");
        p.setPrice(55000);
        p.setInStock(10);
        p.setStatus("ACTIVE");

        when(productRepository.findById("sen-da-hoa-hong")).thenReturn(Optional.of(p));
        when(productRepository.save(any(Product.class))).thenReturn(p);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerName("Phạm Văn D");
        request.setCustomerPhone("0933445566");
        request.setCustomerAddress("789 Nguyễn Huệ, TP.HCM");
        request.setPaymentMethod("cod");

        CreateOrderRequest.OrderItemDto itemDto = new CreateOrderRequest.OrderItemDto();
        itemDto.setId("sen-da-hoa-hong");
        itemDto.setQuantity(2);
        request.setItems(List.of(itemDto));

        Map<String, Object> result = orderService.createOrder(request);

        assertNotNull(result);
        assertNotNull(result.get("order"));

        @SuppressWarnings("unchecked")
        Map<String, Object> orderMap = (Map<String, Object>) result.get("order");
        assertEquals("PENDING", orderMap.get("status"));
        assertEquals("Phạm Văn D", orderMap.get("customerName"));

        // Kiểm tra tồn kho đã bị trừ đúng 2 cây (10 - 2 = 8)
        assertEquals(8, p.getInStock());
        verify(productRepository, atLeastOnce()).save(p);
        verify(orderRepository, times(1)).save(any(Order.class));
    }
}
