var app = angular.module('myApp', ['ngRoute']);

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
    .when("/sanphamchitiet", {
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
    .when('/dashboard', {
      templateUrl: './Views/dashboard.html',
      controller: 'DashboardController'
  })
    .otherwise({
      redirectTo: "/"
});



});
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
    .when("/sanphamchitiet", {
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
  
    .otherwise({
      redirectTo: "/"
    });
});

// Run block để khởi tạo ứng dụng
app.run(function ($rootScope, $location) {
  console.log('Ứng dụng AngularJS đã khởi tạo thành công');

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
      $location.path('#!login');
  };
});
app.run(function($rootScope) {
  // Gắn một listener để theo dõi tất cả các lỗi toàn cục
  $rootScope.$on('$error', function(event, error) {
      console.error('Lỗi toàn cục:', error);
  });
});
