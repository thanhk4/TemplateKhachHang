app.controller("GiohangCtrl", function ($document, $rootScope, $routeParams, $scope, $location) {

    let link = angular.element('<link rel="stylesheet" href="css/giohang.css">');
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

    // Hàm gọi API giảm giá chi tiết theo ID sản phẩm chi tiết
    async function fetchSaleChiTietBySPCTId(spctId) {
        try {
            if (!spctId) {
                console.error("ID sản phẩm chi tiết không hợp lệ");
                return null;
            }

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

    // Hàm xử lý cập nhật giá giảm
    function calculateDiscountPrice(giaHienTai, giatrigiam, donVi) {
        if (donVi === 0) {
            return giaHienTai - giatrigiam; // Giảm giá theo giá trị trực tiếp
        } else if (donVi === 1) {
            return giaHienTai * (1- giatrigiam / 100);
        }
        return giaHienTai; // Nếu không xác định, giữ nguyên giá
    }


    function getQuantityFromSession() {
        // Lấy số lượng từ sessionStorage
        const quantity = sessionStorage.getItem('quantity');
    
        // Nếu có số lượng trong sessionStorage, trả về giá trị đó, nếu không trả về 1 (giá trị mặc định)
        return quantity ? parseInt(quantity) : 1;
    }
    // Biến toàn cục lưu trữ danh sách sản phẩm
    let danhSachSanPham = [];

    // Hàm render sản phẩm
    async function renderSanPham() {
        const sanPhamChitiets = await fetchSanPhamChitiet();
        const productList = document.querySelector(".product-list");
        $scope.quantity = getQuantityFromSession();

        if (sanPhamChitiets.length === 0) {
            productList.innerHTML = "<p>Không có sản phẩm nào để hiển thị.</p>";
            return;
        }

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
                soluong : $scope.quantity,
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
                    <span class="text-black fw-bold quantity-display">${$scope.quantity}</span>
                </div>
                <div class="text-center text-danger fw-bold total-price" style="width: 35%;"></div>
            </div>
            `;
            productList.appendChild(productItem);
        }
        
        initializeTotalPrices();
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
});
