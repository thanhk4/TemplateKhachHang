app.controller("SanPhamThuongHieuController", function ($scope, $document, SanPhamService, $location, $routeParams) {
    // Gắn file CSS cho controller
    let link = angular.element('<link rel="stylesheet" href="css/DanhSachSanPham.css">');
    $document.find('head').append(link);

    // Xóa CSS khi view bị hủy
    $scope.$on('$destroy', function () {
        link.remove();
    });
    const idThuongHieu = $routeParams.id;
    // Khởi tạo danh sách sản phẩm
    $scope.sanPhams = [];
    $scope.errorMessage = null;
    // Hàm load dữ liệu từ API
    function loadSanPham() {
        SanPhamService.getSanPhamByThuongHieu(idThuongHieu)
           
            .then(function (data) {
                $scope.sanPhams = data; // Gán dữ liệu vào scope
                console.log("idThuongHieu:", idThuongHieu);
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




