app.controller("DanhSachSanPhamCtrl", function ($scope, $document, $rootScope) {
  let link = angular.element('<link rel="stylesheet" href="css/DanhSachSanPham.css">');
  $document.find('head').append(link);

  $rootScope.$on('$destroy', function() {
    link.remove();
  });
});