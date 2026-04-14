(function () {
  let TableHeaders = {
    statistics: {
      province: [
        "地市",
        "呼入总量",
        "一次接听量",
        "一次接听率(%)",
        "回拨次数",
        "真实未接通次数",
        "真实接听率(%)",
        "命中数量（户）",
        "外呼接通次数",
        "当日派单量",
        "累积已处理量",
        "累积在途工单量",
        "累积工单及时率(%)",
        "超时工单量",
      ],
      city: [
        "区县",
        "呼入总量",
        "一次接听量",
        "一次接听率(%)",
        "回拨次数",
        "真实未接通次数",
        "真实接听率(%)",
        "命中数量（户）",
        "外呼接通次数",
        "当日派单量",
        "累积已处理量",
        "累积在途工单量",
        "累积工单及时率(%)",
        "超时工单量",
      ],
      district: [
        "姓名",
        "装维账号",
        "网格",
        "呼入总量",
        "一次接听量",
        "一次接听率(%)",
        "回拨次数",
        "真实未接通次数",
        "真实接听率(%)",
        "命中数量（户）",
        "外呼接通次数",
        "当日派单量",
        "累积已处理量",
        "累积在途工单量",
        "累积工单及时率(%)",
        "超时工单量",
      ],
    },
    statistics_comparison: {
      province: [
        { key: "city", label: "地市", isDrill: true },
        { key: "firstRateVal", label: "一次接听率(%)", isPercent: true },
        { key: "momFirstRateVal", label: "一次接听率(%)环比", isPercent: true },
        { key: "realRateVal", label: "真实接听率(%)", isPercent: true },
        { key: "timelyRateVal", label: "累积工单及时率(%)", isPercent: true },
      ],
      city: [
        { key: "district", label: "区县", isDrill: true },
        { key: "firstRateVal", label: "一次接听率(%)", isPercent: true },
        { key: "momFirstRateVal", label: "一次接听率(%)环比", isPercent: true },
        { key: "realRateVal", label: "真实接听率(%)", isPercent: true },
        { key: "timelyRateVal", label: "累积工单及时率(%)", isPercent: true },
      ],
      district: [
        { key: "name", label: "姓名" },
        { key: "account", label: "装维账号" },
        { key: "grid", label: "网格" },
        { key: "firstRateVal", label: "一次接听率(%)", isPercent: true },
        { key: "realRateVal", label: "真实接听率(%)", isPercent: true },
        { key: "timelyRateVal", label: "累积工单及时率(%)", isPercent: true },
      ],
    },
    lowScore: {
      province: ["地市", "总人数", "人数", "占比(%)", "真实接通率(%)"],
      district: ["区县", "总人数", "人数", "占比(%)", "真实接听率(%)"],
    },
    gdjs95: {
      province: ["地市", "总人数", "人数", "占比(%)", "工单及时率(%)"],
      district: ["区县", "总人数", "人数", "占比(%)", "工单及时率(%)"],
      detail: [
        "姓名",
        "装维账号",
        "网格",
        "已处理量",
        "在途工单量",
        "工单及时率(%)",
        "超时工单量",
      ],
    },
    workNumbers: {
      province: ["地市", "工作号数量", "总人数", "工作号接入占比(%)", "端口量"],
      district: ["区县", "工作号", "总人数", "工作号接入占比(%)", "端口量"],
    },
    business: {
      headers: [
        "地市",
        "商机识别数",
        "业务办理工单数",
        "办理成功数",
        "安装成功数",
        "安装成功率(%)",
        "安装及时率(%)",
      ],
    },
    satisfaction: {
      headers: [
        "地市",
        "不满数（户）",
        "派单修复数",
        "修复成功率(%)",
        "满意度平均分",
      ],
    },
    customers: {
      headers: ["地市", "倾向数（户）", "派单修复数", "离网数", "派单闭环率(%)"],
    },
    stat2: {
      city: [
        "地市",
        "一次接听率(%)",
        "一次接听率(%)环比",
        "真实接听率(%)",
        "真实接听率(%)环比",
        "累积工单及时率(%)",
        "累积工单及时率(%)环比",
      ],
      district: [
        "区县",
        "一次接听率(%)",
        "一次接听率(%)环比",
        "真实接听率(%)",
        "真实接听率(%)环比",
        "累积工单及时率(%)",
        "累积工单及时率(%)环比",
      ],
      gridDetail: [
        "姓名",
        "装维账号",
        "网格",
        "一次接听率(%)",
        "一次接听率(%)环比",
        "真实接听率(%)",
        "真实接听率(%)环比",
        "累积工单及时率(%)",
        "累积工单及时率(%)环比",
      ],
    },
  };
  TableHeaders.renderThead = function (thead, headers) {
    if (!thead || !headers || !headers.length) return;
    var html =
      "<tr>" +
      headers
        .map(function (h) {
          return "<th>" + h + "</th>";
        })
        .join("") +
      "</tr>";
    thead.innerHTML = html;
  };
  window.TableHeaders = TableHeaders;
})();
