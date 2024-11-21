app.controller("MuaSanPhamCtrl", function ($scope, $document, $rootScope ) {
    const quantityInput = document.querySelector(".quantity-input"); 
    const priceElement = document.querySelector(".total-price");
    window.onload = function() {
        if (quantityInput && priceElement) {
            updateTotalPrice();
        }
    };

    let link = angular.element('<link rel="stylesheet" href="css/MuaSanPham.css">');
    $document.find('head').append(link);
    $rootScope.$on('$destroy', function () {
        link.remove();
    });

    // API URL
    const apiUrl = "https://localhost:7297/api/Sanpham";

    // Hàm gọi API để lấy sản phẩm
    async function fetchSanPham() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm:", error);
            return [];
        }
    }

    async function renderSanPham() {
        const sanPhams = await fetchSanPham();
        const productList = document.querySelector(".product-list");

        if (sanPhams.length === 0) {
            productList.innerHTML = "<p>Không có sản phẩm nào để hiển thị.</p>";
            return;
        }

        sanPhams.forEach((sanPham) => {
            const productItem = document.createElement("div");
            productItem.className = "product-item d-flex align-items-center py-2 border-bottom";

            productItem.innerHTML = `
                <!-- Sản phẩm -->
                    <!-- Thông tin sản phẩm -->
                    <div class="d-flex align-items-center" style="width: 50%;">
                        <img src="../image/${sanPham.urlHinhanh}.png" alt="Product Image" style="width: 80px; height: auto;">
                        <div class="ms-3" style="flex: 1;">
                            <p class="mb-1 fw-bold">${sanPham.tensp}</p>
                            <span class="text-muted">Phân Loại Hàng:</span>
                            <select class="form-select d-inline-block ms-2 custom-select-small"
                                aria-label="Small select example">
                                <option>Đen</option>
                                <option>Trắng</option>
                            </select>
                            <select class="form-select d-inline-block ms-2 custom-select-small"
                                aria-label="Small select example">
                                <option>32</option>
                                <option>34</option>
                            </select>
                        </div>
                    </div>
    
                    <!-- Chi tiết giá và hành động -->
                    <div class="d-flex justify-content-between align-items-center" style="width: 50%;">
                <!-- Giá -->
                    <div class="text-center" style="width: 25%; display: ruby;">
                        <span class="text-danger fw-bold">${Number(sanPham.giaban).toLocaleString('vi-VN')}₫</span>
                    </div>


                    <!-- Thay đổi số lượng -->
                    <div class="d-flex justify-content-center align-items-center" style="width: 25%;">
                        <div class="input-group input-group-custom">
                            <button class="btn btn-outline-secondary quantity-btn" type="button" id="button-addon1">-</button>
                            <input type="text" class="form-control text-center quantity-input" value="1" min="1">
                            <button class="btn btn-outline-secondary quantity-btn" type="button" id="button-addon2">+</button>
                        </div>
                    </div>

                    <!-- Tổng giá -->
                    <div class="text-center text-danger fw-bold total-price" style="width: 25%;"></div>

                    <!-- Xóa -->
                    <div class="text-center" style="width: 25%;">
                        <button class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#Delete">Xóa</button>
                    </div>
                </div>
                `;
            productList.appendChild(productItem);
        });

        updateEventListeners();
    }

    function updateEventListeners() {
        // Gắn sự kiện cho các nút thay đổi số lượng
        const quantityButtons = document.querySelectorAll(".quantity-btn");
        quantityButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                const input = event.target.closest(".input-group").querySelector(".quantity-input");
                const productItem = event.target.closest(".product-item");
                const priceElement = productItem.querySelector(".total-price");

                // Lấy giá bán hoặc giá sale
                const priceSaleElement = productItem.querySelector(".text-danger");
                const price = parseInt(priceSaleElement.textContent.replace("₫", "").replace('.', ""));

                // Cập nhật số lượng
                if (event.target.id === "button-addon1") {
                    input.value = Math.max(1, parseInt(input.value) - 1);
                } else if (event.target.id === "button-addon2") {
                    input.value = parseInt(input.value) + 1;
                }

                // Tính tổng giá
                const totalPrice = price * parseInt(input.value);
                priceElement.textContent = `${totalPrice.toLocaleString()}₫`;
            });
        });

        // Gắn sự kiện cho nút xóa
        const deleteButtons = document.querySelectorAll(".btn-outline-danger");
        deleteButtons.forEach((button) => {
            button.addEventListener("click", () => {
                button.closest(".product-item").remove();
            });
        });
    }

    quantityInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, ''); // Chỉ cho phép nhập số
        updateTotalPrice(); // Cập nhật lại tổng số tiền khi thay đổi số lượng
    });

    renderSanPham();
});
