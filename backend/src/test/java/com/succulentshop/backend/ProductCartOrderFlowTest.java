package com.succulentshop.backend;

import com.succulentshop.backend.controller.CartController;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.CartItemValidationResult;
import com.succulentshop.backend.dto.CartValidateRequest;
import com.succulentshop.backend.dto.CartValidateResponse;
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
    private UserRepository userRepository;

    @Mock
    private CouponService couponService;

    private ProductService productService;
    private OrderService orderService;
    private CartController cartController;

    @BeforeEach
    void setUp() {
        productService = new ProductService(productRepository);
        com.succulentshop.backend.service.CartService cartService = new com.succulentshop.backend.service.CartService(productRepository);
        orderService = new OrderService(orderRepository, productService, couponService, userRepository);
        cartController = new CartController(cartService);
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

        ResponseEntity<ApiResult<CartValidateResponse>> response = cartController.validateCart(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        CartValidateResponse data = response.getBody().getData();
        assertNotNull(data);
        assertTrue(data.isValid());
        assertFalse(data.isHasUnavailableItems());
        assertFalse(data.isHasOutOfStockItems());

        List<CartItemValidationResult> items = data.getItems();
        assertEquals(1, items.size());
        assertEquals("sen-da-kim-cuong", items.get(0).getProductId());
        assertTrue(items.get(0).isAvailable());
        assertEquals("ACTIVE", items.get(0).getStatus());
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
            ResponseEntity<ApiResult<CartValidateResponse>> response = cartController.validateCart(request);
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());

            CartValidateResponse data = response.getBody().getData();
            assertFalse(data.isValid());
            assertTrue(data.isHasUnavailableItems());

            List<CartItemValidationResult> items = data.getItems();
            assertEquals(1, items.size());
            assertFalse(items.get(0).isAvailable());
            assertEquals("DELETED", items.get(0).getStatus());
            assertTrue(items.get(0).getMessage().contains("không còn được bán"));
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
        com.succulentshop.backend.dto.OrderResponse orderDetail = orderService.getOrderByCode("SX999111");

        assertNotNull(orderDetail);
        assertEquals("SX999111", orderDetail.getOrderCode());
        assertEquals("COMPLETED", orderDetail.getStatus());

        List<com.succulentshop.backend.dto.OrderItemResponse> items = orderDetail.getItems();
        assertEquals(1, items.size());
        assertEquals("sen-da-co-thu", items.get(0).getProductId());
        assertEquals("Sen Đá Cổ Thụ", items.get(0).getProductName());
        assertEquals(150000, items.get(0).getPrice()); // unitPrice tại thời điểm mua được bảo toàn nguyên vẹn
        assertEquals(1, items.get(0).getQuantity());
    }

    @Test
    @DisplayName("Case 6: Product ACTIVE và còn stock -> Checkout thành công (Option B: chưa trừ kho), chỉ trừ khi sang PAID/SHIPPING")
    void testCase6_CheckoutSuccessWhenActiveAndInStock() {
        Product p = new Product();
        p.setId("sen-da-hoa-hong");
        p.setName("Sen Đá Hoa Hồng Đen");
        p.setPrice(55000);
        p.setInStock(10);
        p.setStatus("ACTIVE");

        when(productRepository.findById("sen-da-hoa-hong")).thenReturn(Optional.of(p));
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

        com.succulentshop.backend.dto.CreateOrderResponse result = orderService.createOrder(request);

        assertNotNull(result);
        assertNotNull(result.getOrder());

        com.succulentshop.backend.dto.OrderResponse orderMap = result.getOrder();
        assertEquals("PENDING", orderMap.getStatus());
        assertEquals("Phạm Văn D", orderMap.getCustomerName());

        // Phương án B: Tại thời điểm tạo đơn, kho CHƯA bị trừ (vẫn giữ nguyên 10)
        assertEquals(10, p.getInStock());
        assertEquals(false, orderMap.getStockDeducted());

        // Khi đơn được cập nhật sang PAID / SHIPPING -> kho mới thực sự bị trừ
        Order createdOrder = new Order();
        createdOrder.setId(123L);
        createdOrder.setOrderCode(orderMap.getOrderCode());
        createdOrder.setCustomerName("Phạm Văn D");
        createdOrder.setCustomerPhone("0933445566");
        createdOrder.setStatus("PENDING");
        createdOrder.setStockDeducted(false);
        createdOrder.setTotalAmount(orderMap.getTotalAmount());
        OrderItem ordItem = new OrderItem("sen-da-hoa-hong", "Sen Đá Hoa Hồng Đen", 55000, 2, null);
        createdOrder.addItem(ordItem);

        when(orderRepository.findById(123L)).thenReturn(Optional.of(createdOrder));

        orderService.updateOrderStatus(123L, "PAID");
        assertEquals(8, p.getInStock());
        assertTrue(createdOrder.isStockDeducted());

        // Nếu chuyển tiếp sang SHIPPING -> không trừ lần 2
        orderService.updateOrderStatus(123L, "SHIPPING");
        assertEquals(8, p.getInStock());
    }

    @Test
    @DisplayName("Case 7: Hủy đơn hàng PENDING (chưa trừ kho) -> Không hoàn kho, kho giữ nguyên")
    void testCase7_CancelPendingOrderDoesNotRestoreStock() {
        Order pendingOrder = new Order();
        pendingOrder.setId(7L);
        pendingOrder.setStatus("PENDING");
        pendingOrder.setStockDeducted(false);
        pendingOrder.addItem(new OrderItem("sen-da-p7", "Sen P7", 50000, 2, null));
        when(orderRepository.findById(7L)).thenReturn(Optional.of(pendingOrder));

        orderService.cancelOrder(7L, "Customer cancelled");
        assertEquals("CANCELLED", pendingOrder.getStatus());
        assertFalse(pendingOrder.isStockDeducted());
        // Vì đơn chưa trừ kho nên không bao giờ truy vấn hay cập nhật kho sản phẩm
        verify(productRepository, never()).findById(any());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Case 8: Hủy đơn hàng đã trừ kho -> Hoàn kho chính xác 1 lần, không bị hoàn đúp khi xóa đơn")
    void testCase8_CancelPaidOrderRestoresStockSafelyOnce() {
        Product p = new Product();
        p.setId("sen-da-p8");
        p.setInStock(8); // Đã bị trừ trước đó (10 - 2 = 8)
        when(productRepository.findById("sen-da-p8")).thenReturn(Optional.of(p));

        Order paidOrder = new Order();
        paidOrder.setId(8L);
        paidOrder.setStatus("PAID");
        paidOrder.setStockDeducted(true);
        paidOrder.addItem(new OrderItem("sen-da-p8", "Sen P8", 50000, 2, null));
        when(orderRepository.findById(8L)).thenReturn(Optional.of(paidOrder));

        orderService.cancelOrder(8L, "Customer cancelled paid order");
        assertEquals("CANCELLED", paidOrder.getStatus());
        // Hoàn kho thành 10 (8 + 2 = 10)
        assertEquals(10, p.getInStock());
        assertFalse(paidOrder.isStockDeducted());

        // Thao tác xóa đơn sau đó -> không hoàn kho thêm lần nữa
        orderService.deleteOrder(8L);
        assertEquals(10, p.getInStock());
    }

    @Test
    @DisplayName("Case 9: Đơn hàng đã COMPLETED -> Chặn không cho phép hủy đơn (INVALID_REQUEST)")
    void testCase9_CancelCompletedOrderThrowsException() {
        Order completedOrder = new Order();
        completedOrder.setId(9L);
        completedOrder.setStatus("COMPLETED");
        when(orderRepository.findById(9L)).thenReturn(Optional.of(completedOrder));

        AppException ex = assertThrows(AppException.class, () -> orderService.cancelOrder(9L, "Muốn hủy"));
        assertEquals(ErrorCode.INVALID_REQUEST, ex.getErrorCode());
    }

    @Test
    @DisplayName("Case 10: Tích điểm khi đơn COMPLETED -> Chỉ tích điểm 1 lần, không cộng trùng khi confirmReceived lại")
    void testCase10_AwardLoyaltyPointsOnceOnCompleted() {
        com.succulentshop.backend.entity.User user = new com.succulentshop.backend.entity.User();
        user.setEmail("user@example.com");
        user.setPoints(0);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        Order order = new Order();
        order.setId(10L);
        order.setCustomerEmail("user@example.com");
        order.setTotalAmount(250000);
        order.setStatus("SHIPPING");
        order.setStockDeducted(true);
        order.setPointsAwarded(false);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        orderService.updateOrderStatus(10L, "COMPLETED");
        // 250,000 VND -> 25 điểm
        assertEquals(25, user.getPoints());
        assertTrue(order.isPointsAwarded());

        // Khách bấm nhận hàng hoặc hệ thống gọi confirmReceived lần nữa -> Không bị cộng đúp điểm
        orderService.confirmReceived(10L);
        assertEquals(25, user.getPoints());
    }
}
