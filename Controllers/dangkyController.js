app.controller('dangkyController', function($scope, $http) {
    $scope.user = {};
    $scope.errorMessage = '';
    $scope.successMessage = '';

    // Hàm kiểm tra tuổi người dùng
    function isOver10YearsOld(birthDate) {
        var today = new Date();
        var dob = new Date(birthDate);
        var age = today.getFullYear() - dob.getFullYear();
        var m = today.getMonth() - dob.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        return age >= 10; // Kiểm tra nếu người dùng từ 10 tuổi trở lên
    }

    // Hàm để kiểm tra mật khẩu
    function isValidPassword(password) {
        return password && password.length >= 5;
    }

    $scope.register = function() {
        // Kiểm tra ngày sinh
        if (!isOver10YearsOld($scope.user.ngaysinh)) {
            $scope.errorMessage = 'Bạn phải từ 10 tuổi trở lên để đăng ký';
            return;
        }

        // Kiểm tra mật khẩu
        if (!isValidPassword($scope.user.password)) {
            $scope.errorMessage = 'Mật khẩu phải có ít nhất 5 ký tự';
            return;
        }

        // Kiểm tra nếu mật khẩu không khớp
        if ($scope.user.password !== $scope.user.confirmPassword) {
            $scope.errorMessage = 'Mật khẩu không khớp';
            return;
        }

        // Gửi yêu cầu đăng ký
        $http.post('https://localhost:7297/api/Login/register', {
            Ten: $scope.user.ten,
            Sdt: $scope.user.sdt,
            Ngaysinh: $scope.user.ngaysinh,
            Email: $scope.user.email,
            Diachi: $scope.user.diachi,
            Password: $scope.user.password,
            tichdiem: 0,
            diemsudung: 0,
            trangthai: 0,
            idrank: 1,
        }).then(function(response) {
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
