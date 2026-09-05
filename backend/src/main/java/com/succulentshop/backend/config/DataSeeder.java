package com.succulentshop.backend.config;

import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.repository.CouponRepository;
import com.succulentshop.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;

    public DataSeeder(ProductRepository productRepository, CouponRepository couponRepository) {
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
    }

    @Override
    public void run(String... args) {
        // Seed Coupons
        if (couponRepository.count() == 0) {
            couponRepository.saveAll(List.of(
                new Coupon("SENXANH10", 10, true, "Giảm 10% cho đơn hàng đầu tiên"),
                new Coupon("SENXANH20", 20, true, "Giảm 20% cho khách hàng thân thiết")
            ));
            System.out.println("🌱 [Spring Boot] Coupons seeded successfully!");
        }

        // Seed Products
        if (productRepository.count() == 0) {
            List<Product> initialProducts = List.of(
                new Product(
                    "sen-da-kim-cuong",
                    "Sen Đá Kim Cương Pha Lê",
                    "Haworthia Cooperi",
                    "haworthia",
                    85000,
                    110000,
                    4.9,
                    128,
                    "Bán chạy",
                    "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80",
                    "Dễ trồng",
                    1,
                    "Trong nhà / Bàn làm việc",
                    "indoor",
                    "1 tuần / 1 lần",
                    7,
                    "Mini (6 - 8cm)",
                    "Bàn văn phòng, cạnh cửa sổ sáng, kệ sách",
                    35,
                    "Sen đá Kim Cương (Haworthia Cooperi) sở hữu những bọng lá tròn đầy, phần đầu cánh lá trong suốt như pha lê có thể nhìn xuyên thấu. Cây rất chuộng ánh sáng gián tiếp và là lựa chọn hàng đầu cho bàn làm việc.",
                    "Tượng trưng cho sự thuần khiết, tinh khôi và thu hút nguồn năng lượng sáng tạo tích cực.",
                    "[\"Để nơi có ánh sáng tán xạ (cạnh cửa sổ, đèn bàn làm việc dịu). Tránh nắng trưa gắt làm cháy đầu lá trong suốt.\", \"Chỉ tưới khi đất khô hoàn toàn, tưới quanh gốc, không đọng nước lên ngọn.\", \"Dùng chậu có lỗ thoát nước tốt và giá thể thông thoáng (nhiều đá pumice, perlite).\"]"
                ),
                new Product(
                    "sen-da-nau",
                    "Sen Đá Nâu (Hoàng Tử Đen)",
                    "Echeveria Black Prince",
                    "echeveria",
                    65000,
                    85000,
                    4.8,
                    94,
                    "Ưa chuộng",
                    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
                    "Dễ trồng",
                    1,
                    "Nhiều nắng trực tiếp",
                    "full_sun",
                    "10 - 14 ngày / lần",
                    12,
                    "Trung (8 - 10cm)",
                    "Ban công, sân thượng ngập nắng, bậu cửa sổ đón nắng sớm",
                    42,
                    "Sen Đá Nâu gây ấn tượng với các cánh lá dày, nhọn dần về ngọn, xếp lớp tròn đối xứng hoàn hảo. Càng tắm nhiều nắng, màu lá càng chuyển sang sắc nâu socola ánh tím thẫm cực kỳ huyền bí.",
                    "Biểu tượng cho tình bạn bền chặt, tình yêu son sắt kiên định và mang lại tài lộc, bình an.",
                    "[\"Cần ít nhất 4 - 6 tiếng nắng sớm mỗi ngày để giữ form lá khum và màu nâu thẫm chuẩn đẹp.\", \"Rất chịu hạn tốt, chỉ tưới đẫm khi nhấc chậu thấy thật nhẹ.\", \"Phòng úng vào mùa mưa bằng cách kê chậu nơi thoáng gió.\"]"
                ),
                new Product(
                    "sen-da-chuoi-ngoc",
                    "Sen Đá Chuỗi Ngọc Rủ",
                    "Sedum Morganianum (Burro's Tail)",
                    "echeveria",
                    95000,
                    120000,
                    4.9,
                    76,
                    "Hot trend",
                    "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80",
                    "Trung bình",
                    2,
                    "Nắng tán xạ / Nắng dịu",
                    "indirect",
                    "7 - 10 ngày / lần",
                    8,
                    "Dây rủ 15 - 20cm",
                    "Chậu treo ban công, giàn hoa, góc quán cafe",
                    18,
                    "Những chuỗi lá mọng nước hình giọt lệ xếp san sát nhau như chuỗi ngọc bích buông dài thướt tha. Cây tạo nên mảng xanh rủ mềm mại tuyệt đẹp khi trồng chậu treo.",
                    "Tượng trưng cho sự may mắn, phúc lộc đong đầy và con cháu sum vầy.",
                    "[\"Treo nơi có gió thoảng và ánh sáng dịu. Tránh va chạm mạnh vì hạt lá dễ rụng khi chưa bén rễ chắc.\", \"Khi hạt ngọc hơi nhăn nhẹ là dấu hiệu cần bổ sung nước.\", \"Mỗi hạt lá rụng rơi xuống đất ẩm đều có thể mọc thành một cây con mới.\"]"
                ),
                new Product(
                    "sen-da-mong-rong",
                    "Sen Đá Móng Rồng Cảnh",
                    "Haworthia Fasciata (Zebra Plant)",
                    "haworthia",
                    55000,
                    70000,
                    4.9,
                    210,
                    "Siêu bền",
                    "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80",
                    "Cực dễ trồng",
                    1,
                    "Trong nhà / Bàn làm việc",
                    "indoor",
                    "10 - 15 ngày / lần",
                    14,
                    "Mini (7 - 9cm)",
                    "Cạnh màn hình máy tính, bàn học, quầy lễ tân",
                    60,
                    "Lá vuốt nhọn hướng lên trên với những đường viền gân ngang màu trắng nổi bật như vằn ngựa hoặc móng vuốt rồng dũng mãnh. Cây có sức sống mãnh liệt, chịu râm cực tốt và hút tia bức xạ điện tử.",
                    "Tượng trưng cho sự che chở, hộ mệnh, xua đuổi điều xui rủi và mang lại sự quyết đoán.",
                    "[\"Thích nghi hoàn hảo với môi trường máy lạnh và ánh đèn huỳnh quang văn phòng.\", \"Cực kỳ ghét thừa nước, bỏ quên 2-3 tuần cây vẫn tươi xanh khỏe mạnh.\", \"Mỗi năm có thể đẻ thêm 3 - 5 cây con quanh gốc.\"]"
                ),
                new Product(
                    "sen-da-thach-ngoc",
                    "Sen Đá Thạch Ngọc Đổi Màu",
                    "Sedum Rubrotinctum (Jelly Bean)",
                    "echeveria",
                    75000,
                    90000,
                    4.7,
                    82,
                    "Mới về",
                    "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80",
                    "Dễ trồng",
                    1,
                    "Nhiều nắng",
                    "full_sun",
                    "7 - 10 ngày / lần",
                    8,
                    "Chùm xòe (8 - 10cm)",
                    "Bậu cửa sổ nhiều nắng, ban công hướng Đông",
                    25,
                    "Cây có từng chùm lá tròn nhỏ xinh xắn như những viên kẹo thạch jelly bean. Khi đón đủ nắng và gió lạnh nhẹ, chóp lá sẽ chuyển dần từ xanh ngọc sang đỏ cam rực rỡ.",
                    "Mang ý nghĩa về sự vui tươi, năng lượng căng tràn và ngọt ngào trong cuộc sống.",
                    "[\"Cho cây tắm nắng trực tiếp để lên màu đỏ ửng ngọt ngào.\", \"Đất trồng cần thoát nước nhanh, không để nước mưa ứ đọng nhiều ngày.\", \"Cành dài có thể cắt tỉa cắm sang chậu mới để tạo bụi sum suê.\"]"
                ),
                new Product(
                    "sen-da-bap-cai-tim",
                    "Sen Đá Bắp Cải Xoăn Hồng Tím",
                    "Echeveria Cabbage Rose",
                    "echeveria",
                    135000,
                    160000,
                    4.9,
                    63,
                    "Size lớn VIP",
                    "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
                    "Trung bình",
                    2,
                    "Nhiều nắng tán xạ",
                    "indirect",
                    "1 tuần / lần",
                    7,
                    "Size Đại (13 - 16cm)",
                    "Bàn tiếp khách, ban công thoáng gió",
                    14,
                    "Một trong những giống sen đá lộng lẫy nhất với tán lá to bản dập dềnh lượn sóng như chiếc váy dạ hội kiêu kỳ. Viền lá phủ phấn hồng ánh tím mộng mơ.",
                    "Thể hiện sự quý phái, đẳng cấp vương giả và sự sung túc ấm no cho gia chủ.",
                    "[\"Tưới nước cẩn thận sát gốc đất, tuyệt đối không xịt nước trực tiếp lên bắp xoăn vì dễ đọng nước gây thối nõn.\", \"Để nơi thoáng gió tối đa, ánh sáng từ 4-6 tiếng dịu mát.\", \"Bổ sung phân bón tan chậm chuyên dụng 3 tháng/lần.\"]"
                ),
                new Product(
                    "sen-da-phat-ba",
                    "Sen Đá Phật Bà Cánh Sao",
                    "Sempervivum Calcareum",
                    "echeveria",
                    70000,
                    90000,
                    4.8,
                    115,
                    "Phong thủy",
                    "https://images.unsplash.com/photo-1516048015710-7a3b4c86be43?auto=format&fit=crop&w=800&q=80",
                    "Dễ trồng",
                    1,
                    "Nắng vừa / Ban công",
                    "indirect",
                    "7 - 10 ngày / lần",
                    9,
                    "Trung (9 - 11cm)",
                    "Bàn làm việc, góc thiền định, bàn trà",
                    30,
                    "Tán lá xếp đối xứng nhiều lớp xòe đều như tòa sen của Bồ Tát Quan Âm. Đầu mỗi cánh lá có chóp nhọn màu đỏ tía tạo điểm nhấn thanh tịnh, hài hòa.",
                    "Biểu tượng của sự che chở bình an, tĩnh tâm và may mắn trường tồn.",
                    "[\"Chịu được khí hậu mát mẻ và hanh khô rất tốt.\", \"Cắt bỏ những lá già khô dưới đáy định kỳ để cây thông thoáng không bị nấm bệnh.\", \"Đẻ nhiều nhánh con (cây đệ tử) chạy quanh thân mẹ tạo thành cụm tuyệt đẹp.\"]"
                ),
                new Product(
                    "sen-da-do-la-hong",
                    "Sen Đá Đô La Hồng Bon-sai",
                    "Portulacaria Afra Variegata",
                    "haworthia",
                    110000,
                    140000,
                    4.9,
                    88,
                    "Chiêu tài",
                    "https://images.unsplash.com/photo-1508022713622-df2d8fb7b4ea?auto=format&fit=crop&w=800&q=80",
                    "Dễ trồng",
                    1,
                    "Nắng tán xạ / Nắng sáng",
                    "indirect",
                    "5 - 7 ngày / lần",
                    6,
                    "Dáng Bon-sai (15 - 18cm)",
                    "Quầy thu ngân, bàn giám đốc, cửa sổ phòng khách",
                    20,
                    "Thân cây gỗ mọng nước mọc nhiều nhánh bon-sai uyển chuyển, lá nhỏ tròn cẩm thạch màu xanh kem và ngọn cây phớt hồng pastel xinh lung linh.",
                    "Thu hút tài lộc, vượng khí kinh doanh và sự thăng tiến hanh thông trong công việc.",
                    "[\"Rất dễ uốn nắn và cắt tỉa theo dáng bon-sai tùy thích.\", \"Chịu nắng khá tốt và có nhu cầu nước nhỉnh hơn một chút so với sen đài.\", \"Nhánh tỉa giâm xuống đất ẩm sẽ ra rễ chỉ sau 10 ngày.\"]"
                ),
                new Product(
                    "xuong-rong-thanh-son",
                    "Xương Rồng Lâu Đài Cổ Tích (Thanh Sơn)",
                    "Acanthocereus Tetragonus (Fairy Castle)",
                    "cactus",
                    60000,
                    80000,
                    4.8,
                    140,
                    "Bền bỉ",
                    "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
                    "Cực dễ trồng",
                    1,
                    "Nhiều nắng trực tiếp",
                    "full_sun",
                    "2 - 3 tuần / lần",
                    18,
                    "Dáng Trụ (12 - 15cm)",
                    "Bàn làm việc, góc ban công, bậu cửa sổ",
                    45,
                    "Các nhánh xương rồng xanh mướt mọc xếp tầng cao thấp như những tòa tháp lâu đài cổ tích phương Tây. Gai mềm trắng mịn không gây đau khi vô tình chạm nhẹ.",
                    "Ý chí kiên định, vượt qua mọi chông gai thử thách và sự bảo vệ vững chãi.",
                    "[\"Thuộc dòng cây cực kỳ chịu hạn, tưới 1 tháng 1-2 lần là đủ.\", \"Rất thích ánh nắng mặt trời, để nơi càng nhiều nắng thân cây càng cứng cáp xanh đậm.\", \"Đất trồng yêu cầu 70% đá sỏi thoát nước tốt.\"]"
                ),
                new Product(
                    "combo-vuon-mini",
                    "Combo \"Góc Nhỏ An Yên\" (3 Cây + Chậu Gốm)",
                    "Succulent Gift Trio Set",
                    "combo",
                    245000,
                    320000,
                    5.0,
                    156,
                    "Best Gift",
                    "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80",
                    "Dễ trồng",
                    1,
                    "Trong nhà / Bàn làm việc",
                    "indirect",
                    "1 tuần / lần",
                    7,
                    "Khay gỗ 25cm kèm 3 chậu gốm mộc",
                    "Bàn làm việc văn phòng, quà tặng sinh nhật, tân gia",
                    25,
                    "Set quà tặng gồm 3 dòng sen đá dễ chăm nhất (Kim cương, Nâu, Móng rồng) được trồng sẵn trong chậu gốm mộc thủ công, đi kèm khay gỗ thông tự nhiên và thiệp viết tay theo yêu cầu.",
                    "Món quà xanh chữa lành tâm hồn, gửi gắm lời chúc sức khỏe, an yên và may mắn.",
                    "[\"Đã được sang chậu sẵn với giá thể cao cấp chuẩn xả bầu.\", \"Kèm bình xịt tưới cây vòi nhỏ tiện lợi cho dân văn phòng.\", \"Bảo hành đổi trả miễn phí trong 7 ngày nếu cây có dấu hiệu suy yếu.\"]"
                ),
                new Product(
                    "chau-gom-moc-vintage",
                    "Set 2 Chậu Đất Nung Gốm Mộc Khắc Tay",
                    "Handcrafted Terracotta Pots",
                    "accessories",
                    85000,
                    110000,
                    4.9,
                    78,
                    "Thoát nước 10/10",
                    "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80",
                    "Phụ kiện",
                    1,
                    "Mọi không gian",
                    "indoor",
                    "N/A",
                    0,
                    "Đường kính 9cm & 11cm",
                    "Thích hợp cho mọi loại sen đá và xương rồng",
                    50,
                    "Chậu đất nung nung ở nhiệt độ tiêu chuẩn giữ được độ xốp tự nhiên của đất sét. Bề mặt thấm hút và thoát ẩm cực kỳ nhanh, giúp rễ sen đá hô hấp và chống sốc nhiệt, chống úng triệt để.",
                    "Nâng niu bộ rễ của cây, kết nối sự thô mộc của đất trời với không gian sống hiện đại.",
                    "[\"Đáy có lỗ thoát nước lớn 1.5cm tiêu chuẩn.\", \"Tặng kèm lưới chắn đáy chậu ngăn giá thể rơi ra ngoài.\", \"Họa tiết khắc chìm thủ công phong cách Bắc Âu tối giản.\"]"
                ),
                new Product(
                    "gia-the-soil-mix",
                    "Giá Thể Trồng Sen Đá Cao Cấp 5 Trong 1 (Bao 3kg)",
                    "Premium Succulent Soil Mix",
                    "accessories",
                    65000,
                    80000,
                    5.0,
                    310,
                    "Chuẩn nhà vườn",
                    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
                    "Phụ kiện",
                    1,
                    "Mọi không gian",
                    "indoor",
                    "N/A",
                    0,
                    "Bao 3kg (Trồng được 6-8 chậu nhỏ)",
                    "Phối trộn sẵn tiện lợi dùng ngay",
                    100,
                    "Công thức giá thể độc quyền chuẩn nhà vườn Đà Lạt: 40% Pumice + 20% Perlite + 15% Akadama Nhật + 15% Peatmoss xử lý + 10% Phân trùn quế hữu cơ và nấm đối kháng Trichoderma chống nấm rễ.",
                    "Nền tảng vững chắc cho mọi mầm xanh phát triển khỏe mạnh và rực rỡ.",
                    "[\"Không cần trộn thêm bất cứ thành phần nào khác, có thể dùng ngay khi mở bao.\", \"Thoát nước 100% chỉ sau 5 giây tưới, giữ ẩm rễ nhưng không bao giờ gây úng.\", \"Bổ sung dinh dưỡng phóng thích chậm nuôi cây mập lá suốt 6 tháng.\"]"
                )
            );

            productRepository.saveAll(initialProducts);
            System.out.println("🌿 [Spring Boot] 12 Succulent products seeded to H2 Database!");
        }
    }
}
