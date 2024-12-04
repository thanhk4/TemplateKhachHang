
app.service('OrderHistoryService', function ($http) {
    // Tìm đánh giá theo idhdct (id chi tiết hóa đơn)
    this.getRatingByOrderDetailId = function (orderDetailId) {
        return $http.get('https://localhost:7297/api/Danhgias/byIDhdct/' + orderDetailId);
    };
    // Tạo đánh giá mới
    this.createRating = function (reviewText, customerId, orderDetailId) {
        var data = {
            idkh: customerId,
            trangthai: 0,  // Trạng thái mặc định là 0
            noidungdanhgia: reviewText,
            ngaydanhgia: new Date().toISOString(),
            idhdct: orderDetailId,
            urlHinhanh: "string"
        };
        return $http.post('https://localhost:7297/api/Danhgias', data);
    };
    // Sửa đánh giá
    this.updateRating = function (ratingId, reviewText, customerId, orderDetailId) {
        var data = {
            id: ratingId,
            idkh: customerId,
            trangthai: 0,  // Trạng thái vẫn là 0 khi sửa
            noidungdanhgia: reviewText,
            ngaydanhgia: new Date().toISOString(),
            idhdct: orderDetailId,
            urlHinhanh: "string"
        };
        return $http.put('https://localhost:7297/api/Danhgias/' + ratingId, data);
    };
    // Xóa đánh giá
    this.deleteRating = function (ratingId) {
        return $http.delete('https://localhost:7297/api/Danhgias/' + ratingId);
    };
});


app.controller('donhangcuabanController', function ($scope, $http,$location, OrderHistoryService ) {
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
    $scope.chitiethd = function (id) {
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

    $scope.trahang = function (id) {
        if (!id) {
            console.error("ID không hợp lệ!");
            return;
        }
    
        // Ẩn modal nếu nó đang hiển thị
        $('#exampleModal').modal('hide');
    
        // Điều hướng đến trang trả hàng
        $location.path('/trahang/' + id);
    };
    
    
    //vvfgg
    $scope.chitiethd = function (id) {
        // Kiểm tra xem id có hợp lệ không
        if (!id) {
            console.error("ID không hợp lệ:", id);
            return;
        }
    
        $http.get('https://localhost:7297/api/HoaDonChiTiet/Hoa-don-chi-tiet-Theo-Ma-HD-' + id)
            .then(async function (response) {
                $scope.DataChitiet = response.data;
                console.log("Chi tiết hóa đơn:", $scope.DataChitiet);
    
                // Xử lý từng sản phẩm trong danh sách hóa đơn chi tiết
                for (const element of $scope.DataChitiet) {
                    try {
                        // Lấy danh sách thuộc tính sản phẩm chi tiết
                        const datathuoctinh = await fetchThuocTinhSPCT(element.idspct);
                        element.thuocTinhSelects = createThuocTinhSelects(datathuoctinh, element.idspct);

                        // Lấy đánh giá sản phẩm
                        const ratingResponse = await OrderHistoryService.getRatingByOrderDetailId(element.id);
                        element.existingReview = ratingResponse.data;
                        console.log("Đánh giá sản phẩm:", element.existingReview);
                    } catch (error) {
                        console.error("Lỗi khi tải đánh giá hoặc thuộc tính:", error);
                    }
                }
            })
            .catch(function (error) {
                console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
            });
    };
    
    const apiTTSPCTUrl = "https://localhost:7297/api/Sanphamchitiet/thuoctinh";
    
    async function fetchThuocTinhSPCT(id) {
        if (!id) {
            console.error("ID không hợp lệ:", id);
            return [];
        }
    
        try {
            const response = await fetch(`${apiTTSPCTUrl}/${id}`);
            if (!response.ok) {
                throw new Error("Lỗi API: " + response.statusText);
            }
    
            const data = await response.json();
            if (!Array.isArray(data)) {
                console.warn("Dữ liệu không phải là mảng:", data);
                return [];
            }
    
            return data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thuộc tính sản phẩm chi tiết:", error);
            return [];
        }
    }
    
    function createThuocTinhSelects(thuocTinhList, id) {
        return thuocTinhList.map(tt => ({
            id: tt.idtt,
            tenThuocTinh: tt.tenthuoctinhchitiet[0],
        }));
    }

    $scope.openRatingModal = function (product) {
        console.log("Mở modal đánh giá cho sản phẩm:", product);
        $scope.selectedProduct = product;
        $scope.reviewText = product.existingReview ? product.existingReview.noidungdanhgia : '';
        const myModal = new bootstrap.Modal(document.getElementById('ratingModal'), { keyboard: false });
        myModal.show();
    };
    
    $scope.submitRating = function () {
        if (!$scope.reviewText.trim()) {
            alert("Vui lòng nhập nội dung đánh giá.");
            return;
        }
    
        if ($scope.selectedProduct) {
            if ($scope.selectedProduct.existingReview) {
                // Sửa đánh giá
                OrderHistoryService.updateRating(
                    $scope.selectedProduct.existingReview.id,
                    $scope.reviewText,
                    $scope.userInfo.id,
                    $scope.selectedProduct.id 
                ).then(function () {
                    alert("Đánh giá đã được cập nhật!");
                    $scope.selectedProduct.existingReview.noidungdanhgia = $scope.reviewText; // Cập nhật nhận xét
                    bootstrap.Modal.getInstance(document.getElementById('ratingModal')).hide();
                }).catch(function (error) {
                    console.error("Error updating rating:", error);
                    alert("Lỗi khi cập nhật đánh giá.");
                });
            } else {
                // Thêm mới đánh giá
                OrderHistoryService.createRating(
                    $scope.reviewText,
                    $scope.userInfo.id,
                    $scope.selectedProduct.id
                ).then(function (response) {
                    alert("Đánh giá đã được thêm!");
                    // Tạo mới đánh giá trong danh sách
                    $scope.selectedProduct.existingReview = {
                        id: response.data.id, // ID từ API phản hồi
                        noidungdanhgia: $scope.reviewText,
                        createdAt: new Date(),
                        userId: $scope.userInfo.id,
                        productId: $scope.selectedProduct.id
                    };
    
                    // Đóng modal
                    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('ratingModal'));
                    modalInstance.hide();
                }).catch(function (error) {
                    console.error("Lỗi khi thêm đánh giá:", error);
                    alert("Lỗi khi thêm đánh giá: " + (error.message || "Không xác định"));
                });
            }
        }
    };
    $scope.deleteRating = function (product) {
        if (!product.existingReview) {
            alert("Sản phẩm này chưa có đánh giá để xóa.");
            return;
        }
    
        if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
            OrderHistoryService.deleteRating(product.existingReview.id).then(function () {
                alert("Đánh giá đã bị xóa!");
                // Xóa đánh giá khỏi UI
                product.existingReview = null;
            }).catch(function (error) {
                console.error(`Lỗi khi xóa đánh giá cho sản phẩm ID ${product.id}:`, error);
                alert("Lỗi khi xóa đánh giá: " + (error.message || "Không xác định"));
            });
        }
    };
});
