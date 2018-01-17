angular
  .module('glucoseNotes.controllers')
  .controller('ChartCtrl', function(
    $scope,
    $timeout,
    Helpers,
    MeasurementService,
    MeasurementTypes,
    User
  ) {
    // Vars
    var getTimeAgo = Helpers.getTimeAgo;
    var countDiff = Helpers.countDiff;
    var formatMeasurement = Helpers.formatMeasurement;
    var unwatch;
    var colors = ['#666', '#5a77ed'];
    var periodAgo = 0;
    var measurementData;

    // Get Username
    $scope.userName = User.get();

    // Watch update data
    var dataUpdateWatcher = function(changeEvent) {
      if (changeEvent.event === 'child_added') {
        loadPeriodData();
      }
    };

    // # Load data
    var loadPeriodData = function(direction) {
      // Do not load if still loading
      if ($scope.loading) {
        return;
      }

      // Set the period
      if (direction) {
        periodAgo += direction;
      }

      $scope.loading = true;

      MeasurementService.findByUser($scope.userName)
        .$loaded()
        .then(function(data) {
          // Stop loading
          $scope.loading = false;

          // Set watcher
          unwatch = data.$watch(dataUpdateWatcher);

          // Filter by period
          $scope.measurementData = _.filter(data, function(d) {
            return Helpers.filterDataByPeriod(d, periodAgo);
          });

          // Draw Chart
          initChart($scope.measurementData);
        });
    };

    // # Periodic data
    var periodAgo = 0;
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

    $scope.getTotalRatingsForDate = function(type) {
      var format = getPeriodFormats(chosenPeriod);
      var momentDate = moment().subtract(periodAgo, format.id);
      var measurementsForType = ($scope.measurementData || []).filter(function(measurement) {
        return (
          measurement[MeasurementTypes[type]] &&
          momentDate.isSame(moment(measurement.added), chosenPeriod)
        );
      });

      var avg = '--';

      if (measurementsForType.length) {
        avg = _.round(
          (measurementsForType || []).reduce(function(acc, measurement) {
            return acc + (measurement[MeasurementTypes[type]] || 0);
          }, 0) / measurementsForType.length,
          1
        );
      }

      return `${avg}`;
    };

    $scope.loadPrevPeriod = function() {
      loadPeriodData(1);
    };
    $scope.loadNextPeriod = function() {
      loadPeriodData(-1);
    };

    $scope.resetPeriodNavigation = function() {
      periodAgo = 0;
      loadPeriodData();
    };

    // # Load data on enter
    loadPeriodData();
    // $scope.$on('$ionicView.enter', loadPeriodData);

    // # Initialize Chart
    var initChart = function(data) {
      var series1 = data.map(function(item, index) {
        return {
          y: item[MeasurementTypes.LIBRE] || null,
          x: index,
          date: item.added,
          dataColor: colors[1],
        };
      });

      var series2 = data.map(function(item, index) {
        return {
          y: item[MeasurementTypes.ACCU] || null,
          x: index,
          date: item.added,
          dataColor: colors[0],
        };
      });

      Highcharts.chart('chart-container', {
        lang: {
          noData: 'No data for selected week',
        },
        chart: {
          backgroundColor: 'transparent',
          type: 'spline',
          style: {
            fontFamily: 'Work Sans',
          },
        },
        credits: {
          enabled: false,
        },
        title: {
          text: '',
        },

        yAxis: {
          title: {
            enabled: false,
          },
          min: 0,
        },
        xAxis: {
          labels: {
            enabled: false,
          },
          tickWidth: 0,
          lineWidth: 0,
        },
        legend: {
          enabled: true,
          align: 'left',
        },
        tooltip: {
          shared: true,
          animation: false,
          shadow: 0,
          padding: 0,
          borderWidth: 0,
          backgroundColor: 'rgba(255, 255, 255, 1)',

          useHTML: true,
          formatter: function tooltipFormatter() {
            var header = moment(this.points[0].point.date).format('ddd DD.MM HH:mm');

            var renderBody = point =>
              `<span class="tooltip__value__label" style="color:${point.point.dataColor ||
                point.color}">${point.series.name} <span class="tooltip__value">${formatMeasurement(
                point.y
              )}</span></span>`;

            var body = this.points.map(renderBody).join('');

            return `
              <div class="chart__tooltip">
                <div class="chart__tooltip__header">
                  ${header}
                </div>
                <div class="chart__tooltip__body">
                  ${body}
                </div>
              </div>
            `;
          },
        },
        series: [
          {
            name: MeasurementTypes.LIBRE,
            data: series1,
            color: 'rgba(90, 119, 237, 0.65)',
            marker: {
              fillColor: '#5a77ed',
            },
          },
          {
            name: MeasurementTypes.ACCU,
            data: series2,
            color: 'rgba(102, 102, 102, 0.65)',
            marker: {
              fillColor: '#666',
            },
          },
        ],
        plotOptions: {
          spline: {
            marker: {
              radius: 2,
              lineWidth: 0,
              symbol: 'circle',
              states: {
                hover: {
                  radius: 3,
                  lineWidthPlus: 2,
                },
              },
            },
            states: {
              hover: {
                halo: {
                  size: 8,
                },
                lineWidthPlus: 0,
              },
            },
          },
        },

        noData: {
          position: {
            y: -50,
          },
          style: {
            color: '#BBBBBB',
            fontWeight: 400,
            fontFamily: 'Work Sans',
            fontSize: 13,
          },
        },

        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
            },
          ],
        },
      });
    };
  });
