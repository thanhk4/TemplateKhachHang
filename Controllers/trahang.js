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
            }
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy thông tin hóa đơn:", error);
            $scope.errorMessage = "Không thể tải thông tin hóa đơn chi tiết. Vui lòng thử lại sau.";
        });
    // Khởi tạo quantity từ sessionStorage hoặc để trống, chờ hàm thiết lập
    $scope.quantity = parseInt(sessionStorage.getItem('quantity')) || null;

    $scope.tongSoTienHoan = 0; // Biến để lưu tổng số tiền hoàn

    // Hàm thay đổi số lượng và cập nhật tổng số tiền hoàn
    $scope.changeQuantity = function (delta, productId) {
        const product = $scope.datahdct.find(item => item.id === productId);
        const quantityDisplayElement = document.getElementById(`quantity-display-${productId}`);
    
        if (product && quantityDisplayElement) {
            let currentQuantity = parseInt(quantityDisplayElement.textContent, 10);
            let newQuantity = currentQuantity + delta;
    
            if (newQuantity >= 1 && newQuantity <= product.soluong) {
                quantityDisplayElement.textContent = newQuantity;
    
                // Cập nhật số lượng trong sessionStorage
                sessionStorage.setItem(`quantity_${productId}`, newQuantity);
    
                // Cập nhật số lượng trong selectedProducts nếu sản phẩm đã được chọn
                const selectedProduct = $scope.selectedProducts.find(item => item.productId === productId);
                if (selectedProduct) {
                    selectedProduct.quantity = newQuantity;
                    $scope.updateTotalAmount();
                }
            }
        }
    };
       

    $scope.updateTotalAmount = function () {
        $scope.tongSoTienHoan = 0;
    
        // Duyệt qua danh sách sản phẩm được chọn
        angular.forEach($scope.selectedProducts, function (item) {
            const product = $scope.datahdct.find(product => product.id === item.productId);
    
            if (product) {
                // Tính tổng dựa trên giá sản phẩm và số lượng đã lưu
                $scope.tongSoTienHoan += (product.giasp * item.quantity);
            }
        });
    
        // Định dạng và hiển thị tổng số tiền hoàn
        const formattedTienHoan = `${$scope.tongSoTienHoan.toLocaleString('en-US')} VNĐ`;
        document.getElementById('tongsotienhoan').textContent = formattedTienHoan;
    };

    $scope.selectedProducts = []; // Mảng lưu trữ id các sản phẩm được chọn
    $scope.tongSoTienHoan = 0; // Biến để lưu tổng số tiền hoàn

    $scope.toggleSelection = function (productId) {
        const index = $scope.selectedProducts.findIndex(item => item.productId === productId);
    
        if (index > -1) {
            // Nếu sản phẩm đã tồn tại trong mảng, xóa nó (bỏ chọn)
            $scope.selectedProducts.splice(index, 1);
        } else {
            // Nếu chưa tồn tại, thêm vào mảng (chọn sản phẩm)
            const quantityDisplayElement = document.getElementById(`quantity-display-${productId}`);
            const currentQuantity = quantityDisplayElement ? parseInt(quantityDisplayElement.textContent, 10) : 1;
            $scope.selectedProducts.push({ productId, quantity: currentQuantity });
        }
        // Cập nhật lại tổng số tiền hoàn
        $scope.updateTotalAmount();
    };    
    
    // Khởi tạo số lượng hiện tại từ sessionStorage hoặc giá trị mặc định
    $scope.datahdct.forEach(product => {
        product.soluongHienTai = parseInt(sessionStorage.getItem(`quantity_${product.id}`)) || 1; // Mặc định là 1
    });

    $http.get('https://api.viqr.net/list-banks/')
        .then(function (response) {
            $scope.banks = response.data; // Assign the API data to the scope.
        })
        .catch(function (error) {
            console.log('Error fetching bank data:', error);
        });

    let datahinhanhbase64 = ""; // Biến toàn cục để lưu dữ liệu Base64

    function convertImageToBase64(inputElement, callback) {
        if (inputElement.files && inputElement.files[0]) {
            const file = inputElement.files[0];
            const reader = new FileReader();

            reader.onload = function (e) {
                // Kết quả Base64 đầy đủ
                const base64Data = e.target.result; 
                callback(base64Data); // Truyền dữ liệu qua callback
            };

            reader.onerror = function (error) {
                console.error("Có lỗi xảy ra khi đọc file: ", error);
            };

            // Đọc file dưới dạng Data URL (base64)
            reader.readAsDataURL(file);
        } else {
            console.error("Không có file nào được chọn.");
        }
    }

    // Hàm xử lý Base64 và gán vào biến toàn cục
    function handleBase64Data(base64Data) {
        datahinhanhbase64 = base64Data; // Gán Base64 vào biến toàn cục
    }

    // Sử dụng
    document.getElementById('fileUpload').addEventListener('change', function () {
        convertImageToBase64(this, handleBase64Data);
    });    

    $scope.submit = async function () {
        const dataanh = datahinhanhbase64;
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
    
        // Kiểm tra hình ảnh hoặc video
        if (!dataanh) {
            Swal.fire('Lỗi!', 'Vui lòng tải lên ít nhất một hình ảnh hoặc video.', 'error');
            return;
        }
    
        // Kiểm tra ghi chú
        if (!$scope.ghichu) {
            Swal.fire('Lỗi!', 'Vui lòng điền ghi chú.', 'error');
            return;
        }
    
        const currentDate = new Date();
        const vietnamTimezoneOffset = 0; // Múi giờ Việt Nam là UTC+7

        // Điều chỉnh thời gian theo múi giờ Việt Nam
        currentDate.setMinutes(currentDate.getMinutes() + vietnamTimezoneOffset - currentDate.getTimezoneOffset());

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
        }).then(async (result) => {
            if (result.isConfirmed) {
                const chuthich = 
                ($scope.phuongthuchoantien === 'Ngân hàng' || $scope.phuongthuchoantien === 'Thẻ thanh toán') 
                ? `Ngân hàng: ${$scope.nganhang} - STK: ${$scope.stk} - Tên người hưởng thụ: ${$scope.tennguoihuongthu}`
                : "";
                // Gửi thông tin nếu tất cả điều kiện hợp lệ
                const datatrahang = {
                    tenkhachhang: $scope.userInfo.ten,
                    idnv: null,
                    idkh: $scope.userInfo.id,
                    sotienhoan: sotienhoan,
                    lydotrahang: $scope.lydotrahang || null,
                    trangthai: 0,
                    phuongthuchoantien: $scope.phuongthuchoantien,
                    ngaytrahangdukien: currentDate,
                    ngaytrahangthucte: null,
                    chuthich: chuthich
                };
    
                try {
                    const hoadondata = await CheckHoaDon()
                    console.log(hoadondata)
                    if (hoadondata.trangthai != 3) 
                    {
                        Swal.fire('Trả hàng thất bại!', 'Hoá đơn này đã trả hàng, vui lòng kiểm tra lại', 'error');
                        return;
                    };

                    // Gửi thông tin trả hàng
                    const returnOrder = await trahang(datatrahang);
                    if (!returnOrder) return;  // Nếu không có kết quả trả về, dừng
    
                    // Thêm hình ảnh sau khi tạo đơn trả hàng
                    const checkhinhanh = await hinhanh(returnOrder, dataanh);
                    if (!checkhinhanh) return; 
    
                    // Thêm chi tiết đơn trả hàng
                    const checktrahangchitiet = await trahangchitiet(returnOrder, $scope.selectedProducts);
                    if (!checktrahangchitiet) return; 

                    UpdateHoaDon(hoadondata);
    
                    Swal.fire("Thành Công", "Đặt Hàng Thành Công.", "success");
                    $scope.$apply(() => {
                        $location.path(`/donhangcuaban`);
                    });
                } catch (error) {
                    console.error('Error submitting return order:', error);
                    Swal.fire("Lỗi", "Đã có lỗi xảy ra khi gửi thông tin trả hàng.", "error");
                }
            } else {
                Swal.fire('Đã hủy!', 'Bạn đã hủy gửi thông tin.', 'error');
            }
        });
    };

    // Hàm lấy thông tin khách hàng từ API và cập nhật vào HTML
    async function CheckHoaDon() {
        try {
            const response = await fetch(`https://localhost:7297/api/Hoadon/${idhd}`);

            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }

            const hoaDonData = await response.json();

            if (!hoaDonData) {
                throw new Error("Dữ liệu hoá đơn không hợp lệ.");
            }

            return hoaDonData;

        } catch (error) {
            console.error("Lỗi khi lấy thông tin hoá đơn:", error);
        }
    }

    // Hàm cập nhật thông tin hóa đơn thông qua API
    async function UpdateHoaDon(hoaDonData) {
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
            ngaygiaodukien: hoaDonData.ngaygiaodukien,
            ngaygiaothucte: hoaDonData.ngaygiaothucte,
            tongtiencantra: hoaDonData.tongtiencantra,
            tongtiensanpham: hoaDonData.tongtiensanpham,
            sdt: hoaDonData.sdt,
            tonggiamgia: hoaDonData.tonggiamgia,
            trangthai: 4
        };
        try {
            const response = await fetch(`https://localhost:7297/api/Hoadon/${idhd}`, {
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
    
    // Hàm tạo hóa đơn
    async function hinhanh(idth, dataanh ) {
        const data = {
            idth: idth,
            hinhanh: dataanh
        };
    
        try {
            const response = await fetch('https://localhost:7297/api/Hinhanh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
    
            // Kiểm tra nếu BE trả thông báo lỗi
            if (result.error) {
                Swal.fire("Lỗi", result.error, "error");
                return null;  // Dừng nếu có lỗi từ BE
            }
            return result;
        } catch (error) {
            console.error("Lỗi kết nối API khi thêm hình ảnh:", error);
            Swal.fire("Lỗi", "Kết nối thêm hình ảnh thất bại.", "error");
        }
    }
    
    // Hàm tạo hóa đơn
    async function trahang(data) {
        try {
            const response = await fetch('https://localhost:7297/api/Trahang', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                const result = await response.json();
                return result.id; // Trả về ID hóa đơn
            } else {
                const result = await response.json();
                if (result.error) {
                    Swal.fire("Lỗi", result.error, "error");
                }
            }
        } catch (error) {
            console.error("Lỗi kết nối API khi tạo đơn trả hàng:", error);
            Swal.fire("Lỗi", "Kết nối tạo đơn trả hàng thất bại.", "error");
        }
    }
    
    // Hàm tạo chi tiết hóa đơn
    async function trahangchitiet(idth, selectedProducts) {
        for (const product of selectedProducts) {
            const data = {
                id: 0,
                idth: idth,
                soluong: product.quantity,
                tinhtrang: 0,
                ghichu: $scope.ghichu || "",
                hinhthucxuly: $scope.hinhthucxuly || "",
                Idhdct: product.productId
            };
    
            try {
                const response = await fetch('https://localhost:7297/api/Trahangchitiet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
    
                if (result.error) {
                    Swal.fire("Lỗi", result.error, "error");
                    return null;
                }
            } catch (error) {
                console.error("Lỗi kết nối API khi thêm hoá đơn chi tiết:", error);
                Swal.fire("Lỗi", "Kết nối thêm hoá đơn chi tiết thất bại.", "error");
            }
        }
        return true;
    }    

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
