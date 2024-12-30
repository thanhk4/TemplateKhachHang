app.controller("GiohangCtrl", function ($document, $rootScope, $scope, $compile, $location, $timeout) {
    GetByidKH();
    // Thêm CSS
    const link = angular.element('<link rel="stylesheet" href="css/giohang.css">');
    $document.find('head').append(link);
    $rootScope.$on('$destroy', () => link.remove());

    // API URLs
    const apiUrls = {
        gioHang: "https://localhost:7297/api/Giohang/_KhachHang/giohangkhachhang",
        gioHangChiTiet: "https://localhost:7297/api/Giohangchitiet/_KhachHang/giohangchitietbygiohang",
        sanPhamChiTiet: "https://localhost:7297/api/Sanphamchitiet",
        sanPham: "https://localhost:7297/api/Sanpham",
        thuocTinh: "https://localhost:7297/api/Sanphamchitiet/_KhachHang/thuoctinh",
        saleChiTiet: "https://localhost:7297/api/Salechitiet/_KhachHang/SanPhamCT",
        giohangchitietbyspctandgh: "https://localhost:7297/api/Giohangchitiet/_KhachHang/idghctbygiohangangspct"
    };

    // Hàm lấy thông tin khách hàng từ localStorage
    function GetByidKH() {
        const userInfoString = localStorage.getItem("userInfo");
        let userId = 0;
        // Nếu không tìm thấy id khách hàng, chuyển hướng về trang đăng nhập và tải lại trang
        if (userInfoString === null) {
            $location.path(`/login`);
        }

        if (userInfoString) {
            try {
                const userInfo = JSON.parse(userInfoString);
                userId = userInfo?.id || 0;
            } catch (error) {
                console.error("Lỗi khi phân tích dữ liệu userInfo:", error);
            }
        }
        return userId;
    }

    // Hàm gọi API để lấy sản phẩm chi tiết theo idspct
    async function fetchSanPhamChitiet2(sanPhamCTId) {
            try {
            if (!sanPhamCTId) {
                console.error("idspct không hợp lệ");
                return null;
            }

            const response = await fetch(`${apiUrls.sanPhamChiTiet}/_KhachHang/${sanPhamCTId}`);
            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm chi tiết:", error);
            return null;
        }
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
            const response = await fetch(`${apiUrls.sanPhamChiTiet}/_KhachHang/${sanPhamCTId}`);

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

    // Hàm gọi API để lấy sản phẩm chi tiết theo idspct
    async function fetchSanPhamChitiet2(sanPhamCTId) {
            try {
            if (!sanPhamCTId) {
                console.error("idspct không hợp lệ");
                return null;
            }

            const response = await fetch(`${apiUrls.sanPhamChiTiet}/_KhachHang/${sanPhamCTId}`);
            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm chi tiết:", error);
            return null;
        }
    }

    // Hàm gọi API để lấy thông tin sản phẩm (tensp, urlhinhanh) theo idsp
    async function fetchSanPhamById(idsp) {
        try {
            const response = await fetch(`${apiUrls.sanPham}/_KhachHang/${idsp}`);
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
            const response = await fetch(`${apiUrls.saleChiTiet}/${spctId}`);
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

    async function fetchgiohangchitietbyspctandgh(idgh, idspct) {
        try {
            const response = await fetch(`https://localhost:7297/api/Giohangchitiet/_KhachHang/idghctbygiohangangspct/${idgh}/${idspct}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn("Không tìm thấy dữ liệu giỏ hàng chi tiết");
                    return null;
                }
                throw new Error(`Lỗi API giỏ hàng chi tiết: ${response.status}`);
            }

            return await response.json(); 
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu giảm giá chi tiết:", error);
            return null; 
        }
    }
    
    // Hàm tạo phần tử select cho thuốc tính
    function createThuocTinhSelects(thuocTinhList, idgh, firstIdspct) {
        // Khởi tạo chuỗi chứa phần tử <select>
        let thuocTinhSelects = `
            <select id="${idgh}" class="form-select" aria-label="Select ThuocTinh" style="width: auto;">
        `;
        
        // Tách nhóm chứa firstIdspct lên đầu danh sách
        const firstGroup = thuocTinhList.find(list => list.some(tt => tt.idspct === firstIdspct));
        const remainingGroups = thuocTinhList.filter(list => !list.some(tt => tt.idspct === firstIdspct));

        // Nếu nhóm có firstIdspct tồn tại, đưa nó lên đầu danh sách
        if (firstGroup) {
            thuocTinhSelects += createOptionForGroup(firstGroup, true);
        }

        // Tạo option cho các nhóm còn lại
        remainingGroups.forEach(group => {
            thuocTinhSelects += createOptionForGroup(group, false);
        });

        // Đóng thẻ <select>
        thuocTinhSelects += '</select>';
        
        // Trả về chuỗi chứa phần tử <select> với các <option>
        return thuocTinhSelects;
    }

    // Hàm tạo option cho một nhóm
    function createOptionForGroup(group, isFirstGroup) {
        let options = '';
        const ids = [...new Set(group.map(tt => tt.idspct))].join();
        const tenthuoctinh = group.map(tt => tt.tenthuoctinhchitiet).join(', '); // Nối tất cả tenthuoctinhchitiet thành chuỗi

        // Nếu là nhóm có firstIdspct, thêm thuộc tính selected vào option đầu tiên
        let isSelected = isFirstGroup ? 'selected' : '';

        options += `<option value="${ids}" ${isSelected}>${tenthuoctinh}</option>`;
        
        return options;
    }


    // Hàm cập nhật giỏ hàng và thay đổi option
    async function updateCartDetail(productId, idgh) {
        try {
            const datagiohanglist = await fetch(`https://localhost:7297/api/Giohangchitiet/_KhachHang/${idgh}`);
            const datagiohang = await datagiohanglist.json();

            // Gửi yêu cầu PUT để cập nhật số lượng sản phẩm
            const response = await fetch(`https://localhost:7297/api/Giohangchitiet/_KhachHang/sanpham/${idgh}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: datagiohang.id,
                    idgh: datagiohang.idgh,
                    idspct: productId,
                    soluong: 1,
                }),
            });
            
            // Kiểm tra phản hồi từ API
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lỗi API: ${response.status}. Nội dung: ${errorText}`);
            }

            alert("Cập nhật thành công");
            location.reload();
        } catch (error) {
            console.error("Cập nhật giỏ hàng thất bại", error);
            alert("Cập nhật giỏ hàng thất bại. Vui lòng thử lại sau.");

            // Quay về option đầu tiên trong trường hợp thất bại
            const selectElement = document.querySelector(`#${id}`);
            if (selectElement) {
                // Đặt lại giá trị select về option đầu tiên
                selectElement.selectedIndex = 0;
            }
        }
    }

    // Bắt sự kiện change cho tất cả các <select> với class "form-select" và aria-label="Select ThuocTinh"
    document.addEventListener('change', function(event) {
        // Kiểm tra xem phần tử thay đổi có phải là <select> với class "form-select" và aria-label="Select ThuocTinh"
        if (event.target.classList.contains('form-select') && event.target.getAttribute('aria-label') === 'Select ThuocTinh') {
            const selectedValue = event.target.value;
            
            if (selectedValue) {
                // Lấy idspct từ selectedValue nếu có nhiều giá trị, hoặc lấy trực tiếp
                const productId = selectedValue.split(',')[0];  // Lấy idspct đầu tiên

                // Lấy giá trị idgh từ thuộc tính id của phần tử select
                const idgh = event.target.id; // Lấy id từ thuộc tính id của phần tử select

                // Gửi request cập nhật giỏ hàng với giá trị idspct và idgh
                updateCartDetail(productId, idgh);
            }
        }
    });
    
    async function fetchSanPhamChiTietByIdSP(idsp) {
        try {
            const response = await fetch(`${apiUrls.sanPhamChiTiet}/_KhachHang/sanpham/${idsp}`);
            if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm chi tiết theo idsp:", error);
            return [];
        }
    }

    async function renderGioHang() {
        const idkh = GetByidKH();
        const productList = document.querySelector(".product-list");
        productList.innerHTML = ""; // Reset danh sách sản phẩm trước khi render
    
        const idgh = await fetchGioHangId(idkh);
        console.log(idgh);
    
        // Lấy danh sách chi tiết giỏ hàng
        const idghct = await fetchGioHangChiTiet(idgh.id);
        console.log(idghct);
        if (idghct.length === 0) {
            productList.innerHTML = '<div class="d-flex justify-content-center" style="margin-top: 20px;"><p>Không có sản phẩm nào để hiển thị.</p></div>';
            return;
        }
    
        let sanPhamChitiets = [];
    
        // Vòng lặp xử lý từng phần tử trong danh sách idghct
        for (const item of idghct) {
            try {
                const sanPhamChiTiet = await fetchSanPhamChitiet(item.idspct);
                console.log(sanPhamChiTiet); // Kiểm tra giá trị trả về từ API
                if (sanPhamChiTiet && sanPhamChiTiet.length > 0) {
                    // Thêm thông tin số lượng từ idghct vào mỗi sản phẩm và gắn thêm idgh vào sản phẩm
                    sanPhamChiTiet.forEach(sp => {
                        sp.soluonggiohang = item.soluong; // Gắn số lượng tương ứng
                        sp.idgh = item.id; // Gắn idgh vào từng sản phẩm chi tiết
                    });
                    sanPhamChitiets = [...sanPhamChitiets, ...sanPhamChiTiet];
                }
            } catch (error) {
                console.error(`Lỗi khi xử lý sản phẩm chi tiết với idspct: ${item.idspct}`, error);
            }
        }
    
        // Hàm xử lý cập nhật giá giảm
        function calculateDiscountPrice(giaHienTai, giatrigiam, donVi) {
            if (donVi === 0) {
                return giaHienTai - giatrigiam; // Giảm giá theo giá trị trực tiếp
            } else if (donVi === 1) {
                return giaHienTai * (1 - giatrigiam / 100);
            }
            return giaHienTai; // Nếu không xác định, giữ nguyên giá
        }
    
        console.log(sanPhamChitiets);
    
        danhSachSanPham = []; // Reset lại danh sách sản phẩm mỗi lần render lại
    
        // Duyệt qua tất cả sản phẩm chi tiết (spct) để render thông tin sản phẩm
        for (const sanPham of sanPhamChitiets) {
            const { id, idsp, giathoidiemhientai, trangthai, soluong, soluonggiohang} = sanPham;
    
            // Kiểm tra số lượng sản phẩm và trạng thái
            const isOutOfStock = soluong < 1;
            const isDisabled = (trangthai === 1 || isOutOfStock); 
    
            const sanPhamData = await fetchSanPhamById(idsp);
            if (!sanPhamData) continue;
    
            const saleChiTiet = await fetchSaleChiTietBySPCTId(id);
            let giaGiam = null; // Giá giảm mặc định là null
    
            if (saleChiTiet != null) {
                const { giatrigiam, donvi } = saleChiTiet;
                giaGiam = calculateDiscountPrice(giathoidiemhientai, giatrigiam, donvi);
            }
    
            const listidspctbyidsp = await fetchSanPhamChiTietByIdSP(idsp);
    
            const thuocTinhList = [];
            for(const idspct of listidspctbyidsp) {
                const thuocTinh = await fetchThuocTinhSPCT(idspct.id);
                thuocTinhList.push(thuocTinh);
            }
    
            if (!thuocTinhList || thuocTinhList.length === 0) {
                console.log(`Không có thuộc tính cho sản phẩm chi tiết với ID: ${id}`);
                continue;
            }
    
            let thuocTinhSelects = createThuocTinhSelects(thuocTinhList, sanPham.idgh, id);
    
            danhSachSanPham.push({
                id: id,
                idsp: idsp,
                tensp: sanPhamData.tensp,
                giathoidiemhientai: giathoidiemhientai,
                soluong: soluonggiohang,
                giamgia: giaGiam || 0,
            });
    
            // Tạo HTML cho sản phẩm
            const productItem = document.createElement("div");
            productItem.className = "product-item d-flex align-items-center py-2 border-bottom";
    
            const giaHienThi = giaGiam
                ? `<span class="text-muted text-decoration-line-through">${Number(giathoidiemhientai).toLocaleString('vi-VN')} VND</span>
                <span class="text-danger fw-bold ms-2">${Number(giaGiam).toLocaleString('vi-VN')} VND</span>`
                : `<span class="text-danger fw-bold">${Number(giathoidiemhientai).toLocaleString('vi-VN')} VND</span>`;
    
            // Nếu hết hàng hoặc trạng thái = 1, thêm badge và disable sản phẩm
            let disableClass = isDisabled ? 'disabled' : '';
            let outOfStockBadge = isDisabled ? 
                `<div class="badge bg-primary text-white text-center d-inline-block me-2" style="pointer-events: none; margin-left: 20px;"> Sản phẩm đã hết hàng </div>` 
                : '';
    
                productItem.innerHTML = `
                <div class="d-flex align-items-center" style="width: 5%; ">
                    <input type="checkbox" class="product-checkbox" id="checkbox${id}" data-id="${id}" style="margin: auto;" ${disableClass}>
                </div>
                <div class="d-flex align-items-center" style="width: 45%;">
                    <img src="${sanPhamData.urlHinhanh}" alt="Product Image" style="width: 80px; height: auto;">
                    <div class="ms-3" style="flex: 1;">
                        <!-- Dùng d-flex để chứa cả tên sản phẩm và badge -->
                        <div class="d-flex align-items-center">
                            <p class="mb-1 fw-bold">${sanPhamData.tensp}</p>
                            ${outOfStockBadge}
                        </div>
                        <span class="text-muted">Phân Loại Hàng:</span>
                        ${thuocTinhSelects}
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center" style="width: 50%;">
                    <div class="text-center" style="width: 40%; display: ruby;">
                        ${giaHienThi}
                    </div>
                    
                    <div class="input-group input-group-custom"  style="width: 20%;">
                        <button class="btn btn-outline-secondary quantity-btn" type="button" ng-click="changeQuantity($event, false, ${sanPham.id})" ${disableClass}>-</button>
                        <span class="text-black fw-bold quantity-display" style="margin: auto;">${sanPham.soluonggiohang}</span>
                        <button class="btn btn-outline-secondary quantity-btn" type="button" ng-click="changeQuantity($event, true, ${sanPham.id})" ${disableClass}>+</button>        
                    </div>
                    <div class="text-center text-danger fw-bold total-price" style="width: 30%;"></div>
                    
                    <button class="btn btn-danger delete-btn" ng-click="deleteProduct(${sanPham.id})" style="width: 15%;">Xóa</button>
                </div>
            `;            
           
            const compiledElement = $compile(productItem)($scope);
            productList.appendChild(compiledElement[0]);
        }
    
        // Gọi hàm để xử lý sự kiện checkbox sau khi render
        initializeCheckboxEvents();
    
        initializeTotalPrices();
        updateTotals();
    }
    
    

        // Hàm xóa chi tiết giỏ hàng
    async function deleteGioHangChiTiet(idghct) {
        try {
            const response = await fetch(`https://localhost:7297/api/Giohangchitiet/_KhachHang/${idghct}`, {
                method: 'DELETE'
            });

            // Kiểm tra trạng thái phản hồi
            if (response.ok) {
                return true; // Trả về true nếu xoá thành công
            } else {
                console.error(`Lỗi API: ${response.status}`);
                return false; // Trả về false nếu xoá thất bại
            }
        } catch (error) {
            console.error("Lỗi khi xóa chi tiết giỏ hàng:", error);
            return false; // Trả về false nếu có lỗi
        }
    }

    // Hàm xử lý khi bấm nút xóa
    $scope.deleteProduct = async function (idspct) {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            const product = await fetchSanPhamChitiet2(idspct);
            if (!product) {
                console.error(`Sản phẩm với ID ${productId} không tồn tại trong danh sách.`);
                return;
            }

            const idkh = GetByidKH();
            if (!idkh) {
                throw new Error("Không thể lấy ID khách hàng.");
            }

            const idgh = await fetchGioHangId(idkh);
            if (!idgh || !idgh.id) {
                throw new Error("Không thể lấy ID giỏ hàng.");
            }

            const idgiohangct = await fetchgiohangchitietbyspctandgh(idgh.id, idspct);
            if (!idgiohangct) {
                throw new Error("Không thể lấy ID giỏ hàng chi tiết.");
            }

            const result = await deleteGioHangChiTiet(idgiohangct.id);
            if (result) {
                alert("Sản phẩm đã được xóa khỏi giỏ hàng.");
                renderGioHang(); 
            } else {
                alert("Xóa sản phẩm thất bại, vui lòng thử lại.");
            }
        }
    };

    $scope.changeQuantity = async function(event, isIncrease, productId) {
        const product = await fetchSanPhamChitiet2(productId);
        if (!product) {
            console.error(`Sản phẩm với ID ${productId} không tồn tại trong danh sách.`);
            return;
        }
    
        let quantityDisplay = event.target.closest(".product-item").querySelector(".quantity-display");
        let currentQuantity = parseInt(quantityDisplay.textContent);
    
        const maxQuantity = product.soluong;
    
        if (isIncrease) {
            if (currentQuantity < maxQuantity) {
                currentQuantity++;
            } else {
                alert("Số lượng sản phẩm đã đạt giới hạn tối đa.");
                return;
            }
        } else {
            if (currentQuantity > 1) {
                currentQuantity--;
            }
            else if (currentQuantity = 1){
                alert("Số lượng sản phẩm đã đạt giới hạn tối đa.");
                return;
            }
        }
    
        quantityDisplay.textContent = currentQuantity;

        try {
            updateCartQuantity(productId, currentQuantity);
            initializeTotalPrices();
            updateTotals();
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
        }
    };
    

    async function updateCartQuantity(productId, quantity) {
        try {
            // Lấy ID khách hàng
            const idkh = GetByidKH();
            if (!idkh) {
                throw new Error("Không thể lấy ID khách hàng.");
            }
    
            // Lấy ID giỏ hàng
            const idgh = await fetchGioHangId(idkh);
            if (!idgh || !idgh.id) {
                throw new Error("Không thể lấy ID giỏ hàng.");
            }
    
            // Lấy ID giỏ hàng chi tiết dựa trên sản phẩm chi tiết và giỏ hàng
            const idgiohangct = await fetchgiohangchitietbyspctandgh(idgh.id, productId);
            if (!idgiohangct || !idgiohangct.id) {
                throw new Error("Không thể lấy ID giỏ hàng chi tiết.");
            }
    
            // Gửi yêu cầu PUT để cập nhật số lượng sản phẩm
            const response = await fetch(`https://localhost:7297/api/Giohangchitiet/_KhachHang/${idgiohangct.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: idgiohangct.id,
                    idgh: idgh.id,
                    idspct: productId,
                    soluong: quantity,
                }),
            });
    
            // Kiểm tra phản hồi từ API
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lỗi API: ${response.status}. Nội dung: ${errorText}`);
            }
    
            const data = await response.json();
        } catch (error) {
            console.error("Cập nhật giỏ hàng thất bại", error);
            alert("Cập nhật giỏ hàng thất bại. Vui lòng thử lại sau.");
        }
    }
    

    function updateTotals() {
        const productItems = document.querySelectorAll(".product-item");
        let totalProduct = 0;
        let totalPrice = 0;
    
        productItems.forEach((item) => {
            const checkbox = item.querySelector("input[type='checkbox']");
            if (checkbox.checked) {
                const price = parseFloat(item.querySelector(".total-price").textContent.replace(' VND', '').replace(/\./g, '')); // Lấy giá
    
                totalPrice +=  price;
            }
        });
    
        // Cập nhật thông tin tổng sản phẩm và tổng hóa đơn
        document.querySelector("#tongHoaDon").textContent = `${totalPrice.toLocaleString('vi-VN')} VND`;
    }
    
    // Xử lý sự kiện khi checkbox thay đổi
    function initializeCheckboxEvents() {
        const checkboxes = document.querySelectorAll(".product-checkbox");
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener("change", function () {
                updateTotals();  // Cập nhật lại tổng số sản phẩm và tổng tiền
                const idspct = this.getAttribute('data-id');
                console.log('idspct: ', idspct);
            });
        });
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

    // Lắng nghe sự kiện khi checkbox "chọn tất cả" được click
    document.getElementById("selectAllCheckbox").addEventListener("click", function () {
        // Lấy trạng thái của checkbox "chọn tất cả"
        const isChecked = this.checked;
    
        // Lấy tất cả các checkbox của sản phẩm (bỏ qua checkbox bị disabled)
        const productCheckboxes = document.querySelectorAll(".product-list .product-checkbox:not(:disabled)");
    
        // Thay đổi trạng thái của tất cả checkbox sản phẩm không bị disabled
        productCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    
        // Gọi các hàm xử lý liên quan sau khi cập nhật trạng thái checkbox
        initializeCheckboxEvents();
        initializeTotalPrices();
        updateTotals();
    });    

    
    $scope.changePage = async function () {
        try {
            // Lấy tất cả các checkbox đã chọn
            const selectedCheckboxes = document.querySelectorAll('.product-checkbox:checked');
    
            // Kiểm tra nếu không có checkbox nào được chọn
            if (selectedCheckboxes.length === 0) {
                alert("Vui lòng chọn ít nhất một sản phẩm trong giỏ hàng.");
                return false;
            }
    
            // Lấy ID khách hàng
            const idkh = GetByidKH();
            if (!idkh) {
                alert("Không thể xác định khách hàng. Vui lòng đăng nhập lại.");
                return false;
            }
    
            // Lấy ID giỏ hàng
            const idgh = await fetchGioHangId(idkh);
            if (!idgh || !idgh.id) {
                alert("Không thể lấy thông tin giỏ hàng. Vui lòng thử lại.");
                return false;
            }
    
            // Lấy danh sách chi tiết giỏ hàng
            const gioHangChiTiet = await fetchGioHangChiTiet(idgh.id);
            if (!gioHangChiTiet || gioHangChiTiet.length === 0) {
                alert("Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.");
                return false;
            }
    
            const selectedIds = [];
            const productsWithIssues = []; // Danh sách sản phẩm có vấn đề về số lượng
    
            // Kiểm tra từng sản phẩm được chọn
            for (const checkbox of selectedCheckboxes) {
                const productId = checkbox.getAttribute('data-id');
                const gioHangItem = gioHangChiTiet.find(item => item.idspct === parseInt(productId));
    
                if (!gioHangItem) {
                    console.error(`Không tìm thấy sản phẩm với ID ${productId} trong giỏ hàng.`);
                    continue;
                }
    
                const cartQuantity = gioHangItem.soluong;
    
                // Gọi API lấy thông tin sản phẩm chi tiết
                const productDetail = await fetchSanPhamChitiet2(productId);
                if (!productDetail) {
                    console.error(`Không thể lấy thông tin sản phẩm chi tiết cho ID ${productId}.`);
                    continue;
                }
    
                // Kiểm tra số lượng
                if (cartQuantity > productDetail.soluong) {
                    const sanPhamData = await fetchSanPhamById(productDetail.idsp);
                    productsWithIssues.push(productDetail.tenSanPham || `ID: ${sanPhamData.tensp}`);
                } else {
                    selectedIds.push(productId); // Chỉ thêm sản phẩm hợp lệ
                }
            }
    
            // Nếu có sản phẩm vượt quá số lượng
            if (productsWithIssues.length > 0) {
                Swal.fire({
                    title: 'Cảnh báo',
                    icon: 'warning',
                    html: `Các sản phẩm sau đây có số lượng trong giỏ hàng lớn hơn số lượng khả dụng:<br>- ${productsWithIssues.join('<br>- ')}`,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                });                
                return false;
            }
    
            // Chuyển hướng sang trang "Hóa đơn giỏ hàng"
            $timeout(() => {
                $scope.$apply(() => {
                    $location.path(`/hoadongiohang/${selectedIds.join(',')}`); // Chuyển hướng với danh sách ID hợp lệ
                });
                $scope.isLoading = false; // Kết thúc tải (nếu cần)
            }, 1000);
    
        } catch (error) {
            console.error("Lỗi khi kiểm tra số lượng sản phẩm:", error);
            alert("Có lỗi xảy ra khi kiểm tra số lượng sản phẩm. Vui lòng thử lại sau.");
        }
    };
           
    // Gọi render khi khởi tạo controller
    renderGioHang();
    
});
