// Service để xử lý API sản phẩm
app.service("SanPhamService", function ($http) {
    const baseUrl = "https://localhost:7297/api/";

this.getAllSanPham = function () {
    return $http.get(baseUrl + "Sanpham/GetALLSanPham")
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
};
this.getSanPhamGiamGia = function () {
    return $http.get(baseUrl + "Sanpham/GetALLSanPhamGiamGia")
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
}
this.getSanPhamById = function (id) {
    return $http.get(baseUrl + "Sanpham/GetALLSanPham/" + id)
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
};

this.getDanhGiaByIdSPCT = function (id) {
    return $http.get(baseUrl + "Danhgias/GetByIdSPCT/" + id)
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
};
this.getSanPhamByThuongHieu = function (id) {
    return $http.get(baseUrl + "Sanpham/GetALLSanPhamByThuongHieu/" + id)
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
    }
this.getThuocTinhAll = function () {
        return $http.get(baseUrl + "Thuoctinh/GetThuocTinh/thuocTinhChiTiet")
            .then(response => response.data)
            .catch(error => {
                console.error("Lỗi khi gọi API:", error);
                throw error;
            });
        }

this.getThuongHieu = function () {
    return $http.get(baseUrl + "Thuonghieu")
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
};

this.searchSanPham = function (filterParams) {
    return $http.get(baseUrl + "Sanpham/SanPhamChiTiet/search", { params: filterParams })
        .then(response => response.data)
        .catch(error => {
            console.error("Lỗi khi gọi API:", error);
            throw error;
        });
};

this.getKhachHangById = function (id) {
    return $http.get(baseUrl + "Khachhang/" + id)
    .then(response => response.data)
    .catch(error => {
        console.error("Lỗi khi gọi API:", error);
        throw error;
    });
}
});






