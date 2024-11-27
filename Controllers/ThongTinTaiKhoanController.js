app.controller('ThongTinTaiKhoanController', function($scope, $rootScope, $location) {
    // Kiểm tra đăng nhập
    
    if (!$rootScope.isLoggedIn) {
        $location.path('/login');
        return;
    }

    // Lấy thông tin người dùng từ localStorage
    $scope.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    $scope.Dangky = JSON.parse(localStorage.getItem('Dangky'));

    // Hàm đăng xuất
   
});