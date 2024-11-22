app.controller('LoginController', function ($scope, $http, $rootScope, $location) {
    $scope.user = {};
    $scope.errorMessage = '';
    $scope.isLoading = false;

    $scope.login = function () {
        $scope.isLoading = true;
        $scope.errorMessage = '';

        $http.post('https://localhost:7297/api/Login/login', {
            Email: $scope.user.email,
            Password: $scope.user.password
        }).then(function (response) {
            $scope.isLoading = false;

            if (response.data && response.data.message === "Đăng nhập thành công") {
                // Cập nhật trạng thái đăng nhập
                $rootScope.isLoggedIn = true;
                $rootScope.userInfo = {
                    id: response.data.khachHangId,
                    ten: response.data.ten,
                    email: response.data.email
                };

                // Lưu thông tin người dùng vào localStorage
                localStorage.setItem('userInfo', JSON.stringify($rootScope.userInfo));

                // Điều hướng về trang chủ
                $location.path('/');
            } else {
                $scope.errorMessage = response.data.message || "Đăng nhập thất bại";
            }
        }).catch(function (error) {
            $scope.isLoading = false;
            $scope.errorMessage = "Lỗi: " + (error.data || error.statusText);
        });
    };

    // Hàm đăng xuất
    $scope.dangxuat = function () {
        // Xóa thông tin người dùng
        $rootScope.isLoggedIn = false;
        $rootScope.userInfo = null;
        localStorage.removeItem('userInfo');
        
        // Log ra console để kiểm tra
        console.log("Đăng xuất thành công");
    
        // Kiểm tra xem isLoggedIn đã được cập nhật chưa
        console.log($rootScope.isLoggedIn);
    
        // Điều hướng đến trang login
        $location.path('/login');
    };
    
});
