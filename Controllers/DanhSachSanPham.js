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



app.controller("DanhSachSanPhamCtrl", function ($scope, $document, SanPhamService, $location) {
    // Gắn file CSS cho controller
    let link = angular.element('<link rel="stylesheet" href="css/DanhSachSanPham.css">');
    $document.find('head').append(link);

    // Xóa CSS khi view bị hủy
    $scope.$on('$destroy', function () {
        link.remove();
    });

    // Khởi tạo danh sách sản phẩm
    $scope.sanPhams = [];
    $scope.errorMessage = null;
    // Hàm load dữ liệu từ API
    function loadSanPham() {
        SanPhamService.getAllSanPham()
            .then(function (data) {
                $scope.sanPhams = data; // Gán dữ liệu vào scope
                console.log("Danh sách sản phẩm:", $scope.sanPhams);
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải sản phẩm:", error);
            });
    }
      // Hàm gọi API chi tiết sản phẩm khi click vào sản phẩ

    // Gọi hàm load dữ liệu khi controller khởi chạy
    loadSanPham();

    $scope.xemChiTiet = function (id) {
        console.log("Xem chi tiết sản phẩm:", id);
        
        $location.path(`/sanphamchitiet/${id}`);
    };
});
