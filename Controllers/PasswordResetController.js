app.controller('PasswordResetController', function ($scope, $http, $rootScope, $location) {
   

    // Hàm để thay đổi tab
  
    // Lấy thông tin userInfo từ localStorage hoặc từ backend
    const userInfo = JSON.parse(localStorage.getItem('userInfo')); // Dữ liệu lưu trữ sau khi đăng nhập
    if (!userInfo) {
        console.error('Không tìm thấy thông tin người dùng.'); // Xử lý lỗi nếu cần
    }
   
    $scope.passwordData = {
        oldPassword: '',
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
        if ($scope.passwordData.newPassword.length < 6) {
            $scope.errorMessages.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
            return;
        }
        if ($scope.passwordData.confirmPassword.length < 6) {
            $scope.errorMessages.confirmPassword = 'Xác nhận mật khẩu mới phải có ít nhất 6 ký tự.';
            return;
        }
        // Kiểm tra các trường
        if (!$scope.passwordData.oldPassword) {
            $scope.errorMessages.oldPassword = 'Vui lòng nhập mật khẩu cũ.';
        }
        if ($scope.passwordData.newPassword === $scope.passwordData.oldPassword) {
            $scope.errorMessages.newPassword = 'Mật khẩu mới không được trùng với mật khẩu cũ.';
            return;
        }
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
            email: userInfo.email, // Lấy email từ userInfo
            oldPassword: $scope.passwordData.oldPassword,
            newPassword: $scope.passwordData.newPassword
        };

        console.log('Sending DTO:', changePasswordDto); // Log để kiểm tra dữ liệu

        // Gửi yêu cầu đổi mật khẩu tới backend
        $http.post('https://localhost:7297/api/Khachhang/doimatkhau', changePasswordDto)
            .then(function (response) {
                Swal.fire("Đổi mật khẩu thành công", "Tài khoản sẽ được đăng xuất, vui lòng đăng nhật lại với mật khẩu mới.", "success"); 
                $rootScope.dangxuat();
            })
            .catch(function (error) {
                $scope.generalErrorMessage = error.data?.message || 'Đã xảy ra lỗi không xác định.';
            });
    };
});