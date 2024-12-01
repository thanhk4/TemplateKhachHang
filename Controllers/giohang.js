app.controller("GiohangCtrl", function ($document, $rootScope, $scope) {
    // Thêm CSS
    const link = angular.element('<link rel="stylesheet" href="css/giohang.css">');
    $document.find('head').append(link);
    $rootScope.$on('$destroy', () => link.remove());

    // API URLs
    const apiUrls = {
        gioHang: "https://localhost:7297/api/Giohang/giohangkhachhang",
        gioHangChiTiet: "https://localhost:7297/api/Giohangchitiet/giohangchitietbygiohang",
        sanPhamChiTiet: "https://localhost:7297/api/Sanphamchitiet",
        sanPham: "https://localhost:7297/api/Sanpham",
        thuocTinh: "https://localhost:7297/api/Sanphamchitiet/thuoctinh",
        saleChiTiet: "https://localhost:7297/api/Salechitiet/SanPhamCT"
    };

    // Hàm lấy thông tin khách hàng từ localStorage
    function GetByidKH() {
        // Lấy dữ liệu từ localStorage
        const userInfoString = localStorage.getItem("userInfo");
        let userId = 0; // Giá trị mặc định nếu không có thông tin khách hàng

        // Kiểm tra nếu dữ liệu tồn tại
        if (userInfoString) {
            try {
                // Chuyển đổi chuỗi JSON thành đối tượng
                const userInfo = JSON.parse(userInfoString);

                // Kiểm tra và lấy giá trị id từ userInfo
                userId = userInfo?.id || 0;
            } catch (error) {
                console.error("Lỗi khi phân tích dữ liệu userInfo:", error);
            }
        } else {
            console.warn("Dữ liệu userInfo không tồn tại trong localStorage.");
        }

        return userId;
    }

    // Hàm lấy id giỏ hàng
    async function fetchGioHangId(idkh) {
        try {
            const response = await fetch(`${apiUrls.gioHang}/${idkh}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy id giỏ hàng:", error);
            return null;
        }
    }

    // Hàm lấy danh sách chi tiết giỏ hàng
    async function fetchGioHangChiTiet(gioHangId) {
        try {
            const response = await fetch(`${apiUrls.gioHangChiTiet}/${gioHangId}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách chi tiết giỏ hàng:", error);
            return [];
        }
    }

    // Hàm gọi API để lấy sản phẩm chi tiết theo idspct
    async function fetchSanPhamChitiet(sanPhamCTId) {
        try {
            // Kiểm tra nếu idspct có giá trị hợp lệ
            if (!sanPhamCTId) {
                console.error("idspct không hợp lệ");
                return null;
            }

            // Gọi API với idspct
            const response = await fetch(`${apiUrls.sanPhamChiTiet}/${sanPhamCTId}`);

            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }

            const data = await response.json();

            // Nếu API trả về một đối tượng, chuyển đổi nó thành mảng
            return Array.isArray(data) ? data : [data];
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm chi tiết:", error);
            return null; // Trả về null nếu có lỗi
        }
    }

    // Hàm gọi API để lấy thông tin sản phẩm (tensp, urlhinhanh) theo idsp
    async function fetchSanPhamById(idsp) {
        try {
            const response = await fetch(`${apiUrls.sanPham}/${idsp}`);
            if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy thông tin sản phẩm:", error);
            return null;
        }
    }

    // Hàm lấy thuộc tính sản phẩm chi tiết
    async function fetchThuocTinhSPCT(idspct) {
        try {
            const response = await fetch(`${apiUrls.thuocTinh}/${idspct}`);
            if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy thuộc tính sản phẩm chi tiết:", error);
            return [];
        }
    }

    // Hàm gọi API giảm giá chi tiết theo ID sản phẩm chi tiết
    async function fetchSaleChiTietBySPCTId(spctId) {
        try {
            // Gọi API giảm giá chi tiết
            const response = await fetch(`https://localhost:7297/api/Salechitiet/SanPhamCT/${spctId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn("Không tìm thấy dữ liệu giảm giá chi tiết");
                    return null; // Không tìm thấy, trả về null
                }
                throw new Error(`Lỗi API giảm giá: ${response.status}`);
            }

            return await response.json(); // Trả về dữ liệu JSON nếu thành công
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu giảm giá chi tiết:", error);
            return null; // Trả về null nếu có lỗi
        }
    }


    function createThuocTinhSelects(thuocTinhList, id) {
        let thuocTinhSelects = '';
        thuocTinhList.forEach(tt => {
            thuocTinhSelects += `
                <div 
                    class="badge bg-primary text-white text-center d-inline-block me-2" 
                    id="select-ttspct-${tt.idtt}" 
                    style="pointer-events: none;">
                    ${tt.tenthuoctinhchitiet}
                </div>
            `;
        });
        return thuocTinhSelects;
    }
    // Hàm render sản phẩm
    async function renderGioHang() {
        const idkh = GetByidKH();
        const productList = document.querySelector(".product-list");
        productList.innerHTML = ""; // Reset danh sách sản phẩm trước khi render

        const idgh = await fetchGioHangId(idkh);
        console.log(idgh);

        // Lấy danh sách chi tiết giỏ hàng
        const idghct = await fetchGioHangChiTiet(idgh.id);
        console.log(idghct);

        let sanPhamChitiets = [];

        // Vòng lặp xử lý từng phần tử trong danh sách idghct
        for (const item of idghct) {
            try {
                const sanPhamChiTiet = await fetchSanPhamChitiet(item.idspct);
                if (sanPhamChiTiet && sanPhamChiTiet.length > 0) {
                    // Thêm thông tin số lượng từ idghct vào mỗi sản phẩm
                    sanPhamChiTiet.forEach(sp => {
                        sp.soluong = item.soluong; // Gắn số lượng tương ứng
                    });
                    sanPhamChitiets = [...sanPhamChitiets, ...sanPhamChiTiet];
                }
            } catch (error) {
                console.error(`Lỗi khi xử lý sản phẩm chi tiết với idspct: ${item.idspct}`, error);
            }
        }

        console.log(sanPhamChitiets);

        danhSachSanPham = []; // Reset lại danh sách sản phẩm mỗi lần render lại

        // Duyệt qua tất cả sản phẩm chi tiết (spct) để render thông tin sản phẩm
        for (const sanPham of sanPhamChitiets) {
            const { id, idsp, giathoidiemhientai, trangthai, soluong } = sanPham;

            if (trangthai !== 0 || soluong < 1) {
                continue; // Bỏ qua sản phẩm không thỏa mãn điều kiện
            }

            const sanPhamData = await fetchSanPhamById(idsp);
            if (!sanPhamData) continue;

            const saleChiTiet = await fetchSaleChiTietBySPCTId(id);
            let giaGiam = null; // Giá giảm mặc định là null

            if (saleChiTiet != null) {
                const { giatrigiam, donvi } = saleChiTiet;
                giaGiam = calculateDiscountPrice(giathoidiemhientai, giatrigiam, donvi);
            }

            const thuocTinhList = await fetchThuocTinhSPCT(id);
            if (!thuocTinhList || thuocTinhList.length === 0) {
                console.log(`Không có thuộc tính cho sản phẩm chi tiết với ID: ${id}`);
                continue;
            }

            let thuocTinhSelects = createThuocTinhSelects(thuocTinhList, id);

            danhSachSanPham.push({
                id: id,
                idsp: idsp,
                tensp: sanPhamData.tensp,
                giathoidiemhientai: giathoidiemhientai,
                soluong: soluong,
                giamgia: giaGiam || 0,
            });

            // Tạo HTML
            const productItem = document.createElement("div");
            productItem.className = "product-item d-flex align-items-center py-2 border-bottom";

            const giaHienThi = giaGiam
                ? `<span class="text-muted text-decoration-line-through">${Number(giathoidiemhientai).toLocaleString('vi-VN')} VND</span>
                <span class="text-danger fw-bold ms-2">${Number(giaGiam).toLocaleString('vi-VN')} VND</span>`
                : `<span class="text-danger fw-bold">${Number(giathoidiemhientai).toLocaleString('vi-VN')} VND</span>`;

            productItem.innerHTML = `
            <div class="d-flex align-items-center" style="width: 50%;">
                <img src="../image/${sanPhamData.urlHinhanh}" alt="Product Image" style="width: 80px; height: auto;">
                <div class="ms-3" style="flex: 1;">
                    <p class="mb-1 fw-bold">${sanPhamData.tensp}</p>
                    <span class="text-muted">Phân Loại Hàng:</span>
                    ${thuocTinhSelects}
                </div>
            </div>
            <div class="d-flex justify-content-between align-items-center" style="width: 50%;">
                <div class="text-center" style="width: 50%; display: ruby;">
                    ${giaHienThi}
                </div>
                <div class="d-flex justify-content-center align-items-center" style="width: 15%;">
                    <span class="text-black fw-bold quantity-display">${soluong}</span>
                </div>
                <div class="text-center text-danger fw-bold total-price" style="width: 35%;"></div>
            </div>
            `;
            productList.appendChild(productItem);
        }
        initializeTotalPrices();
        updateTotals();
    }

    function updateTotals() {
        const productItems = document.querySelectorAll(".product-item");
        const discountElement = document.querySelector("#soTienGiamGia");
        const totalProductElement = document.querySelector("#tongSanPham");
        const totalInvoiceElement = document.querySelector("#tongHoaDon");

        let totalProduct = 0;

        // Tính tổng giá trị sản phẩm
        productItems.forEach((item) => {
            const priceElement = item.querySelector(".total-price");
            if (priceElement) {
                const price = parseInt(priceElement.textContent.replace(" VND", "").replace(/\./g, "")) || 0;
                totalProduct += price;
            }
        });

        // Lấy số tiền giảm giá
        const discount = parseInt(discountElement.textContent.replace(" VND", "").replace(/\./g, "")) || 0;

        // Cập nhật giá trị
        totalProductElement.textContent = `${totalProduct.toLocaleString('vi-VN')} VND`;

        // Nếu tổng hóa đơn nhỏ hơn 0, thì gán giá trị bằng 0
        const totalInvoiceValue = Math.max(0, totalProduct - discount);
        totalInvoiceElement.textContent = `${totalInvoiceValue.toLocaleString('vi-VN')} VND`;
    }

    function initializeTotalPrices() {
        const productItems = document.querySelectorAll(".product-item");
        productItems.forEach((productItem) => {
            const priceElement = productItem.querySelector(".total-price");
            const priceOriginal = parseInt(
                productItem.querySelector(".text-danger.fw-bold").textContent.replace(" VND", "").replace(/\./g, "")
            );

            // Lấy số lượng từ danhSachSanPham
            const quantity = parseInt(productItem.querySelector(".quantity-display").textContent || 1);

            // Cập nhật tổng giá mặc định
            updateTotalPrice(priceElement, priceOriginal, quantity);
        });
    }

    function updateTotalPrice(priceElement, priceOriginal, quantity) {
        const totalPrice = quantity * priceOriginal;
        priceElement.textContent = `${totalPrice.toLocaleString('vi-VN')} VND`;
    }

    renderGioHang();
});
