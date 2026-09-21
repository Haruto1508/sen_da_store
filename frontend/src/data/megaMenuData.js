/**
 * Dữ liệu phân cấp Mega-Menu danh mục sản phẩm & các loại sen đá
 * Thiết kế theo cấu trúc bảng 3 khu vực (Left Categories - Middle Matrix - Right Brands/Attributes)
 */

export const MEGA_MENU_DATA = {
  categories: [
    {
      id: 'echeveria',
      title: 'SEN HOA HỒNG & SEN ĐÀI',
      subgroups: [
        {
          title: 'SEN HOA HỒNG CỔ ĐIỂN',
          items: [
            { name: 'Sen Nâu (Hoàng Tử Đen)', id: 'sen-da-nau' },
            { name: 'Sen Hồng Phấn Đà Lạt' },
            { name: 'Sen Viền Đỏ Lửa' },
            { name: 'Sen Bắp Cải Xoăn Tím', id: 'sen-da-bap-cai-tim' }
          ]
        },
        {
          title: 'SEN ĐÀI TỔ HỢP',
          items: [
            { name: 'Sen Phật Bà Cánh Sao', id: 'sen-da-phat-ba' },
            { name: 'Sen Thái Xanh Tuyển Chọn' },
            { name: 'Sen Thược Dược Cánh Dày' },
            { name: 'Sen Tuyết Trắng Phấn' }
          ]
        },
        {
          title: 'SEN ĐỘT BIẾN / VIP',
          items: [
            { name: 'Sen Cẩm Thạch (Variegated)' },
            { name: 'Sen Cánh Bướm Tím Dạ Quang' },
            { name: 'Sen Bắp Cải Xoăn VIP Size Đại' }
          ]
        }
      ]
    },
    {
      id: 'haworthia',
      title: 'SEN MỌNG NƯỚC & KIM CƯƠNG',
      subgroups: [
        {
          title: 'SEN KIM CƯƠNG PHA LÊ',
          items: [
            { name: 'Sen Đá Kim Cương Pha Lê', id: 'sen-da-kim-cuong' },
            { name: 'Haworthia Cooperi Tròn' },
            { name: 'Kim Cương Chóp Vân Trắng' }
          ]
        },
        {
          title: 'SEN MÓNG RỒNG & NGỰA VẰN',
          items: [
            { name: 'Sen Đá Móng Rồng Cảnh', id: 'sen-da-mong-rong' },
            { name: 'Móng Rồng Xoắn Độc Lạ' },
            { name: 'Haworthia Ngựa Vằn Trắng' }
          ]
        },
        {
          title: 'SEN ĐÔ LA & BONSAI',
          items: [
            { name: 'Sen Đô La Hồng Bon-sai', id: 'sen-da-do-la-hong' },
            { name: 'Đô La Cẩm Thạch Thần Tài' },
            { name: 'Dáng Bon-sai Chiêu Tài Lộc' }
          ]
        }
      ]
    },
    {
      id: 'cactus',
      title: 'XƯƠNG RỒNG & PHONG THỦY',
      subgroups: [
        {
          title: 'XƯƠNG RỒNG TRỤ & BỤI',
          items: [
            { name: 'Lâu Đài Cổ Tích (Thanh Sơn)', id: 'xuong-rong-thanh-son' },
            { name: 'Xương Rồng Tai Thỏ Vàng' },
            { name: 'Trụ Bát Tiên Khổng Lồ' }
          ]
        },
        {
          title: 'XƯƠNG RỒNG HOA NỞ',
          items: [
            { name: 'Gymno Đỏ / Vàng Rực Rỡ' },
            { name: 'Xương Rồng Bát Tiên Hoa Hồng' },
            { name: 'Xương Rồng Trứng Chim Bụi' }
          ]
        },
        {
          title: 'DÒNG HÚT TIA BỨC XẠ',
          items: [
            { name: 'Xương Rồng Bánh Sinh Nhật' },
            { name: 'Kim Hổ Tròn Đại Thọ' },
            { name: 'Thần Long May Mắn' }
          ]
        }
      ]
    },
    {
      id: 'sedum',
      title: 'SEN DÂY RỦ & BÒ ĐẤT',
      subgroups: [
        {
          title: 'DÒNG DÂY RỦ TREO',
          items: [
            { name: 'Sen Đá Chuỗi Ngọc Rủ', id: 'sen-da-chuoi-ngoc' },
            { name: 'Sen Chuỗi Ngọc Bi Đà Lạt' },
            { name: 'Sen Tim Rủ Dễ Thương' }
          ]
        },
        {
          title: 'DÒNG CHÙM XÒE ĐỔI MÀU',
          items: [
            { name: 'Sen Thạch Ngọc Đổi Màu', id: 'sen-da-thach-ngoc' },
            { name: 'Chuỗi Ngọc Thái Bụi Sum Suê' },
            { name: 'Sen Cúc Bò Đất Xanh Mướt' }
          ]
        },
        {
          title: 'SEN MẶT TRỜI & CẨM NHUNG',
          items: [
            { name: 'Cẩm Nhung Lá Đỏ May Mắn' },
            { name: 'Cẩm Nhung Bạc Hà' },
            { name: 'Sen Dù Đỏ Nắng Sớm' }
          ]
        }
      ]
    },
    {
      id: 'combo',
      title: 'COMBO & SET QUÀ TẶNG',
      subgroups: [
        {
          title: 'SET BÀN LÀM VIỆC',
          items: [
            { name: 'Combo "Góc Nhỏ An Yên" (3 Cây)', id: 'combo-vuon-mini' },
            { name: 'Bộ Đôi Sen Tài Lộc May Mắn' },
            { name: 'Bộ 4 Sen Mini Để Bàn Xinh' }
          ]
        },
        {
          title: 'SET TÂN GIA & SINH NHẬT',
          items: [
            { name: 'Khay Gỗ Mix 5 Cây Kèm Đèn' },
            { name: 'Hộp Quà Kraft Kèm Thiệp Viết Tay' },
            { name: 'Set Sen Tình Bạn Gắn Kết' }
          ]
        },
        {
          title: 'TIỂU CẢNH NGHỆ THUẬT',
          items: [
            { name: 'Tiểu Cảnh Terrarium Thủy Tinh' },
            { name: 'Đồi Sen An Nhiên Thác Nước' },
            { name: 'Bonsai Tiểu Cảnh Cổ Điển' }
          ]
        }
      ]
    },
    {
      id: 'accessories',
      title: 'CHẬU TRỒNG SEN ĐÁ',
      subgroups: [
        {
          title: 'CHẬU ĐẤT NUNG THOÁT NƯỚC',
          items: [
            { name: 'Set 2 Chậu Đất Nung Gốm Mộc', id: 'chau-gom-moc-vintage' },
            { name: 'Chậu Đất Nung Nâu Đỏ Thấm Hút' },
            { name: 'Chậu Khắc Chìm Thủ Công Bắc Âu' }
          ]
        },
        {
          title: 'CHẬU GỐM SỨ CAO CẤP',
          items: [
            { name: 'Gốm Men Hỏa Biến Bát Tràng' },
            { name: 'Chậu Sứ Trắng Tối Giản' },
            { name: 'Chậu Hình Thú Dễ Thương' }
          ]
        },
        {
          title: 'KHAY GỖ & XI MĂNG',
          items: [
            { name: 'Khay Gỗ Thông Tự Nhiên' },
            { name: 'Chậu Xi Măng Đá Mài Mini' },
            { name: 'Chậu Treo Ban Công Dây Thừng' }
          ]
        }
      ]
    },
    {
      id: 'accessories',
      title: 'ĐẤT & GIÁ THỂ TRỒNG CÂY',
      subgroups: [
        {
          title: 'GIÁ THỂ TRỘN SẴN',
          items: [
            { name: 'Soil Mix 5 Trong 1 (Bao 3kg)', id: 'gia-the-soil-mix' },
            { name: 'Đất Trồng Xương Rồng Thoát Nhanh' },
            { name: 'Giá Thể Ươm Mầm Lá Mới' }
          ]
        },
        {
          title: 'ĐÁ KHOÁNG THÔNG KHÍ RỄ',
          items: [
            { name: 'Đá Pumice Indonesia (Size 3-6mm)' },
            { name: 'Đá Perlite Trắng Nam Phi' },
            { name: 'Đá Vermiculite Giữ Ẩm Rễ' }
          ]
        },
        {
          title: 'RẢI MẶT & DINH DƯỠNG',
          items: [
            { name: 'Đá Nung Akadama Nhật Bản' },
            { name: 'Sỏi Nhẹ Keramzit Lót Đáy' },
            { name: 'Phân Trùn Quế Hữu Cơ Vi Sinh' }
          ]
        }
      ]
    },
    {
      id: 'accessories',
      title: 'DỤNG CỤ VƯỜN & PHỤ KIỆN',
      subgroups: [
        {
          title: 'BÌNH TƯỚI & VỆ SINH CÂY',
          items: [
            { name: 'Bình Tưới Nước Vòi Cong 500ml' },
            { name: 'Bóng Cao Su Xịt Bụi Lá' },
            { name: 'Chổi Lông Quét Phấn Mịn' }
          ]
        },
        {
          title: 'DỤNG CỤ TRỒNG CÂY',
          items: [
            { name: 'Nhíp Inox Gắp Cây Mũi Cong' },
            { name: 'Bộ 3 Xẻng Cào Xúc Đất Mini' },
            { name: 'Kéo Tỉa Rễ Mũi Nhọn Thép' }
          ]
        },
        {
          title: 'PHÂN BÓN & THUỐC ĐẶC TRỊ',
          items: [
            { name: 'Phân Tan Chậm Osmocote 14-14-14' },
            { name: 'Thuốc Trị Rệp Sáp Siêu Tốc' },
            { name: 'Nấm Đối Kháng Trichoderma' }
          ]
        }
      ]
    }
  ],
  rightSidebar: [
    {
      title: 'THƯƠNG HIỆU & VƯỜN ƯƠM',
      items: [
        { label: 'VƯỜN SEN ĐÀ LẠT', search: 'Đà Lạt' },
        { label: 'SEN NHẬP KHẨU HÀN QUỐC', search: 'Hàn Quốc' },
        { label: 'VƯỜN ƯƠM NÔNG NGHIỆP HÀ NỘI', search: 'Hà Nội' }
      ]
    },
    {
      title: 'THEO ÁNH SÁNG & KHÔNG GIAN',
      items: [
        { label: 'VĂN PHÒNG / TRONG NHÀ', filter: { light: 'indoor' } },
        { label: 'NẮNG TÁN XẠ CỬA SỔ', filter: { light: 'indirect' } },
        { label: 'BAN CÔNG & SÂN THƯỢNG', filter: { light: 'full_sun' } }
      ]
    },
    {
      title: 'Ý NGHĨA PHONG THỦY',
      items: [
        { label: 'CHIÊU TÀI & HÚT LỘC', search: 'chiêu tài' },
        { label: 'HỘ MỆNH & BÌNH AN', search: 'bình an' },
        { label: 'TÌNH BẠN BỀN CHẶT', search: 'tình bạn' }
      ]
    },
    {
      title: 'TIÊU CHÍ NỔI BẬT',
      items: [
        { label: 'CỰC KỲ DỄ TRỒNG CHO NGƯỜI MỚI', filter: { difficulty: 'easy' } },
        { label: 'HÚT TIA BỨC XẠ MÁY TÍNH', search: 'máy tính' },
        { label: 'SEN ĐÁ SIZE ĐẠI VIP', search: 'VIP' }
      ]
    },
    {
      title: 'CHÍNH SÁCH BẢO HÀNH',
      items: [
        { label: 'BẢO HÀNH ĐỔI TRẢ 7 NGÀY', badge: '100%' },
        { label: 'BỌC 4 LỚP BÔNG GÒN CHỐNG SỐC', badge: 'Chuẩn VIP' },
        { label: 'FREESHIP ĐƠN TỪ 250.000₫', badge: 'Toàn Quốc' }
      ]
    }
  ]
};
