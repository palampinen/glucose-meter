angular
  .module('glucoseNotes.controllers')
  .controller('FeedCtrl', function(
    $scope,
    $timeout,
    Helpers,
    MeasurementService,
    MeasurementTypes,
    User
  ) {
    $scope.loading = true;

    // # User
    var getUser = User.get;
    $scope.userName = getUser();
    $scope.$on('$ionicView.enter', function() {
      $timeout(getUser);
    });

    // # Types
    $scope.measurementTypes = MeasurementTypes;
    $scope.visibleTypes = [MeasurementTypes.LIBRE, MeasurementTypes.ACCU];
    $scope.diffType = MeasurementTypes.ACCU;

    // # Measurement Average
    $scope.measurementAverage = function(type) {
      var measurementsForType = ($scope.measurements || [])
        .map(function(m) {
          return m[type];
        })
        .filter(function(m) {
          return !_.isNil(m);
        });

      if (!measurementsForType || !measurementsForType.length) {
        return null;
      }

      return (
        measurementsForType.reduce(function(acc, measurement) {
          return acc + (parseFloat(measurement) || 0);
        }, 0) / measurementsForType.length
      );
    };

    $scope.hasNoData = function() {
      return !$scope.items || _.isEmpty($scope.items);
    };

    // # Load & bind data
    MeasurementService.findByUser($scope.userName)
      .$loaded()
      .then(function(data) {
        $scope.measurements = data;
        $scope.loading = false;
      });

    // # Get time passed from last action
    $scope.getTimeAgo = Helpers.getTimeAgo;
    $scope.countDiff = Helpers.countDiff;
    $scope.formatMeasurement = Helpers.formatMeasurement;

    // # Toggle measurement
    $scope.visibleDialogId = '';
    $scope.showMeasurementDialog = function(id) {
      $scope.visibleDialogId = id;
    };

    // # Remove measurement
    $scope.removeMeasurement = function(measurement) {
      if (confirm('Remove measurement?')) {
        $scope.measurements.$remove(measurement);
        $scope.showMeasurementDialog(null);
      }
    };
  });
