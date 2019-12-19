var getSuggestions = require('../suggestions');

test.each([
  ["London", null, "London, United Kingdom"],
  ["ha1", null, "Harrow, England, HA1, GB"],
  ["ha1 1bh", null, "College Road, Harrow, HA1 1BH, GB"],
  ["77 Charterhouse street", "GBR", "77, Charterhouse Street, City of London, London, EC1M 6HJ, United Kingdom"],
  ["Fabric", "GBR", "Fabric, 77, Charterhouse Street, City of London, London, EC1M 6HJ, United Kingdom"],
  ["le1", "GBR", "Leicester, England, LE1, GB"],
  ["Martinsburg", null, "Martinsburg, Berkeley, WV, US"],
  ["SG17 5JU", "GB", "Ivel Road, Shefford, SG17 5JU, GB"],
  ["E14 6BT", "GB", "Vesey Path, London, E14 6BT, GB"],
  ["LE3 1UQ", "GB", "Scudamore Road, Leicester, LE3 1UQ, GB"],
  ["BS2 0XJ", "GB", "Albert Road, Bristol, BS2 0XJ, GB"],
  ["NP12 2XH", "GB", "Newport Road, Blackwood, NP12 2XH, GB"],
  ["TR11 2LH", "GB", "Trevaylor Road, Falmouth, TR11 2LH, GB"],
  ["EX2 8RL", "GB", "Trusham Road, Exeter, EX2 8RL, GB"],
  ["25403", "US", "Martinsburg, WV, United States"],
  ["1072 GK", "NL", "Amsterdam, North Holland, 1072 GK, NL"],
  ["1000", "BE", "Brussels, 1000, BE"],
  ["30159", "DE", "Hanover, 30159, Germany"],
  ["75004", "FR", "Paris, 75004, FR"],
  ["H3A 1J7", "CA", "Montreal, QC, H3A 1J7, CA"],

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

  ["LS1", "GB", "Leeds, England, LS1, GB"],
  ["LE9", "GB", "Leicester, England, LE9, GB"],
  ["13627", "DE", "Berlin, 13627, DE"],
  ["1078", "NL", "Amsterdam, 1078, NL"],

  ["Perth", "GB", "Perth, United Kingdom"],
  ["elgin", "GB", "Elgin, United Kingdom"],
  ["Rotterdam", "NL", "Rotterdam, Netherlands"],
  ["Berlin", "DE", "Berlin, Germany"],
  ["Springfield", "US", "Springfield, MO, United States"],
  ["Toronto", "CA", "Toronto, ON, Canada"]

])('%s, %s -> %s', async (query, allowedCountries, expected) => {
  var onSuccess = (resolve) => (result) => resolve(result);
  var onError = (reject) => (error) => reject(error);

  var promise = new Promise((resolve, reject) => {
    getSuggestions(query, allowedCountries, onSuccess(resolve), onError(reject));
  })

  var suggestions = await promise;
  expect(suggestions[0].Location.Address.Label).toBe(expected);
})