app.controller("DanhSachSanPhamCtrl", function ($scope, $document, SanPhamService, $location, $interval) {
    // Gắn file CSS cho controller
    let link = angular.element('<link rel="stylesheet" href="css/DanhSachSanPham.css">');
    $document.find('head').append(link);

    $scope.$on('$destroy', function () {
        link.remove();
        if (autoReload) {
            $interval.cancel(autoReload); // Hủy interval khi thoát khỏi controller
        }
    });

    $scope.filteredProduct = [];
    $scope.paginatedProduct = [];
    $scope.itemsPerPage = 9;
    $scope.currentPage = 0;
    $scope.sanPhams = [];
    $scope.errorMessage = null;
    $scope.listThuocTinh = [];
    $scope.listThuongHieu = [];
    $scope.searchParams = {
        idThuongHieu: null, // Mã thương hiệu
        giaMin: null, // Giá thấp nhất
        giaMax: null, // Giá cao nhất
        tenThuocTinhs: [] // Các thuộc tính lọc
    };
    $scope.toggleChiTiet = function (chiTiet) {
        const index = $scope.searchParams.tenThuocTinhs.indexOf(chiTiet);
        if (index === -1) {
            // Nếu chưa có, thêm vào mảng
            $scope.searchParams.tenThuocTinhs.push(chiTiet);
        } else {
            // Nếu đã có, xóa khỏi mảng
            $scope.searchParams.tenThuocTinhs.splice(index, 1);
        }
    };

    // Hàm tải danh sách sản phẩm
    function loadSanPham() {
        SanPhamService.getAllSanPham()
            .then(function (data) {
                $scope.sanPhams = data;
                $scope.filteredProduct = data;
                $scope.paginateOrders();
                $scope.sortOrder = true; 
                $scope.paginateOrders();
                console.log("Danh sách sản phẩm đã được cập nhật tự động.", data);
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải sản phẩm:", error);
            });
    }

    $scope.sortByName = function () {
        $scope.sortOrder = !$scope.sortOrder; // Đổi chiều sắp xếp
        $scope.filteredProduct.sort(function (a, b) {
            // So sánh tensp và đảo ngược nếu cần thiết
            if ($scope.sortOrder) {
                return a.tensp.localeCompare(b.tensp); // Từ A đến Z
            } else {
                return b.tensp.localeCompare(a.tensp); // Từ Z đến A
            }
        });
        console.log("Danh sách sản phẩm đã được sắp xếp:", $scope.filteredProduct);
    };

    function searchSanPhams() {
        const params = {
            idThuongHieu: $scope.searchParams.idThuongHieu,
            giaMin: $scope.searchParams.giaMin,
            giaMax: $scope.searchParams.giaMax,
            tenThuocTinhs: $scope.searchParams.tenThuocTinhs
        };SanPhamService.searchSanPham(params)
            .then(function (data) {
                $scope.sanPhams = data;
                $scope.filteredProduct = data;
                $scope.paginateOrders();
                if (data.length === 0) {
                    $scope.errorMessage = "Không tìm thấy sản phẩm phù hợp.";
                } else {
                    $scope.errorMessage = null; // Xóa thông báo lỗi nếu có dữ liệu
                }
    
                console.log("Danh sách sản phẩm đã được cập nhật sau khi tìm kiếm.");
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tìm kiếm sản phẩm. Vui lòng thử lại sau.";
                console.error("Lỗi khi tìm kiếm sản phẩm:", error);
            });
    }
    $scope.applyFilters = function() {
        searchSanPhams();
    };

    // Hàm phân trang
    $scope.paginateOrders = function () {
        $scope.paginatedProduct = [];
        for (let i = 0; i < $scope.filteredProduct.length; i += $scope.itemsPerPage) {
            $scope.paginatedProduct.push($scope.filteredProduct.slice(i, i + $scope.itemsPerPage));
        }
        $scope.currentPage = 0; // Reset về trang đầu tiên
    };

    $scope.goToPage = function (page) {
        if (page >= 0 && page < $scope.paginatedProduct.length) {
            $scope.currentPage = page;
        }
    };

    function LoadThuocTinh() {
        SanPhamService.getThuocTinhAll()
            .then(function (data) {
                // Dữ liệu ban đầu
                console.log("Thuộc tính trước khi gộp:", data);
    
                // Gộp thuộc tính
                $scope.groupedThuocTinhs = groupThuocTinhs(data);
    
                // Kiểm tra kết quả
                console.log("Thuộc tính sau khi gộp:", $scope.groupedThuocTinhs);
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải danh sách thuộc tính. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải thuộc tính:", error);
            });
    }
    function LoadThuongHieu() {
        SanPhamService.getThuongHieu()
            .then(function (data) {
                $scope.listThuongHieu = data;
                console.log("Danh sách thương hiệu:", $scope.listThuongHieu);
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải danh sách thương hiệu. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải thương hiệu:", error);
            });
        
    }
    LoadThuongHieu();
    function groupThuocTinhs(thuocTinhs) {
        const grouped = {};
    
        thuocTinhs.forEach(thuocTinh => {
            // Kiểm tra nếu thuộc tính chưa được thêm vào grouped
            if (!grouped[thuocTinh.nameThuocTinh]) {
                grouped[thuocTinh.nameThuocTinh] = [];
            }
    
            // Duyệt qua các chi tiết thuộc tính và thêm vào grouped nếu chưa có
            thuocTinh.thuocTinhChiTietViewModels.forEach(chitiet => {
                if (!grouped[thuocTinh.nameThuocTinh].includes(chitiet.tenThucTinhChiTiet)) {
                    grouped[thuocTinh.nameThuocTinh].push(chitiet.tenThucTinhChiTiet);
                }
            });
        });
    
        // Chuyển từ object sang mảng để dễ hiển thị
        return Object.keys(grouped).map(key => ({
            nameThuocTinh: key,
            chiTiet: grouped[key]
        }));
    }
    
    LoadThuocTinh();

    $scope.xemChiTiet = function (id) {
        console.log("Xem chi tiết sản phẩm:", id);
        $location.path(`/sanphamchitiet/${id}`);
    };

    //Tự động tải lại danh sách sản phẩm mỗi 10 giây
    const autoReload = $interval(function () {
        loadSanPham();
     }, 60000); // 10000 ms = 10 giây

    // Gọi hàm load dữ liệu ban đầu
    loadSanPham();
});

