angular
  .module('glucoseNotes.controllers')
  .controller('FeedCtrl', function(
    $scope,
    SmileyService,
    $timeout,
    User,
    Helpers,
    MeasurementTypes
  ) {
    // # Types
    $scope.measurementTypes = MeasurementTypes;
    $scope.visibleTypes = [MeasurementTypes.LIBRE, MeasurementTypes.ACCU];
    $scope.diffType = MeasurementTypes.ACCU;

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

    // # User
    $scope.userName = User.get();
    $scope.$on('$ionicView.enter', function() {
      $timeout(function() {
        $scope.userName = User.get();
      });
    });

    $scope.hasNoData = function() {
      return !$scope.items || _.isEmpty($scope.items);
    };

    // List mode toggle
    $scope.listMode = false;

    // Show dates
    $scope.showDates = true;

    var periodLabelFormat = 'YYYY-W';

    // Load content
    $scope.lastChecked = User.lastChecked();
    $scope.items = [];
    var periodAgo = 0;

    var getLoadDate = function(periodsAgo) {
      var ago = periodsAgo || 0;
      return moment()
        .startOf('week')
        .subtract(ago, 'weeks')
        .valueOf();
    };

    $scope.loading = true;

    // , getLoadDate(periodAgo)
    SmileyService.findByUser($scope.userName)
      .$loaded()
      .then(function(data) {
        $scope.measurements = data;
        $scope.loading = false;
      });

    //  Get time passed from last action
    $scope.getTimeAgo = Helpers.getTimeAgo;
    $scope.countDiff = Helpers.countDiff;
    $scope.formatMeasurement = Helpers.formatMeasurement;

    // Load more data
    loadPeriodData = function(direction) {
      if ($scope.loading) {
        return;
      }

      if (direction) {
        periodAgo += direction;
      }

      $scope.loading = true;
      var before = getLoadDate(periodAgo);
      var after = getLoadDate(periodAgo - 1);

      SmileyService.findByUser($scope.userName, before, after)
        .$loaded()
        .then(function(data) {
          $scope.measurements = data;
          $scope.loading = false;
        });
    };

    $scope.loadPrevPeriod = function() {
      loadPeriodData(1);
    };
    $scope.loadNextPeriod = function() {
      loadPeriodData(-1);
    };

    // Period (day, week) based content splitting
    var periods = {
      WEEK: 'week',
      DAY: 'day',
    };

    var chosenPeriod = periods.WEEK;
    var startDate = moment().startOf('week');
    var prevStartDate = moment()
      .subtract(1, 'week')
      .startOf('week');

    var getPeriodFormats = function(period) {
      switch (period) {
        case periods.WEEK:
          return {
            same: 'This Week',
            prev: 'Last Week',
            dateString: 'Week ',
            dateFormat: 'w',
            id: 'weeks',
          };

        case periods.DAY:
          return {
            same: 'Today',
            prev: 'Yesteday',
            dateString: '',
            dateFormat: 'ddd D.M.',
            id: 'days',
          };
      }
    };

    $scope.isNextWeekInFuture = function() {
      return periodAgo <= 0;
    };

    $scope.isNextWeekInFuture = function() {
      return periodAgo <= 0;
    };

    $scope.isInSamePeriod = function(a, b) {
      return a && b && moment(a).isSame(moment(b), chosenPeriod);
    };

    $scope.getPeriodLabel = function() {
      var format = getPeriodFormats(chosenPeriod);
      var momentDate = moment().subtract(periodAgo, format.id);

      if (momentDate.isSame(startDate, chosenPeriod)) {
        return format.same;
      }

      if (momentDate.isSame(prevStartDate, chosenPeriod)) {
        return format.prev;
      }

      return format.dateString + momentDate.format(format.dateFormat);
    };

    $scope.getTotalRatingsForDate = function(date) {
      var format = getPeriodFormats(chosenPeriod);
      var momentDate = moment().subtract(periodAgo, format.id);

      var totalRatedPostsForDate = ($scope.items || []).filter(function(smiley) {
        return smiley.rate && momentDate.isSame(moment(smiley.added), chosenPeriod);
      });

      if (totalRatedPostsForDate.length === 0) {
        return '-';
      }

      var avg =
        (totalRatedPostsForDate || []).reduce(function(acc, smiley) {
          return acc + (smiley.rate || 0);
        }, 0) / totalRatedPostsForDate.length;

      return avg.toFixed(1);
    };

    $scope.resetPeriodNavigation = function() {
      periodAgo = 0;
      loadPeriodData();
    };

    $scope.visibleDialogId = '';
    $scope.showMeasurementDialog = function(id) {
      $scope.visibleDialogId = id;
    };

    $scope.removeMeasurement = function(measurement) {
      console.log(measurement);
      if (confirm('Remove measurement?')) {
        $scope.measurements.$remove(measurement);
        $scope.showMeasurementDialog(null);
      }
    };
  });
