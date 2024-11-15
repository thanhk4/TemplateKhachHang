app.controller("SanPhamChiTietCtrl", function ($scope, $document) {
    let link = angular.element('<link rel="stylesheet" href="css/SanPhamChiTiet.css">');
    $document.find('head').append(link);

    const quantityInput = document.getElementById('quantity');
    const incrementButton = document.getElementById('button-addon2');
    const decrementButton = document.getElementById('button-addon1');

    incrementButton.addEventListener('click', () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    });

    decrementButton.addEventListener('click', () => {
        if (parseInt(quantityInput.value) > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
        }
    });

    quantityInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
})
    ;