export const CATEGORIES = [
  { id: 'all', name: 'Tất cả sản phẩm', icon: 'Sparkles' },
  { id: 'echeveria', name: 'Sen Đài & Hoa Hồng', icon: 'Flower2' },
  { id: 'haworthia', name: 'Sen Mọng Nước & Kim Cương', icon: 'Gem' },
  { id: 'cactus', name: 'Xương Rồng Phong Thủy', icon: 'Sun' },
  { id: 'combo', name: 'Combo Quà Tặng', icon: 'Gift' },
  { id: 'accessories', name: 'Chậu & Đất Trồng', icon: 'Layers' },
];

export const PRODUCTS = [
  {
    id: 'sen-da-kim-cuong',
    name: 'Sen Đá Kim Cương Pha Lê',
    scientificName: 'Haworthia Cooperi',
    category: 'haworthia',
    price: 85000,
    originalPrice: 110000,
    rating: 4.9,
    reviewsCount: 128,
    badge: 'Bán chạy',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Dễ trồng',
    difficultyLevel: 1, // 1: Dễ, 2: Vừa, 3: Cần kinh nghiệm
    light: 'Trong nhà / Bàn làm việc',
    lightType: 'indirect', // 'indoor' | 'indirect' | 'full_sun'
    watering: '1 tuần / 1 lần',
    wateringDays: 7,
    size: 'Mini (6 - 8cm)',
    idealLocation: 'Bàn văn phòng, cạnh cửa sổ sáng, kệ sách',
    inStock: 35,
    description: 'Sen đá Kim Cương (Haworthia Cooperi) sở hữu những bọng lá tròn đầy, phần đầu cánh lá trong suốt như pha lê có thể nhìn xuyên thấu. Cây rất chuộng ánh sáng gián tiếp và là lựa chọn hàng đầu cho bàn làm việc.',
    careTips: [
      'Để nơi có ánh sáng tán xạ (cạnh cửa sổ, đèn bàn làm việc dịu). Tránh nắng trưa gắt làm cháy đầu lá trong suốt.',
      'Chỉ tưới khi đất khô hoàn toàn, tưới quanh gốc, không đọng nước lên ngọn.',
      'Dùng chậu có lỗ thoát nước tốt và giá thể thông thoáng (nhiều đá pumice, perlite).'
    ],
    meaning: 'Tượng trưng cho sự thuần khiết, tinh khôi và thu hút nguồn năng lượng sáng tạo tích cực.'
  },
  {
    id: 'sen-da-nau',
    name: 'Sen Đá Nâu (Hoàng Tử Đen)',
    scientificName: 'Echeveria Black Prince',
    category: 'echeveria',
    price: 65000,
    originalPrice: 85000,
    rating: 4.8,
    reviewsCount: 94,
    badge: 'Ưa chuộng',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Dễ trồng',
    difficultyLevel: 1,
    light: 'Nhiều nắng trực tiếp',
    lightType: 'full_sun',
    watering: '10 - 14 ngày / lần',
    wateringDays: 12,
    size: 'Trung (8 - 10cm)',
    idealLocation: 'Ban công, sân thượng ngập nắng, bậu cửa sổ đón nắng sớm',
    inStock: 42,
    description: 'Sen Đá Nâu gây ấn tượng với các cánh lá dày, nhọn dần về ngọn, xếp lớp tròn đối xứng hoàn hảo. Càng tắm nhiều nắng, màu lá càng chuyển sang sắc nâu socola ánh tím thẫm cực kỳ huyền bí.',
    careTips: [
      'Cần ít nhất 4 - 6 tiếng nắng sớm mỗi ngày để giữ form lá khum và màu nâu thẫm chuẩn đẹp.',
      'Rất chịu hạn tốt, chỉ tưới đẫm khi nhấc chậu thấy thật nhẹ.',
      'Phòng úng vào mùa mưa bằng cách kê chậu nơi thoáng gió.'
    ],
    meaning: 'Biểu tượng cho tình bạn bền chặt, tình yêu son sắt kiên định và mang lại tài lộc, bình an.'
  },
  {
    id: 'sen-da-chuoi-ngoc',
    name: 'Sen Đá Chuỗi Ngọc Rủ',
    scientificName: 'Sedum Morganianum (Burro\'s Tail)',
    category: 'echeveria',
    price: 95000,
    originalPrice: 120000,
    rating: 4.9,
    reviewsCount: 76,
    badge: 'Hot trend',
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Trung bình',
    difficultyLevel: 2,
    light: 'Nắng tán xạ / Nắng dịu',
    lightType: 'indirect',
    watering: '7 - 10 ngày / lần',
    wateringDays: 8,
    size: 'Dây rủ 15 - 20cm',
    idealLocation: 'Chậu treo ban công, giàn hoa, góc quán cafe',
    inStock: 18,
    description: 'Những chuỗi lá mọng nước hình giọt lệ xếp san sát nhau như chuỗi ngọc bích buông dài thướt tha. Cây tạo nên mảng xanh rủ mềm mại tuyệt đẹp khi trồng chậu treo.',
    careTips: [
      'Treo nơi có gió thoảng và ánh sáng dịu. Tránh va chạm mạnh vì hạt lá dễ rụng khi chưa bén rễ chắc.',
      'Khi hạt ngọc hơi nhăn nhẹ là dấu hiệu cần bổ sung nước.',
      'Mỗi hạt lá rụng rơi xuống đất ẩm đều có thể mọc thành một cây con mới.'
    ],
    meaning: 'Tượng trưng cho sự may mắn, phúc lộc đong đầy và con cháu sum vầy.'
  },
  {
    id: 'sen-da-mong-rong',
    name: 'Sen Đá Móng Rồng Cảnh',
    scientificName: 'Haworthia Fasciata (Zebra Plant)',
    category: 'haworthia',
    price: 55000,
    originalPrice: 70000,
    rating: 4.9,
    reviewsCount: 210,
    badge: 'Siêu bền',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Cực dễ trồng',
    difficultyLevel: 1,
    light: 'Trong nhà / Bàn làm việc',
    lightType: 'indoor',
    watering: '10 - 15 ngày / lần',
    wateringDays: 14,
    size: 'Mini (7 - 9cm)',
    idealLocation: 'Cạnh màn hình máy tính, bàn học, quầy lễ tân',
    inStock: 60,
    description: 'Lá vuốt nhọn hướng lên trên với những đường viền gân ngang màu trắng nổi bật như vằn ngựa hoặc móng vuốt rồng dũng mãnh. Cây có sức sống mãnh liệt, chịu râm cực tốt và hút tia bức xạ điện tử.',
    careTips: [
      'Thích nghi hoàn hảo với môi trường máy lạnh và ánh đèn huỳnh quang văn phòng.',
      'Cực kỳ ghét thừa nước, bỏ quên 2-3 tuần cây vẫn tươi xanh khỏe mạnh.',
      'Mỗi năm có thể đẻ thêm 3 - 5 cây con quanh gốc.'
    ],
    meaning: 'Tượng trưng cho sự che chở, hộ mệnh, xua đuổi điều xui rủi và mang lại sự quyết đoán.'
  },
  {
    id: 'sen-da-thach-ngoc',
    name: 'Sen Đá Thạch Ngọc Đổi Màu',
    scientificName: 'Sedum Rubrotinctum (Jelly Bean)',
    category: 'echeveria',
    price: 75000,
    originalPrice: 90000,
    rating: 4.7,
    reviewsCount: 82,
    badge: 'Mới về',
    image: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Dễ trồng',
    difficultyLevel: 1,
    light: 'Nhiều nắng',
    lightType: 'full_sun',
    watering: '7 - 10 ngày / lần',
    wateringDays: 8,
    size: 'Chùm xòe (8 - 10cm)',
    idealLocation: 'Bậu cửa sổ nhiều nắng, ban công hướng Đông',
    inStock: 25,
    description: 'Cây có từng chùm lá tròn nhỏ xinh xắn như những viên kẹo thạch jelly bean. Khi đón đủ nắng và gió lạnh nhẹ, chóp lá sẽ chuyển dần từ xanh ngọc sang đỏ cam rực rỡ.',
    careTips: [
      'Cho cây tắm nắng trực tiếp để lên màu đỏ ửng ngọt ngào.',
      'Đất trồng cần thoát nước nhanh, không để nước mưa ứ đọng nhiều ngày.',
      'Cành dài có thể cắt tỉa cắm sang chậu mới để tạo bụi sum suê.'
    ],
    meaning: 'Mang ý nghĩa về sự vui tươi, năng lượng căng tràn và ngọt ngào trong cuộc sống.'
  },
  {
    id: 'sen-da-bap-cai-tim',
    name: 'Sen Đá Bắp Cải Xoăn Hồng Tím',
    scientificName: 'Echeveria Cabbage Rose',
    category: 'echeveria',
    price: 135000,
    originalPrice: 160000,
    rating: 4.9,
    reviewsCount: 63,
    badge: 'Size lớn VIP',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Trung bình',
    difficultyLevel: 2,
    light: 'Nhiều nắng tán xạ',
    lightType: 'indirect',
    watering: '1 tuần / lần',
    wateringDays: 7,
    size: 'Size Đại (13 - 16cm)',
    idealLocation: 'Bàn tiếp khách, ban công thoáng gió',
    inStock: 14,
    description: 'Một trong những giống sen đá lộng lẫy nhất với tán lá to bản dập dềnh lượn sóng như chiếc váy dạ hội kiêu kỳ. Viền lá phủ phấn hồng ánh tím mộng mơ.',
    careTips: [
      'Tưới nước cẩn thận sát gốc đất, tuyệt đối không xịt nước trực tiếp lên bắp xoăn vì dễ đọng nước gây thối nõn.',
      'Để nơi thoáng gió tối đa, ánh sáng từ 4-6 tiếng dịu mát.',
      'Bổ sung phân bón tan chậm chuyên dụng 3 tháng/lần.'
    ],
    meaning: 'Thể hiện sự quý phái, đẳng cấp vương giả và sự sung túc ấm no cho gia chủ.'
  },
  {
    id: 'sen-da-phat-ba',
    name: 'Sen Đá Phật Bà Cánh Sao',
    scientificName: 'Sempervivum Calcareum',
    category: 'echeveria',
    price: 70000,
    originalPrice: 90000,
    rating: 4.8,
    reviewsCount: 115,
    badge: 'Phong thủy',
    image: 'https://images.unsplash.com/photo-1516048015710-7a3b4c86be43?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Dễ trồng',
    difficultyLevel: 1,
    light: 'Nắng vừa / Ban công',
    lightType: 'indirect',
    watering: '7 - 10 ngày / lần',
    wateringDays: 9,
    size: 'Trung (9 - 11cm)',
    idealLocation: 'Bàn làm việc, góc thiền định, bàn trà',
    inStock: 30,
    description: 'Tán lá xếp đối xứng nhiều lớp xòe đều như tòa sen của Bồ Tát Quan Âm. Đầu mỗi cánh lá có chóp nhọn màu đỏ tía tạo điểm nhấn thanh tịnh, hài hòa.',
    careTips: [
      'Chịu được khí hậu mát mẻ và hanh khô rất tốt.',
      'Cắt bỏ những lá già khô dưới đáy định kỳ để cây thông thoáng không bị nấm bệnh.',
      'Đẻ nhiều nhánh con (cây đệ tử) chạy quanh thân mẹ tạo thành cụm tuyệt đẹp.'
    ],
    meaning: 'Biểu tượng của sự che chở bình an, tĩnh tâm và may mắn trường tồn.'
  },
  {
    id: 'sen-da-do-la-hong',
    name: 'Sen Đá Đô La Hồng Bon-sai',
    scientificName: 'Portulacaria Afra Variegata',
    category: 'haworthia',
    price: 110000,
    originalPrice: 140000,
    rating: 4.9,
    reviewsCount: 88,
    badge: 'Chiêu tài',
    image: 'https://images.unsplash.com/photo-1508022713622-df2d8fb7b4ea?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Dễ trồng',
    difficultyLevel: 1,
    light: 'Nắng tán xạ / Nắng sáng',
    lightType: 'indirect',
    watering: '5 - 7 ngày / lần',
    wateringDays: 6,
    size: 'Dáng Bon-sai (15 - 18cm)',
    idealLocation: 'Quầy thu ngân, bàn giám đốc, cửa sổ phòng khách',
    inStock: 20,
    description: 'Thân cây gỗ mọng nước mọc nhiều nhánh bon-sai uyển chuyển, lá nhỏ tròn cẩm thạch màu xanh kem và ngọn cây phớt hồng pastel xinh lung linh.',
    careTips: [
      'Rất dễ uốn nắn và cắt tỉa theo dáng bon-sai tùy thích.',
      'Chịu nắng khá tốt và có nhu cầu nước nhỉnh hơn một chút so với sen đài.',
      'Nhánh tỉa giâm xuống đất ẩm sẽ ra rễ chỉ sau 10 ngày.'
    ],
    meaning: 'Thu hút tài lộc, vượng khí kinh doanh và sự thăng tiến hanh thông trong công việc.'
  },
  {
    id: 'xuong-rong-thanh-son',
    name: 'Xương Rồng Lâu Đài Cổ Tích (Thanh Sơn)',
    scientificName: 'Acanthocereus Tetragonus (Fairy Castle)',
    category: 'cactus',
    price: 60000,
    originalPrice: 80000,
    rating: 4.8,
    reviewsCount: 140,
    badge: 'Bền bỉ',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Cực dễ trồng',
    difficultyLevel: 1,
    light: 'Nhiều nắng trực tiếp',
    lightType: 'full_sun',
    watering: '2 - 3 tuần / lần',
    wateringDays: 18,
    size: 'Dáng Trụ (12 - 15cm)',
    idealLocation: 'Bàn làm việc, góc ban công, bậu cửa sổ',
    inStock: 45,
    description: 'Các nhánh xương rồng xanh mướt mọc xếp tầng cao thấp như những tòa tháp lâu đài cổ tích phương Tây. Gai mềm trắng mịn không gây đau khi vô tình chạm nhẹ.',
    careTips: [
      'Thuộc dòng cây cực kỳ chịu hạn, tưới 1 tháng 1-2 lần là đủ.',
      'Rất thích ánh nắng mặt trời, để nơi càng nhiều nắng thân cây càng cứng cáp xanh đậm.',
      'Đất trồng yêu cầu 70% đá sỏi thoát nước tốt.'
    ],
    meaning: 'Ý chí kiên định, vượt qua mọi chông gai thử thách và sự bảo vệ vững chãi.'
  },
  {
    id: 'combo-vuon-mini',
    name: 'Combo "Góc Nhỏ An Yên" (3 Cây + Chậu Gốm)',
    scientificName: 'Succulent Gift Trio Set',
    category: 'combo',
    price: 245000,
    originalPrice: 320000,
    rating: 5.0,
    reviewsCount: 156,
    badge: 'Best Gift',
    image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Dễ trồng',
    difficultyLevel: 1,
    light: 'Trong nhà / Bàn làm việc',
    lightType: 'indirect',
    watering: '1 tuần / lần',
    wateringDays: 7,
    size: 'Khay gỗ 25cm kèm 3 chậu gốm mộc',
    idealLocation: 'Bàn làm việc văn phòng, quà tặng sinh nhật, tân gia',
    inStock: 25,
    description: 'Set quà tặng gồm 3 dòng sen đá dễ chăm nhất (Kim cương, Nâu, Móng rồng) được trồng sẵn trong chậu gốm mộc thủ công, đi kèm khay gỗ thông tự nhiên và thiệp viết tay theo yêu cầu.',
    careTips: [
      'Đã được sang chậu sẵn với giá thể cao cấp chuẩn xả bầu.',
      'Kèm bình xịt tưới cây vòi nhỏ tiện lợi cho dân văn phòng.',
      'Bảo hành đổi trả miễn phí trong 7 ngày nếu cây có dấu hiệu suy yếu.'
    ],
    meaning: 'Món quà xanh chữa lành tâm hồn, gửi gắm lời chúc sức khỏe, an yên và may mắn.'
  },
  {
    id: 'chau-gom-moc-vintage',
    name: 'Set 2 Chậu Đất Nung Gốm Mộc Khắc Tay',
    scientificName: 'Handcrafted Terracotta Pots',
    category: 'accessories',
    price: 85000,
    originalPrice: 110000,
    rating: 4.9,
    reviewsCount: 78,
    badge: 'Thoát nước 10/10',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Phụ kiện',
    difficultyLevel: 1,
    light: 'Mọi không gian',
    lightType: 'indoor',
    watering: 'N/A',
    wateringDays: 0,
    size: 'Đường kính 9cm & 11cm',
    idealLocation: 'Thích hợp cho mọi loại sen đá và xương rồng',
    inStock: 50,
    description: 'Chậu đất nung nung ở nhiệt độ tiêu chuẩn giữ được độ xốp tự nhiên của đất sét. Bề mặt thấm hút và thoát ẩm cực kỳ nhanh, giúp rễ sen đá hô hấp và chống sốc nhiệt, chống úng triệt để.',
    careTips: [
      'Đáy có lỗ thoát nước lớn 1.5cm tiêu chuẩn.',
      'Tặng kèm lưới chắn đáy chậu ngăn giá thể rơi ra ngoài.',
      'Họa tiết khắc chìm thủ công phong cách Bắc Âu tối giản.'
    ],
    meaning: 'Nâng niu bộ rễ của cây, kết nối sự thô mộc của đất trời với không gian sống hiện đại.'
  },
  {
    id: 'gia-the-soil-mix',
    name: 'Giá Thể Trồng Sen Đá Cao Cấp 5 Trong 1 (Bao 3kg)',
    scientificName: 'Premium Succulent Soil Mix',
    category: 'accessories',
    price: 65000,
    originalPrice: 80000,
    rating: 5.0,
    reviewsCount: 310,
    badge: 'Chuẩn nhà vườn',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    difficulty: 'Phụ kiện',
    difficultyLevel: 1,
    light: 'Mọi không gian',
    lightType: 'indoor',
    watering: 'N/A',
    wateringDays: 0,
    size: 'Bao 3kg (Trồng được 6-8 chậu nhỏ)',
    idealLocation: 'Phối trộn sẵn tiện lợi dùng ngay',
    inStock: 100,
    description: 'Công thức giá thể độc quyền chuẩn nhà vườn Đà Lạt: 40% Pumice + 20% Perlite + 15% Akadama Nhật + 15% Peatmoss xử lý + 10% Phân trùn quế hữu cơ và nấm đối kháng Trichoderma chống nấm rễ.',
    careTips: [
      'Không cần trộn thêm bất cứ thành phần nào khác, có thể dùng ngay khi mở bao.',
      'Thoát nước 100% chỉ sau 5 giây tưới, giữ ẩm rễ nhưng không bao giờ gây úng.',
      'Bổ sung dinh dưỡng phóng thích chậm nuôi cây mập lá suốt 6 tháng.'
    ],
    meaning: 'Nền tảng vững chắc cho mọi mầm xanh phát triển khỏe mạnh và rực rỡ.'
  }
];

