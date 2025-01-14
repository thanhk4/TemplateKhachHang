app.controller('RegisterPasswordController', function ($scope, $http, $location, $routeParams) {
    $scope.email = $routeParams.email;

    $scope.registerPassword = function () {
        $scope.errorMessage = '';

        if ($scope.password !== $scope.confirmPassword) {
            $scope.errorMessage = "Mật khẩu không khớp.";
            return;
        }
        if ($scope.password.length < 6 ) {
            $scope.errorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự.";
            return;
        }
        $http.post('https://localhost:7297/api/Login/RegisterPassword2', {
            Email: $scope.email,
            Password: $scope.password
        }).then(function (response) {
            Swal.fire("Thành Công", "Mật khẩu đã được đăng ký thành công.", "success");
            $location.path('/login');
        }).catch(function (error) {
            console.error(error);
            $scope.errorMessage = "Có lỗi xảy ra. Vui lòng thử lại.";
        });
    };
});
