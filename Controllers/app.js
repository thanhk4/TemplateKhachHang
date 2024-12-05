
var app = angular.module('myApp', ['ngRoute']);

// Config để cấu hình các route
app.config(($routeProvider) => {
  $routeProvider
    .when("/", {
      templateUrl: "./Views/TrangChu.html",
      controller: "TrangChuCtrl",
    })
    .when("/danhsachsanpham", {
      templateUrl: "./Views/DanhSachSanPham.html",
      controller: "DanhSachSanPhamCtrl"
    })
    .when("/sanphamchitiet/:id", {
      templateUrl: "./Views/SanPhamChiTiet.html",
      controller: "SanPhamChiTietCtrl"
    })
    .when("/sanphamthuonghieu/:id", {
      templateUrl: "./Views/SanPhamThuongHieu.html",
      controller: "SanPhamThuongHieuController"
    })
    .when("/sanPhamSale", {
      templateUrl: "./Views/SanPhamSale.html",
      controller: "SanPhamSaleController"
    })
    .when("/login", {
      templateUrl: "./Views/login.html",
      controller: "LoginController"
    })
    .when("/diachicuaban", {
      templateUrl: "./Views/diachicuaban.html",
      controller: "DiachicuabanCtrl"
    })
    .when("/muasanpham/:id", {
      templateUrl: "./Views/MuaSanPham.html",
      controller: "MuaSanPhamCtrl"
    })  
    .when("/dangky", {
      templateUrl: "./Views/dangky.html",
      controller: "dangkyController"
    })
    .when("/donhangcuaban", {
      templateUrl: "./Views/donhangcuaban.html",
      controller:'donhangcuabanController'
    })
    .when("/timkiem/:search", {
      templateUrl: './Views/timkiem.html',
      controller: 'timkiemController'//<!--gaaaa-->//<!--gaaaa-->//<!--gaaaa-->
    })
    .when("/trahang/:id", {
      templateUrl: './Views/trahang.html',
      controller:'trahangController'
    })
    .when('/thongtintaikhoan', {
      templateUrl: './Views/thongtintaikhoan.html',
      controller: 'ThongTinTaiKhoanController'
  })
  .when('/hoadongiohang/:ids', {
    templateUrl: './Views/hoadongiohang.html',
    controller: 'HoadongiohangCtrl'
})
  .when('/quenmatkhau', {
    templateUrl: './Views/quenmatkhau.html',
    controller: 'quenmatkhauController'
})
.when('/giohang', {
  templateUrl: './Views/giohang.html',
  controller: 'GiohangCtrl'
})
  .when('/resetpassword', {
    templateUrl: './Views/resetpassword.html',
    controller: 'PasswordResetController'
})
.when('/doimatkhau2', {
  templateUrl: './Views/doimatkhau2.html',
  controller: 'doimatkhau2Controller'
})
.otherwise({
  redirectTo: "/"
});

   
});



// Run block để khởi tạo ứng dụng
app.run(function ($rootScope, $location, $http) {
  $rootScope.showAccountInfo = false;
  // Kiểm tra trạng thái đăng nhập từ localStorage
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
      $rootScope.isLoggedIn = true;
      $rootScope.userInfo = JSON.parse(userInfo);
  } else {
      $rootScope.isLoggedIn = false;
      $rootScope.userInfo = null;
  }
  
  // Kiểm tra trạng thái khách hàng mỗi khi chuyển trang
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
      const idkh = GetByidKH();
      if ($rootScope.isLoggedIn) {
          // Gọi API để kiểm tra trạng thái của khách hàng
          $http.get(`https://localhost:7297/api/Khachhang/${idkh}`)  
              .then(function(response) {
                  if (response.data.trangthai === "Tài khoản bị khoá") {
                      // Nếu trạng thái là 1, gọi hàm đăng xuất
                      $rootScope.dangxuat();
                      Swal.fire({
                        icon: 'error',               // Chọn icon là lỗi (error)
                        title: 'Lỗi',                // Tiêu đề thông báo
                        text: 'Tài khoản của bạn đã bị khoá',  // Nội dung thông báo
                        confirmButtonText: 'Đóng'    // Văn bản cho nút xác nhận
                      });  
                  }
              })
              .catch(function(error) {
                  console.error("Lỗi khi gọi API kiểm tra trạng thái:", error);
              });
      }
  });

  // Hàm đăng xuất
  $rootScope.dangxuat = function () {
    $rootScope.isLoggedIn = false;
    $rootScope.userInfo = null;
    localStorage.removeItem('userInfo');
    $location.path('/login');
  };

//aa
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

  // Hàm đăng xuất
  $rootScope.dangxuat = function () {
      $rootScope.isLoggedIn = false;
      $rootScope.userInfo = null;
      localStorage.removeItem('userInfo');
      console.log("Đăng xuất thành công");
      $location.path('/login');
  };

  // Gắn một listener để theo dõi tất cả các lỗi toàn cục
  $rootScope.$on('$error', function (event, error) {
      console.error('Lỗi toàn cục:', error);
      
  });
});
app.controller('mainController', function ($scope, $location) {
  $scope.btntimkiem = function () {
    if ($scope.search && $scope.search.trim() !== '') {
      $location.path('/timkiem/' + $scope.search);
      $scope.search = '';
    } else {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng nhập từ khóa để tìm kiếm!',//ss
        icon: 'info',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
        background: '#fff',
        color: '#333',
        customClass: {
            popup: 'custom-popup',
        }
    });
    }
    $http.get()
  };
  
});
app.service('ThuongHieuService', function($http) {
  const apiUrl = 'https://localhost:7297/api/Thuonghieu'; // Thay URL API của bạn

  // Hàm lấy danh sách thương hiệu
  this.getAllThuongHieu = function() {
      return $http.get(apiUrl);
  };
});

app.controller('ThuongHieuController', function($scope, ThuongHieuService) {
  $scope.thuongHieus = []; // Danh sách thương hiệu
  $scope.errorMessage = null;

  // Hàm tải dữ liệu thương hiệu
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
});
const apiUrl = "https://localhost:7297/api/Trahang/tra-hang-qua-han";

// Cấu hình yêu cầu
const requestOptions = {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    // Thêm Authorization nếu cần
    // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
  },
};

// Gửi yêu cầu xóa
fetch(apiUrl, requestOptions)
  .then(response => {
    if (response.status === 404) {
      throw new Error("Không tìm thấy bản ghi phù hợp để xóa.");
    }
    if (response.status === 500) {
      throw new Error("Lỗi hệ thống trong quá trình xóa.");
    }
    if (!response.ok) {
      throw new Error(`Lỗi không xác định! Status: ${response.status}`);
    }
    console.log("Xóa thành công!");
  })
  .catch(error => {
    console.error("Lỗi:", error.message);
  });
