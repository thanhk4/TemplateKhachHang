app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.service('OrderHistoryService', function ($http) {
    // Tìm đánh giá theo idhdct (id chi tiết hóa đơn)
    this.getRatingByOrderDetailId = function (orderDetailId) {
        return $http.get('https://localhost:7297/api/Danhgias/_KhachHang/byIDhdct/' + orderDetailId);
    };
// Tạo đánh giá mới
this.createRating = function (reviewText, customerId, orderDetailId, imageBase64) {
    // Lấy ngày giờ hiện tại ở UTC
    const ngayDanhGiaUTC = new Date().toISOString();  // Chuyển ngày giờ hiện tại thành UTC
console.log(ngayDanhGiaUTC);

    const data = {
        idkh: customerId,
        trangthai: 0, // Trạng thái mặc định là 0
        noidungdanhgia: reviewText,
        ngaydanhgia: ngayDanhGiaUTC, // Sử dụng ngày giờ UTC
        idhdct: orderDetailId,
        urlHinhanh: imageBase64 // Dữ liệu Base64
    };
    return $http.post('https://localhost:7297/api/Danhgias', data);
    
};

// Sửa đánh giá
this.updateRating = function (ratingId, reviewText, customerId, orderDetailId, imageBase64) {
    const ngayDanhGiaUTC = new Date().toISOString();  // Chuyển ngày giờ hiện tại thành UTC

    const data = {
        id: ratingId,
        idkh: customerId,
        trangthai: 0,
        noidungdanhgia: reviewText,
        ngaydanhgia: ngayDanhGiaUTC, // Sử dụng ngày giờ UTC
        idhdct: orderDetailId,
        urlHinhanh: imageBase64
    };
    return $http.put('https://localhost:7297/api/Danhgias/_KhachHang/' + ratingId, data);
};


   
    // Xóa đánh giá
    this.deleteRating = function (ratingId) {
        return $http.delete('https://localhost:7297/api/Danhgias/_KhachHang/' + ratingId);
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
    // Trạng thái đơn hàngaaaaa
    $scope.orderStatuses = [
        "Chờ xác nhận",
        "Đã xác nhận",
        "Đang giao",
        "Thành công",
        "Đã hủy",
        "Trả thành công"
    ];
    
    // Fetch danh sách ngân hàng
    $http.get('https://api.viqr.net/list-banks/')
        .then(function (response) {
            $scope.banks = response.data; // Assign the API data to the scope.
        })
        .catch(function (error) {
            console.log('Error fetching bank data:', error);
        });

    $scope.huydonhang = async function (id) {
        try {
            // Lấy dữ liệu lịch sử thanh toán
            const lichSuThanhToanResponse = await $http.get('https://localhost:7297/api/Lichsuthanhtoan/_KhachHang/list/' + id);
            const lichSuThanhToanData = lichSuThanhToanResponse.data[0];
            const hoaDonData = await CheckHoaDon(id);

            let requireInput = false;

            // Xác định yêu cầu nhập ghi chú
            if (hoaDonData.trangthai === 1 && lichSuThanhToanData.trangthai === 2) {
                requireInput = true;
            } else if (hoaDonData.trangthai === 0 && lichSuThanhToanData.trangthai === 2) {
                requireInput = true; // Yêu cầu ghi chú
            }

            if (requireInput) {
                // Hiển thị modal để nhập thông tin ghi chú
                $('#modalGhiChuHuyDonHang').modal('show');
                $scope.currentHoaDon = hoaDonData; // Lưu dữ liệu hóa đơn hiện tại để xử lý sau
            } else {
                // Xác nhận hủy đơn hàng
                Swal.fire({
                    title: 'Bạn chắc chắn?',
                    text: 'Bạn chắc chắn muốn hủy đơn hàng này?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Đồng ý',
                    cancelButtonText: 'Hủy',
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        hoaDonData.trangthai = 4; // Hủy đơn hàng
                        await HuyUpdateHoaDon(hoaDonData);

                        Swal.fire('Thành công', 'Đơn hàng đã được hủy thành công!', 'success')
                        .then((result) => {
                          // Kiểm tra nếu người dùng nhấn OK (hoặc nhấn vào nút xác nhận)
                          if (result.isConfirmed) {
                            // Sau khi nhấn OK, sẽ thực hiện reload trang
                            location.reload();
                          }
                        });                      
                    }
                });
            }
        } catch (error) {
            console.error('Lỗi:', error);
            Swal.fire('Lỗi', 'Đã xảy ra lỗi khi xử lý!', 'error');
        }
    };
    $scope.danhandonhang = async function (id) {
        const hoaDonData = await CheckHoaDon(id);
        try {
            // Hiển thị hộp thoại xác nhận
            const result = await Swal.fire({
                title: 'Xác Nhận?',
                text: 'Bạn chắc chắn đã nhận đơn hàng rồi?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Đồng ý',
                cancelButtonText: 'Hủy',
            });
    
            if (result.isConfirmed) {
                // Kiểm tra nếu hoaDonData đã được khởi tạo
                if (!hoaDonData) {
                    console.error('hoaDonData không tồn tại.');
                    return Swal.fire('Lỗi', 'Dữ liệu hoá đơn không hợp lệ!', 'error');
                }
    
                // Cập nhật trạng thái hoá đơn
                hoaDonData.trangthai = 3; // Đã nhận đơn hàng
                await HuyUpdateHoaDon(hoaDonData);
    
                // Thông báo thành công
                const successResult = await Swal.fire(
                    'Thành công',
                    'Xác nhận hoá đơn đã nhận đơn hàng!',
                    'success'
                );
    
                // Reload trang nếu người dùng nhấn OK
                if (successResult.isConfirmed) {
                    location.reload();
                }
            }
        } catch (error) {
            console.error('Có lỗi xảy ra:', error);
            Swal.fire('Lỗi', 'Đã xảy ra lỗi trong quá trình xử lý!', 'error');
        }
    }; 

    // Xử lý xác nhận hủy trong modal
    $scope.xacNhanHuy = async function () {
        if (!$scope.nganhang || !$scope.stk || !$scope.tennguoihuongthu) {
            Swal.fire('Lỗi', 'Vui lòng nhập đầy đủ thông tin!', 'error');
            return;
        }

        try {
            // Kết hợp dữ liệu nhập
            const ghiChu = `${$scope.nganhang}, ${$scope.stk}, ${$scope.tennguoihuongthu}`;
            $scope.currentHoaDon.trangthai = 4; // Hủy đơn hàng
            $scope.currentHoaDon.ghichu = ghiChu;

            // Cập nhật hóa đơn
            await UpdateHoaDonghichu($scope.currentHoaDon);

            Swal.fire('Thành công', 'Đơn hàng đã được hủy thành công!', 'success');
            $('#modalGhiChuHuyDonHang').modal('hide'); // Ẩn modal sau khi xử lý xong
        } catch (error) {
            console.error('Lỗi khi cập nhật hóa đơn:', error);
            Swal.fire('Lỗi', 'Không thể cập nhật hóa đơn!', 'error');
        }
    };

    // Hàm kiểm tra trạng thái hóa đơn
    async function CheckHoaDon(id) {
        const response = await $http.get('https://localhost:7297/api/HoaDon/_KhachHang/' + id);
        return response.data;
    }

    // Hàm cập nhật hóa đơn
    async function HuyUpdateHoaDon(hoaDonData) {
        try {
            const response = await $http.put(`https://localhost:7297/api/HoaDon/_KhachHang/trangthai/${hoaDonData.id}?trangthai=${hoaDonData.trangthai}`);
            Swal.fire('Thành công', 'Hóa đơn đã được cập nhật!', 'success');
            return response.data;
        } catch (error) {
            console.error('Lỗi khi cập nhật hóa đơn:', error);
            Swal.fire('Lỗi', 'Không thể cập nhật hóa đơn!', 'error');
        }
    }
    $scope.xemChiTietth=function(id){
        $('#trahangModal').modal('hide');
        $location.path('/sanphamchitiet/'+id)
    }
    $scope.xemChiTiet=function(id){
        $('#exampleModal').modal('hide');
        $location.path('/sanphamchitiet/'+id)
    }

    // Hàm cập nhật thông tin hóa đơn thông qua API
    async function UpdateHoaDonghichu(hoaDonData) {
        const updatedData = {
            id: 0,
            idnv: 0,
            idkh: $scope.userInfo.id,
            idgg: hoaDonData.idgg,
            trangthaithanhtoan: 0,
            donvitrangthai: 0,
            thoigiandathang: hoaDonData.thoigiandathang,
            diachiship: hoaDonData.diachiship,
            ghichu : hoaDonData.ghichu,
            diemsudung :  hoaDonData.diemsudung,
            ngaygiaodukien: hoaDonData.ngaygiaodukien,
            ngaygiaothucte: hoaDonData.ngaygiaothucte,
            tongtiencantra: hoaDonData.tongtiencantra,
            tongtiensanpham: hoaDonData.tongtiensanpham,
            tiencoc: hoaDonData.tiencoc,
            sdt: hoaDonData.sdt,
            tonggiamgia: hoaDonData.tonggiamgia,
            trangthai: 4
        };
        try {
            const response = await fetch(`https://localhost:7297/api/Hoadon/_KhachHang/${idhd}`, {
                method: 'PUT', // Hoặc PATCH nếu bạn chỉ cập nhật một phần dữ liệu
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi API: ${response.status}`);
            }

            const result = await response.json();
            Swal.fire("Thành công", "Hóa đơn đã được cập nhật thành công!", "success");
            return result;
        } catch (error) {
            console.error("Lỗi khi cập nhật hóa đơn:", error);
            Swal.fire("Lỗi", "Không thể cập nhật hóa đơn!", "error");
            return null;
        }
    }

    // Lấy danh sách hóa đơn từ API
    $http.get('https://localhost:7297/api/Hoadon/_KhachHang/hoa-don-theo-ma-kh-' + $scope.userInfo.id)
        .then(function (response) {
            $scope.DataHoaDonMua = response.data;
            console.log($scope.DataHoaDonMua)
            $scope.filterOrders(-1); // Hiển thị tất cả đơn hàng mặc định
        })
        .catch(function (error) {
            console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
        });
    $scope.thediv=-1
    // Lọc đơn hàng theo trạng thái
    $scope.filterOrders = function (status) {
        $scope.filterStatus = status;
        if (status === -1) {
            $scope.filteredOrders = $scope.DataHoaDonMua;
            $scope.thediv= status
            $scope.paginateOrders();
            
        }  else if(status==3) {
            $scope.filteredOrders = $scope.DataHoaDonMua.filter(order => order.trangthai == 3||order.trangthai==5);
            $scope.thediv= status
            $scope.paginateOrders();
        } else if(status!=3&&status<5) {
            $scope.filteredOrders = $scope.DataHoaDonMua.filter(order => order.trangthai === status);
            $scope.thediv= status
            $scope.paginateOrders();
        }
        else if(status==5){
            $scope.thediv= status
            $http.get('https://localhost:7297/api/Trahang/_KhachHang/View-Hoa-Don-Tra-By-Idkh-'+$scope.userInfo.id)
            .then(function(response){
                $scope.filteredOrders = response.data
                console.log($scope.filteredOrders)
                $scope.paginateOrders();
            })
            .catch(function(error){
                console.error(error)
            })
        } // Tạo lại phân trang sau khi lọc
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
        $http.get('https://localhost:7297/api/HoaDonChiTiet/_KhachHang/Hoa-don-chi-tiet-Theo-Ma-HD-' + id)
        .then(function (response) {
            $scope.DataChitiet = response.data;
        })
        .catch(function (error) {
            console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
        });
    }
    $http.get('https://localhost:7297/api/Danhgias')
    .then(function(response) {
        if (response.data && response.data.length > 0) {
            $scope.dataDanhgia = response.data;
        } else {
            console.warn("Không tìm thấy dữ liệu đánh giá.");
        }
    })
    .catch(function (error) {
        console.error("Lỗi khi tải dữ liệu đánh giá:", error);
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
    
    $http.get('https://localhost:7297/api/Phuongthucthanhtoan')
    .then(async function (response) {
        $scope.Phuongthucthanhtoan = response.data;
        console.log($scope.Phuongthucthanhtoan);
    })
    .catch(function (error) {
        console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
    });
    //vvfgg
    $scope.chitiethd = function (id) {
        // Kiểm tra xem id có hợp lệ không
        if (!id) {
            console.error("ID không hợp lệ:", id);
            return;
        }
        $http.get('https://localhost:7297/api/Hoadon/_KhachHang/' + id)
            .then(async function (response) {
                $scope.hoadonbyid = response.data;
                console.log($scope.hoadonbyid);
            })
            .catch(function (error) {
                console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
            });
        $http.get('https://localhost:7297/api/HoaDonChiTiet/_KhachHang/Hoa-don-chi-tiet-Theo-Ma-HD-' + id)
            .then(async function (response) {
                $scope.DataChitiet = response.data;
    
                // Xử lý từng sản phẩm trong danh sách hóa đơn chi tiết
                for (const element of $scope.DataChitiet) {
                    try {
                        // Lấy danh sách thuộc tính sản phẩm chi tiết
                        const datathuoctinh = await fetchThuocTinhSPCT(element.idspct);
                        element.thuocTinhSelects = createThuocTinhSelects(datathuoctinh, element.idspct);

                        // Lấy đánh giá sản phẩm
                        const ratingResponse = await OrderHistoryService.getRatingByOrderDetailId(element.id);

                        element.existingReview = ratingResponse.data;
                        if (element.existingReview && element.existingReview.urlHinhanh) {
                            element.existingReview.imageSrc = `data:image/*;base64,${element.existingReview.urlHinhanh}`;
                        }


                    } catch (error) {
                        console.error("Lỗi khi tải đánh giá hoặc thuộc tính:", error);
                    }
                }
            })
            .catch(function (error) {
                console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
            });
    };
    
    const apiTTSPCTUrl = "https://localhost:7297/api/Sanphamchitiet/_KhachHang/thuoctinh";
    
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
        $scope.selectedProduct = product;
        $scope.reviewText = product.existingReview ? product.existingReview.noidungdanhgia : '';
        const myModal = new bootstrap.Modal(document.getElementById('ratingModal'), { keyboard: false });
        myModal.show();
    };
    
    let selectedFile = null; // Biến toàn cục để lưu file được chọn

// Sử dụng sự kiện change để lưu file vào biến toàn cục
document.getElementById('imageUpload').addEventListener('change', function () {
    if (this.files && this.files[0]) {
        selectedFile = this.files[0]; // Gán file được chọn vào biến toàn cục
    } else {
        console.error("Không có file nào được chọn.");
    }
});

$scope.submitRating = async function () {
    if (!selectedFile) {
        alert("Vui lòng chọn hình ảnh trước khi gửi đánh giá.");
        return;
    }

    // Tạo formData để gửi file cùng với các thông tin khác
    const formData = new FormData();
    formData.append('file', selectedFile); // Đính kèm file vào FormData
    formData.append('reviewText', $scope.reviewText);
    formData.append('customerId', $scope.userInfo.id);
    formData.append('orderDetailId', $scope.selectedProduct.id);

    try {
        // Gửi file lên API upload ảnh
        const response = await axios.post(
            'https://localhost:7297/api/Images/upload',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );

        // URL của hình ảnh sau khi upload
        const uploadedImageUrl = response.data.url;

        // Tạo object để gửi tới API đánh giá
        const ratingData = {
            reviewText: $scope.reviewText,
            customerId: $scope.userInfo.id,
            orderDetailId: $scope.selectedProduct.id,
            imageUrl: uploadedImageUrl, // Dùng URL thay vì Base64
        };

        if ($scope.selectedProduct.existingReview) {
            await OrderHistoryService.updateRating(
                $scope.selectedProduct.existingReview.id,
                ratingData.reviewText,
                ratingData.customerId,
                ratingData.orderDetailId,
                ratingData.imageUrl
            );
            alert("Đánh giá đã được cập nhật!");
        } else {
            await OrderHistoryService.createRating(
                ratingData.reviewText,
                ratingData.customerId,
                ratingData.orderDetailId,
                ratingData.imageUrl
            );
            alert("Đánh giá đã được thêm!");
        }

        // Ẩn modal sau khi xử lý xong
        const modal = bootstrap.Modal.getInstance(document.getElementById('ratingModal'));
        modal.hide();
    } catch (error) {
        console.error("Có lỗi xảy ra khi xử lý đánh giá:", error);
        alert("Lỗi khi xử lý đánh giá. Vui lòng thử lại.");
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
    $scope.hdtrahang = async function (id) {
        try {
            // First API call
            const response1 = await $http.get('https://localhost:7297/api/Trahang/_KhachHang/' + id);
            $scope.datatrahang = response1.data;
            console.log($scope.datatrahang);
        } catch (error) {
            console.error("Error fetching Trahang data:", error);
        }
    
        try {
            // Second API call
            const response2 = await $http.get('https://localhost:7297/api/Trahangchitiet/_KhachHang/View-Hoadonct-Theo-Idth-' + id);
            $scope.trahangct = response2.data;
            console.log($scope.trahangct);
    
            // Iterate over `trahangct` and handle async operations
            for (const element of $scope.trahangct) {
                try {
                    // Fetch attributes for the product
                    const datathuoctinh = await fetchThuocTinhSPCT(element.idspct);
                    element.thuocTinhSelects = createThuocTinhSelects(datathuoctinh, element.idspct);
                } catch (innerError) {
                    console.error("Error loading attributes or creating selects:", innerError);
                }
            }
        } catch (error) {
            console.error("Error fetching Trahangchitiet data:", error);
        }
    };
    
    $scope.quahantra = function(ngaygiao) {
        if (ngaygiao != null) { 
            const d1 = new Date();
            const d2 = new Date(ngaygiao);
            const diffTime = d1 - d2;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays;
        } else {
            return 15;
        }
    };
    
});