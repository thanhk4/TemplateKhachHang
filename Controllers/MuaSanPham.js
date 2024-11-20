app.controller("MuaSanPhamCtrl", function ($scope, $document, $rootScope) {
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
                <div>
                    <!-- Thông tin sản phẩm -->
                    <div class="d-flex align-items-center" style="width: 50%;">
                        <img src="${sanPham.urlHinhanh}" alt="Product Image" style="width: 80px; height: auto;">
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
                            <span class="text-muted text-decoration-line-through">${sanPham.giaban}₫</span><br>
                            <span class="text-danger fw-bold" id="product-price-sale">${sanPham.giasale}₫</span>
                        </div>
    
                        <!-- Thay đổi số lượng -->
                        <div class="d-flex justify-content-center align-items-center" style="width: 25%;">
                            <div class="input-group input-group-custom">
                                <button class="btn btn-outline-secondary quantity-btn" type="button"
                                    id="button-addon1">-</button>
                                <input type="text" class="form-control text-center quantity-input" value="${sanPham.soluong}"
                                    min="1">
                                <button class="btn btn-outline-secondary quantity-btn" type="button"
                                    id="button-addon2">+</button>
                            </div>
                        </div>
    
                        <!-- Tổng giá -->
                        <div class="text-center text-danger fw-bold total-price" style="width: 25%;"></div>
    
                        <!-- Xóa -->
                        <div class="text-center" style="width: 25%;">
                            <button class="btn btn-outline-danger" data-bs-toggle="modal"
                                data-bs-target="#Delete">Xóa</button>
                        </div>
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
                if (event.target.id === "button-addon1") {
                    input.value = Math.max(1, parseInt(input.value) - 1);
                } else if (event.target.id === "button-addon2") {
                    input.value = parseInt(input.value) + 1;
                }
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

    renderSanPham();
});
