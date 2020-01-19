var getSuggestions = require('../suggestions');

test.each([
  ["London", null, "London, United Kingdom"],
  ["ha1", null, "Harrow, HA1, United Kingdom"],
  ["ha1 1bh", null, "College Road, Harrow, HA1 1BH, United Kingdom"],
  ["77 Charterhouse street", "GBR", "77, Charterhouse Street, London, EC1M 6HJ, United Kingdom"],
  ["Fabric", "GBR", "Fabric, 77, Charterhouse Street, London, EC1M 6HJ, United Kingdom"],
  ["le1", "GBR", "Leicester, LE1, United Kingdom"],
  ["Martinsburg", null, "Martinsburg, WV, United States"],
  ["SG17 5JU", "GBR", "Ivel Road, Shefford, SG17 5JU, United Kingdom"],
  ["E14 6BT", "GBR", "Vesey Path, London, E14 6BT, United Kingdom"],
  ["LE3 1UQ", "GBR", "Scudamore Road, Leicester, LE3 1UQ, United Kingdom"],
  ["BS2 0XJ", "GBR", "Albert Road, Bristol, BS2 0XJ, United Kingdom"],
  ["NP12 2XH", "GBR", "Newport Road, Blackwood, NP12 2XH, United Kingdom"],
  ["TR11 2LH", "GBR", "Trevaylor Road, Falmouth, TR11 2LH, United Kingdom"],
  ["EX2 8RL", "GBR", "Trusham Road, Exeter, EX2 8RL, United Kingdom"],
  ["25403", "USA", "Martinsburg, 25403, WV, United States"],
  ["1072 GK", "NLD", "Amsterdam, 1072 GK, Netherlands"],
  ["1000", "BEL", "Brussels, 1000, Belgium"],
  ["30159", "DEU", "Hanover, 30159, Germany"],
  ["75004", "FRA", "Paris, 75004, France"],
  ["H3A 1J7", "CAN", "Montreal, H3A 1J7, QC, Canada"],
  ["WD17", "GBR", "Watford, WD17, United Kingdom"],
  ["M17 1PG", "GBR", "Mosley Road, Manchester, M17 1PG, United Kingdom"],
  ["M17 1WA", "GBR", "Textilose Road, Manchester, M17 1WA, United Kingdom"],
  ["Stretford", "GBR", "Stretford, Manchester, United Kingdom"],
  ["OL8", "GBR", "Oldham, OL8, United Kingdom"],

  ["United Kingdom", null, "United Kingdom"],
  ["United States", null, "United States"],
  ["America", null, "United States"],
  ["Italy", null, "Italy"],
  ["Germany", null, "Germany"],

  ["Aberdeenshire", "GBR", "Aberdeenshire, United Kingdom"],
  ["Surrey", "GBR", "Surrey, United Kingdom"],
  ["Saxony", "DEU", "Germany"], //TODO: should include state?
  ["Illinois", "USA", "IL, United States"],
  ["Ontario", "CAN", "ON, Canada"],
  ["Devon", "GBR", "Devon, United Kingdom"],
  ["Cornwall", "GBR", "Cornwall, United Kingdom"],

  ["LS1", "GBR", "Leeds, LS1, United Kingdom"],
  ["LE9", "GBR", "Leicester, LE9, United Kingdom"],
  ["13627", "DEU", "Berlin, 13627, Germany"],
  ["1078", "NLD", "Amsterdam, 1078, Netherlands"],

  ["Perth", "GBR", "Perth, United Kingdom"],
  ["elgin", "GBR", "Elgin, United Kingdom"],
  ["Rotterdam", "NLD", "Rotterdam, Netherlands"],
  ["Berlin", "DEU", "Berlin, Germany"],
  ["Springfield", "USA", "Springfield, MO, United States"],
  ["Toronto", "CAN", "Toronto, ON, Canada"],

  ["Kalochori", "GRC", "Kalochori, Echedoro, Greece"]

])('%s, %s -> %s', async (query, allowedCountries, expected) => {
  var onSuccess = (resolve) => (result) => resolve(result);
  var onError = (reject) => (error) => reject(error);

  var promise = new Promise((resolve, reject) => {
    getSuggestions(query, allowedCountries, onSuccess(resolve), onError(reject));
  });

  var suggestions = await promise;
  expect(suggestions[0].Location.Address.Label).toBe(expected);
});
