angular
  .module('glucoseNotes.controllers')
  .controller('ChartCtrl', function(
    $scope,
    SmileyService,
    $timeout,
    User,
    Helpers,
    MeasurementTypes
  ) {
    // Vars
    var getTimeAgo = Helpers.getTimeAgo;
    var countDiff = Helpers.countDiff;
    var formatMeasurement = Helpers.formatMeasurement;
    var unwatch;
    var colors = ['#666', '#5a77ed'];

    // Get Username
    $scope.userName = User.get();

    // Watch update data
    var dataUpdateWatcher = function(changeEvent) {
      if (changeEvent.event === 'child_added') {
        loadData();
      }
    };

    // # Load data
    var loadData = function() {
      $scope.loading = true;
      SmileyService.findByUser($scope.userName)
        .$loaded()
        .then(function(data) {
          $scope.measurements = data;
          $scope.loading = false;

          unwatch = data.$watch(dataUpdateWatcher);

          initChart(data);
        });
    };

    // # Load data on enter
    loadData();
    $scope.$on('$ionicView.enter', loadData);

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
          // type: 'datetime',
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
