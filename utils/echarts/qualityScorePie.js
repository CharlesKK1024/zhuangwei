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
        left: 'center',
        top: '10'
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
        left: 'center',
        top: '10'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: '40',
        data: ['90分以上占比', '70-90分占比', '70分以下占比']
      },
      color: ['#4f46e5', '#86efac', '#fbbf24'],
      series: [
        {
          name: '得分情况',
          type: 'pie',
          radius: '50%',
          center: ['50%', '55%'],
          data: [
            { value: v90, name: '90分以上占比' },
            { value: v70_90, name: '70-90分占比' },
            { value: v70, name: '70分以下占比' }
          ],
          label: {
            show: true,
            position: 'outside',
            formatter: function(params) {
              // 显示：名称\n数量 (百分比)
              return params.name + '\n' + params.value + ' (' + params.percent + '%)';
            },
            fontSize: 11,
            color: '#333',
            lineHeight: 14
          },
          labelLine: {
            show: true,
            length: 20,
            length2: 15,
            smooth: 0.2
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          // 添加点击事件
          selectedMode: 'single',
          select: {
            itemStyle: {
              borderColor: '#000',
              borderWidth: 2
            }
          }
        }
      ]
    };
  }

  function renderQualityScorePieChart() {
    if (!qualityScorePieChart || !qualityScorePieData) return;

    // 清除之前的配置，防止 graphic 残留（特别是在从”暂无数据”切换到有数据时）
    qualityScorePieChart.clear();

    const option = getQualityScorePieOption();
    qualityScorePieChart.setOption(option, true); // true 表示不合并，强制更新

    // 添加点击事件监听器
    qualityScorePieChart.off('click'); // 移除之前的事件监听器
    qualityScorePieChart.on('click', function(params) {
      if (params.seriesType === 'pie') {
        handlePieClick(params);
      }
    });
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

  // 处理饼图点击事件
  function handlePieClick(params) {
    const clickedSegment = params.name; // 获取点击的段名称
    console.log('Clicked segment:', clickedSegment);

    // 根据点击的段确定得分档位
    let scoreRange = '';
    if (clickedSegment === '90分以上占比') {
      scoreRange = '90以上';
    } else if (clickedSegment === '70-90分占比') {
      scoreRange = '70-90';
    } else if (clickedSegment === '70分以下占比') {
      scoreRange = '小于70';
    }

    if (!scoreRange) return;

    // 获取当前选中的月份数据
    const currentMonthData = getCurrentMonthData();
    if (currentMonthData && currentMonthData.district_detail_data) {
      // 过滤出对应得分档位的数据
      const filteredData = filterDataByScoreRange(currentMonthData.district_detail_data, scoreRange);
      // 显示弹窗
      showDetailModal(clickedSegment, filteredData, scoreRange);
    } else {
      console.error('未找到当前月份的详细数据');
    }
  }

  // 获取当前选中的月份数据
  function getCurrentMonthData() {
    if (!qualityScorePieData || qualityScorePieData.length === 0) {
      return null;
    }

    const monthInput = document.getElementById("monthInput2");
    let monthData = null;

    if (monthInput && monthInput.value) {
      const monthNum = parseInt(monthInput.value.split("-")[1], 10); // 获取月份数字，例如 3
      const selectedMonthStr = monthNum + "月"; // 格式化为 "3月"

      // 尝试匹配 item.month 或 item.name
      monthData = qualityScorePieData.find(item => {
        // 匹配 "3月" 或 "三月"
        return (item.month === selectedMonthStr) || (item.name === monthToChinese(monthNum));
      });
    } else {
      // 如果没有月份选择，默认取最后一个月的数据
      monthData = qualityScorePieData[qualityScorePieData.length - 1];
    }

    return monthData;
  }

  // 根据得分档位过滤数据
  function filterDataByScoreRange(districtData, scoreRange) {
    const result = [];

    for (const [city, districts] of Object.entries(districtData)) {
      for (const [district, people] of Object.entries(districts)) {
        const filteredPeople = people.filter(person => person.得分档位 === scoreRange);
        if (filteredPeople.length > 0) {
          result.push({
            city: city,
            district: district,
            people: filteredPeople
          });
        }
      }
    }

    return result;
  }

  // 灵活的字符串匹配函数
  function fuzzyMatch(str1, str2) {
    if (!str1 || !str2) return false;

    // 移除常见后缀
    const removeSuffixes = (str) => {
      return str.replace(/(市|县|区|州|服务中心|支撑|特区|特区)$/g, '');
    };

    // 提取前2-3个字符进行匹配
    const getPrefix = (str, len = 2) => {
      return str.substring(0, len);
    };

    const cleanStr1 = removeSuffixes(str1);
    const cleanStr2 = removeSuffixes(str2);

    // 多种匹配方式
    return cleanStr1 === cleanStr2 ||
           getPrefix(str1, 2) === getPrefix(str2, 2) ||
           getPrefix(str1, 3) === getPrefix(str2, 3) ||
           cleanStr1.includes(cleanStr2) ||
           cleanStr2.includes(cleanStr1);
  }

  // 显示详细数据弹窗
  function showDetailModal(title, data, scoreRange) {
    // 创建弹窗元素
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.style.fontFamily = 'Microsoft YaHei, sans-serif';

    // 计算总人数
    const totalPeople = data.reduce((sum, item) => sum + item.people.length, 0);

    // 创建弹窗内容
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-4xl max-h-[80vh] overflow-hidden" style="min-width: 600px;">
        <div class="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 class="text-lg font-semibold">${title} - 详细数据 (共${totalPeople}人)</h2>
          <button class="text-white hover:text-gray-200 text-xl font-bold" onclick="this.closest('.fixed').remove()">×</button>
        </div>
        <div class="p-4 overflow-y-auto" style="max-height: calc(80vh - 80px);">
          <div class="space-y-4">
            ${data.map(region => {
              // 简化地区名称显示
              const cleanDistrictName = region.district
                .replace(/支撑服务中心$/, '')
                .replace(/服务中心$/, '')
                .replace(/区$/, '')
                .replace(/市$/, '')
                .replace(/县$/, '');

              return `
              <div class="border rounded-lg p-3">
                <h3 class="font-semibold text-blue-700 mb-2">${region.city} - ${cleanDistrictName} (${region.people.length}人)</h3>
                <div class="overflow-x-auto">
                  <table class="min-w-full text-sm">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-2 py-1 text-left">姓名</th>
                        <th class="px-2 py-1 text-left">工作号</th>
                        <th class="px-2 py-1 text-left">一次接通率</th>
                        <th class="px-2 py-1 text-left">真实接通率</th>
                        <th class="px-2 py-1 text-left">及时率</th>
                        <th class="px-2 py-1 text-left">总分</th>
                        <th class="px-2 py-1 text-left">扣罚情况</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${region.people.map(person => `
                        <tr class="border-t hover:bg-gray-50">
                          <td class="px-2 py-1">${person.姓名}</td>
                          <td class="px-2 py-1">${person.工作号}</td>
                          <td class="px-2 py-1">${person.一次接通率.toFixed(2)}%</td>
                          <td class="px-2 py-1">${person.真实接通率.toFixed(2)}%</td>
                          <td class="px-2 py-1">${person.及时率40}%</td>
                          <td class="px-2 py-1 font-semibold ${person.总分 >= 90 ? 'text-green-600' : person.总分 >= 70 ? 'text-yellow-600' : 'text-red-600'}">${person.总分.toFixed(2)}</td>
                          <td class="px-2 py-1">${person.扣罚情况}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
            }).join('')}
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 flex justify-end">
          <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onclick="this.closest('.fixed').remove()">关闭</button>
        </div>
      </div>
    `;

    // 添加到页面
    document.body.appendChild(modal);

    // 点击背景关闭弹窗
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // ESC键关闭弹窗
    const escHandler = function(e) {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // Expose to global scope
  window.initQualityScorePieChart = initQualityScorePieChart;
  window.loadQualityScorePieData = loadQualityScorePieData;
  window.renderQualityScorePieChart = renderQualityScorePieChart;
  window.refreshQualityScorePieChart = refreshQualityScorePieChart;
})();