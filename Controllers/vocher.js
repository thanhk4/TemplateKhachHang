app.controller("vocherController", function ($scope, $document, $rootScope, SanPhamService, $location ) {
   
    function GetByidKH() {
        const userInfoString = localStorage.getItem("userInfo");
        let userId = 0;

        if (userInfoString) {
            try {
                const userInfo = JSON.parse(userInfoString);
                userId = userInfo?.id || 0;
                document.getElementById('userInitial').textContent = userInfo.ten.charAt(0);
                document.getElementById('userName').textContent = userInfo.ten;
            } catch (error) {
                console.error("Lỗi khi phân tích dữ liệu userInfo:", error);
            }
        } else {
            console.warn("Dữ liệu userInfo không tồn tại trong localStorage.");
        }

        return userId;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    }

 

    async function fetchVouchers() {
        const idkh = GetByidKH();
        try {
            // Bước 1: Lấy idRank từ API khách hàng
            const responseRank = await fetch(`https://localhost:7297/api/khachhang/${idkh}`);
            if (!responseRank.ok) {
                throw new Error(`Lỗi khi lấy idRank: ${responseRank.status}`);
            }
            const data = await responseRank.json();
            const idRank = data.idrank;
    
            // Bước 2: Lấy danh sách id giảm giá từ API giamgia_rank
            const responseDiscountIds = await fetch(`https://localhost:7297/api/giamgia_rank/rank/${idRank}`);
            if (!responseDiscountIds.ok) {
                throw new Error(`Lỗi khi lấy danh sách idGiamGia: ${responseDiscountIds.status}`);
            }
            const discountIds = await responseDiscountIds.json();
    
            // Bước 3: Lấy danh sách các mã giảm giá mà khách hàng đã sử dụng
            const responseUsedVouchers = await fetch(`https://localhost:7297/api/Hoadon/voucher/${idkh}`);
            let usedVouchers = [];
            if (responseUsedVouchers.status === 204) {
                console.log("Không có dữ liệu voucher từ hóa đơn.");
            } else if (!responseUsedVouchers.ok) {
                throw new Error(`Lỗi khi lấy dữ liệu từ API hóa đơn: ${responseUsedVouchers.status}`);
            } else {
                const usedVouchersText = await responseUsedVouchers.text();
                if (usedVouchersText) {
                    usedVouchers = JSON.parse(usedVouchersText);
                }
            }
    
            const activeVouchers = [];
            const historyVouchers = [];
            for (const id of discountIds) {
                const isUsed = usedVouchers.length > 0 && usedVouchers.some(voucher => voucher.idgg === id.iDgiamgia);
                if (isUsed) continue;
    
                try {
                    const responseVoucher = await fetch(`https://localhost:7297/api/giamgia/${id.iDgiamgia}`);
                    const data = await responseVoucher.json();
                    const currentDate = new Date();
                    const formattedDate = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        currentDate.getDate()
                    );
    
                    const updatengaybatdauDate = new Date(data.ngaybatdau);
                    const updatengayketthucDate = new Date(data.ngayketthuc);
    
                    if (data.trangthai === 'Đang phát hành' || data.trangthai === 'Chuẩn bị phát hành') {
                        if (updatengaybatdauDate <= formattedDate && formattedDate <= updatengayketthucDate) {
                            activeVouchers.push(data);
                        }
                    } else if (data.trangthai === 'Dừng phát hành') {
                        historyVouchers.push(data);
                    }
                } catch (error) {
                    console.warn(`Lỗi không xác định khi lấy voucher với id: ${id.iDgiamgia}`, error);
                }
            }
    
            // Sắp xếp danh sách voucher
            activeVouchers.sort((a, b) => {
                if (a.donvi === "%" && b.donvi !== "VND") return -1;
                if (a.donvi !== "VND" && b.donvi === "%") return 1;
                return a.giatri - b.giatri;
            });
    
            displayVouchers(activeVouchers, 'active-voucher-list', 'active-voucher-notice');
            displayVouchers(historyVouchers, 'history-voucher-list', 'history-voucher-notice');
        } catch (error) {
            console.error('Lỗi khi lấy danh sách voucher:', error);
            Swal.fire("Lỗi", "Đã xảy ra lỗi khi tải danh sách voucher.", "error");
        }
    }
    
    function interpretStatus(status) {
        switch(status) {
            case 'Đang phát hành':
                return 'Đang phát hành';
            case 'Chuẩn bị phát hành':
                return 'Chuẩn bị phát hành';
            case 'Dừng phát hành':
                return 'Dừng phát hành';
            default:
                return 'Không xác định';
        }
    }
    
    function displayVouchers(vouchers, listId, noticeId) {
        const voucherList = document.getElementById(listId);
        const notice = document.getElementById(noticeId);
        voucherList.innerHTML = '';
        if (vouchers.length === 0) {
            notice.style.display = 'block';
            return;
        }
        notice.style.display = 'none';
        vouchers.forEach(voucher => {
            const card = document.createElement('div');
            card.classList.add('card', 'mb-3');
            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');
            const cardTitle = document.createElement('h5');
            cardTitle.classList.add('card-title');
            cardTitle.textContent = voucher.tengiamgia;
            const cardText = document.createElement('p');
            cardText.classList.add('card-text');
            cardText.textContent = `Giá trị: ${voucher.giatri} ${voucher.donvi}`;
            const cardStatus = document.createElement('p');
            cardStatus.classList.add('card-text');
            cardStatus.textContent = `Trạng thái: ${voucher.trangthai}`;
            cardBody.appendChild(cardTitle);
            cardBody.appendChild(cardText);
            cardBody.appendChild(cardStatus);
            card.appendChild(cardBody);
            voucherList.appendChild(card);
        });
    }
    
    
    
    

    function displayVouchers(vouchers, listContainerId, noticeId) {
        const voucherListContainer = document.getElementById(listContainerId);
        const voucherNotice = document.getElementById(noticeId);

        voucherListContainer.innerHTML = '';

        if (vouchers.length === 0) {
            voucherNotice.style.display = 'block';
        } else {
            voucherNotice.style.display = 'none';
            vouchers.forEach((voucher) => {
                const voucherCol = document.createElement('div');
                voucherCol.classList.add('col-md-6', 'col-lg-4', 'mb-3');

                const card = document.createElement('div');
                card.classList.add('card', 'voucher-card', 'h-100');

                const cardBody = document.createElement('div');
                cardBody.classList.add('card-body');

                const cardTitle = document.createElement('h5');
                cardTitle.classList.add('card-title');
                cardTitle.textContent = voucher.mota;

                const cardValue = document.createElement('p');
                cardValue.classList.add('card-text', 'voucher-value');
                if (voucher.donvi === '%' || voucher.donvi === 'VND') {
                    const formattedValue = voucher.giatri >= 1000
                        ? voucher.giatri.toLocaleString('vi-VN')
                        : voucher.giatri;
                    cardValue.textContent = `Giảm: ${formattedValue} ${voucher.donvi}`;
                }

                const cardDates = document.createElement('p');
                cardDates.classList.add('card-text', 'voucher-dates');
                cardDates.textContent = `Hiệu lực: ${formatDate(voucher.ngaybatdau)} - ${formatDate(voucher.ngayketthuc)}`;

                const cardStatus = document.createElement('p');
                cardStatus.classList.add('card-text');
                cardStatus.textContent = `Trạng thái: ${interpretStatus(voucher.trangthai)}`;

                cardBody.appendChild(cardTitle);
                cardBody.appendChild(cardValue);
                cardBody.appendChild(cardDates);
                cardBody.appendChild(cardStatus);
                card.appendChild(cardBody);
                voucherCol.appendChild(card);

                voucherListContainer.appendChild(voucherCol);
            });
        }
    }

    // Gọi hàm fetchVouchers khi trang được tải
    document.addEventListener('DOMContentLoaded', fetchVouchers);

fetchVouchers();
});