export const CARE_GUIDES = [
  {
    id: 'water-rule',
    title: 'Nguyên Tắc Tưới Nước "Bất Di Bất Dịch"',
    summary: '90% sen đá chết vì thừa nước chứ không phải thiếu nước!',
    content: 'Chỉ tưới khi giá thể khô hoàn toàn từ trên mặt xuống đáy chậu. Dùng que tăm xiên sâu vào đất, nếu tăm khô sạch mới tưới. Khi tưới, hãy tưới đẫm nước quanh miệng chậu cho đến khi nước chảy ra ở đáy chậu, tuyệt đối tránh xịt nước đọng vào nách lá khi trời nắng nóng.'
  },
  {
    id: 'sun-light',
    title: 'Ánh Sáng & Cách "Thuần" Nắng Sen Đá',
    summary: 'Sen đá cần nắng để giữ dáng khum và lên màu rực rỡ.',
    content: 'Ánh sáng tốt nhất là nắng sớm từ 6h - 10h sáng. Nếu mới mua về từ nhà vườn hoặc nơi mát mẻ, hãy để cây ở bóng râm có gió 2-3 ngày, sau đó mới tăng dần thời gian tiếp xúc nắng 1-2 tiếng mỗi ngày để tránh hiện tượng sốc nhiệt, cháy nám lá.'
  },
  {
    id: 'soil-mix',
    title: 'Bí Quyết Trộn Giá Thể Thoát Nước Siêu Tốc',
    summary: 'Đất bí chặt là kẻ thù số 1 của rễ cây mọng nước.',
    content: 'Tỉ lệ vàng cho giá thể sen đá là 60-70% đá khoáng (Pumice, Perlite, Lava rock, Vermiculite) và 30-40% chất mùn hữu cơ (Peat moss, trấu hun, phân trùn quế). Giá thể chuẩn phải thoát sạch nước trong vòng 5 giây sau khi tưới.'
  },
  {
    id: 'rescue-overwater',
    title: 'Cách Cứu Cây Bị Úng Nước, Vàng Nhũn Lá',
    summary: 'Xử lý ngay trong 24h đầu tiên để cứu sống gốc rễ.',
    content: 'Ngay khi thấy lá dưới gốc mềm nhũn, trong suốt: Hãy nhổ cây khỏi chậu ngay lập tức, giũ sạch đất ẩm. Dùng dao lam tiệt trùng cắt bỏ phần rễ/thân thối đến khi thấy mô xanh khỏe. Bôi vôi hoặc bột quế vào vết cắt, để nơi thoáng gió 3-5 ngày cho khô sẹo rồi mới đặt lên đất mới kích rễ.'
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Phương Linh (Hà Nội)',
    role: 'Nhân viên văn phòng',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    comment: 'Cây đóng gói cực kỳ cẩn thận, quấn bông gòn nhiều lớp nên từ Đà Lạt ship ra Hà Nội cây vẫn nguyên vẹn không rụng một cánh nào! Chậu sen đá kim cương trong suốt ngắm xả stress cực kỳ.',
    stars: 5,
    product: 'Sen Đá Kim Cương'
  },
  {
    id: 2,
    name: 'Hoàng Nam (TP. Hồ Chí Minh)',
    role: 'Lập trình viên',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    comment: 'Mình dân IT ngồi máy tính cả ngày, tậu em Móng Rồng với Hoàng Tử Đen để bàn làm việc 2 tuần quên tưới vẫn xanh mướt. Quét mã VietQR chuyển khoản cực nhanh, shop hỗ trợ nhiệt tình 10 sao!',
    stars: 5,
    product: 'Sen Đá Móng Rồng'
  },
  {
    id: 3,
    name: 'Thu Trang (Đà Nẵng)',
    role: 'Kiến trúc sư',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    comment: 'Giao diện web đẹp mê ly, cái công cụ trắc nghiệm chọn cây chuẩn ghê luôn! Mình làm theo quiz ra cây Chuỗi Ngọc rủ ban công, giờ cây dài 20cm rủ xuống nhìn thơ mộng lắm.',
    stars: 5,
    product: 'Sen Đá Chuỗi Ngọc'
  }
];

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Bạn dự định đặt chậu sen đá ở vị trí nào?',
    options: [
      { text: 'Bàn làm việc trong phòng máy lạnh / ít ánh nắng', type: 'indoor', hint: 'Phù hợp dòng chịu râm, lọc khí' },
      { text: 'Cạnh cửa sổ có nắng sáng dịu nhẹ', type: 'indirect', hint: 'Ánh sáng tán xạ lý tưởng' },
      { text: 'Ban công, sân thượng ngập tràn ánh nắng tự nhiên', type: 'full_sun', hint: 'Thích hợp dòng lên màu rực rỡ' }
    ]
  },
  {
    id: 2,
    question: 'Thời gian chăm sóc cây của bạn như thế nào?',
    options: [
      { text: 'Tôi rất bận, hay quên tưới nước cả tuần', type: 'super_easy', hint: 'Cây chịu hạn siêu phàm' },
      { text: 'Tôi có thể kiểm tra và tưới cây 1 lần mỗi tuần', type: 'moderate', hint: 'Chế độ chăm sóc chuẩn' },
      { text: 'Tôi thích ngắm và chăm sóc cây mỗi ngày', type: 'enthusiast', hint: 'Dòng cây độc đáo, cao cấp' }
    ]
  },
  {
    id: 3,
    question: 'Phong cách thẩm mỹ bạn yêu thích nhất?',
    options: [
      { text: 'Lá mọng tròn trong veo, thanh tao tinh tế', style: 'haworthia', hint: 'Dòng Haworthia pha lê' },
      { text: 'Cánh hoa xòe tròn như đóa hồng, sắc màu phong phú', style: 'echeveria', hint: 'Dòng Sen Đài quý phái' },
      { text: 'Cành nhánh dáng bon-sai hoặc dây rủ thướt tha', style: 'special', hint: 'Dòng nghệ thuật phá cách' }
    ]
  }
];
