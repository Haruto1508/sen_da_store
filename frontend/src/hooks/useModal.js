import { useState, useCallback } from 'react';

/**
 * useModal – hook tiện ích để hiển thị NotificationModal.
 *
 * Trả về:
 *  - modalProps  – props truyền thẳng vào <NotificationModal />
 *  - showModal   – hàm gọi để mở modal
 *    Ví dụ: showModal('error', 'Không thể xóa sản phẩm')
 *           showModal('success', 'Lưu thành công!', 'Thành công')
 */
export default function useModal() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showModal = useCallback((type = 'info', message = '', title = '') => {
    setModalState({ isOpen: true, type, message, title });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const modalProps = {
    isOpen: modalState.isOpen,
    type: modalState.type,
    title: modalState.title,
    message: modalState.message,
    onClose: closeModal,
  };

  return { modalProps, showModal };
}
