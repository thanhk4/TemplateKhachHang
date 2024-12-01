app.controller('ThongTinTaiKhoanController', function($scope, $rootScope, $location) {
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
    async function fetchkhachangById() {
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

            // Gắn dữ liệu vào các phần tử HTML
            updateCustomerInfo(khachHangData);

            return khachHangData;

        } catch (error) {
            console.error("Lỗi khi lấy thông tin khách hàng:", error);
            alert("Có lỗi xảy ra khi tải thông tin khách hàng. Vui lòng thử lại.");
        }
    }

    // Hàm cập nhật dữ liệu vào HTML
    function updateCustomerInfo(khachHangData) {
        const defaultText = "Chưa cập nhật";
        document.getElementById("hovaten").innerText = khachHangData.ten || defaultText;
        document.getElementById("sdt").innerText = khachHangData.sdt || defaultText;
        document.getElementById("diachi").innerText = khachHangData.diachi || defaultText;
        document.getElementById("email").innerText = khachHangData.email || defaultText;
    }

    // Gọi API khi controller khởi tạo
    fetchkhachangById();
});
