// Service để xử lý API sản phẩm
app.service("SanPhamService", function ($http) {
    const baseUrl = "https://localhost:7297/api/";

this.getAllSanPham = function () {
    return $http.get(baseUrl + "Sanpham/GetALLSanPham")
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
};
this.getSanPhamGiamGia = function () {
    return $http.get(baseUrl + "Sanpham/GetALLSanPhamGiamGia")
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
}
this.getSanPhamById = function (id) {
    return $http.get(baseUrl + "Sanpham/GetALLSanPham/" + id)
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
};

this.getDanhGiaByIdSPCT = function (id) {
    return $http.get(baseUrl + "Danhgias/GetByIdSPCT/" + id)
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
};
this.getSanPhamByThuongHieu = function (id) {
    return $http.get(baseUrl + "Sanpham/GetALLSanPhamByThuongHieu/" + id)
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
    }
});



app.controller("DanhSachSanPhamCtrl", function ($scope, $document, SanPhamService, $location, $interval) {
    // Gắn file CSS cho controller
    let link = angular.element('<link rel="stylesheet" href="css/DanhSachSanPham.css">');
    $document.find('head').append(link);

    $scope.$on('$destroy', function () {
        link.remove();
        if (autoReload) {
            $interval.cancel(autoReload); // Hủy interval khi thoát khỏi controller
        }
    });

    $scope.filteredProduct = [];
    $scope.paginatedProduct = [];
    $scope.itemsPerPage = 12;
    $scope.currentPage = 0;
    $scope.sanPhams = [];
    $scope.errorMessage = null;

    // Hàm tải danh sách sản phẩm
    function loadSanPham() {
        SanPhamService.getAllSanPham()
            .then(function (data) {
                $scope.sanPhams = data;
                $scope.filteredProduct = data;
                $scope.paginateOrders();
                console.log("Danh sách sản phẩm đã được cập nhật tự động.");
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải sản phẩm:", error);
            });
    }

    // Hàm phân trang
    $scope.paginateOrders = function () {
        $scope.paginatedProduct = [];
        for (let i = 0; i < $scope.filteredProduct.length; i += $scope.itemsPerPage) {
            $scope.paginatedProduct.push($scope.filteredProduct.slice(i, i + $scope.itemsPerPage));
        }
        $scope.currentPage = 0; // Reset về trang đầu tiên
    };

    $scope.goToPage = function (page) {
        if (page >= 0 && page < $scope.paginatedProduct.length) {
            $scope.currentPage = page;
        }
    };

    $scope.xemChiTiet = function (id) {
        console.log("Xem chi tiết sản phẩm:", id);
        $location.path(`/sanphamchitiet/${id}`);
    };

    // Tự động tải lại danh sách sản phẩm mỗi 10 giây
    const autoReload = $interval(function () {
        loadSanPham();
    }, 10000); // 10000 ms = 10 giây

    // Gọi hàm load dữ liệu ban đầu
    loadSanPham();
});

