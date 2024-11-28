
var app = angular.module('myApp', ['ngRoute']);

// Config để cấu hình các route
app.config(($routeProvider) => {
  $routeProvider
    .when("/", {
      templateUrl: "./Views/TrangChu.html",
      controller: "TrangChuCtrl"
    })
    .when("/danhsachsanpham", {
      templateUrl: "./Views/DanhSachSanPham.html",
      controller: "DanhSachSanPhamCtrl"
    })
    .when("/danhsachsanphamSale", {
      templateUrl: "./Views/SanPhamSale.html",
      controller: "SanPhamSaleController"
    })
    .when("/sanphamchitiet/:id", {
      templateUrl: "./Views/SanPhamChiTiet.html",
      controller: "SanPhamChiTietCtrl"
    })
    .when("/login", {
      templateUrl: "./Views/login.html",
      controller: "LoginController"
    })
    .when("/dangky", {
      templateUrl: "./Views/dangky.html",
      controller: "dangkyController"
    })
    .when('/thongtintaikhoan', {
      templateUrl: './Views/thongtintaikhoan.html',
      controller: 'ThongTinTaiKhoanController'

  })
  .when('/quenmatkhau', {
    templateUrl: './Views/quenmatkhau.html',
    controller: 'quenmatkhauController'
})
  .when('/resetpassword', {
    templateUrl: './Views/resetpassword.html',
    controller: 'PasswordResetController'
})
.when('/trangthai', {
  templateUrl: './Views/Donmua.html',
  controller: 'MuahangController'
})
.when('/diachi', {
  templateUrl: './Views/diachi.html',
  controller: 'diachiController'
})

.when('/doimatkhau2', {
  templateUrl: './Views/doimatkhau2.html',
  controller: 'doimatkhau2Controller'
})
.when("/sanphamthuonghieu/:id", {
  templateUrl: "./Views/SanPhamThuongHieu.html",
  controller: "SanPhamThuongHieuController"
})
.otherwise({
  redirectTo: "/"
});

    });
    



<<<<<<< HEAD
   
// redirect to

=======
>>>>>>> 11314bd8b90df5d423e65133ce6bf7726ee0c4b5
// Run block để khởi tạo ứng dụng
app.run(function ($rootScope, $location) {
  console.log('Ứng dụng AngularJS đã khởi tạo thành công');
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

  // Gọi hàm khi Controller khởi tạo
  $scope.loadThuongHieu();
});

