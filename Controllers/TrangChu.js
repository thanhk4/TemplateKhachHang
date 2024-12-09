app.controller("TrangChuCtrl", function ($scope, $document, $rootScope, SanPhamService, $location, ThuongHieuService ) {
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
    
    $scope.thuongHieus = [];

    $scope.sanPhams = [];
    $scope.errorMessage = null;
    $scope.SanPhamGiamGia = [];
    $scope.SanPhamThemMoi = [];
    $scope.loadThuongHieu = function() {
      ThuongHieuService.getAllThuongHieu()
          .then(function(response) {
              $scope.thuongHieus = response.data; // Gán dữ liệu từ API
              console.log("Danh sách thương hiệu:", $scope.thuongHieus);
          })
          .catch(function(error) {
              $scope.errorMessage = "Không thể tải danh sách thương hiệu.";
              console.error("Lỗi khi gọi API thương hiệu:", error);
          });
  };
///aqsdfgádfc
  // Gọi hàm khi Controller khởi tạo
  $scope.loadThuongHieu();
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
    function loadSanPhamMoi() {
      SanPhamService.getAllSanPham()
      .then(function (data) {
        // Lọc các sản phẩm mới thêm (ngày thêm lớn hơn hoặc bằng ngày hiện tại)
        const currentDate = new Date(); // Ngày hiện tại
        $scope.SanPhamThemMoi = data.filter(function (sanPham) {
            const ngayThem = new Date(sanPham.NgayThemSanPham); // Chuyển NgayThemSanPham thành kiểu Date
            return ngayThem >= currentDate; // So sánh ngày
        });

        // Sắp xếp các sản phẩm theo NgayThemSanPham từ mới nhất đến cũ nhất
        $scope.sanPhams.sort(function (a, b) {
            const ngayThemA = new Date(a.NgayThemSanPham);
            const ngayThemB = new Date(b.NgayThemSanPham);
            return ngayThemB - ngayThemA; // Sắp xếp theo ngày giảm dần
        });

        console.log("Danh sách sản phẩm mới thêm, sắp xếp theo ngày:", $scope.sanPhams);
    })
    .catch(function (error) {
        $scope.errorMessage = "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.";
        console.error("Lỗi khi tải sản phẩm:", error);
    });
  }
  loadSanPhamMoi();
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
    };//<!--gaaaa-->//<!--gaaaa-->//<!--gaaaa-->

//<!--gaaaa-->

  });
  