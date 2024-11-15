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
    .when("/muasanpham", {
      templateUrl: "./Views/MuaSanPham.html",
      controller: "MuaSanPhamCtrl"
    })
    .otherwise({
      redirectTo: "/"
    });
});
