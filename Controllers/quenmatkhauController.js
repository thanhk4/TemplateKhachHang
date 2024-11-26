app.controller('quenmatkhauController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
    $scope.user = {};
    $scope.successMessage = '';
    $scope.errorMessage = '';
    $scope.showOtpForm = false;
    $scope.showPassword = false;

    // Gửi yêu cầu OTP
    $scope.sendOtp = function () {
        if (!$scope.user.email) {
            $scope.errorMessage = 'Email không được để trống.';
            return;
        }
    
        // Gửi yêu cầu GET thay vì POST
        $http.get(`https://localhost:7297/api/Khachhang/find-khachhang?email=${encodeURIComponent($scope.user.email)}`)
            .then(function (response) {
                $scope.user.password = response.data.password; // Nếu cần
                // Gửi yêu cầu gửi OTP sau khi tìm thấy email
                return $http.post('https://localhost:7297/api/Khachhang/send-otp', { email: $scope.user.email });
            })
            .then(function (response) {
                $scope.successMessage = 'Mã OTP đã được gửi đến email của bạn!';
                $scope.errorMessage = '';
                $scope.showOtpForm = true;
                $scope.user.serverOtp = response.data.otp;
            })
            .catch(function (error) {
                $scope.errorMessage = error.data.message || 'Không tìm thấy tài khoản với email này.';
                $scope.successMessage = '';
            });
    };
    

    // Xác nhận OTP
    $scope.verifyOtp = function () {
        if ($scope.user.otp === $scope.user.serverOtp) {
            $scope.successMessage = 'OTP chính xác! Chuyển đến trang đổi mật khẩu...';
            $scope.errorMessage = '';

            // Lưu thông tin vào localStorage để sử dụng trên trang đổi mật khẩu
            localStorage.setItem('resetPasswordInfo', JSON.stringify({   email: $scope.user.email,
                oldPassword: $scope.user.password }));

            // Chuyển đến trang đổi mật khẩu
            setTimeout(function () {
                $window.location.href = '#!doimatkhau2';
            }, 2000);
        } else {
            $scope.errorMessage = 'Mã OTP không chính xác. Vui lòng thử lại.';
            $scope.successMessage = '';
        }
    };
}]);
