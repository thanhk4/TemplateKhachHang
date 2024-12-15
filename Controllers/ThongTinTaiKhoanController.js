app.controller('ThongTinTaiKhoanController', function ($scope, $rootScope, $location, $timeout) {
    // Kiểm tra đăng nhập
    if (!$rootScope.isLoggedIn) {
        $location.path('/login');
        return;
    }

    const apiKHUrl = "https://localhost:7297/api/Khachhang";

    // Hàm lấy thông tin khách hàng từ localStorage
    function GetByidKH() {
        const userInfoString = localStorage.getItem("userInfo");
        if (userInfoString) {
            try {
                const userInfo = JSON.parse(userInfoString);
                return userInfo?.id || 0;
            } catch (error) {
                console.error("Lỗi khi phân tích dữ liệu userInfo:", error);
            }
        } else {
            console.warn("Dữ liệu userInfo không tồn tại trong localStorage.");
        }
        return 0; // Giá trị mặc định nếu không lấy được ID
    }

    // Hàm lấy thông tin khách hàng từ API
    async function fetchKhachHangData() {
        const idkh = GetByidKH();
        if (!idkh) {
            console.warn("Không thể lấy ID khách hàng.");
            return;
        }

        try {
            const response = await fetch(`${apiKHUrl}/${idkh}`);
            if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

            const khachHangData = await response.json();
            if (!khachHangData) throw new Error("Dữ liệu khách hàng không hợp lệ.");
            if (khachHangData.idrank) {
                const rankResponse = await fetch(`https://localhost:7297/api/Rank/${khachHangData.idrank}`);
                if (rankResponse.ok) {
                    const rankData = await rankResponse.json();
                    khachHangData.rank = rankData;
                }
            }
            return khachHangData;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin khách hàng:", error);
        }
    }
    let chart = null;

    // Hàm cập nhật dữ liệu vào các phần tử HTML
    async function updateDataToHTML(khachHangData) {
        const defaultText = "Chưa cập nhật";
        const datarank = await fetchRank(khachHangData.idrank)
        // Cập nhật các giá trị cho các trường input
        document.getElementById("hovaten").innerText = khachHangData.ten || defaultText;
        document.getElementById("sdt").innerText = khachHangData.sdt || defaultText;
        document.getElementById("diachi").innerText = khachHangData.diachi || defaultText;
        document.getElementById("ngaysinh").innerText = formatDate(khachHangData.ngaysinh) || defaultText;
        document.getElementById("email").innerText = khachHangData.email || defaultText;
        document.getElementById("diemsudung").innerText = khachHangData.diemsudung || "0";
        if (datarank && typeof khachHangData.diemsudung !== 'undefined') {
            createOrUpdateChart(khachHangData.tichdiem, datarank.maxMoney || 100, datarank.tenRank);
        }
    }
   

function createOrUpdateChart(currentPoints, totalPoints, rankName) {
    const ctx = document.getElementById('rankChart').getContext('2d');
    
    if (chart) {
        chart.destroy(); // Hủy biểu đồ cũ nếu tồn tại
    }

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Điểm đã tích', 'Điểm cần tích'],
            datasets: [{
                data: [currentPoints, totalPoints - currentPoints],
                backgroundColor: ['#0d6efd', '#e9ecef'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        boxWidth: 15,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw} điểm`;
                        }
                    }
                }
            }
        }
    });

    // Cập nhật text ở giữa biểu đồ
    document.getElementById('rankText').textContent = rankName;
    document.getElementById('rankText').style.fontSize = '24px';
    document.getElementById('pointsText').textContent = `${currentPoints}/${totalPoints} điểm`;
    document.getElementById('pointsText').style.fontSize = '18px';
}
    // Hàm gọi API để lấy sản phẩm chi tiết theo idspct
    async function fetchRank(idrank) {
        try {
            // Kiểm tra nếu idspct có giá trị hợp lệ
            if (!idrank) {
                console.error("idrank không hợp lệ");
                return null;
            }

            // Gọi API với idspct
            const response = await fetch(`https://localhost:7297/api/Rank/${idrank}`);

            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi khi Rank:", error);
            return null; // Trả về null nếu có lỗi
        }
    }

    // Hàm cập nhật dữ liệu vào các trường input khi mở modal
    function updateDataToEditModal(khachHangData) {
        const defaultText = "Chưa cập nhật";
        // Cập nhật giá trị cho các trường input
        document.getElementById("editHoTen").value = khachHangData.ten || defaultText;
        document.getElementById("editSDT").value = khachHangData.sdt || defaultText;
        document.getElementById("editDiaChi").value = khachHangData.diachi || defaultText;
        document.getElementById("editNgaysinh").value = formatDateForInput(khachHangData.ngaysinh) || '';
        document.getElementById("editEmail").value = khachHangData.email || defaultText;
    }

    // Hàm gọi API và cập nhật dữ liệu vào các phần tử HTML
    async function fetchAndUpdateData() {
        const khachHangData = await fetchKhachHangData();
        if (khachHangData) {
            updateDataToHTML(khachHangData); // Cập nhật thông tin hiển thị ngoài trang
        }
    }

    // Sự kiện mở modal để cập nhật dữ liệu vào các trường input
    document.getElementById("btnChangeAcc").addEventListener("click", async function () {
        const khachHangData = await fetchKhachHangData();
        if (khachHangData) {
            updateDataToEditModal(khachHangData); // Cập nhật dữ liệu vào modal khi mở
        }
    });

    // Hàm formatDate để chuyển đổi ngày theo định dạng mong muốn (VD: ngày/tháng/năm)
    function formatDate(dateString) {
        if (!dateString) return null;

        // Chuyển đổi ngày từ chuỗi sang đối tượng Date
        const date = new Date(dateString);

        // Kiểm tra nếu giá trị ngày hợp lệ
        if (isNaN(date)) return null;

        // Định dạng ngày: Ngày/Tháng/Năm
        const day = String(date.getDate()).padStart(2, '0');  // Thêm số 0 nếu ngày chỉ có 1 chữ số
        const month = String(date.getMonth() + 1).padStart(2, '0');  // Thêm số 0 nếu tháng chỉ có 1 chữ số
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    function formatDateForInput(dateString) {
        if (!dateString) return null;

        const date = new Date(dateString);
        if (isNaN(date)) return null;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`; // Định dạng yyyy-MM-dd
    }


    const confirmButton = document.querySelector('#btnSave');

    confirmButton.addEventListener('click', async function () {
        // Lấy ID khách hàng từ localStorage
        const idkh = GetByidKH();
        if (!idkh) {
            alert("Không thể lấy ID khách hàng.");
            return;
        }

        // Lấy thông tin khách hàng hiện tại từ API
        const khachHangData = await fetchKhachHangData();
        if (!khachHangData) {
            alert("Không thể lấy dữ liệu khách hàng hiện tại.");
            return;
        }

        // Kiểm tra trạng thái của khách hàng
        let trangthais;
        if (khachHangData.trangthai === "Hoạt động") {
            trangthais = 0;
        } else if (khachHangData.trangthai === "Tài khoản bị khoá") {
            trangthais = 1;
        } else {
            alert("Trạng thái không hợp lệ. Vui lòng chọn giá trị hợp lệ.");
            return; // Dừng xử lý nếu trạng thái không hợp lệ
        }
        const hoTen = document.getElementById('editHoTen').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const sdt = document.getElementById('editSDT').value.trim();
        const ngaysinh = document.getElementById('editNgaysinh').value.trim();
        
        // Kiểm tra validation
        let isValid = true;
    
        // Kiểm tra tên (chỉ cho phép chữ cái và khoảng trắng)
        if (!validateName(hoTen)) {
            isValid = false;
            document.getElementById('editHoTen').classList.add('is-invalid');
        } else {
            document.getElementById('editHoTen').classList.remove('is-invalid');
        }
    
        // Kiểm tra email
        if (!validateEmail(email)) {
            isValid = false;
            document.getElementById('editEmail').classList.add('is-invalid');
        } else {
            document.getElementById('editEmail').classList.remove('is-invalid');
        }
    
        // Kiểm tra số điện thoại
        if (!validatePhoneNumber(sdt)) {
            isValid = false;
            document.getElementById('editSDT').classList.add('is-invalid');
        } else {
            document.getElementById('editSDT').classList.remove('is-invalid');
        }
    
        // Kiểm tra ngày sinh
        if (!validateDateOfBirth(ngaysinh)) {
            isValid = false;
            document.getElementById('editNgaysinh').classList.add('is-invalid');
        } else {
            document.getElementById('editNgaysinh').classList.remove('is-invalid');
        }
        if (isValid) {

        // Cập nhật dữ liệu mới từ form
        const updatedData = {
            ten: document.getElementById('editHoTen').value,
            sdt: document.getElementById('editSDT').value,
            ngaysinh: document.getElementById('editNgaysinh').value.split("T")[0], // Chỉ lấy ngày
            tichdiem: khachHangData.tichdiem,
            email: document.getElementById('editEmail').value,
            diachi: document.getElementById('editDiaChi').value,
            password: "string", // Giả sử bạn muốn giữ mật khẩu không thay đổi hoặc bạn cần thêm logic xử lý mật khẩu
            diemsudung: khachHangData.diemsudung,
            trangthai: trangthais,
            idrank: khachHangData.idrank
        };

        try {
            // Gửi yêu cầu PUT đến API để cập nhật thông tin khách hàng
            const response = await fetch(`${apiKHUrl}/UpdateThongTinKhachhangAsync/${idkh}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            // Kiểm tra phản hồi từ API
            if (response.ok) {
                
                Swal.fire("Thành Công", "Thay đổi thông tin cá nhân thành công.", "success");

                // Cập nhật lại thông tin khách hàng trong giao diện
                const khachHangData = await fetchKhachHangData();
                if (khachHangData) {
                    updateDataToHTML(khachHangData);  // Cập nhật giao diện với thông tin mới
                    updateDataToEditModal(khachHangData); // Cập nhật modal nếu cần

                       // Cập nhật chỉ email, id và tên (ten) trong localStorage
                       const updatedUserInfo = {
                        id: idkh,  // Giữ nguyên id từ localStorage
                        ten: hoTen,  // Cập nhật tên mới
                        email: email  // Cập nhật email mới
                    };
                    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

                    var modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
                    modal.hide();
                     // Tự động reload trang sau khi cập nhật thành công
                     setTimeout(() => {
                        window.location.reload();  // Reload lại trang sau 2 giây (2000ms)
                    }, 2000); // Thời gian trì hoãn (2 giây)  // Tự động tải lại trang
                }
            } else {
                const errorData = await response.json();
                console.error('Lỗi khi cập nhật:', errorData);
                alert('Cập nhật thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi trong quá trình gửi yêu cầu:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    }
    });
    function validateName(name) {
        // Loại bỏ khoảng trắng và kiểm tra tên có ít nhất 5 chữ cái và tối đa 50 chữ cái
        const strippedName = name.replace(/\s+/g, '');  // Loại bỏ tất cả các khoảng trắng
        const regex = /^[a-zA-Zàáạảãâấầẩẫăắằẳẵêếềểễiíịỉĩòóọỏõôốồổỗơớờởỡuúụủũôớờởỡuúụủũựỳỹý]/g;  // Kiểm tra tên chỉ chứa chữ cái (bao gồm cả chữ có dấu)
    
        return strippedName.length >= 5 && strippedName.length <= 50 && regex.test(name);
    }
    
    function validateEmail(email) {
        var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com|vn)$/;
        return emailPattern.test(email);
    }
    
    
    function validatePhoneNumber(phone) {
        var phoneRegex = /^[0-9]{10}$/; // Kiểm tra số điện thoại từ 10
        return phoneRegex.test(phone);
    }
    
    function validateDateOfBirth(dob) {
        const today = new Date();
        const birthDate = new Date(dob);
        const age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 10 && age <= 100;
    }

    // Gọi API khi controller khởi tạo
    fetchAndUpdateData();
});

