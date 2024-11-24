app.controller("MuaSanPhamCtrl", function ($document, $rootScope) {
    const quantityInput = document.querySelector(".quantity-input");
    const priceElement = document.querySelector(".total-price");
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

    // Hàm gọi API để lấy danh sách sản phẩm chi tiết
    async function fetchSanPhamChitiet() {
        try {
            const response = await fetch(apiSPCTUrl);
            if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
            const data = await response.json();
            console.log("Danh sách sản phẩm chi tiết:", data);
            return data; // Trả về danh sách sản phẩm chi tiết
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm chi tiết:", error);
            return [];
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
                console.log("User ID:", userId);
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
            const { id, idsp, giathoidiemhientai } = sanPham; // Lấy giaBanHienTai trực tiếp từ sanPham
    
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
                    <span class="text-danger fw-bold">${Number(giathoidiemhientai).toLocaleString('vi-VN')}₫</span>
                </div>
    
                <div class="d-flex justify-content-center align-items-center" style="width: 30%;">
                    <span class="text-black fw-bold quantity-display">${1}</span> <!-- Hiển thị số lượng là 1 -->
                </div>
                <div class="text-center text-danger fw-bold total-price" style="width: 35%;"></div>
            </div>
            `;
            productList.appendChild(productItem);
        }
    
        updateEventListeners();
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
                const price = parseInt(priceElement.textContent.replace("₫", "").replace(/\./g, "")) || 0;
                totalProduct += price;
            }
        });

        // Lấy số tiền giảm giá
        const discount = parseInt(discountElement.textContent.replace("₫", "").replace(/\./g, "")) || 0;

        // Cập nhật giá trị
        totalProductElement.textContent = `${totalProduct.toLocaleString('vi-VN')}₫`;
        totalInvoiceElement.textContent = `${(totalProduct - discount).toLocaleString('vi-VN')}₫`;
    }


    function updateEventListeners() {
        const quantityInputs = document.querySelectorAll(".quantity-input");

        quantityInputs.forEach((input) => {
            // Xử lý khi số lượng được nhập trực tiếp
            input.addEventListener("input", function () {
                this.value = this.value.replace(/[^0-9]/g, ''); // Chỉ cho phép nhập số
                const value = Math.max(1, Math.min(99, parseInt(this.value) || 1)); // Đảm bảo giá trị từ 1 đến 99
                this.value = value;
                updatePriceForItem(this);
                updateTotals();
            });

            // Xử lý khi bấm nút tăng/giảm
            const buttons = input.closest(".input-group").querySelectorAll(".quantity-btn");
            buttons.forEach((button) => {
                button.addEventListener("click", (event) => {
                    let currentQuantity = parseInt(input.value) || 1;
                    if (button.id === "button-addon1") {
                        // Giảm số lượng
                        currentQuantity = Math.max(1, currentQuantity - 1);
                    } else if (button.id === "button-addon2") {
                        // Tăng số lượng
                        currentQuantity = Math.min(99, currentQuantity + 1);
                    }
                    input.value = currentQuantity;
                    updatePriceForItem(input);
                    updateTotals();
                });
            });
        });
    }

    // Hàm cập nhật giá cho từng sản phẩm
    function updatePriceForItem(input) {
        const productItem = input.closest(".product-item");
        if (!productItem) return;

        const priceOriginalElement = productItem.querySelector(".text-danger.fw-bold");
        const priceElement = productItem.querySelector(".total-price");

        if (!priceOriginalElement || !priceElement) return;

        const priceOriginal = parseInt(priceOriginalElement.textContent.replace("₫", "").replace(/\./g, ""));
        const quantity = parseInt(input.value) || 1;
        const totalPrice = quantity * priceOriginal;

        priceElement.textContent = `${totalPrice.toLocaleString('vi-VN')}₫`;
    }


    function initializeTotalPrices() {
        const productItems = document.querySelectorAll(".product-item");
        productItems.forEach((productItem) => {
            const priceElement = productItem.querySelector(".total-price");
            const priceOriginal = parseInt(
                productItem.querySelector(".text-danger.fw-bold").textContent.replace("₫", "").replace(/\./g, "")
            );
    
            // Lấy số lượng từ danhSachSanPham
            const quantity = parseInt(productItem.querySelector(".quantity-display").textContent || 1);
            
            // Cập nhật tổng giá mặc định
            updateTotalPrice(priceElement, priceOriginal, quantity);
        });
    }
    
    function updateTotalPrice(priceElement, priceOriginal, quantity) {
        const totalPrice = quantity * priceOriginal;
        priceElement.textContent = `${totalPrice.toLocaleString('vi-VN')}₫`;
    }
    

    // Hàm gọi API giảm giá và xử lý nhập mã
    async function applyVoucherCodeById(voucherId) {
        try {
            // Gửi yêu cầu API để lấy thông tin mã giảm giá
            const response = await fetch(`${discountApiUrl}/${voucherId}`);

            // Kiểm tra nếu response không thành công
            if (!response.ok) {
                throw new Error(`Lỗi API mã giảm giá: ${response.status}`);
            }

            // Chuyển đổi dữ liệu nhận được thành JSON
            const data = await response.json();

            console.log("Dữ liệu giảm giá:", data);

            // Kiểm tra nếu dữ liệu trả về có thuộc tính giatri
            if (data && data.giatri) {
                // Cập nhật giá trị giảm giá
                updateDiscount(data.giatri);

                // Vô hiệu hóa input và đổi nút thành Hủy
                disableVoucherInput();
                alert('Thêm mã giảm giá thành công!');
            } else {
                // Nếu không có thuộc tính giatri, thông báo mã không hợp lệ
                alert('Mã giảm giá không tồn tại hoặc không hợp lệ.');
            }
        } catch (error) {
            console.error("Lỗi khi áp dụng mã giảm giá:", error);
            alert('Đã xảy ra lỗi khi áp dụng mã giảm giá. Vui lòng thử lại.');
        }
    }

    // Hàm cập nhật giá trị giảm giá
    function updateDiscount(value) {
        const discountElement = document.querySelector("#soTienGiamGia");
        discountElement.textContent = `${value.toLocaleString('vi-VN')}₫`;
        updateTotals();
    }

    // Hàm vô hiệu hóa input và thay đổi nút thành Hủy
    function disableVoucherInput() {
        const voucherInput = document.querySelector("#voucherCodeInput");
        const addButton = document.querySelector("#addVoucherButton");

        voucherInput.disabled = true;    // Không thể chỉnh sửa
        addButton.textContent = "Hủy mã";  // Đổi nút thành "Hủy mã"
    }

    // Hàm kích hoạt lại input và thay đổi nút thành Thêm
    function enableVoucherInput() {
        const voucherInput = document.querySelector("#voucherCodeInput");
        const addButton = document.querySelector("#addVoucherButton");

        voucherInput.value = "";   // Xóa nội dung cũ
        voucherInput.disabled = false; // Cho phép nhập lại
        addButton.textContent = "Thêm";  // Đổi nút thành "Thêm mã giảm giá"
    }

    // Xử lý sự kiện khi nhấn nút Hủy mã
    function handleCancelVoucher() {
        enableVoucherInput(); // Kích hoạt lại input
        const discountElement = document.querySelector("#soTienGiamGia");
        discountElement.textContent = "0₫"; // Reset giá trị giảm giá
        updateTotals(); // Cập nhật tổng số tiền
    }

    // Thêm sự kiện cho nút "Thêm mã giảm giá"
    const addVoucherButton = document.querySelector("#addVoucherButton");
    if (addVoucherButton) {
        addVoucherButton.addEventListener("click", function () {
            const voucherId = document.querySelector("#voucherCodeInput").value;
            if (this.textContent === "Thêm") {
                // Gọi API để áp dụng mã giảm giá
                applyVoucherCodeById(voucherId);
            } else if (this.textContent === "Hủy mã") {
                // Xử lý hủy mã giảm giá
                handleCancelVoucher();
            }
        });
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
                console.log("User ID:", userId);
            } catch (error) {
                console.error("Lỗi khi phân tích dữ liệu userInfo:", error);
            }
        } else {
            console.warn("Dữ liệu userInfo không tồn tại trong localStorage.");
        }
    
        // Trả về userId
        return userId;
    }

    $('#muaHangBtn').on('click', function () {
        const diachi = document.getElementById("diachi") ? document.getElementById("diachi").innerText.trim() : "";
        const sdt = document.getElementById("sdt") ? document.getElementById("sdt").innerText.trim() : "";
        const voucherCodeInput = document.getElementById("voucherCodeInput") ? document.getElementById("voucherCodeInput").value || 0 : 0;
    
        // Xử lý các giá trị tiền tệ, nếu không hợp lệ, gán về 0
        const tongHoaDon = parseInt(document.getElementById("tongHoaDon") ? document.getElementById("tongHoaDon").innerText.replace(/[₫.]/g, "") : 0) || 0;
        const tongSanPham = parseInt(document.getElementById("tongSanPham") ? document.getElementById("tongSanPham").innerText.replace(/[₫.]/g, "") : 0) || 0;
        const soTienGiamGia = parseInt(document.getElementById("soTienGiamGia") ? document.getElementById("soTienGiamGia").innerText.replace(/[₫.]/g, "") : 0) || 0;
        const userId = GetByidKH();
    
        // Lấy ngày hiện tại cho trường "thoigiandathang"
        const currentDate = new Date().toISOString();
    
        // Tạo dữ liệu hóa đơn
        const hoadonData = {
            idnv: 0,  // Ví dụ nếu không có thông tin nhân viên, set là 0
            idkh: userId,  // Thông tin khách hàng (id khách hàng từ localStorage)
            idgg: voucherCodeInput,  // Voucher code nhập vào
            trangthaithanhtoan: 0,  // Trạng thái thanh toán (ví dụ: chưa thanh toán)
            donvitrangthai: 0,  // Đơn vị trạng thái
            thoigiandathang: currentDate,  // Thời gian đặt hàng (ngày hiện tại)
            diachiship: diachi,  // Địa chỉ giao hàng
            ngaygiaodukien: currentDate,  // Ngày giao dự kiến
            ngaygiaothucte: currentDate,  // Ngày giao thực tế
            tongtiencantra: tongHoaDon,  // Tổng tiền cần trả
            tongtiensanpham: tongSanPham,  // Tổng tiền sản phẩm
            sdt: sdt,  // Số điện thoại khách hàng
            tonggiamgia: soTienGiamGia,  // Số tiền giảm giá
            trangthai: 0  // Trạng thái của hóa đơn (ví dụ: chưa xử lý)
        };
    
        // URL API để gửi yêu cầu
        const url = 'https://localhost:7297/api/Hoadon';
        const method = 'POST';
    
        // Gửi yêu cầu AJAX
        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(hoadonData),
            success: function (response) {
                // Sau khi tạo hóa đơn thành công, gọi hàm thêm chi tiết hóa đơn
                const idhd = response.id;  // Giả sử id hóa đơn trả về từ API
                themHoaDonChiTiet(idhd);
    
                // Nếu API trả về thành công, chuyển hướng sang trang thanh toán và thêm idhd vào URL
                window.location.href = `#!thanhtoan?id=${idhd}`;
            },
            error: function (err) {
                // Nếu có lỗi xảy ra, hiển thị thông báo lỗi
                console.error('Lỗi khi lưu chương trình hoá đơn:', err);
                $('#error-message').text('Có lỗi xảy ra khi lưu dữ liệu.').removeClass('d-none');
            }
        });
    });  

    async function themHoaDonChiTiet(idhd) {
        // Sử dụng danh sách sản phẩm từ giỏ hàng (được lưu trong biến toàn cục danhSachSanPham)
        const ListdanhSachSanPham = danhSachSanPham; // Đây là danh sách bạn đã lưu trong renderSanPham

        // Duyệt qua danh sách sản phẩm và gửi từng chi tiết hóa đơn
        for (const sanPham of ListdanhSachSanPham) {
            const idspct = sanPham.id;
            const soluong = sanPham.soluong;
            const giasp = sanPham.giathoidiemhientai;
            const giamgia = sanPham.giamgia || 0;

            const data = {
                idhd: idhd,
                idspct: idspct,
                soluong: parseInt(soluong),
                giasp: parseFloat(giasp),
                giamgia: parseFloat(giamgia) || 0
            };

            try {
                const response = await fetch('https://localhost:7297/api/HoaDonChiTiet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Dữ liệu chi tiết hóa đơn đã được thêm thành công:', result);
                } else {
                    console.error('Lỗi khi thêm chi tiết hóa đơn:', response.statusText);
                    alert("Có lỗi xảy ra khi thêm chi tiết hóa đơn.");
                }
            } catch (error) {
                console.error('Lỗi kết nối API:', error);
                alert("Lỗi kết nối API.");
            }
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
                    alert("Không có dữ liệu tỉnh!");
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
                    alert("Không có dữ liệu quận!");
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
                    alert("Không có dữ liệu phường!");
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

    // Lắng nghe sự kiện "Lưu" địa chỉ
    document.getElementById("btnSaveAddress").addEventListener("click", function () {
        var province = document.getElementById("province").value;
        var district = document.getElementById("district").value;
        var ward = document.getElementById("ward").value;
        var detailInput = document.getElementById("detailInput").value;

        // Kiểm tra xem người dùng đã nhập đầy đủ thông tin
        if (province && district && ward && detailInput) {
            // Tạo địa chỉ mới từ thông tin nhập vào
            var newAddress = detailInput + ", " + document.getElementById("ward").selectedOptions[0].text +
                ", " + document.getElementById("district").selectedOptions[0].text + ", " +
                document.getElementById("province").selectedOptions[0].text;

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
            alert("Thay đổi địa chỉ thành công.");
        } else {
            alert("Vui lòng nhập đầy đủ thông tin địa chỉ.");
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
                        newBadge.textContent = "Mặc định";
                        diachiElement.appendChild(newBadge);
                    }

                    // Ẩn nút khôi phục sau khi đã khôi phục địa chỉ mặc định
                    document.getElementById("btnRestoreAddress").style.display = 'none';

                    // Hiển thị thông báo lỗi giả
                    alert("Khôi phục địa chỉ mặc định thành công.");
                } else {
                    // Nếu không có địa chỉ trong dữ liệu trả về, thông báo lỗi
                    alert("Không tìm thấy địa chỉ mặc định.");
                }
            })
            .catch(error => {
                // Thông báo lỗi khi gọi API
                alert("Lỗi khi khôi phục địa chỉ: " + error.message);
            });
    });

    fetchkhachangById();
    renderSanPham();

});
