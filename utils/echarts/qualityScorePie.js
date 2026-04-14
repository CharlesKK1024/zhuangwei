(function () {
  let qualityScorePieChart = null;
  let qualityScorePieData = null; // This will hold the parsed JSON array
  let currentQualityScorePieLevel = "province"; // province, city, district
  let currentQualityScorePieCity = "";
  let currentQualityScorePieDistrict = "";

  function initQualityScorePieChart() {
    const chartDom = document.getElementById("qualityScorePieChart");
    if (!chartDom) return;
    qualityScorePieChart = echarts.init(chartDom);
    window.addEventListener("resize", () => {
      qualityScorePieChart.resize();
    });
  }

  async function loadQualityScorePieData() {
    const data = await Requests.fetchQualityScorePie();
    if (data) {
      qualityScorePieData = data;
      renderQualityScorePieChart();
    } else {
      console.error("Failed to load quality score pie data.");
    }
  }

  // Normalize city names like "贵阳市" -> "贵阳", "黔南布依族苗族自治州" -> "黔南"
  function normalizeCityName(name) {
    if (!name) return name;
    let normalized = name.replace(/市$/, '');
    normalized = normalized.replace(/苗族侗族自治州$/, '');
    normalized = normalized.replace(/布依族苗族自治州$/, '');
    return normalized;
  }

  function monthToChinese(monthNum) {
    const map = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    return map[monthNum - 1] || "";
  }

  function getNoDataOption() {
    return {
      title: {
        text: '装维人员得分情况',
        left: 'center'
      },
      graphic: {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: '暂无数据',
              fill: '#999',
              font: '14px Microsoft YaHei'
            }
          }
        ]
      },
      series: [] // 清空 series，不显示饼图
    };
  }

  function getQualityScorePieOption() {
    // console.log("getQualityScorePieOption called.");
    let v90 = 0;
    let v70_90 = 0;
    let v70 = 0;

    if (!qualityScorePieData || qualityScorePieData.length === 0) {
      // console.log("qualityScorePieData is empty or null, returning no data option.");
      return getNoDataOption();
    }

    let monthData = null;
    const monthInput = document.getElementById("monthInput2");

    if (monthInput && monthInput.value) {
      const monthNum = parseInt(monthInput.value.split("-")[1], 10); // 获取月份数字，例如 3
      const selectedMonthStr = monthNum + "月"; // 格式化为 "3月"

      // 尝试匹配 item.month 或 item.name
      monthData = qualityScorePieData.find(item => {
        // 匹配 "3月" 或 "三月"
        return (item.month === selectedMonthStr) || (item.name === monthToChinese(monthNum));
      });
      // console.log("Selected month from input:", monthInput.value, "Parsed:", selectedMonthStr, "Found monthData:", monthData);
    } else {
      // 如果没有月份选择，默认取最后一个月的数据
      monthData = qualityScorePieData[qualityScorePieData.length - 1];
      // console.log("No month input, defaulting to last month:", monthData);
    }

    // --- 关键修改：如果没有找到对应月份的数据，直接返回“暂无数据” ---
    if (!monthData) {
      // console.log("No monthData found for selected criteria, returning no data option.");
      return getNoDataOption();
    }

    let currentItem = null;
    if (currentQualityScorePieLevel === "province") {
      // 全省数据
      currentItem = (monthData.province_data || []).find(d => d["地市"] === "全省");
    } else if (currentQualityScorePieLevel === "city") {
      // 某地市的数据（从 province_data 里取地市汇总）
      const normCity = normalizeCityName(currentQualityScorePieCity);
      currentItem = (monthData.province_data || []).find(d => d["地市"] === normCity);
    } else if (currentQualityScorePieLevel === "district") {
      // 某区县的数据
      const normCity = normalizeCityName(currentQualityScorePieCity);
      const cityDistricts = (monthData.city_data || {})[normCity] || [];
      currentItem = cityDistricts.find(d => d["区县"] === currentQualityScorePieDistrict);
    }

    if (currentItem) {
      v90 = currentItem["90分以上人数"] || 0;
      v70_90 = currentItem["70-90分人数"] || 0;
      v70 = currentItem["小于70分人数"] || 0;
    }

    // 关键修改：必须使用 clear 方法清除旧的图形，防止 graphic 残留，同时也要在数据有效时清除 graphic
    if (v90 === 0 && v70_90 === 0 && v70 === 0) {
      return getNoDataOption();
    }

    console.log("Returning chart option with data:", { v90, v70_90, v70 });

    return {
      title: {
        text: '装维人员得分情况',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['90分以上占比', '70-90分占比', '70分以下占比']
      },
      color: ['#4f46e5', '#86efac', '#fbbf24'],
      series: [
        {
          name: '得分情况',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: [
            { value: v90, name: '90分以上占比' },
            { value: v70_90, name: '70-90分占比' },
            { value: v70, name: '70分以下占比' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }

  function renderQualityScorePieChart() {
    if (!qualityScorePieChart || !qualityScorePieData) return;

    // 清除之前的配置，防止 graphic 残留（特别是在从“暂无数据”切换到有数据时）
    qualityScorePieChart.clear();
    
    const option = getQualityScorePieOption();
    qualityScorePieChart.setOption(option, true); // true 表示不合并，强制更新
  }

  // 被外部调用来更新选择状态
  function refreshQualityScorePieChart(state) {
    if (!state) return;
    if (state.district) {
      currentQualityScorePieLevel = "district";
      currentQualityScorePieCity = state.city;
      currentQualityScorePieDistrict = state.district;
    } else if (state.city) {
      currentQualityScorePieLevel = "city";
      currentQualityScorePieCity = state.city;
      currentQualityScorePieDistrict = "";
    } else {
      currentQualityScorePieLevel = "province";
      currentQualityScorePieCity = "";
      currentQualityScorePieDistrict = "";
    }
    renderQualityScorePieChart();
  }

  // Expose to global scope
  window.initQualityScorePieChart = initQualityScorePieChart;
  window.loadQualityScorePieData = loadQualityScorePieData;
  window.renderQualityScorePieChart = renderQualityScorePieChart;
  window.refreshQualityScorePieChart = refreshQualityScorePieChart;
})();