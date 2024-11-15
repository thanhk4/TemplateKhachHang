app.controller("DanhSachSanPhamCtrl", function ($scope, $document) {
  let link = angular.element('<link rel="stylesheet" href="css/DanhSachSanPham.css">');
  $document.find('head').append(link);
});