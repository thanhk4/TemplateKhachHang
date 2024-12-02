app.controller('donhangcuabanController', function ($scope, $http,$location,$routeParams) {
    // Lấy thông tin người dùng từ localStorage
    $scope.userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // Danh sách đơn hàng
    $scope.DataHoaDonMua = [];
    $scope.filteredOrders = [];
    $scope.paginatedOrders = [];
    $scope.itemsPerPage = 6; // Số mục trên mỗi trang
    $scope.currentPage = 0; // Trang hiện tại
    $scope.filterStatus = -1; // Mặc định là tất cả trạng thái (-1)

    // Trạng thái đơn hàngaaaa
    $scope.orderStatuses = [
        "Chờ xác nhận",
        "Đã xác nhận",
        "Đang giao",
        "Thành công",
        "Đã hủy",
        "Trả hàng"
    ];
    $scope.xemChiTiet = function (id) {
        console.log("Xem chi tiết sản phẩm:", id);
        $('#exampleModal').modal('hide');
        $location.path(`/sanphamchitiet/${id}`);
    };
    $scope.huydonhang = function(id) {
        Swal.fire({
            title: 'Xác nhận hủy đơn hàng',
            text: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có, tôi chắc chắn!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                // Người dùng đã xác nhận
                $http.get('https://localhost:7297/api/Hoadon/' + id)
                    .then(function(response) {
                        $scope.dataGetById = {
                            id: id,
                            idnv: response.data.idnv,
                            idkh: response.data.idkh,
                            trangthaithanhtoan: response.data.trangthaithanhtoan,
                            donvitrangthai: response.data.donvitrangthai,
                            thoigiandathang: response.data.thoigiandathang,
                            diachiship: response.data.diachiship,
                            ngaygiaodukien: response.data.ngaygiaodukien,
                            ngaygiaothucte: response.data.ngaygiaothucte,
                            tongtiencantra: response.data.tongtiencantra,
                            tongtiensanpham: response.data.tongtiensanpham,
                            sdt: response.data.sdt,
                            tonggiamgia: response.data.tonggiamgia,
                            idgg: response.data.idgg,
                            trangthai: response.data.trangthai
                        };
                        console.log($scope.dataGetById)
                        $scope.dataeidt = {
                            idnv: $scope.dataGetById.idnv||null,
                            idkh: $scope.dataGetById.idkh,
                            trangthaithanhtoan: $scope.dataGetById.trangthaithanhtoan,
                            donvitrangthai: $scope.dataGetById.donvitrangthai,
                            thoigiandathang: $scope.dataGetById.thoigiandathang,
                            diachiship: $scope.dataGetById.diachiship,
                            ngaygiaodukien: $scope.dataGetById.ngaygiaodukien,
                            ngaygiaothucte: $scope.dataGetById.ngaygiaothucte||null,
                            tongtiencantra: $scope.dataGetById.tongtiencantra,
                            tongtiensanpham: $scope.dataGetById.tongtiensanpham,
                            sdt: $scope.dataGetById.sdt,
                            tonggiamgia: $scope.dataGetById.tonggiamgia||null,
                            idgg: $scope.dataGetById.idgg||null,
                            trangthai: 4
                        };
    
                        $http.put('https://localhost:7297/api/Hoadon/' + id,  $scope.dataeidt)
                            .then(function(response) {
                                Swal.fire(
                                    'Đã hủy!',
                                    'Đơn hàng đã được hủy thành công.',
                                    'success'
                                );
                                $scope.filterOrders(-1); // Hiển thị tất cả đơn hàng mặc định
                            })
                            .catch(function(error) {
                                console.error("Lỗi khi hủy đơn hàng:", error);
                                Swal.fire(
                                    'Lỗi!',
                                    'Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại.',
                                    'error'
                                );
                            });
                    })
                    .catch(function(error) {
                        console.error("Lỗi khi lấy thông tin đơn hàng:", error);
                        Swal.fire(
                            'Lỗi!',
                            'Không thể lấy thông tin đơn hàng. Vui lòng thử lại.',
                            'error'
                        );
                    });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // Người dùng chọn hủy xác nhận
                Swal.fire(
                    'Đã hủy',
                    'Đơn hàng không bị thay đổi.',
                    'info'
                );
            }
        });
    };
    
    // Lấy danh sách hóa đơn từ API
    $http.get('https://localhost:7297/api/Hoadon/hoa-don-theo-ma-kh-' + $scope.userInfo.id)
        .then(function (response) {
            $scope.DataHoaDonMua = response.data;
            console.log($scope.DataHoaDonMua)
            $scope.filterOrders(-1); // Hiển thị tất cả đơn hàng mặc định
        })
        .catch(function (error) {
            console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
        });

    // Lọc đơn hàng theo trạng thái
    $scope.filterOrders = function (status) {
        $scope.filterStatus = status;
        if (status === -1) {
            $scope.filteredOrders = $scope.DataHoaDonMua;
        } else {
            $scope.filteredOrders = $scope.DataHoaDonMua.filter(order => order.trangthai === status);
        }
        $scope.paginateOrders(); // Tạo lại phân trang sau khi lọc
    };

    // Chia danh sách đơn hàng thành các trang
    $scope.paginateOrders = function () {
        $scope.paginatedOrders = [];
        for (let i = 0; i < $scope.filteredOrders.length; i += $scope.itemsPerPage) {
            $scope.paginatedOrders.push($scope.filteredOrders.slice(i, i + $scope.itemsPerPage));
        }
        $scope.currentPage = 0; // Reset về trang đầu tiên
    };

    // Chuyển trang//<!--gaaaa-->
    $scope.goToPage = function (page) {
        if (page >= 0 && page < $scope.paginatedOrders.length) {
            $scope.currentPage = page;
        }//<!--gaaaa-->//<!--gaaaa-->//<!--gaaaa-->
    };
    $scope.chitiethd = function(id){ 
        $http.get('https://localhost:7297/api/HoaDonChiTiet/Hoa-don-chi-tiet-Theo-Ma-HD-' + id)
        .then(function (response) {
            $scope.DataChitiet = response.data;
            console.log($scope.DataChitiet)
        })
        .catch(function (error) {
            console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
        });
    }
    $http.get('https://localhost:7297/api/Danhgias')
    .then(function(response){
        $scope.dataDanhgia=response.data
        console.log($scope.dataDanhgia)
    })
    .catch(function (error) {
        console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
    });
    $scope.trahang = function (idhdct) {
        Swal.fire({
            title: 'Xác nhận hủy đơn hàng',
            text: "Bạn có chắc chắn muốn trả đơn hàng này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có, tôi chắc chắn!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                $http.get('https://localhost:7297/api/Khachhang/'+$scope.userInfo.id)
                .then(function(response){
                    $scope.dataKH = {
                        id: response.id,
                        ten: response.ten
                    }
                })
                .catch(function(error){
                    console.log(error)
                })
                $http.post('https://localhost:7297/api/Trahang/',dataTrahang)
                    .then(function(response) {
                        $('#exampleModal').modal('hide');
                        $location.path(`/trahang/${idhdct}`);
                    })
                    .catch(function(error) {
                        console.error("Lỗi khi lấy thông tin đơn hàng:", error);
                        Swal.fire(
                            'Lỗi!',
                            'Không thể lấy thông tin đơn hàng. Vui lòng thử lại.',
                            'error'
                        );
                    });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // Người dùng chọn hủy xác nhận
                Swal.fire(
                    'Đã hủy',
                    'Đơn hàng không bị thay đổi.',
                    'info'
                );
            }
        });
        $('#exampleModal').modal('hide');
        $location.path(`/trahang`);
    };
});
