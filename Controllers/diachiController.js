


app.controller("diachiController", function ($scope, $http) {
    const apiAddressList = "https://localhost:7297/api/Diachis";

    $scope.addressList = [];
    $scope.currentAddress = {};
    $scope.isEditing = false;
    $scope.UserInfo = {};
    $scope.dangky = {};

    // Hàm lấy thông tin người dùng và số điện thoại từ session storage
    $scope.loadUserInfo = function() {
        const userInfoString = localStorage.getItem("UserInfo");
        const dangkyString = localStorage.getItem("Dangky");
        
        if (userInfoString) {
            $scope.userInfo = JSON.parse(userInfoString);
            console.log("User Info:", $scope.userInfo);
        } else {
            console.error("Không tìm thấy thông tin UserInfo trong session storage");
        }

        if (dangkyString) {
            $scope.dangky = JSON.parse(dangkyString);
            console.log("Dangky Info:", $scope.dangky);
        } else {
            console.error("Không tìm thấy thông tin Dangky trong session storage");
        }
    };

    // Hàm lấy danh sách địa chỉ theo ID khách hàng
    $scope.loadAddressesByIdKH = async function () {
        if (!$scope.userInfo.id) {
            alert("Không tìm thấy thông tin khách hàng.");
            return;
        }

        try {
            const response = await $http.get(`${apiAddressList}/khachhang/${$scope.userInfo.id}`);
            console.log("Dữ liệu từ API:", response.data);

            if (response.data && response.data.length > 0) {
                $scope.addressList = response.data.map((item) => ({
                    id: item.id,
                    hoten: $scope.userInfo.ten, // Sử dụng tên từ UserInfo trong session storage
                    sodienthoai: $scope.dangky.sdt, // Sử dụng số điện thoại từ Dangky trong session storage
                    thanhpho: item.thanhpho,
                    quanhuyen: item.quanhuyen,
                    phuongxa: item.phuongxa,
                    diachicuthe: item.diachicuthe,
                    macdinh: item.macdinh,
                    fullAddress: `${item.thanhpho}, ${item.quanhuyen}, ${item.phuongxa}, ${item.diachicuthe}`,
                }));
                $scope.$apply();
            } else {
                $scope.addressList = [];
                alert("Không có địa chỉ nào.");
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách địa chỉ:", error);
            alert("Không thể tải danh sách địa chỉ.");
        }
    };

    $scope.editAddress = function(address) {
        $scope.currentAddress = angular.copy(address);
        $scope.isEditing = true;
    };

    $scope.newAddress = function() {
        $scope.currentAddress = {
            hoten: $scope.userInfo.ten,
            sodienthoai: $scope.dangky.sodienthoai
        };
        $scope.isEditing = false;
    };

    $scope.saveAddress = async function() {
        try {
            if ($scope.isEditing) {
                await $http.put(`${apiAddressList}/${$scope.currentAddress.id}`, $scope.currentAddress);
            } else {
                $scope.currentAddress.idkhachhang = $scope.userInfo.id;
                await $http.post(apiAddressList, $scope.currentAddress);
            }
            await $scope.loadAddressesByIdKH();
            $('#addressModal').modal('hide');
        } catch (error) {
            console.error("Lỗi khi lưu địa chỉ:", error);
            alert("Không thể lưu địa chỉ.");
        }
    };

    // Khởi chạy khi tải trang
    $scope.loadUserInfo();
    $scope.loadAddressesByIdKH();
});
