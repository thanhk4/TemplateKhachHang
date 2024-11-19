const app = angular.module("myApp", ["ngRoute"]);

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
      controller: "logincontroller"
    })
    .when("/dangky", {
      templateUrl: "./Views/dangky.html",
      controller: "Dangkycontroller"
    })
    .otherwise({
      redirectTo: "/"
    });
});
