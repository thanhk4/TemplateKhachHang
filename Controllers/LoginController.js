app.controller('LoginController', function ($scope, $http, $rootScope, $location, $timeout) {
    $scope.step = 1; // Bước hiện tại
    $scope.user = {};
    $scope.isLoading = false;
    $scope.errorMessage = '';

    // Hàm reset mật khẩu khi email thay đổi
    $scope.resetPasswordInput = function () {
        $scope.step = 1;
        $scope.user.password = '';
        $scope.errorMessage = '';
    };

    // Kiểm tra email
    $scope.checkEmail = function () {
        $scope.isLoading = true;
        $http.post(`https://localhost:7297/api/Login/_KhachHang/checkemail?checkEmail=${$scope.user.email}`,)
        .then(function (response) {
            $scope.isLoading = false;

            if (response.data && response.data.status === 'password_required') {
                $scope.step = 2; // Chuyển sang bước nhập mật khẩu
            } else if (response.data && response.data.status === 'new_account') {
                $location.path('/RegisterPassword').search({ email: $scope.user.email }); // Đăng ký mới
            } else if (response.data && response.data.status === 'not_found') {
                $scope.errorMessage = "Email không tồn tại.";
            } else {
                $scope.errorMessage = "Đã xảy ra lỗi, vui lòng thử lại.";
            }
        }).catch(function (error) {
            $scope.isLoading = false;
            $scope.errorMessage = "Không thể kiểm tra email. Vui lòng thử lại.";
        });
    };

    // Đăng nhập
    $scope.login = function () {
        $scope.isLoading = true;
        $http.post('https://localhost:7297/api/Login/_KhachHang/login', {
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
                $location.path('/');
            } else {
                $scope.errorMessage = response.data.message || "Đăng nhập thất bại";
            }
        }).catch(function (error) {
            $scope.isLoading = false;
            $scope.errorMessage = "Không thể đăng nhập. Vui lòng thử lại.";
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
            $http.get(`https://localhost:7297/api/Khachhang/_KhachHang/${userInfo.id}`)
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
