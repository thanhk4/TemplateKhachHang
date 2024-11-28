app.controller("MuaSanPhamCtrl", function ($document, $rootScope, $routeParams) {
    const quantityInput = document.querySelector(".quantity-input");
    const priceElement = document.querySelector(".total-price");
    const sanPhamCTId = $routeParams.id;
    window.onload = function () {
        if (quantityInput && priceElement) {
            updateTotalPrice();
        }
    };

    let link = angular.element('<link rel="stylesheet" href="css/MuaSanPham.css">');
    $document.find('head').append(link);
    $rootScope.$on('$destroy', function () {
        link.remove();
    });

    // API URLs
    const apiSPCTUrl = "https://localhost:7297/api/Sanphamchitiet";
    const apiSPUrl = "https://localhost:7297/api/Sanpham";
    const apiTTSPCTUrl = "https://localhost:7297/api/Sanphamchitiet/thuoctinh";
    const discountApiUrl = "https://localhost:7297/api/Giamgia";
    const apiKHUrl = "https://localhost:7297/api/Khachhang";


    // Hàm gọi API để lấy sản phẩm chi tiết theo idspct
    async function fetchSanPhamChitiet() {
        try {
            // Kiểm tra nếu idspct có giá trị hợp lệ
            if (!sanPhamCTId) {
                console.error("idspct không hợp lệ");
                return null;
            }

            // Gọi API với idspct
            const response = await fetch(`${apiSPCTUrl}/${sanPhamCTId}`);

            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }

            // Chuyển đổi dữ liệu JSON từ response
            const data = await response.json();

            // Trả về dữ liệu của sản phẩm chi tiết
            return data;
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm chi tiết:", error);
            return null; // Trả về null nếu có lỗi
        }
    }


    // Hàm gọi API để lấy thông tin sản phẩm (tensp, urlhinhanh) theo idsp
    async function fetchSanPhamById(idsp) {
        try {
            const response = await fetch(`${apiSPUrl}/${idsp}`);
            if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy thông tin sản phẩm:", error);
            return null;
        }
    }

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

    // Hàm lấy thông tin khách hàng từ API và cập nhật vào HTML
    async function fetchkhachangById() {
        // Lấy ID khách hàng
        const idkh = GetByidKH();
        if (!idkh) {
            console.warn("Không thể lấy ID khách hàng.");
            return;
        }

        try {
            // Gửi yêu cầu đến API với idkh
            const response = await fetch(`${apiKHUrl}/${idkh}`);

            // Kiểm tra nếu response không ok, vứt lỗi
            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }

            // Chuyển đổi dữ liệu JSON
            const khachHangData = await response.json();

            // Kiểm tra xem dữ liệu có hợp lệ hay không
            if (!khachHangData) {
                throw new Error("Dữ liệu khách hàng không hợp lệ.");
            }

            // Hiển thị dữ liệu vào HTML nếu các phần tử tồn tại
            if (document.getElementById("hovaten")) {
                document.getElementById("hovaten").innerText = khachHangData.ten || "Chưa cập nhật";
            }
            if (document.getElementById("sdt")) {
                document.getElementById("sdt").innerText = khachHangData.sdt || "Chưa cập nhật";
            }
            if (document.getElementById("diachi")) {
                document.getElementById("diachi").innerText = khachHangData.diachi || "Chưa cập nhật";
            }

            // Trả về dữ liệu khách hàng
            return khachHangData;

        } catch (error) {
            // Hiển thị thông báo lỗi khi có vấn đề xảy ra
            console.error("Lỗi khi lấy thông tin khách hàng:", error);
            alert("Có lỗi xảy ra khi tải thông tin khách hàng. Vui lòng thử lại.");
        }
    }


    // Biến toàn cục lưu trữ danh sách sản phẩm
    let danhSachSanPham = [];

    // Hàm render sản phẩm
    async function renderSanPham() {
        const sanPhamChitiets = await fetchSanPhamChitiet();
        const productList = document.querySelector(".product-list");

        if (sanPhamChitiets.length === 0) {
            productList.innerHTML = "<p>Không có sản phẩm nào để hiển thị.</p>";
            return;
        }

        danhSachSanPham = []; // Reset lại danh sách sản phẩm mỗi lần render lại

        // Duyệt qua tất cả sản phẩm chi tiết (spct) để render thông tin sản phẩm
        for (const sanPham of sanPhamChitiets) {
            const { id, idsp, giathoidiemhientai, trangthai, soluong } = sanPham; // Thêm trường trangthai và soluong

            // Kiểm tra nếu sản phẩm chi tiết có trạng thái = 0 và số lượng > 1
            if (trangthai !== 0 || soluong < 1) {
                continue; // Bỏ qua sản phẩm không thỏa mãn điều kiện
            }

            // Lấy thông tin sản phẩm từ bảng sp
            const sanPhamData = await fetchSanPhamById(idsp);
            if (!sanPhamData) continue; // Nếu không tìm thấy sản phẩm, bỏ qua

            // Lấy thuộc tính sản phẩm chi tiết
            const thuocTinhList = await fetchThuocTinhSPCT(id);
            if (!thuocTinhList || thuocTinhList.length === 0) {
                console.log(`Không có thuộc tính cho sản phẩm chi tiết với ID: ${id}`);
                continue; // Nếu không có thuộc tính chi tiết hoặc là null, bỏ qua sản phẩm này
            }

            // Gọi hàm để tạo phần tử select cho thuộc tính
            let thuocTinhSelects = createThuocTinhSelects(thuocTinhList, id);

            // Lưu thông tin sản phẩm vào danhSachSanPham
            danhSachSanPham.push({
                id: id, // id của sản phẩm chi tiết
                idsp: idsp, // id của sản phẩm
                tensp: sanPhamData.tensp,
                giathoidiemhientai: giathoidiemhientai,
                soluong: 1, // Giả sử ban đầu là 1 sản phẩm
                giamgia: 0 // Giảm giá mặc định nếu có
            });

            // Tạo HTML cho mỗi sản phẩm
            const productItem = document.createElement("div");
            productItem.className = "product-item d-flex align-items-center py-2 border-bottom";

            productItem.innerHTML = `
            <!-- Sản phẩm -->
            <div class="d-flex align-items-center" style="width: 50%;">
                <img src="../image/${sanPhamData.urlHinhanh}.png" alt="Product Image" style="width: 80px; height: auto;">
                <div class="ms-3" style="flex: 1;">
                    <p class="mb-1 fw-bold">${sanPhamData.tensp}</p>
                    <span class="text-muted">Phân Loại Hàng:</span>
                    ${thuocTinhSelects}  <!-- Danh sách thuộc tính -->
                </div>
            </div>

            <!-- Chi tiết giá và hành động -->
            <div class="d-flex justify-content-between align-items-center" style="width: 50%;">
                <div class="text-center" style="width: 35%; display: ruby;">
                    <span class="text-danger fw-bold">${Number(giathoidiemhientai).toLocaleString('vi-VN')} VND</span>
                </div>

                <div class="d-flex justify-content-center align-items-center" style="width: 30%;">
                    <span class="text-black fw-bold quantity-display">${1}</span> <!-- Hiển thị số lượng là 1 -->
                </div>
                <div class="text-center text-danger fw-bold total-price" style="width: 35%;"></div>
            </div>
            `;
            productList.appendChild(productItem);
        }

        initializeTotalPrices(); // Cập nhật tổng giá mặc định
        updateTotals();
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

    async function fetchThuocTinhSPCT(id) {
        if (!id) {
            console.error('ID không hợp lệ:', id);
            return [];  // Trả về mảng rỗng thay vì undefined
        }

        try {
            const response = await fetch(`${apiTTSPCTUrl}/${id}`);

            if (!response.ok) {
                throw new Error('Lỗi API: ' + response.statusText);
            }

            const data = await response.json();

            // Kiểm tra dữ liệu trả về, nếu không có dữ liệu trả về mảng rỗng
            if (!Array.isArray(data)) {
                console.warn('Dữ liệu không phải là mảng:', data);
                return []; // Trả về mảng rỗng nếu dữ liệu không phải mảng
            }

            return data;  // Trả về dữ liệu nếu hợp lệ
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thuộc tính sản phẩm chi tiết:', error);
            return [];  // Trả về mảng rỗng nếu có lỗi
        }
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
        totalInvoiceElement.textContent = `${(totalProduct - discount).toLocaleString('vi-VN')} VND`;
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

        // Trả về userId
        return userId;
    }

    $('#muaHangBtn').on('click', async function () {
        const tongHoaDon = parseInt(document.getElementById("tongHoaDon")?.innerText.replace(/[VND.]/g, "") || 0) || 0;
        const diachi = document.getElementById("diachi")?.innerText.trim() || "";
        const sdt = document.getElementById("sdt")?.innerText.trim() || "";
        const voucherCodeInput = document.getElementById("voucherCodeInput")?.value || 0;
        const userId = GetByidKH();
        const currentDate = new Date().toISOString();
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

        const hoadonData = {
            idnv: 0,
            idkh: userId,
            idgg: voucherCodeInput,
            trangthaithanhtoan: 0,
            donvitrangthai: 0,
            thoigiandathang: currentDate,
            diachiship: diachi,
            ngaygiaodukien: currentDate,
            ngaygiaothucte: currentDate,
            tongtiencantra: tongHoaDon,
            tongtiensanpham: tongHoaDon, // Có thể thay bằng tổng tiền sản phẩm nếu khác
            sdt: sdt,
            tonggiamgia: 0,
            trangthai: 0
        };

        try {
            if (paymentMethod === "1" && tongHoaDon >= 10000000) {
                const confirm = await Swal.fire({
                    title: 'Yêu cầu đặt cọc',
                    text: 'Hóa đơn trên 10.000.000 VND, vui lòng đặt cọc 30%.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Đồng ý',
                    cancelButtonText: 'Hủy'
                });

                if (confirm.isConfirmed) {
                    const idhd = await taoHoaDon(hoadonData);
                    if (idhd) {
                        await themHoaDonChiTiet(idhd);
                        await taoLinkThanhToanCoc(idhd);
                        await addPaymentHistory(idhd);
                    }
                }
            } else {
                const idhd = await taoHoaDon(hoadonData);
                await themHoaDonChiTiet(idhd);
                if (idhd) {
                    if (paymentMethod === "2") {
                        await taoLinkThanhToan(idhd);
                        await addPaymentHistory(idhd);
                    }
                    Swal.fire("Thành Công", "Đặt Hàng Thành Công.", "success");
                }
            }
        } catch (error) {
            console.error("Lỗi trong quá trình xử lý:", error);
            Swal.fire("Lỗi", "Có lỗi xảy ra trong quá trình đặt hàng.", "error");
        }
    });

    // Hàm tạo hóa đơn
    async function taoHoaDon(hoadonData) {
        try {
            const response = await fetch('https://localhost:7297/api/Hoadon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hoadonData)
            });
            if (response.ok) {
                const result = await response.json();
                return result.id; // Trả về ID hóa đơn
            } else {
                Swal.fire("Lỗi", "Tạo hóa đơn thất bại.", "error");
            }
        } catch (error) {
            console.error("Lỗi khi tạo hóa đơn:", error);
            Swal.fire("Lỗi", "Kết nối tạo hóa đơn thất bại.", "error");
        }
        return null;
    }

    // Hàm thêm chi tiết hóa đơn
    async function themHoaDonChiTiet(idhd) {
        const ListdanhSachSanPham = danhSachSanPham; // Danh sách sản phẩm từ giỏ hàng
        for (const sanPham of ListdanhSachSanPham) {
            const data = {
                idhd: idhd,
                idspct: sanPham.id,
                soluong: sanPham.soluong,
                giasp: sanPham.giathoidiemhientai,
                giamgia: sanPham.giamgia || 0
            };

            try {
                const response = await fetch('https://localhost:7297/api/HoaDonChiTiet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    Swal.fire("Lỗi", "Thêm chi tiết hóa đơn thất bại.", "error");
                }
            } catch (error) {
                console.error("Lỗi kết nối API khi thêm chi tiết hóa đơn:", error);
                Swal.fire("Lỗi", "Kết nối thêm chi tiết hóa đơn thất bại.", "error");
            }
        }
    }

    // Hàm thêm lịch sử thanh toán
    async function addPaymentHistory(idhd) {
        const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
        if (!paymentMethodElement) {
            Swal.fire("Cảnh báo", "Vui lòng chọn phương thức thanh toán.", "warning");
            return;
        }
        const paymentMethodId = parseInt(paymentMethodElement.value);

        const paymentHistoryData = {
            idhd: idhd,
            idPttt: paymentMethodId,
            thoigianthanhtoan: new Date().toISOString(),
            trangthai: 0
        };

        try {
            const response = await fetch("https://localhost:7297/api/Lichsuthanhtoan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentHistoryData)
            });

            if (!response.ok) {
                Swal.fire("Lỗi", "Thêm lịch sử thanh toán thất bại.", "error");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            Swal.fire("Lỗi", "Kết nối thêm lịch sử thanh toán thất bại.", "error");
        }
    }


    async function taoLinkThanhToanCoc(idhd) {
        // Lấy dữ liệu giỏ hàng và tổng tiền
        const ListdanhSachSanPham = danhSachSanPham;
        const tongHoaDon = parseInt(document.getElementById("tongHoaDon") ? document.getElementById("tongHoaDon").innerText.replace(/[VND.]/g, "") : 0) || 0;
        const soTienDatCoc = tongHoaDon * 0.3;
        // Tạo payload gửi sang BE
        const payload = {
            orderCode: idhd,  // Mã hóa đơn
            items: ListdanhSachSanPham.map(sanPham => ({
                name: sanPham.tensp,
                quantity: sanPham.soluong,
                price: sanPham.giathoidiemhientai
            })),
            totalAmount: soTienDatCoc,
            description: "Hoa Don Coc San Pham"
        };

        const response = await fetch('https://localhost:7297/api/checkout/create-payment-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Có lỗi xảy ra trong quá trình xử lý.');
        }

        const data = await response.json();
        if (data && data.checkoutUrl) {
            // Chuyển hướng người dùng tới link thanh toán
            window.location.href = data.checkoutUrl;
        } else {
            Swal.fire('Lỗi', 'Không nhận được đường dẫn thanh toán.', 'error');
        }
    }

    // Hàm tạo link thanh toán
    async function taoLinkThanhToan(idhd) {
        // Lấy dữ liệu giỏ hàng và tổng tiền
        const ListdanhSachSanPham = danhSachSanPham;
        const tongHoaDon = parseInt(document.getElementById("tongHoaDon") ? document.getElementById("tongHoaDon").innerText.replace(/[VND.]/g, "") : 0) || 0;

        // Tạo payload gửi sang BE
        const payload = {
            orderCode: idhd,  // Mã hóa đơn
            items: ListdanhSachSanPham.map(sanPham => ({
                name: sanPham.tensp,  // Tên sản phẩm
                quantity: sanPham.soluong,  // Số lượng
                price: sanPham.giathoidiemhientai  // Giá sản phẩm
            })),
            totalAmount: tongHoaDon,  // Tổng tiền
            description: "Thanh Toán Hoá Đơn"  // Mô tả thêm nếu cần
        };

        // Gọi API tạo link thanh toán
        const response = await fetch('https://localhost:7297/api/checkout/create-payment-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Có lỗi xảy ra trong quá trình xử lý.');
        }

        const data = await response.json();
        if (data && data.checkoutUrl) {
            // Chuyển hướng người dùng tới link thanh toán
            window.location.href = data.checkoutUrl;
        } else {
            Swal.fire('Lỗi', 'Không nhận được đường dẫn thanh toán.', 'error');
        }
    }

    const host = "https://provinces.open-api.vn/api/";

    // Hàm để xóa dữ liệu trong các dropdown
    var clearDropdowns = () => {
        if (document.querySelector("#province")) {
            document.querySelector("#province").innerHTML = '<option disabled value="">Chọn Tỉnh</option>';
        }
        if (document.querySelector("#district")) {
            document.querySelector("#district").innerHTML = '<option disabled value="">Chọn Quận</option>';
            document.querySelector("#district").disabled = true;  // Disable district dropdown
        }
        if (document.querySelector("#ward")) {
            document.querySelector("#ward").innerHTML = '<option disabled value="">Chọn Phường</option>';
            document.querySelector("#ward").disabled = true;  // Disable ward dropdown
        }
        if (document.querySelector("#result")) {
            document.querySelector("#result").textContent = '';  // Xóa kết quả hiển thị
        }
    };

    // Làm sạch dropdown và kết quả khi modal được mở
    clearDropdowns();

    // Gọi API lấy dữ liệu tỉnh
    var callAPI = (api) => {
        return axios.get(api)
            .then((response) => {
                if (response.data.length === 0) {
                    Swal.fire("Lỗi", "Không có dữ liệu tỉnh!", "error");
                } else {
                    renderData(response.data, "province"); // Gọi hàm render để hiển thị dữ liệu tỉnh
                }
            });
    };

    // Gọi API lấy dữ liệu quận
    var callApiDistrict = (api) => {
        return axios.get(api)
            .then((response) => {
                if (response.data.districts.length === 0) {
                    Swal.fire("Lỗi", "Không có dữ liệu quận!", "error");
                } else {
                    renderData(response.data.districts, "district"); // Gọi hàm render để hiển thị dữ liệu quận
                    document.querySelector("#district").disabled = false;  // Mở khóa dropdown quận

                    // Sau khi có dữ liệu quận, gọi API lấy phường cho quận đầu tiên
                    if (response.data.districts.length > 0) {
                        let firstDistrictCode = response.data.districts[0].code;
                        callApiWard(`https://provinces.open-api.vn/api/d/${firstDistrictCode}?depth=2`); // Gọi API lấy phường cho quận đầu tiên
                    }
                }
            });
    };

    // Gọi API lấy dữ liệu phường
    var callApiWard = (api) => {
        return axios.get(api)
            .then((response) => {
                if (response.data.wards.length === 0) {
                    Swal.fire("Lỗi", "Không có dữ liệu phường!", "error");
                } else {
                    renderData(response.data.wards, "ward"); // Gọi hàm render để hiển thị dữ liệu phường
                    document.querySelector("#ward").disabled = false;  // Mở khóa dropdown phường
                }
            });
    };

    // Hàm để render dữ liệu vào các dropdown
    var renderData = (array, select) => {
        let row = '<option disabled value="">Chọn</option>';
        array.forEach(element => {
            row += `<option value="${element.code}">${element.name}</option>`; // Thêm các option vào dropdown
        });
        if (document.querySelector("#" + select)) {
            document.querySelector("#" + select).innerHTML = row; // Cập nhật nội dung dropdown
        }
    };

    // Gọi API để tải danh sách tỉnh khi modal mở
    callAPI('https://provinces.open-api.vn/api/?depth=1');

    // Lắng nghe sự thay đổi của dropdown Tỉnh
    if (document.querySelector("#province")) {
        document.querySelector("#province").addEventListener("change", () => {
            let provinceCode = document.querySelector("#province").value;
            if (provinceCode) {
                callApiDistrict(host + "p/" + provinceCode + "?depth=2"); // Gọi API lấy quận khi chọn tỉnh
            }
            printResult(); // Cập nhật kết quả
        });
    }

    // Lắng nghe sự thay đổi của dropdown Quận
    if (document.querySelector("#district")) {
        document.querySelector("#district").addEventListener("change", () => {
            let districtCode = document.querySelector("#district").value;
            if (districtCode) {
                callApiWard(host + "d/" + districtCode + "?depth=2"); // Gọi API lấy phường khi chọn quận
            }
            printResult(); // Cập nhật kết quả
        });
    }

    // Lắng nghe sự thay đổi của dropdown Phường
    if (document.querySelector("#ward")) {
        document.querySelector("#ward").addEventListener("change", printResult); // Cập nhật kết quả khi chọn phường
    }

    // Hàm để hiển thị kết quả đã chọn từ các dropdown
    var printResult = () => {
        let province = document.querySelector("#province") ? document.querySelector("#province").value : '';
        let district = document.querySelector("#district") ? document.querySelector("#district").value : '';
        let ward = document.querySelector("#ward") ? document.querySelector("#ward").value : '';

        // Nếu tất cả các dropdown đều có giá trị đã chọn, hiển thị kết quả
        if (province && district && ward) {
            let result = `${document.querySelector("#province").selectedOptions[0].text} | ` +
                `${document.querySelector("#district").selectedOptions[0].text} | ` +
                `${document.querySelector("#ward").selectedOptions[0].text}`;
            if (document.querySelector("#result")) {
                document.querySelector("#result").textContent = result; // Hiển thị kết quả
            }
        }
    };

    document.getElementById("btnSaveAddress").addEventListener("click", async function () {
        var addressSelect = document.getElementById("addressSelect");
        var selectedAddressId = addressSelect.value; // Lấy id của địa chỉ đã chọn
    
        // Kiểm tra xem người dùng có chọn địa chỉ không
        if (!selectedAddressId) {
            Swal.fire("Lỗi", "Vui lòng chọn một địa chỉ", "error");
            return;
        }
    
        // Lấy thông tin địa chỉ chi tiết từ API hoặc mảng địa chỉ
        try {
            const response = await axios.get(`${apiAddressList}/${selectedAddressId}`);
            
            if (response && response.data) {
                // Tạo địa chỉ mới từ thông tin chi tiết của địa chỉ
                var newAddress = response.data.diachicuthe + ", " +
                                 response.data.phuongxa + ", " +
                                 response.data.quanhuyen + ", " +
                                 response.data.thanhpho;
    
                // Cập nhật thông tin địa chỉ vào phần tử có id "diachi"
                document.getElementById("diachi").textContent = newAddress;
    
                // Xóa phần tử "Mặc định" nếu có
                var defaultBadge = document.querySelector(".badge.bg-primary-subtle.text-success");
                if (defaultBadge) {
                    defaultBadge.remove(); // Xóa "Mặc định"
                }
    
                // Hiển thị nút "Khôi phục" nếu địa chỉ đã thay đổi
                document.getElementById("btnRestoreAddress").style.display = 'inline-block';
    
                // Ẩn modal sau khi lưu địa chỉ
                var modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
                modal.hide();
    
                // Hiển thị kết quả sau khi lưu thành công
                printResult();
                Swal.fire("Thành Công", "Thay đổi địa chỉ thành công.", "success");
            } else {
                Swal.fire("Lỗi", "Không tìm thấy thông tin địa chỉ.", "error");
            }
        } catch (error) {
            Swal.fire("Lỗi", "Không thể tải thông tin địa chỉ", "error");
            console.error(error);
        }
    });     

    /// Lắng nghe sự kiện "Khôi phục" địa chỉ mặc định
    document.getElementById("btnRestoreAddress").addEventListener("click", function () {
        // Gọi API để lấy lại địa chỉ mặc định
        fetchkhachangById()
            .then(data => {
                // Kiểm tra xem dữ liệu trả về có chứa địa chỉ không
                if (data && data.diachi) {
                    var defaultAddress = data.diachi; // Cập nhật theo cấu trúc dữ liệu thực tế

                    // Cập nhật lại địa chỉ mặc định vào phần tử "diachi"
                    var diachiElement = document.getElementById("diachi");
                    if (diachiElement) {
                        diachiElement.textContent = defaultAddress;

                        // Kiểm tra và hiển thị lại phần tử "Mặc định"
                        var badge = document.querySelector(".badge.bg-primary-subtle.text-success");
                        if (badge) {
                            badge.remove(); // Xóa phần tử "Mặc định" cũ nếu có
                        }

                        // Tạo phần tử "Mặc định" mới
                        var newBadge = document.createElement("span");
                        newBadge.classList.add("badge", "bg-primary-subtle", "text-success", "border", "border-success", "me-2");
                        newBadge.style.marginLeft = "10px";
                        newBadge.textContent = "Mặc định";
                        diachiElement.appendChild(newBadge);
                    }

                    // Ẩn nút khôi phục sau khi đã khôi phục địa chỉ mặc định
                    document.getElementById("btnRestoreAddress").style.display = 'none';
                    // Ẩn modal sau khi lưu địa chỉ
                    var modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
                    modal.hide();

                    // Hiển thị thông báo lỗi giả
                    Swal.fire("Thành Công", "Khôi phục địa chỉ mặc định thành công.", "success");
                } else {
                    // Nếu không có địa chỉ trong dữ liệu trả về, thông báo lỗi
                    Swal.fire("Lỗi", "Không tìm thấy địa chỉ mặc định.", "error");
                }
            })
            .catch(error => {
                // Thông báo lỗi khi gọi API
                Swal.fire("Lỗi", "Lỗi khi khôi phục địa chỉ: " + error.message, "error");
            });
    });
    // API chính để lấy và thêm địa chỉ từ hệ thống
    const apiAddressList = "https://localhost:7297/api/Diachis";

    // Lưu địa chỉ mới api
    document.getElementById("btnSaveAddress").addEventListener("click", async () => {
        const thanhpho = document.getElementById("province").value.trim();
        const quanhuyen = document.getElementById("district").value.trim();
        const phuongxa = document.getElementById("ward").value.trim();
        const diachicuthe = document.getElementById("detailInput").value.trim();
        const idkh = GetByidKH();

        if (!thanhpho || !quanhuyen || !phuongxa || !diachicuthe || !idkh) {
            Swal.fire("Lỗi", "Vui lòng nhập đầy đủ thông tin.", "error");
            return;
        }

        const newAddress = {
            idkh,
            thanhpho,
            quanhuyen,
            phuongxa,
            diachicuthe
        };

        try {
            await axios.post(apiAddressList, newAddress);
            Swal.fire("Thành công", "Địa chỉ mới đã được lưu.", "success");
            loadAddressesByIdKH(); // Làm mới danh sách địa chỉ
        } catch (error) {
            Swal.fire("Lỗi", "Không thể lưu địa chỉ mới.", "error");
            console.error(error);
        }
    });

    document.getElementById("AddNewAddressExample").addEventListener("click", function () {
        var addressSelect = document.getElementById("addressSelect");
        var btnSaveAddress = document.getElementById("btnSaveAddress");
    
        // Kiểm tra trạng thái hiện tại của addressSelect và btnSaveAddress
        if (addressSelect.disabled) {
            // Nếu đang ở trạng thái disabled, thì chuyển sang enabled
            addressSelect.disabled = false;
            btnSaveAddress.disabled = false;
        } else {
            // Nếu đang ở trạng thái enabled, thì chuyển sang disabled
            addressSelect.disabled = true;
            btnSaveAddress.disabled = true;
        }
    });

   // Lấy danh sách địa chỉ theo idKH
   const loadAddressesByIdKH = async () => {
       const idKH = GetByidKH(); // Hàm logic lấy idKH
       const addressSelect = document.getElementById("addressSelect");
       
       // Reset nội dung của select
       addressSelect.innerHTML = '<option disabled selected value="">Đang tải...</option>';
       addressSelect.disabled = true;

       if (!idKH) {
           Swal.fire("Lỗi", "Không tìm thấy mã khách hàng.", "error");
           return;
       }

       try {
           const response = await axios.get(`${apiAddressList}/khachhang/${idKH}`);

           if (response.data.length === 0) {
               // Không có địa chỉ
               addressSelect.innerHTML = '<option disabled selected value="">Tài khoản này chưa có địa chỉ, vui lòng thêm địa chỉ</option>';
               addressSelect.disabled = true;
               Swal.fire("Thông báo", "Không có địa chỉ nào liên quan đến khách hàng này.", "info");
           } else {
               // Có địa chỉ
               addressSelect.innerHTML = '<option disabled selected value="" required>Chọn địa chỉ...</option>';
               response.data.forEach(address => {
                   addressSelect.innerHTML += `<option value="${address.id}"> ${address.diachicuthe}, ${address.phuongxa}, ${address.quanhuyen}, ${address.thanhpho}</option>`;
               });
               addressSelect.disabled = false; // Kích hoạt select khi có dữ liệu
           }
       } catch (error) {
           addressSelect.innerHTML = '<option disabled selected value="">Không thể tải địa chỉ</option>';
           Swal.fire("Lỗi", "Không thể tải danh sách địa chỉ.", "error");
           console.error(error);
       }
   };

   // Lưu địa chỉ mới api
   document.getElementById("btnAddNewAddress").addEventListener("click", async () => {
       const thanhpho = document.getElementById("province").value.trim();
       const quanhuyen = document.getElementById("district").value.trim();
       const phuongxa = document.getElementById("ward").value.trim();
       const diachicuthe = document.getElementById("detailInput").value.trim();
       const idkh = GetByidKH();

       if (!thanhpho || !quanhuyen || !phuongxa || !diachicuthe || !idkh) {
           Swal.fire("Lỗi", "Vui lòng nhập đầy đủ thông tin.", "error");
           return;
       }

       const newAddress = {
           idkh,
           thanhpho,
           quanhuyen,
           phuongxa,
           diachicuthe
       };

       try {
           await axios.post(apiAddressList, newAddress);
           Swal.fire("Thành công", "Địa chỉ mới đã được lưu.", "success");
           loadAddressesByIdKH(); // Làm mới danh sách địa chỉ
       } catch (error) {
           Swal.fire("Lỗi", "Không thể lưu địa chỉ mới.", "error");
           console.error(error);
       }
   });

   document.querySelectorAll('.voucher-card').forEach(card => {
        card.addEventListener('click', function() {
        // Lấy ra id của voucher được chọn từ thẻ card
        var radioButtonId = card.id.replace('card-', '');
    
        // Đánh dấu radio button tương ứng với thẻ card được chọn
        var radioButton = document.getElementById(radioButtonId);
        radioButton.checked = true;
    
        // Thêm lớp 'selected-card' vào thẻ card để làm nổi bật
        document.querySelectorAll('.voucher-card').forEach(c => c.classList.remove('selected-card'));
        card.classList.add('selected-card');
        });
    });


    // Hàm gọi API lấy danh sách voucher khi modal mở
    $('#addVoucherButton').on('show.bs.modal', function () {
        fetchVouchers();
    });

    async function fetchVouchers() {
        try {
            // Gửi yêu cầu API lấy danh sách voucher
            const response = await fetch(discountApiUrl);
    
            // Kiểm tra nếu response không thành công
            if (!response.ok) {
                throw new Error(`Lỗi API danh sách voucher: ${response.status}`);
            }
    
            // Hàm định dạng ngày
            const formatDate = (dateTimeString) => {
                const date = new Date(dateTimeString); // Chuyển đổi chuỗi datetime sang đối tượng Date
                const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
                return date.toLocaleDateString('vi-VN', options); // Định dạng ngày theo kiểu Việt Nam
            };

            // Chuyển đổi dữ liệu nhận được thành JSON
            const vouchers = await response.json();
            
            // Lấy đối tượng chứa danh sách voucher
            const voucherListContainer = document.getElementById('voucher-list');
            voucherListContainer.innerHTML = ''; // Xóa nội dung cũ
            
            // Lấy phần tử thông báo không có voucher
            const voucherNotice = document.getElementById('voucher-notice');
            
            // Nếu không có voucher nào, hiển thị thông báo và ẩn danh sách voucher
            if (vouchers.length === 0) {
                voucherNotice.style.display = 'block';  // Hiển thị thông báo không có voucher
            } else {
                    voucherNotice.style.display = 'none';  // Ẩn thông báo nếu có voucher
                    // Duyệt qua danh sách và tạo các thẻ lựa chọn voucher
                    vouchers.forEach(voucher => {
                        const voucherCard = document.createElement('div');
                    voucherCard.classList.add('form-check');

                    const voucherRadio = document.createElement('input');
                    voucherRadio.classList.add('form-check-input');
                    voucherRadio.type = 'radio';
                    voucherRadio.name = 'voucher';
                    voucherRadio.id = `voucher${voucher.id}`;
                    voucherRadio.dataset.value = voucher.id;  // Lưu ID voucher trong thuộc tính data-value

                    const voucherLabel = document.createElement('label');
                    voucherLabel.setAttribute('for', `voucher${voucher.id}`);

                    const card = document.createElement('div');
                    card.classList.add('card', 'voucher-card');
                    card.setAttribute('id', `card-voucher${voucher.id}`);

                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');

                    const cardTitle = document.createElement('h5');
                    cardTitle.classList.add('card-title');
                    cardTitle.textContent = voucher.mota;

                    const cardText1 = document.createElement('p');
                    cardText1.classList.add('card-text');
                    cardText1.textContent = `${formatDate(voucher.ngaybatdau)} - ${formatDate(voucher.ngayketthuc)}`;

                    const cardText2 = document.createElement('p');
                    cardText2.classList.add('card-text');
    
                   // Hiển thị đơn vị nếu hợp lệ, ẩn nếu không hợp lệ
                    if (voucher.donvi === '%' || voucher.donvi === 'VND') {
                        // Kiểm tra nếu giá trị voucher.giatri >= 1000, định dạng lại
                        const formattedValue = voucher.giatri >= 1000 
                            ? voucher.giatri.toLocaleString('vi-VN')  // Định dạng giá trị với dấu phẩy phân cách hàng nghìn
                            : voucher.giatri;

                        // Cập nhật giá trị vào cardText2
                        cardText2.textContent = `Giá Trị: ${formattedValue} ${voucher.donvi}`;
                    } else {
                        cardText2.style.display = 'none';
                    }

                    cardBody.appendChild(cardTitle);
                    cardBody.appendChild(cardText1);
                    cardBody.appendChild(cardText2);
                    card.appendChild(cardBody);
                    voucherLabel.appendChild(card);
                    voucherCard.appendChild(voucherRadio);
                    voucherCard.appendChild(voucherLabel);
    
                    // Thêm voucher vào danh sách
                    voucherListContainer.appendChild(voucherCard);
                });
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách voucher:', error);
            Swal.fire("Lỗi", "Đã xảy ra lỗi khi tải danh sách voucher.", "error");
        }
    }    
    
    // Xử lý khi click vào thẻ card
    document.querySelectorAll('.voucher-card').forEach(card => {
        card.addEventListener('click', function() {
            // Lấy ra id của voucher được chọn từ thẻ card
            var radioButtonId = card.id.replace('card-voucher', '');
    
            // Đánh dấu radio button tương ứng với thẻ card được chọn
            var radioButton = document.getElementById(`voucher${radioButtonId}`);
            radioButton.checked = true;
    
            // Thêm lớp 'selected-card' vào thẻ card để làm nổi bật
            document.querySelectorAll('.voucher-card').forEach(c => c.classList.remove('selected-card'));
            card.classList.add('selected-card');
        });
    });
           
    const confirmButton = document.querySelector('#addVoucherButton .btn-secondary');
    confirmButton.addEventListener('click', function () {
        const selectedVoucher = document.querySelector('input[name="voucher"]:checked');

        if (!selectedVoucher) {
            Swal.fire('Thông báo', 'Vui lòng chọn một voucher.', 'warning');
            return;
        }

        const selectedVoucherId = selectedVoucher.dataset.value; // Lấy ID của voucher

        Swal.fire({
            title: 'Xác Nhận Voucher',
            text: `Bạn có chắc chắn muốn áp dụng voucher này?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Đồng Ý',
            cancelButtonText: 'Hủy Bỏ'
        }).then((result) => {
            if (result.isConfirmed) {
                // Gọi API để lấy thông tin voucher dựa trên ID
                fetch(`${discountApiUrl}/${selectedVoucherId}`)
                    .then(response => response.json())
                    .then(voucher => {
                        // Nếu API trả về voucher hợp lệ
                        if (voucher && voucher.giatri) {
                            const voucherCodeInput = document.getElementById('voucherCodeInput');

                            // Gán ID làm giá trị (value) của input
                            voucherCodeInput.value = selectedVoucherId;

                            // Hiển thị mô tả voucher bên trong input bằng cách thay đổi placeholder
                            voucherCodeInput.setAttribute('placeholder', voucher.mota);
                            voucherCodeInput.classList.add('active'); // Nếu cần style input sau khi chọn

                            const soTienGiamGia = document.getElementById('soTienGiamGia');
                            const tongHoaDonElement = document.getElementById('tongHoaDon');
                            const tongSanPhamElement = document.getElementById('tongSanPham');
                            
                            const tongSanPhamValue = parseInt(tongSanPhamElement.textContent.replace(/[VND.]/g, ''));
                            let soTienGiam = 0;

                            // Tính toán số tiền giảm tùy thuộc vào đơn vị của voucher
                            if (voucher.donvi === 'VND') {
                                // Nếu đơn vị là VND, số tiền giảm là giá trị của voucher
                                soTienGiam = voucher.giatri;
                            } else if (voucher.donvi === '%') {
                                // Nếu đơn vị là %, tính số tiền giảm theo tỷ lệ phần trăm
                                soTienGiam = tongSanPhamValue * (voucher.giatri / 100);
                            }

                            // Hiển thị số tiền giảm
                            soTienGiamGia.textContent = `${soTienGiam.toLocaleString()} VND`;

                            // Cập nhật tổng hóa đơn
                            const tongHoaDonValue = Math.max(0, tongSanPhamValue - soTienGiam);
                            tongHoaDonElement.textContent = `${tongHoaDonValue.toLocaleString()} VND`;

                            // Gọi hàm updateTotals để tính lại tổng sản phẩm và hóa đơn
                            updateTotals();

                            const modal = bootstrap.Modal.getInstance(document.getElementById('addVoucherButton'));
                            modal.hide();

                            Swal.fire(
                                'Xác Nhận Thành Công',
                                `Voucher "${voucher.mota}" đã được áp dụng.`,
                                'success'
                            );
                        } else {
                            Swal.fire('Thông báo', 'Voucher không hợp lệ hoặc đã hết hạn.', 'error');
                        }
                    })
                    .catch(error => {
                        Swal.fire('Lỗi', 'Có lỗi xảy ra khi tải dữ liệu voucher. Vui lòng thử lại.', 'error');
                        console.error(error);
                    });
            } else {
                Swal.fire('Thông báo', 'Voucher chưa được áp dụng.', 'info');
            }
        });
    });

    loadAddressesByIdKH();
    fetchkhachangById();
    renderSanPham();

});
