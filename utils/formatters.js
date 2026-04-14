function sanitizeCellValue(value) {
  if (value === null || value === undefined || (typeof value === 'number' && isNaN(value)) || value === 'NaN') {
    return 0;
  }
  return value;
}