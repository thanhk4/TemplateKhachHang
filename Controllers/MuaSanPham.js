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

    $('#muaHangBtn').on('click', async function () {
        const tongHoaDon = parseInt(document.getElementById("tongHoaDon")?.innerText.replace(/[₫.]/g, "") || 0) || 0;
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
            if (paymentMethod === "1" && tongHoaDon > 10000000) {
                const confirm = await Swal.fire({
                    title: 'Yêu cầu đặt cọc',
                    text: 'Hóa đơn trên 10.000.000₫, vui lòng đặt cọc 30%.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Đồng ý',
                    cancelButtonText: 'Hủy'
                });
    
                if (confirm.isConfirmed) {
                    const soTienDatCoc = Math.ceil(tongHoaDon * 0.3);
                    const idhd = await taoHoaDon(hoadonData);
                    if (idhd) {
                        await themHoaDonChiTiet(idhd);
                        await taoLinkThanhToanCoc(hoadonData, soTienDatCoc);
                        await addPaymentHistory(idhd)
                    }
                }
            } else {
                const idhd = await taoHoaDon(hoadonData);
                if (idhd) {
                    await themHoaDonChiTiet(idhd);
                    if (paymentMethod === "2")
                         await taoLinkThanhToan(idhd)
                         await addPaymentHistory(idhd);
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
                    console.error("Lỗi khi thêm chi tiết hóa đơn:", response.statusText);
                }
            } catch (error) {
                console.error("Lỗi kết nối API khi thêm chi tiết hóa đơn:", error);
            }
        }
    }   
    
    async function taoLinkThanhToanCoc(hoadonData, soTienDatCoc) {
        const payload = {
            orderCode: hoadonData.idkh, // Mã hóa đơn
            items: [
                {
                    name: sanPham.tensp,  // Tên sản phẩm
                    quantity: sanPham.soluong,  // Số lượng
                    price: sanPham.giathoidiemhientai  // Giá sản phẩm
                }
            ],
            totalAmount: soTienDatCoc, // Tổng tiền đặt cọc
            description: "Đặt cọc 30% tổng hóa đơn"
        };
    
        try {
            const response = await fetch('https://localhost:7297/api/checkout/create-payment-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
    
            if (response.ok) {
                const data = await response.json();
                if (data && data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    Swal.fire('Lỗi', 'Không nhận được đường dẫn thanh toán.', 'error');
                }
            } else {
                Swal.fire('Lỗi', 'Tạo link thanh toán thất bại.', 'error');
            }
        } catch (error) {
            console.error('Lỗi khi tạo link thanh toán:', error);
            Swal.fire('Lỗi', 'Có lỗi xảy ra trong quá trình xử lý.', 'error');
        }
    }

    // Hàm thêm lịch sử thanh toán
    async function addPaymentHistory(idhd) {

        // Lấy phương thức thanh toán được chọn
        const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
        if (!paymentMethodElement) {
            alert("Vui lòng chọn phương thức thanh toán.");
            return;
        }
        const paymentMethodId = parseInt(paymentMethodElement.value);

        // Dữ liệu gửi đến API
        const paymentHistoryData = {
            idhd: idhd,
            idPttt: paymentMethodId,
            thoigianthanhtoan: new Date().toISOString(), // Thời gian hiện tại theo chuẩn ISO
            trangthai: 0 // Trạng thái mặc định
        };

        try {
            // Gửi yêu cầu POST đến API
            const response = await fetch("https://localhost:7297/api/Lichsuthanhtoan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentHistoryData)
            });

            // Xử lý kết quả trả về
            if (response.ok) {
                const result = await response.json();
                console.log("Kết quả:", result);
            } else {
                alert("Thêm lịch sử thanh toán thất bại.");
                console.error("Lỗi:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            alert("Có lỗi xảy ra khi thêm lịch sử thanh toán.");
        }
    }

    // Hàm tạo link thanh toán
    async function taoLinkThanhToan(idhd) {
        // Lấy dữ liệu giỏ hàng và tổng tiền
        const ListdanhSachSanPham = danhSachSanPham;
        const tongHoaDon = parseInt(document.getElementById("tongHoaDon") ? document.getElementById("tongHoaDon").innerText.replace(/[₫.]/g, "") : 0) || 0;
    
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
    
        console.log('Payload gửi sang BE:', payload);  // Kiểm tra payload
    
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


    // Xử lý redirect khi thanh toán bị hủy (cancel) hoặc thành công (success)
    if (window.location.pathname === '/cancel') {
        const previousUrl = sessionStorage.getItem('previousUrl');
        if (previousUrl) {
            window.location.href = previousUrl; // Quay lại trang trước đó
        } else {
            window.location.href = '/'; // Quay lại trang chủ nếu không có trang trước đó
        }
    }

    if (window.location.pathname === '/success') {
        window.location.href = '/'; // Quay lại trang chủ khi thanh toán thành công
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
