app.controller("TrangChuCtrl", function ($scope, $document, $rootScope) {
    let link = angular.element('<link rel="stylesheet" href="css/TrangChu.css">');
    $document.find('head').append(link);

    $rootScope.$on('$destroy', function() {
      link.remove();
    });
  });
  