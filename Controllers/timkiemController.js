app.controller('timkiemController', function ($scope, $routeParams, $http) {
  $scope.searchKey = $routeParams.search;
  $scope.filteredResults = [];
  $scope.displayResults = [];
  $scope.errorMessage = '';
  $scope.priceFilter = { min: null, max: null };
  $scope.brandFilter = [];

  // Fetch brand data
  $http.get('https://localhost:7297/api/Thuonghieu')
    .then(function (response) {
      $scope.dataThuonghieu = response.data;
    })
    .catch(function (error) {
      console.error('API Error:', error);
    });

  // Fetch search results from API
  $http.get(`https://localhost:7297/api/Sanpham/search?name=${encodeURIComponent($scope.searchKey)}`)
    .then(function (response) {
      $scope.filteredResults = response.data;
      $scope.displayResults = [...$scope.filteredResults];
    })
    .catch(function (error) {
      $scope.errorMessage = 'Không thể tải dữ liệu từ server. Vui lòng thử lại!';
      console.error('API Error:', error);
    });

  // Apply all filters on button click
  $scope.applyAllFilters = function () {
    const minPrice = $scope.priceFilter.min || 0;
    const maxPrice = $scope.priceFilter.max || Infinity;

    const selectedBrands = Object.keys($scope.brandFilter).filter(key => $scope.brandFilter[key]);

    $scope.displayResults = $scope.filteredResults.filter(item => {
      const matchesPrice = item.giaban >= minPrice && item.giaban <= maxPrice;
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(String(item.idth));
      return matchesPrice && matchesBrand;
    });
  };

  // Reset Filters
  $scope.resetFilters = function () {
    $scope.priceFilter.min = null;
    $scope.priceFilter.max = null;
    $scope.brandFilter = [];
    $scope.displayResults = [...$scope.filteredResults];
  };
});//<!--gaaaa-->//<!--gaaaa-->//<!--gaaaa-->//<!--gaaaa-->//;lll