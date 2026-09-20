import { useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE, getAdminSseTicket, USE_MOCK_DATA } from '../services/api';

/**
 * Custom React hook for Admin Realtime Order Notifications via Server-Sent Events (SSE).
 *
 * Nhận thông báo thời gian thực khi:
 * - Khách hàng đặt đơn hàng mới: ORDER_CREATED
 * - Trạng thái đơn hàng thay đổi: ORDER_STATUS_CHANGED
 *
 * Tính năng bảo mật & độ tin cậy:
 * - Ticket-based Authentication: Lấy mã vé dùng 1 lần (Single-use ticket) trước khi mở EventSource,
 *   tránh để lộ JWT token trực tiếp trên URL query string.
 * - Deduplication: Chống xử lý trùng lặp sự kiện qua Set cache.
 * - Auto-reconnect: Tự động kết nối lại khi mất kết nối mạng (Exponential Backoff).
 * - Tự động đóng kết nối khi component unmount.
 */
export function useOrderEvents({
  onOrderCreated,
  onOrderStatusChanged,
  enabled = true
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [error, setError] = useState(null);

  const eventSourceRef = useRef(null);
  const isMountedRef = useRef(true);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const processedEventsRef = useRef(new Set());

  // Lưu callbacks trong ref để tránh re-subscribe không cần thiết
  const onOrderCreatedRef = useRef(onOrderCreated);
  const onOrderStatusChangedRef = useRef(onOrderStatusChanged);

  useEffect(() => {
    onOrderCreatedRef.current = onOrderCreated;
  }, [onOrderCreated]);

  useEffect(() => {
    onOrderStatusChangedRef.current = onOrderStatusChanged;
  }, [onOrderStatusChanged]);

  const handleIncomingData = useCallback((data) => {
    if (!data || !isMountedRef.current) return;

    // Deduplication: Chống xử lý lặp sự kiện
    const eventKey = `${data.type}_${data.orderCode || data.orderId}_${data.status || ''}_${data.updatedAt || data.createdAt || ''}`;
    if (processedEventsRef.current.has(eventKey)) {
      return;
    }
    processedEventsRef.current.add(eventKey);

    // Giữ kích thước cache tối đa 100 sự kiện gần nhất
    if (processedEventsRef.current.size > 100) {
      const iter = processedEventsRef.current.values();
      processedEventsRef.current.delete(iter.next().value);
    }

    setLastEvent(data);

    if (data.type === 'ORDER_CREATED') {
      if (onOrderCreatedRef.current) {
        onOrderCreatedRef.current(data);
      }
    } else if (data.type === 'ORDER_STATUS_CHANGED') {
      if (onOrderStatusChangedRef.current) {
        onOrderStatusChangedRef.current(data);
      }
    }
  }, []);

  const connectSse = useCallback(async () => {
    if (!enabled || !isMountedRef.current) return;

    // Nếu đang ở chế độ Mock Data thuần túy thì bỏ qua SSE thực
    if (USE_MOCK_DATA) {
      setIsConnected(true);
      return;
    }

    // Đóng kết nối cũ nếu có
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      // 1. Lấy mã vé xác thực an toàn (Single-use ticket)
      const ticket = await getAdminSseTicket();
      if (!isMountedRef.current) return;

      // 2. Mở kết nối EventSource tới endpoint SSE của Admin
      const sseUrl = `${API_BASE}/admin/orders/events?ticket=${encodeURIComponent(ticket)}`;
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!isMountedRef.current) return;
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        console.info('📡 [SSE] Admin Order Stream đã kết nối thành công!');
      };

      // Lắng nghe sự kiện nghiệp vụ order_event
      es.addEventListener('order_event', (event) => {
        try {
          const parsed = JSON.parse(event.data);
          handleIncomingData(parsed);
        } catch (e) {
          console.warn('[SSE] Không thể parse dữ liệu sự kiện:', e);
        }
      });

      // Lắng nghe sự kiện handshake ban đầu
      es.addEventListener('INIT', (event) => {
        console.debug('[SSE] Handshake nhận:', event.data);
      });

      // Lắng nghe sự kiện keep-alive
      es.addEventListener('ping', () => {
        // Heartbeat duy trì kết nối
      });

      es.onerror = (err) => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        setError('Mất kết nối SSE thời gian thực');
        es.close();
        eventSourceRef.current = null;

        // Auto-reconnect với Exponential Backoff (tối đa 30s)
        const delay = Math.min(30000, 3000 * Math.pow(1.5, reconnectAttemptsRef.current));
        reconnectAttemptsRef.current += 1;
        console.warn(`[SSE] Mất kết nối. Tự động kết nối lại sau ${Math.round(delay / 1000)}s...`);

        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            connectSse();
          }
        }, delay);
      };
    } catch (err) {
      if (!isMountedRef.current) return;
      setIsConnected(false);
      setError(err.message);

      // Thử kết nối lại sau 5s nếu lỗi lấy ticket
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          connectSse();
        }
      }, 5000);
    }
  }, [enabled, handleIncomingData]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      connectSse();
    }

    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [enabled, connectSse]);

  return {
    isConnected,
    lastEvent,
    error,
    reconnect: connectSse
  };
}

export default useOrderEvents;
