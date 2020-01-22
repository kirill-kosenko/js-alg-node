var getSuggestions = require('../suggestions');

test.each([
  ["London", null, false, "London, United Kingdom"],
  ["ha1", null, false, "Harrow, HA1, United Kingdom"],
  ["ha1 1bh", null, false, "College Road, Harrow, HA1 1BH, United Kingdom"],
  ["77 Charterhouse street", "GBR", false, "77, Charterhouse Street, London, EC1M 6HJ, United Kingdom"],
  ["Fabric", "GBR", false, "Fabric, 77, Charterhouse Street, London, EC1M 6HJ, United Kingdom"],
  ["le1", "GBR", false, "Leicester, LE1, United Kingdom"],
  ["Martinsburg", null, true, "Martinsburg, WV, United States"],
  ["SG17 5JU", "GBR", false, "Ivel Road, Shefford, SG17 5JU, United Kingdom"],
  ["E14 6BT", "GBR", false, "Vesey Path, London, E14 6BT, United Kingdom"],
  ["LE3 1UQ", "GBR", false, "Scudamore Road, Leicester, LE3 1UQ, United Kingdom"],
  ["BS2 0XJ", "GBR", false, "Albert Road, Bristol, BS2 0XJ, United Kingdom"],
  ["NP12 2XH", "GBR", false, "Newport Road, Blackwood, NP12 2XH, United Kingdom"],
  ["TR11 2LH", "GBR", false, "Trevaylor Road, Falmouth, TR11 2LH, United Kingdom"],
  ["EX2 8RL", "GBR", false, "Trusham Road, Exeter, EX2 8RL, United Kingdom"],
  ["25403", "USA", true, "Martinsburg, 25403, WV, United States"],
  ["1072 GK", "NLD", false, "Amsterdam, 1072 GK, Netherlands"],
  ["1000", "BEL", false, "Brussels, 1000, Belgium"],
  ["30159", "DEU", false, "Hanover, 30159, Germany"],
  ["75004", "FRA", false, "Paris, 75004, France"],
  ["H3A 1J7", "CAN", false, "Montreal, H3A 1J7, QC, Canada"],
  ["WD17", "GBR", false, "Watford, WD17, United Kingdom"],
  ["M17 1PG", "GBR", false, "Mosley Road, Manchester, M17 1PG, United Kingdom"],
  ["M17 1WA", "GBR", false, "Textilose Road, Manchester, M17 1WA, United Kingdom"],
  ["Stretford", "GBR", false, "Stretford, Manchester, United Kingdom"],
  ["OL8", "GBR", false, "Oldham, OL8, United Kingdom"],

  ["United Kingdom", null, false, "United Kingdom"],
  ["United States", null, true, "United States"],
  ["America", null, true, "United States"],
  ["Italy", null, false, "Italy"],
  ["Germany", null, false, "Germany"],

  ["Aberdeenshire", "GBR", false, "Aberdeenshire, United Kingdom"],
  ["Surrey", "GBR", false, "Surrey, United Kingdom"],
  ["Saxony", "DEU", false, "Germany"], //TODO: should include state?
  ["Illinois", "USA", true, "IL, United States"],
  ["Ontario", "CAN", true, "ON, Canada"],
  ["Devon", "GBR", false, "Devon, United Kingdom"],
  ["Cornwall", "GBR", false, "Cornwall, United Kingdom"],

  ["LS1", "GBR", false, "Leeds, LS1, United Kingdom"],
  ["LE9", "GBR", false, "Leicester, LE9, United Kingdom"],
  ["13627", "DEU", false, "Berlin, 13627, Germany"],
  ["1078", "NLD", false, "Amsterdam, 1078, Netherlands"],

  ["Perth", "GBR", false, "Perth, United Kingdom"],
  ["elgin", "GBR", false, "Elgin, United Kingdom"],
  ["Rotterdam", "NLD", false, "Rotterdam, Netherlands"],
  ["Berlin", "DEU", false, "Berlin, Germany"],
  ["Springfield", "USA", true, "Springfield, MO, United States"],
  ["Toronto", "CAN", true, "Toronto, ON, Canada"],

  ["Kalochori", "GRC", false, "Kalochori, Echedoro, Greece"],

  ["25403", null, true, "Martinsburg, 25403, WV, United States"]

])('%s, %s -> %s', async (query, allowedCountries, americanUser, expected) => {
  var onSuccess = (resolve) => (result) => resolve(result);
  var onError = (reject) => (error) => reject(error);

  var promise = new Promise((resolve, reject) => {
    getSuggestions(query, allowedCountries, americanUser, onSuccess(resolve), onError(reject));
  });

  var suggestions = await promise;
  expect(suggestions[0].Location.Address.Label).toBe(expected);
});
