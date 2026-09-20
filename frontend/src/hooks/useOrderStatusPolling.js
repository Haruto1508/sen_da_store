import { useEffect, useRef, useState, useCallback } from 'react';
import { checkOrderStatus, lookupOrder } from '../services/api';

/**
 * Custom React hook for User Order Status HTTP Polling.
 *
 * Tự động kiểm tra trạng thái đơn hàng định kỳ (5-10s) bằng HTTP polling,
 * cập nhật giao diện mà không reload toàn bộ trang.
 *
 * Dừng polling khi:
 * - Component unmount hoặc người dùng rời khỏi trang
 * - Đơn hàng đạt trạng thái kết thúc: 'COMPLETED', 'DELIVERED', 'CANCELLED'
 *
 * Ngăn chặn:
 * - Duplicated intervals
 * - Memory leaks
 * - Unnecessary requests sau khi unmount
 */
const TERMINAL_STATUSES = ['COMPLETED', 'DELIVERED', 'CANCELLED'];

export function useOrderStatusPolling({
  orderCode,
  initialStatus = 'PENDING',
  onStatusChange,
  intervalMs = 6000,
  enabled = true
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isPolling, setIsPolling] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  const isMountedRef = useRef(true);
  const statusRef = useRef(initialStatus);
  const intervalIdRef = useRef(null);

  // Đồng bộ statusRef với status mới nhất
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Cập nhật khi initialStatus thay đổi từ bên ngoài
  useEffect(() => {
    if (initialStatus && initialStatus !== statusRef.current) {
      statusRef.current = initialStatus;
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  const stopPolling = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (isMountedRef.current) {
      setIsPolling(false);
    }
  }, []);

  const pollStatus = useCallback(async () => {
    if (!orderCode || !isMountedRef.current) return;

    // Nếu đã ở trạng thái cuối thì dừng polling ngay
    if (TERMINAL_STATUSES.includes(statusRef.current?.toUpperCase())) {
      stopPolling();
      return;
    }

    try {
      // Sử dụng API checkOrderStatus hoặc lookupOrder hiện có của dự án
      const res = await checkOrderStatus(orderCode);
      if (!isMountedRef.current) return;

      setLastCheckedAt(new Date());

      const remoteStatus = res?.status || (res?.data && res.data.status);
      if (remoteStatus && remoteStatus !== statusRef.current) {
        const oldStatus = statusRef.current;
        statusRef.current = remoteStatus;
        setStatus(remoteStatus);

        if (onStatusChange) {
          onStatusChange(remoteStatus, oldStatus);
        }

        // Nếu chuyển sang trạng thái cuối thì dừng polling
        if (TERMINAL_STATUSES.includes(remoteStatus.toUpperCase())) {
          stopPolling();
        }
      }
    } catch (err) {
      // Không crash UI khi mất mạng tạm thời, chỉ ghi nhận log và tiếp tục thử lại ở chu kỳ sau
      console.warn(`[useOrderStatusPolling] Lỗi polling đơn #${orderCode}:`, err.message);
    }
  }, [orderCode, onStatusChange, stopPolling]);

  useEffect(() => {
    isMountedRef.current = true;

    // Không poll nếu bị disabled hoặc mã đơn rỗng hoặc đã ở trạng thái cuối
    if (!enabled || !orderCode || TERMINAL_STATUSES.includes(initialStatus?.toUpperCase())) {
      stopPolling();
      return;
    }

    setIsPolling(true);

    // Chạy ngay 1 lần sau 1.5s để có thông tin sớm
    const initialTimer = setTimeout(() => {
      if (isMountedRef.current) {
        pollStatus();
      }
    }, 1500);

    // Thiết lập interval định kỳ
    intervalIdRef.current = setInterval(pollStatus, Math.max(3000, intervalMs));

    return () => {
      isMountedRef.current = false;
      clearTimeout(initialTimer);
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [orderCode, enabled, intervalMs, pollStatus, stopPolling]);

  return {
    status,
    isPolling,
    lastCheckedAt,
    stopPolling,
    refetchNow: pollStatus
  };
}

export default useOrderStatusPolling;
