app.controller('doimatkhau2Controller', function ($scope, $http) {
    // Lấy thông tin userInfo từ localStorage hoặc từ backend
    const restPasswordInfo = JSON.parse(localStorage.getItem('resetPasswordInfo')); // Dữ liệu lưu trữ sau khi đăng nhập
    if (!restPasswordInfo) {
        console.error('Không tìm thấy thông tin người dùng.'); // Xử lý lỗi nếu cần
    }

    $scope.passwordData = {
        newPassword: '',
        confirmPassword: ''
    };

    $scope.errorMessages = {};
    $scope.successMessage = '';
    $scope.generalErrorMessage = '';

    $scope.submitPasswordReset = function () {
        // Reset thông báo lỗi
        $scope.errorMessages = {};
        $scope.successMessage = '';
        $scope.generalErrorMessage = '';

        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if ($scope.passwordData.newPassword !== $scope.passwordData.confirmPassword) {
            $scope.errorMessages.confirmPassword = 'Mật khẩu mới và xác nhận mật khẩu không khớp.';
            return;
        }

        // Kiểm tra các trường
      
        if (!$scope.passwordData.newPassword) {
            $scope.errorMessages.newPassword = 'Vui lòng nhập mật khẩu mới.';
        }
        if (!$scope.passwordData.confirmPassword) {
            $scope.errorMessages.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
        }

        if (Object.keys($scope.errorMessages).length > 0) {
            return;
        }

        // Tạo DTO từ thông tin đã có
        const changePasswordDto = {
            email: restPasswordInfo.email, // Lấy email từ userInfo
            oldPassword: restPasswordInfo.oldPassword,
            newPassword: $scope.passwordData.newPassword
        };

        console.log('Sending DTO:', changePasswordDto); // Log để kiểm tra dữ liệu

        // Gửi yêu cầu đổi mật khẩu tới backend
        $http.post('https://localhost:7297/api/Khachhang/doimatkhau', changePasswordDto)
            .then(function (response) {
                $scope.successMessage = 'Đổi mật khẩu thành công.';
                setTimeout(function () {
                    $location.path = '#!login';
                }, 2000);
            })
            .catch(function (error) {
                $scope.generalErrorMessage = error.data?.message || 'Đã xảy ra lỗi không xác định.';
            });
    };
});