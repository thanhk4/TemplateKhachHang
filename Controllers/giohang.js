app.controller("GiohangCtrl", function ($document, $rootScope, $scope, $compile, $location, $timeout) {
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
        saleChiTiet: "https://localhost:7297/api/Salechitiet/SanPhamCT",
        giohangchitietbyspctandgh: "https://localhost:7297/api/Giohangchitiet/idghctbygiohangangspct"
    };

    // Hàm lấy thông tin khách hàng từ localStorage
    function GetByidKH() {
        const userInfoString = localStorage.getItem("userInfo");
        let userId = 0;
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

            const response = await fetch(`${apiUrls.sanPhamChiTiet}/${sanPhamCTId}`);
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

    // Hàm gọi API để lấy sản phẩm chi tiết theo idspct
    async function fetchSanPhamChitiet2(sanPhamCTId) {
            try {
            if (!sanPhamCTId) {
                console.error("idspct không hợp lệ");
                return null;
            }

            const response = await fetch(`${apiUrls.sanPhamChiTiet}/${sanPhamCTId}`);
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
            const response = await fetch(`https://localhost:7297/api/Giohangchitiet/idghctbygiohangangspct/${idgh}/${idspct}`);
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
                <div class="d-flex align-items-center" style="width: 5%; ">
                    <input type="checkbox" class="product-checkbox" id="checkbox${id}" data-id="${id}" style="margin: auto;">
                </div>
                <div class="d-flex align-items-center" style="width: 45%;">
                    <img src="../image/${sanPhamData.urlHinhanh}" alt="Product Image" style="width: 80px; height: auto;">
                    <div class="ms-3" style="flex: 1;">
                        <p class="mb-1 fw-bold">${sanPhamData.tensp}</p>
                        <span class="text-muted">Phân Loại Hàng:</span>
                        ${thuocTinhSelects}
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center" style="width: 50%;">
                    <div class="text-center" style="width: 40%; display: ruby;">
                        ${giaHienThi}
                    </div>
                    
                    <div class="input-group input-group-custom"  style="width: 20%;">
                            <button class="btn btn-outline-secondary quantity-btn" type="button"
                                ng-click="changeQuantity($event, false, ${sanPham.id})">-</button>
                            <span class="text-black fw-bold quantity-display" style="margin: auto;">${sanPham.soluong}</span>
                            <button class="btn btn-outline-secondary quantity-btn" type="button"
                                ng-click="changeQuantity($event, true, ${sanPham.id})">+</button>        
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
            const response = await fetch(`https://localhost:7297/api/Giohangchitiet/${idghct}`, {
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
            const response = await fetch(`https://localhost:7297/api/Giohangchitiet/${idgiohangct.id}`, {
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

        // Lấy tất cả các checkbox của sản phẩm
        const productCheckboxes = document.querySelectorAll(".product-list .product-checkbox");

        // Thay đổi trạng thái của tất cả checkbox sản phẩm
        productCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            initializeCheckboxEvents();
            initializeTotalPrices();
            updateTotals();
        });
    });

    
    // Hàm chuyển trang
    $scope.changePage = async function() {
        // Lấy tất cả các checkbox đã chọn
        const selectedCheckboxes = document.querySelectorAll('.product-checkbox:checked');
        
        // Kiểm tra nếu không có checkbox nào được chọn
        if (selectedCheckboxes.length === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm trong giỏ hàng.");
            return false;
        }
    
        // Lấy các data-id của các checkbox đã chọn
        const selectedIds = [];
        selectedCheckboxes.forEach(checkbox => {
            selectedIds.push(checkbox.getAttribute('data-id'));
        });
    
        // Sử dụng $timeout để gọi $apply một cách an toàn trong AngularJS
        $timeout(() => {
            $location.path(`/hoadongiohang/${selectedIds.join(',')}`); // Chuyển hướng với các ID sản phẩm
        });
    };        

    renderGioHang();
    
});
