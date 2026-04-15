(function () {
  function toFiniteNumber(val) {
    if (val == null || val === "") return null;
    var num = Number(val);
    return Number.isFinite(num) ? num : null;
  }

  function roundNiceMax(maxVal) {
    if (!Number.isFinite(maxVal) || maxVal <= 0) return 100;
    var step = 10;
    var v = Math.ceil(maxVal / step) * step;
    return v < 10 ? 10 : v;
  }

  function roundNiceMaxNumber(maxVal) {
    if (!Number.isFinite(maxVal) || maxVal <= 0) return 10;
    var step = 10;
    var v = Math.ceil(maxVal / step) * step;
    return v < 10 ? 10 : v;
  }

  // 提取通用的极值计算函数
  function getMinMax(list) {
    var validValues = (list || []).filter(function (v) {
      return Number.isFinite(v);
    });
    
    if (validValues.length === 0) return null;
    
    var min = Math.min.apply(Math, validValues);
    var max = Math.max.apply(Math, validValues);
    
    return { 
      min: min, 
      max: max,
      validValues: validValues,
      range: max - min
    };
  }

  // 通用的Y轴范围计算函数（百分比）
  function calcPercentAxisBounds(values) {
    var mm = getMinMax(values);
    if (!mm) return { min: 0, max: 100 };
    
    var minV = mm.min;
    var maxV = mm.max;
    var range = mm.range;
    var validCount = mm.validValues.length;
    
    var padRatio = 0.2;
    if (range < 10) padRatio = 0.3;
    if (range < 5) padRatio = 0.5;
    
    var pad = range * padRatio;
    if (!Number.isFinite(pad) || pad < 1) pad = 2;
    
    if (range <= 0 || validCount <= 1) {
      var base = Math.max(5, Math.abs(maxV) * 0.2);
      minV = Math.max(0, minV - base);
      maxV = Math.min(100, maxV + base);
    } else {
      minV = Math.max(0, Math.floor(minV - pad));
      maxV = Math.min(100, Math.ceil(maxV + pad));
    }
    
    if (maxV - minV < 10) {
      var center = (minV + maxV) / 2;
      var halfRange = 5;
      minV = Math.max(0, Math.floor(center - halfRange));
      maxV = Math.min(100, Math.ceil(center + halfRange));
    }
    
    if (maxV <= minV) return { min: 0, max: 100 };
    return { min: minV, max: maxV };
  }

  // 通用的Y轴范围计算函数（数值）
  function calcNumberAxisBounds(values) {
    var mm = getMinMax(values);
    if (!mm) return { min: 0, max: 10 };
    
    var minV = mm.min;
    var maxV = mm.max;
    var range = mm.range;
    var validCount = mm.validValues.length;
    
    var padRatio = 0.2;
    if (range < 20) padRatio = 0.3;
    if (range < 10) padRatio = 0.5;
    
    var pad = range * padRatio;
    if (!Number.isFinite(pad) || pad < 1) pad = 5;
    
    if (range <= 0 || validCount <= 1) {
      var base = Math.max(10, Math.abs(maxV) * 0.2);
      minV = Math.max(0, minV - base);
      maxV = maxV + base;
    } else {
      minV = Math.max(0, Math.floor(minV - pad));
      maxV = Math.ceil(maxV + pad);
    }
    
    if (maxV - minV < 20) {
      var center = (minV + maxV) / 2;
      var halfRange = 10;
      minV = Math.max(0, Math.floor(center - halfRange));
      maxV = Math.ceil(center + halfRange);
    }
    
    if (maxV <= minV) return { min: 0, max: roundNiceMaxNumber(maxV) };
    return { min: minV, max: maxV };
  }

  function format2(val) {
    if (val == null) return "-";
    var num = Number(val);
    if (!Number.isFinite(num)) return "-";
    return num.toFixed(2);
  }

  // 重构：提取获取有效数据的函数
  function getValidSeriesData(seriesList, visibleSeriesNames) {
    var percentData = [];
    var workOrderData = [];
    
    seriesList.forEach(function (series) {
      // 只处理显示的系列
      if (visibleSeriesNames && !visibleSeriesNames.includes(series.name)) {
        return;
      }
      
      var data = series.data || [];
      var validData = data.filter(function (v) {
        return Number.isFinite(v);
      });
      
      // 区分百分比系列和工单量系列
      if (series.yAxisIndex === 1) {
        workOrderData = workOrderData.concat(validData);
      } else {
        percentData = percentData.concat(validData);
      }
    });
    
    return {
      percentData: percentData,
      workOrderData: workOrderData
    };
  }

  function buildSeries(months) {
    var names = months.map(function (m) { return m && m.name ? String(m.name) : ""; });
    var once = months.map(function (m) { return toFiniteNumber(m && m.once_answer_rate); });
    var real = months.map(function (m) { return toFiniteNumber(m && m.real_answer_rate); });
    var lowSatisfaction = months.map(function (m) { return toFiniteNumber(m && m.low_satisfaction_repair_rate); });
    var accWorkOrder = months.map(function (m) { return toFiniteNumber(m && m.accumulated_work_order); });
    var serviceLevel = months.map(function (m) { return toFiniteNumber(m && m.overall_service_level); });
    
    var seriesList = [
      {
        name: "一次接听率",
        type: "line",
        smooth: true,
        connectNulls: false,
        data: once,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3 },
      },
      {
        name: "真实接听率",
        type: "line",
        smooth: true,
        connectNulls: false,
        data: real,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3 },
      },
      {
        name: "低满意度修复率",
        type: "line",
        smooth: true,
        connectNulls: false,
        data: lowSatisfaction,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3 },
      },
      {
        name: "累积工单及时率",
        type: "line",
        smooth: true,
        connectNulls: false,
        data: accWorkOrder,
        yAxisIndex: 1,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3 },
      },
      {
        name: "服务水平",
        type: "line",
        smooth: true,
        connectNulls: false,
        data: serviceLevel,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3 },
      },
    ];
    
    // 初始化时获取所有数据的轴范围
    var initData = getValidSeriesData(seriesList);
    var percentAxis = calcPercentAxisBounds(initData.percentData);
    var workOrderAxis = calcNumberAxisBounds(initData.workOrderData);
    
    return {
      names: names,
      percentAxis: percentAxis,
      workOrderAxis: workOrderAxis,
      series: seriesList
    };
  }

  function init(domId, item) {
    if (!window.echarts) throw new Error("echarts 未加载");
    var el = typeof domId === "string" ? document.getElementById(domId) : domId;
    if (!el) throw new Error("找不到图表容器");
    var months = Array.isArray(item && item.months) ? item.months : [];
    var built = buildSeries(months);
    
    var chart = window.echarts.init(el);
    var option = {
      color: ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899"],
      tooltip: {
        trigger: "axis",
        valueFormatter: function (value) { return format2(value); },
        formatter: function (params) {
          if (!params || !params.length) return "";
          var axisValue = params[0] && params[0].axisValueLabel ? params[0].axisValueLabel : "";
          var lines = [axisValue];
          params.forEach(function (p) {
            var name = p && p.seriesName ? p.seriesName : "";
            var v = p && p.value != null ? p.value : null;
            // 累积工单量如果只是数值则不加%，但目前看起来它是及时率
            var suffix = (name === "累积工单量") ? "" : "%";
            lines.push(
              (p.marker || "") + name + "　" + (v == null ? "-" : format2(v) + suffix),
            );
          });
          return lines.join("<br/>");
        },
      },
      legend: [
        {
          top: 0,
          data: ["一次接听率", "真实接听率", "低满意度修复率"],
          textStyle: { color: "#334155", fontSize: 12 },
          selectedMode: true
        },
        {
          top: 25,
          data: ["累积工单及时率", "服务水平"],
          textStyle: { color: "#334155", fontSize: 12 },
          selectedMode: true
        }
      ],
      grid: { left: 16, right: 16, top: 75, bottom: 16, containLabel: true },
      xAxis: {
        type: "category",
        data: built.names,
        axisLine: { lineStyle: { color: "rgba(148,163,184,0.7)" } },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 12 },
      },
      yAxis: [
        {
          type: "value",
          min: built.percentAxis.min,
          max: built.percentAxis.max,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "#64748b",
            fontSize: 12,
            formatter: function (v) { return v + "%"; },
          },
          splitLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
        },
        {
          type: "value",
          min: built.workOrderAxis.min,
          max: built.workOrderAxis.max,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "#64748b", fontSize: 12 },
          splitLine: { show: false },
        },
      ],
      series: built.series,
    };

    chart.setOption(option);

    // 核心：监听图例点击事件，动态更新Y轴范围
    chart.on('legendselectchanged', function (params) {
      // 获取当前显示的系列名称
      var visibleSeriesNames = [];
      for (var name in params.selected) {
        if (params.selected[name]) {
          visibleSeriesNames.push(name);
        }
      }
      
      // 获取当前显示系列的有效数据
      var validData = getValidSeriesData(built.series, visibleSeriesNames);
      
      // 重新计算Y轴范围
      var newPercentAxis = calcPercentAxisBounds(validData.percentData);
      var newWorkOrderAxis = calcNumberAxisBounds(validData.workOrderData);
      
      // 更新Y轴配置（只更新min/max，保留其他样式）
      chart.setOption({
        yAxis: [
          {
            min: newPercentAxis.min,
            max: newPercentAxis.max
          },
          {
            min: newWorkOrderAxis.min,
            max: newWorkOrderAxis.max
          }
        ]
      });
    });

    // 窗口自适应
    window.addEventListener('resize', function() {
      chart.resize();
    });
    
    return chart;
  }

  window.QualityStat2Chart = { init: init };
})();
