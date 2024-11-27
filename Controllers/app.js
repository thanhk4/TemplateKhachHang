
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
<<<<<<< HEAD

=======
>>>>>>> parent of 9dfec91 (SanPhamSale view)
  })
  .when('/quenmatkhau', {
    templateUrl: './Views/quenmatkhau.html',
    controller: 'quenmatkhauController'
})
  .when('/resetpassword', {
    templateUrl: './Views/resetpassword.html',
    controller: 'PasswordResetController'
})
<<<<<<< HEAD
.when('/trangthai', {
  templateUrl: './Views/Donmua.html',
  controller: 'MuahangController'
})
.when('/diachi', {
  templateUrl: './Views/diachi.html',
  controller: 'diachiController'
})

=======
>>>>>>> parent of 9dfec91 (SanPhamSale view)
.when('/doimatkhau2', {
  templateUrl: './Views/doimatkhau2.html',
  controller: 'doimatkhau2Controller'
})
<<<<<<< HEAD
.when("/sanphamthuonghieu/:id", {
  templateUrl: "./Views/SanPhamThuongHieu.html",
  controller: "SanPhamThuongHieuController"
})
.otherwise({
  redirectTo: "/"
=======
    .otherwise({
      redirectTo: "/"
    });
>>>>>>> parent of 9dfec91 (SanPhamSale view)
});

    });
    



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
