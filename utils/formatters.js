function sanitizeCellValue(value) {
  if (value === null || value === undefined || (typeof value === 'number' && isNaN(value)) || value === 'NaN') {
    return 0;
  }
  return value;
}

/**
 * 贵州地市排序函数
 * 顺序：贵阳、安顺、遵义、黔南、黔东南、铜仁、毕节、六盘水、黔西南
 * 如果包含“全省”，则排在最前面
 */
function sortGuiZhouRegions(data, regionKey) {
  if (!Array.isArray(data)) return [];
  const order = ["全省", "贵阳", "遵义", "安顺", "黔南", "黔东南", "铜仁", "毕节", "六盘水", "黔西南"];
  
  return data.sort((a, b) => {
    // 支持对象数组和字符串数组
    const nameA = (typeof a === 'string' ? a : a[regionKey]) || "";
    const nameB = (typeof b === 'string' ? b : b[regionKey]) || "";
    
    // 模糊匹配逻辑：比如 "贵阳市" 匹配 "贵阳"
    const getIndex = (name) => {
      for (let i = 0; i < order.length; i++) {
        if (name.includes(order[i])) return i;
      }
      return 999; // 未匹配到的放在最后
    };

    return getIndex(nameA) - getIndex(nameB);
  });
}

// 如果是在浏览器环境，挂载到 window 对象上
if (typeof window !== 'undefined') {
  window.sortGuiZhouRegions = sortGuiZhouRegions;
}