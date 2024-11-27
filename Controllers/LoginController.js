app.controller('LoginController', function ($scope, $http, $rootScope, $location, $timeout) {
    $scope.user = {};
    $scope.errorMessage = '';
    $scope.isLoading = false;

    const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 phút (đơn vị là milliseconds)

    // Kiểm tra nếu người dùng đã đăng nhập và nếu session đã hết hạn
    const checkSession = function () {
        const lastLoginTime = localStorage.getItem('lastLoginTime');
        if (lastLoginTime && (Date.now() - lastLoginTime > SESSION_TIMEOUT)) {
            $rootScope.isLoggedIn = false;
            localStorage.removeItem('userInfo');
            localStorage.removeItem('lastLoginTime');
            $location.path('/login');
        }
    };

    // Cập nhật thời gian đăng nhập mỗi khi người dùng tương tác với trang
    const resetSessionTimer = function () {
        localStorage.setItem('lastLoginTime', Date.now());
        checkSession();
    };

    // Gọi resetSessionTimer mỗi khi người dùng thực hiện thao tác
    document.addEventListener('mousemove', resetSessionTimer);
    document.addEventListener('keydown', resetSessionTimer);

    // Nếu người dùng đã đăng nhập, kiểm tra session
    if ($rootScope.isLoggedIn) {
        checkSession();
    }

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
                localStorage.setItem('lastLoginTime', Date.now()); // Lưu thời gian đăng nhập

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

    // Kiểm tra session mỗi khi trang được tải lại
    checkSession();
});
