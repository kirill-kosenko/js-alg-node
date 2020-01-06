var getSuggestions = require('../suggestions');

test.each([
  ["London", null, "London, United Kingdom"],
  ["ha1", null, "Harrow, HA1, United Kingdom"],
  ["ha1 1bh", null, "College Road, Harrow, HA1 1BH, United Kingdom"],
  ["77 Charterhouse street", "GBR", "77, Charterhouse Street, London, EC1M 6HJ, United Kingdom"],
  ["Fabric", "GBR", "Fabric, 77, Charterhouse Street, London, EC1M 6HJ, United Kingdom"],
  ["le1", "GBR", "Leicester, LE1, United Kingdom"],
  ["Martinsburg", null, "Martinsburg, WV, United States"],
  ["SG17 5JU", "GB", "Ivel Road, Shefford, SG17 5JU, United Kingdom"],
  ["E14 6BT", "GB", "Vesey Path, London, E14 6BT, United Kingdom"],
  ["LE3 1UQ", "GB", "Scudamore Road, Leicester, LE3 1UQ, United Kingdom"],
  ["BS2 0XJ", "GB", "Albert Road, Bristol, BS2 0XJ, United Kingdom"],
  ["NP12 2XH", "GB", "Newport Road, Blackwood, NP12 2XH, United Kingdom"],
  ["TR11 2LH", "GB", "Trevaylor Road, Falmouth, TR11 2LH, United Kingdom"],
  ["EX2 8RL", "GB", "Trusham Road, Exeter, EX2 8RL, United Kingdom"],
  ["25403", "US", "Martinsburg, 25403, WV, United States"],
  ["1072 GK", "NL", "Amsterdam, 1072 GK, Netherlands"],
  ["1000", "BE", "Brussels, 1000, Belgium"],
  ["30159", "DE", "Hanover, 30159, Germany"],
  ["75004", "FR", "Paris, 75004, France"],
  ["H3A 1J7", "CA", "Montreal, H3A 1J7, QC, Canada"],
  ["WD17", "GB", "Watford, WD17, United Kingdom"],
  ["M17 1PG", "GB", "Mosley Road, Manchester, M17 1PG, United Kingdom"],
  ["M17 1WA", "GB", "Textilose Road, Manchester, M17 1WA, United Kingdom"],
  ["Stretford", "GB", "Stretford, United Kingdom"],
  ["OL8", "GB", "Oldham, OL8, United Kingdom"],

  ["United Kingdom", null, "United Kingdom"],
  ["United States", null, "United States"],
  ["America", null, "United States"],
  ["Italy", null, "Italy"],
  ["Germany", null, "Germany"],

  ["Aberdeenshire", "GB", "Aberdeenshire, United Kingdom"],
  ["Surrey", "GB", "Surrey, United Kingdom"],
  ["Saxony", "DE", "Germany"], //TODO: should include state?
  ["Illinois", "US", "IL, United States"],
  ["Ontario", "CA", "ON, Canada"],
  ["Devon", "GB", "Devon, United Kingdom"],
  ["Cornwall", "GB", "Cornwall, United Kingdom"],

  ["LS1", "GB", "Leeds, LS1, United Kingdom"],
  ["LE9", "GB", "Leicester, LE9, United Kingdom"],
  ["13627", "DE", "Berlin, 13627, Germany"],
  ["1078", "NL", "Amsterdam, 1078, Netherlands"],

  ["Perth", "GB", "Perth, United Kingdom"],
  ["elgin", "GB", "Elgin, United Kingdom"],
  ["Rotterdam", "NL", "Rotterdam, Netherlands"],
  ["Berlin", "DE", "Berlin, Germany"],
  ["Springfield", "US", "Springfield, MO, United States"],
  ["Toronto", "CA", "Toronto, ON, Canada"],

  ["Kalochori", "GR", "Kalochori, Greece"]

])('%s, %s -> %s', async (query, allowedCountries, expected) => {
  var onSuccess = (resolve) => (result) => resolve(result);
  var onError = (reject) => (error) => reject(error);

  var promise = new Promise((resolve, reject) => {
    getSuggestions(query, allowedCountries, onSuccess(resolve), onError(reject));
  })

  var suggestions = await promise;
  expect(suggestions[0].Location.Address.Label).toBe(expected);
})
