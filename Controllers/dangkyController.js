app.controller('dangkyController', function($scope, $http) {
    $scope.user = {};
    $scope.errorMessage = '';
    $scope.successMessage = '';

    $scope.register = function() {
        if ($scope.user.password !== $scope.user.confirmPassword) {
            $scope.errorMessage = 'Mật khẩu không khớp';
            return;
        }

        $http.post('https://localhost:7297/api/Login/register', {
            Ten: $scope.user.ten,
            Sdt: $scope.user.sdt,
            Ngaysinh: $scope.user.ngaysinh,
            Email: $scope.user.email,
            Diachi: $scope.user.diachi,
            Password: $scope.user.password
        }).then(function(response) {
            localStorage.setItem('Dangky', JSON.stringify({
                ten: $scope.user.ten,
                sdt: $scope.user.sdt,
                ngaysinh: $scope.user.ngaysinh,
                email: $scope.user.email,
                diachi: $scope.user.diachi
            }));
            $scope.successMessage = 'Đăng ký thành công';
            $scope.errorMessage = '';
            setTimeout(function() {
                window.location.href = '#!login';
            }, 2000);
        }).catch(function(error) {
            $scope.errorMessage = error.data || 'Đã xảy ra lỗi khi đăng ký';
            $scope.successMessage = '';
        });
    };
});