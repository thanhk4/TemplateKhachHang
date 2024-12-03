app.controller('trahangController', function ($scope, $http, $location, $routeParams, $timeout) {
    $scope.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const idhd = $routeParams.id;
    $scope.datahd = {};
    $scope.datahdct = [];
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

            // Khởi tạo số lượng và tổng số tiền hoàn cho mỗi sản phẩm
            if ($scope.datahdct.length > 0) {
                $scope.quantity = $scope.datahdct[0].soluong || 1; // Số lượng mặc định là 1 nếu không có dữ liệu
                const giaSp = $scope.datahdct[0].giasp; // Giá sản phẩm đầu tiên
            }

            console.log("Thông tin hóa đơn:", $scope.datahd);
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy thông tin hóa đơn:", error);
            $scope.errorMessage = "Không thể tải thông tin hóa đơn chi tiết. Vui lòng thử lại sau.";
        });
    // Khởi tạo quantity từ sessionStorage hoặc để trống, chờ hàm thiết lập
    $scope.quantity = parseInt(sessionStorage.getItem('quantity')) || null;

    $scope.tongSoTienHoan = 0; // Biến để lưu tổng số tiền hoàn

    // Hàm thay đổi số lượng và cập nhật tổng số tiền hoàn
    $scope.changeQuantity = function (delta, soluong, giaSp, productId) {
        let newQuantity = $scope.quantity + delta;
        if (newQuantity >= 1 && newQuantity <= soluong) {
            $scope.quantity = newQuantity;
            sessionStorage.setItem('quantity', $scope.quantity);

            // Cập nhật tổng số tiền hoàn nếu sản phẩm này đã được chọn
            if ($scope.selectedProducts.includes(productId)) {
                $scope.updateTotalAmount();
            }
        }
    };

    // Hàm tính toán lại tổng số tiền hoàn dựa trên các sản phẩm đã chọn và số lượng
    $scope.updateTotalAmount = function () {
        $scope.tongSoTienHoan = 0;
        angular.forEach($scope.selectedProducts, function (productId) {
            const product = $scope.datahdct.find(function (item) {
                return item.id === productId;
            });
            if (product) {
                $scope.tongSoTienHoan += (product.giasp * $scope.quantity);
            }
        });
        const formattedTienHoan = `${$scope.tongSoTienHoan.toLocaleString('en-US')} VNĐ`;
        document.getElementById('tongsotienhoan').textContent = formattedTienHoan;
    };

    // Hàm lấy giá trị số lượng từ phần tử span (hiển thị)
    $scope.getQuantityDisplay = function () {
        const quantityDisplay = document.getElementById("quantity-display");
        if (quantityDisplay) {
            return quantityDisplay.innerText || quantityDisplay.textContent; // Lấy giá trị hiển thị
        }
        return null;
    };

    $http.get('https://api.viqr.net/list-banks/')
        .then(function (response) {
            $scope.banks = response.data; // Assign the API data to the scope.
            console.log($scope.banks.data);
        })
        .catch(function (error) {
            console.log('Error fetching bank data:', error);
        });

    $scope.selectedProducts = []; // Mảng lưu trữ id các sản phẩm được chọn
    $scope.tongSoTienHoan = 0; // Biến để lưu tổng số tiền hoàn

    // Hàm xử lý khi chọn hoặc bỏ chọn sản phẩm
    $scope.toggleSelection = function (productId, giasp) {
        const index = $scope.selectedProducts.indexOf(productId);
        if (index > -1) {
            // Nếu sản phẩm đã tồn tại trong mảng, xóa nó (bỏ chọn)
            $scope.selectedProducts.splice(index, 1);
        } else {
            // Nếu chưa tồn tại, thêm vào mảng (chọn sản phẩm)
            $scope.selectedProducts.push(productId);
        }
        // Cập nhật lại tổng số tiền hoàn khi có sự thay đổi trong danh sách các sản phẩm được chọn
        $scope.updateTotalAmount();
    };

    function checkFiles() {
        const fileInput = document.getElementById('fileUpload');
        const files = fileInput.files; // Lấy các tệp đã chọn từ input

        // Kiểm tra nếu không có tệp nào được chọn
        if (files.length === 0) {
            Swal.fire('Lỗi!', 'Vui lòng tải lên ít nhất một hình ảnh hoặc video.', 'error');
        } else {
            return files[0].name;
        }
    };



    $scope.submit = function () {
        const sotienhoan = parseInt(document.getElementById("tongsotienhoan").textContent.replace(" VND", "").replace(/\,/g, "")) || 0;
        // Kiểm tra lý do trả hàng
        if (!$scope.lydotrahang) {
            Swal.fire('Lỗi!', 'Vui lòng chọn lý do trả hàng.', 'error');
            return;
        }

        // Kiểm tra danh sách sản phẩm
        if (!$scope.selectedProducts || $scope.selectedProducts.length === 0) {
            Swal.fire('Lỗi!', 'Vui lòng chọn ít nhất một sản phẩm trong hóa đơn.', 'error');
            return;
        }

        // Kiểm tra phương thức hoàn tiền
        if (!$scope.phuongthuchoantien) {
            Swal.fire('Lỗi!', 'Vui lòng chọn phương thức hoàn tiền.', 'error');
            return;
        }

        // Kiểm tra thông tin ngân hàng khi phương thức hoàn tiền yêu cầu
        if (
            ($scope.phuongthuchoantien === 'Ngân hàng' || $scope.phuongthuchoantien === 'Thẻ thanh toán') &&
            (!$scope.nganhang || !$scope.stk || !$scope.tennguoihuongthu)
        ) {
            Swal.fire('Lỗi!', 'Vui lòng điền đầy đủ thông tin Ngân hàng, Số tài khoản và Tên người hưởng thụ.', 'error');
            return;
        }

        // Kiểm tra tình trạng
        if (!$scope.tinhtrang) {
            Swal.fire('Lỗi!', 'Vui lòng chọn tình trạng sản phẩm.', 'error');
            return;
        }

        const checkhinhanh = checkFiles()
        // Kiểm tra hình ảnh hoặc video
        if (!checkhinhanh) {
            Swal.fire('Lỗi!', 'Vui lòng tải lên ít nhất một hình ảnh hoặc video.', 'error');
            return;
        }

        // Kiểm tra ghi chú
        if (!$scope.ghichu) {
            Swal.fire('Lỗi!', 'Vui lòng điền ghi chú.', 'error');
            return;
        }

        // Hiển thị xác nhận gửi thông tin
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
                // Gửi thông tin nếu tất cả điều kiện hợp lệ
                $scope.datatrahang = {
                    tenkhachhang: $scope.userInfo.ten,
                    idnv: null,
                    idkh: $scope.userInfo.id,
                    sotienhoan: sotienhoan,
                    lydotrahang: $scope.lydotrahang || null,
                    trangthai: 0,
                    phuongthuchoantien: $scope.phuongthuchoantien,
                    ngaytrahangdukien: new Date(),
                    ngaytrahangthucte: null,
                    chuthich: `Ngân hàng: ${$scope.nganhang} - STK: ${$scope.stk} - Tên người hưởng thụ: ${$scope.tennguoihuongthu}` || null
                };

                $http.post('https://localhost:7297/api/Trahang', $scope.datatrahang)
                    .then(function (response) {
                        console.log('Successfully created return order with ID:', response.data.id);
                        Swal.fire("Thành Công", "Đặt Hàng Thành Công.", "success");
                        // Tiếp tục xử lý chi tiết đơn trả hàng và hình ảnh như logic ban đầu
                    })
                    .catch(function (error) {
                        console.error('Error submitting return order:', error);
                    });
            } else {
                Swal.fire('Đã hủy!', 'Bạn đã hủy gửi thông tin.', 'error');
            }
        });
    };


    $scope.$watch('phuongthuchoantien', function (newValue, oldValue) {
        // Kiểm tra khi phuongthuchoantien thay đổi và nếu thuộc tính cần hiển thị
        if (newValue === 'Thẻ thanh toán' || newValue === 'Ngân hàng') {
            // Delay ngắn để đảm bảo rằng collapse đã mở
            $timeout(function () {
                // Làm mới lại các input và select trong collapse khi mở
                resetInputsAndSelects();
            }, 0); // Chạy sau khi Angular đã hoàn tất xử lý
        }
    });

    // Hàm làm mới lại các input và select
    function resetInputsAndSelects() {
        // Lấy tất cả các input và select trong collapse
        const inputs = document.querySelectorAll('#collapseExample input, #collapseExample select');

        // Duyệt qua từng input và select và reset giá trị
        inputs.forEach(input => {
            if (input.type === "text") {
                input.value = '';  // Đặt lại giá trị input kiểu text thành rỗng
            } else if (input.tagName === "SELECT") {
                input.selectedIndex = 0;  // Đặt lại select về lựa chọn đầu tiên có value=""
            }
        });
    }

    function handleSelectChange(selectId, displayId) {
        // Lấy phần tử select và phần tử hiển thị
        const selectElement = document.getElementById(selectId);
        const displayElement = document.getElementById(displayId);

        // Gắn sự kiện change cho phần tử select
        selectElement.addEventListener('change', function () {
            const selectedValue = this.value; // Giá trị được chọn
            const selectedText = this.options[this.selectedIndex].text; // Văn bản hiển thị của lựa chọn

            // Cập nhật nội dung hiển thị và giá trị
            if (selectedValue) {
                displayElement.textContent = `${selectedText}`;
                displayElement.setAttribute('value', selectedValue);
            } else {
                displayElement.textContent = ''; // Nếu không chọn gì
                displayElement.setAttribute('value', '');
            }
        });
    }

    // Gọi hàm xử lý cho select ID "refundMethod" và phần tử hiển thị ID "hienthiphuongthucthanhtoandachon"
    handleSelectChange('refundMethod', 'hienthiphuongthucthanhtoandachon');
});
