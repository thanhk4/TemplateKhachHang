app.controller("TrangChuCtrl", function ($scope, $document, $rootScope, SanPhamService, $location ) {
    let link = angular.element('<link rel="stylesheet" href="css/TrangChu.css">');
    $document.find('head').append(link);

    $rootScope.$on('$destroy', function() {
      link.remove();
    });
    $scope.btntimkiem = function () {
      if ($scope.search && $scope.search.trim() !== '') {
        $location.path('/timkiem/' + $scope.search);
      } else {
        alert("Vui lòng nhập từ khóa để tìm kiếm!");
      }
    };
    
    
    $scope.sanPhams = [];
    $scope.errorMessage = null;
    $scope.SanPhamGiamGia = [];
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
    function LoadSanPhamGiamGia() {
      SanPhamService.getSanPhamGiamGia()
      .then(function(data){
        $scope.SanPhamGiamGia = data;
        console.log("San pham giam gia:", $scope.SanPhamGiamGia);
      })
      .catch(function(error){
        $scope.errorMessage = "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.";
        console.error("Lỗi khi tải sản phẩm:", error);
      });
    }
    LoadSanPhamGiamGia();
    $scope.xemChiTiet = function (id) {
        console.log("Xem chi tiết sản phẩm:", id);
        
        $location.path(`/sanphamchitiet/${id}`);
    };//<!--gaaaa-->//<!--gaaaa-->

//<!--gaaaa-->

  });
  