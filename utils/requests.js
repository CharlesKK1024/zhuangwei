(function () {
  function getSuffixes(granularity, dayValue, monthValue) {
    var noZero = "";
    var withZero = "";
    if (granularity === "day") {
      if (!dayValue) return { noZero: "", withZero: "" };
      var parts = dayValue.split("-");
      var mRaw = parts[1];
      var dRaw = parts[2];
      var mNum = parseInt(mRaw, 10);
      var dNum = parseInt(dRaw, 10);
      noZero = mNum + "月" + dNum + "日";
      withZero = mRaw + "月" + dRaw + "日";
    } else {
      if (!monthValue) return { noZero: "", withZero: "" };
      var partsM = monthValue.split("-");
      var mRawM = partsM[1];
      var mNumM = parseInt(mRawM, 10);
      noZero = mNumM + "月";
      withZero = mRawM + "月";
    }
    return { noZero: noZero, withZero: withZero };
  }
  async function fetchTriplet(p, c, d) {
    var res = await Promise.all([fetch(p), fetch(c), fetch(d)]);
    if (!res[0].ok || !res[1].ok || !res[2].ok) return null;
    var data = await Promise.all(
      res.map(function (r) {
        return r.json();
      }),
    );
    return { p: data[0], c: data[1], d: data[2] };
  }
  async function fetchSingle(url) {
    var r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  }
  var Requests = {
    getSuffixes: getSuffixes,
    fetchStatistics: async function (modeKey, suffix) {
      return await fetchTriplet(
        "data/01statistics_table/province_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
        "data/01statistics_table/city_data_" + modeKey + "_" + suffix + ".json",
        "data/01statistics_table/district_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
      );
    },
    fetchQualityStat2: async function (modeKey, suffix) {
      return await fetchTriplet(
        "data/08quality_table/province_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
        "data/08quality_table/city_data_" + modeKey + "_" + suffix + ".json",
        "data/08quality_table/district_detail_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
      );
    },
    fetchGdjs95: async function (modeKey, suffix) {
      return await fetchTriplet(
        "data/03WorkTimelinessRate_table/province_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
        "data/03WorkTimelinessRate_table/city_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
        "data/03WorkTimelinessRate_table/district_detail_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
      );
    },
    fetchWorkNumbers: async function (modeKey, suffix) {
      let data = null;
      let originalFetchSuccessful = false;
      console.log(modeKey, suffix, "modeKeymodeKey");
      // Try original fetch
      try {
        if (modeKey === "day") {
          const targetDates = [
            "3月10日",
            "3月11日",
            "3月12日",
            "4月1日",
            "4月2日",
            "4月3日",
            "4月4日",
            "4月5日",
            "4月6日",
            "4月7日",
            "4月13日",
            "4月14日",
          ];
          if (targetDates.includes(suffix)) {
            suffix = "3月11日";
          }
        }
        if (modeKey === "month") {
          const targetDates = ["1月", "2月", "3月"];
          if (targetDates.includes(suffix)) {
            suffix = "2月";
          }
        }
        data = await fetchTriplet(
          "data/04workNumbers_table/province_data_" +
            modeKey +
            "_" +
            suffix +
            ".json",
          "data/04workNumbers_table/city_data_" +
            modeKey +
            "_" +
            suffix +
            ".json",
          "data/04workNumbers_table/district_data_" +
            modeKey +
            "_" +
            suffix +
            ".json",
        );
        if (data) {
          // If data is successfully fetched and not null
          originalFetchSuccessful = true;
        }
      } catch (error) {
        // Error during original fetch, proceed to fallback if conditions met
        console.warn(
          `Original fetch for modeKey=${modeKey}, suffix=${suffix} failed or returned no data.`,
        );
      }

      // If original fetch failed (data is null or originalFetchSuccessful is false) and it's day granularity, attempt fallback
      if (!originalFetchSuccessful && suffix.includes("日")) {
        console.warn(
          `Attempting fallback to 03月10日 for modeKey=${modeKey}, suffix=${suffix}.`,
        );
        try {
          data = await fetchTriplet(
            "data/04workNumbers_table/province_data_03_10日.json",
            "data/04workNumbers_table/city_data_03_10日.json",
            "data/04workNumbers_table/district_data_03_10日.json",
          );
        } catch (fallbackError) {
          console.error(`Fallback to 03月10日 also failed: ${fallbackError}`);
          data = null; // Ensure data is null if fallback also fails
        }
      }
      return data;
    },
    fetchLowScore: async function (modeKey, suffix) {
      return await fetchTriplet(
        "data/02realConnectionRate_table/province_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
        "data/02realConnectionRate_table/city_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
        "data/02realConnectionRate_table/district_detail_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
      );
    },
    fetchBusiness: async function (modeKey, suffix) {
      return await fetchSingle(
        "data/07business_table/business_opportunity_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
      );
    },
    fetchCustomers: async function (modeKey, suffix) {
      return await fetchSingle(
        "data/06customers_table/churn_tendency_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
      );
    },
    fetchSatisfaction: async function (modeKey, suffix) {
      return await fetchSingle(
        "data/05satisfactionUsers_table/low_satisfaction_data_" +
          modeKey +
          "_" +
          suffix +
          ".json",
      );
    },
    fetchQualityScorePie: async function () {
      return await fetchSingle(
        "data/10pie_echart/trend_region_months_pie.json",
      );
    },
    fetchQualityScoreDetail: async function (city, district) {
      const data = await fetchSingle(
        "data/10pie_echart/trend_region_months_pie.json",
      );
      if (!data || !data.district_detail_data) return null;
      const key = `${city}-${district}`;
      return data.district_detail_data[key] || null;
    },
  };
  window.Requests = Requests;
})();
