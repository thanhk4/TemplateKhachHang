app.controller('LoginController', function ($scope, $http, $rootScope, $location, $timeout) {
    $scope.login = function () {
        $scope.isLoading = true;
        $scope.errorMessage = '';
    
        $http.post('https://localhost:7297/api/Login/login', {
            Email: $scope.user.email,
            Password: $scope.user.password
        }).then(function (response) {
            $scope.isLoading = false;
    
            if (response.data && response.data.trangthai === 1) {
                $scope.errorMessage = "Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên.";
                return; // Không cho phép đăng nhập
            }
    
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
                localStorage.setItem('lastLoginTime', Date.now()); // Lưu thời gian đăng nhập
                Swal.fire("Thành Công", "Đăng nhập thành công.", "success"); 
                // Điều hướng về trang chủ
                $location.path('/');
            } else {
                $scope.errorMessage = response.data.message || "Đăng nhập thất bại";
            }
        }).catch(function (error) {
            $scope.isLoading = false;
            $scope.errorMessage = (error.data || error.statusText);
        });
    };
    const checkSession = function () {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const lastLoginTime = localStorage.getItem('lastLoginTime');
    
        // Kiểm tra thời gian session
        if (lastLoginTime && (Date.now() - lastLoginTime > SESSION_TIMEOUT)) {
            $rootScope.isLoggedIn = false;
            localStorage.removeItem('userInfo');
            localStorage.removeItem('lastLoginTime');
            $location.path('/login');
            return;
        }
    
        // Kiểm tra trạng thái tài khoản
        if (userInfo) {
            $http.get(`https://localhost:7297/api/Khachhang/${userInfo.id}`)
                .then(function (response) {
                    if (response.data.Trangthai === 1) {
                        alert("Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên.");
                        $rootScope.isLoggedIn = false;
                        localStorage.removeItem('userInfo');
                        localStorage.removeItem('lastLoginTime');
                        $location.path('/login');
                    }
                }).catch(function (error) {
                    console.error("Lỗi kiểm tra trạng thái tài khoản:", error);
                });
        }
    };
    
    
});
