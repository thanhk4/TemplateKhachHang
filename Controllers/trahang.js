app.controller('trahangController', function ($scope, $http, $location, $routeParams) {
    $scope.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const idhd = $routeParams.id;
    $scope.datahd = {};
    $scope.datahdct=[];
    $scope.datatrahang = {};
    $scope.datatrahangct = {};
    $scope.quantity = 0;
    $http.get(`https://localhost:7297/api/Hoadon/${idhd}`)
        .then(function (response) {
            // Lưu thông tin hóa đơn vào scope
            $scope.datahd = {
                id: response.data.id,
                tenkh: $scope.userInfo.ten,
                sdt: response.data.sdt,
                tongtiencantra: response.data.tongtiencantra,
                tongtiensanpham: response.data.tongtiensanpham,
                sdt: response.data.sdt,
                tonggiamgia: response.data.tonggiamgia,
                diachiship: response.data.diachiship,
                thoigiandathang: response.data.thoigiandathang

            };
            console.log("Thông tin hóa đơn:", $scope.datahd);
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy thông tin hóa đơn:", error);
            $scope.errorMessage = "Không thể tải thông tin hóa đơn. Vui lòng thử lại sau.";
        });
    
    $http.get(`https://localhost:7297/api/HoaDonChiTiet/Hoa-don-chi-tiet-Theo-Ma-HD-${idhd}`)
        .then(function (response) {
            // Lưu thông tin hóa đơn vào scope
            $scope.datahdct = response.data;
            console.log("Thông tin hóa đơn:", $scope.datahd);
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy thông tin hóa đơn:", error);
            $scope.errorMessage = "Không thể tải thông tin hóa đơn chi tiết. Vui lòng thử lại sau.";
        });
    // Khởi tạo quantity từ sessionStorage hoặc để trống, chờ hàm thiết lập
        $scope.quantity = parseInt(sessionStorage.getItem('quantity')) || null;

// Hàm thay đổi số lượng
        $scope.changeQuantity = function (delta, soluong) {
    // Nếu quantity chưa được thiết lập, gán bằng soluong
            if ($scope.quantity === null) {
                $scope.quantity = soluong;
            }

            let newQuantity = $scope.quantity + delta;
            if (newQuantity >= 1 && newQuantity <= soluong) {
                $scope.quantity = newQuantity;
                sessionStorage.setItem('quantity', $scope.quantity); // Lưu số lượng vào sessionStorage
            }
};

    
        // Hàm lấy giá trị số lượng từ phần tử span (hiển thị)
    $scope.getQuantityDisplay = function() {
            const quantityDisplay = document.getElementById("quantity-display");
            if (quantityDisplay) {
                return quantityDisplay.innerText || quantityDisplay.textContent; // Lấy giá trị hiển thị
            }
            return null;
        };
    $http.get('https://api.viqr.net/list-banks/')
        .then(function(response) {
            $scope.banks = response.data; // Assign the API data to the scope.
            console.log($scope.banks.data);
        })
        .catch(function(error) {
            console.log('Error fetching bank data:', error);
        });
    $scope.selectedProducts = []; // Mảng lưu trữ id các sản phẩm được chọn.
    $scope.toggleSelection = function (productId) {
            const index = $scope.selectedProducts.indexOf(productId);
            if (index > -1) {
                // Nếu `id` đã tồn tại trong mảng, xóa nó
                $scope.selectedProducts.splice(index, 1);
            } else {
                // Nếu chưa tồn tại, thêm vào mảng
                $scope.selectedProducts.push(productId);
            }
            console.log("Selected products:", $scope.selectedProducts);
        };
        
        $scope.submit = function() {
            // Kiểm tra tính hợp lệ của biểu mẫu
            if (!$scope.form.$valid) {
                // Hiển thị thông báo lỗi cho người dùng
                Swal.fire('Lỗi!', 'Vui lòng điền đầy đủ thông tin.', 'error');
                console.log('Biểu mẫu không hợp lệ. Vui lòng kiểm tra lại các trường thông tin.');
            } else {
                Swal.fire({
                    title: 'Bạn có chắc chắn?',
                    text: "Bạn muốn gửi thông tin này!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Đồng ý',
                    cancelButtonText: 'Hủy bỏ'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Xử lý gửi thông tin
                        $scope.datatrahang = {
                            tenkhachhang: $scope.userInfo.ten,
                            idnv: null,
                            idkh: $scope.userInfo.id,
                            sotienhoan: 0,
                            lydotrahang: $scope.lydotrahang || null,
                            trangthai: 0,
                            phuongthuchoantien: $scope.phuongthuchoantien,
                            ngaytrahangdukien: new Date(), // Ngày hiện tại
                            ngaytrahangthucte: null,
                            chuthich: `Ngân hàng: ${$scope.nganhang} - STK: ${$scope.stk} - Tên người hưởng thụ: ${$scope.tennguoihuongthu}` || null
                        };
        
                        // Gửi yêu cầu tạo đơn trả hàng
                        $http.post('https://localhost:7297/api/Trahang', $scope.datatrahang)
                            .then(function(response) {
                                console.log('Successfully created return order with ID:', response.data.id);
                                return $http.get('https://localhost:7297/api/Trahang');
                            })
                            .then(function(response) {
                                const traHangs = response.data;
                                if (traHangs && traHangs.length > 0) {
                                    const maxId = Math.max(...traHangs.map(order => order.id));
                                    // Lặp qua các sản phẩm đã chọn
                                    $scope.selectedProducts.forEach(x => {
                                        $scope.datatrahangct = {
                                            Idth: maxId,
                                            Soluong: $scope.quantity, // Đảm bảo quantity được định nghĩa
                                            Tinhtrang: $scope.tinhtrang,
                                            Ghichu: $scope.ghichu,
                                            Hinhthucxuly: 'null',
                                            Idhdct: x
                                        };
                                        // Gửi yêu cầu tạo chi tiết đơn trả hàng
                                        $http.post('https://localhost:7297/api/Trahangchitiet', $scope.datatrahangct)
                                            .then(function(reponse) {
                                                console.log('Tra hang chi tiet thanh cong');
                                                $scope.hinhanh = {
                                                    urlhinhanh: $scope.hinhanh,
                                                    idth: maxId
                                                };
                                                // Gửi yêu cầu thêm hình ảnh
                                                return $http.post('https://localhost:7297/api/Hinhanh', $scope.hinhanh);
                                            })
                                            .then(function(reponse) {
                                                console.log('them anh thanh cong');
                                                Swal.fire(
                                                    'Thành công!',
                                                    'Thông tin của bạn đã được gửi.',
                                                    'success'
                                                );
                                            })
                                            .catch(function(error) {
                                                console.log('them anh that bai:', error);
                                            });
                                    });
                                } else {
                                    console.log('No return orders found.');
                                }
                            })
                            .catch(function(error) {
                                console.error('Error submitting return order:', error);
                            });
                    } else {
                        // Người dùng đã hủy
                        Swal.fire('Đã hủy!', 'Bạn đã hủy gửi thông tin.', 'error');
                    }
                });
            }
        };
        
});
