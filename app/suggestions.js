var axios = require('axios');

function getSuggestions(queryString, allowedCountries, onResult, onFailure) {

	  var placesUrl = 'https://places.api.here.com/places/v1/autosuggest?app_code=3UpwZJS-ymLTM2zEAEMSfQ&app_id=aerSeN2zm0flQOz3KqZS&q='
            + encodeURIComponent(queryString);
		var geocodeUrl = 'https://geocoder.api.here.com/6.2/geocode.json?app_id=aerSeN2zm0flQOz3KqZS&app_code=3UpwZJS-ymLTM2zEAEMSfQ' +
				'&locationattributes=in%2Ctz&gen=9&language=en&additionaldata=Country2%2Ctrue';
    if (allowedCountries) {
        placesUrl += '&addressFilter=' + encodeURIComponent('countryCode=' + allowedCountries);
        geocodeUrl += '&country=' + encodeURIComponent(allowedCountries);
    }

		var multiReverseUrl = 'https://reverse.geocoder.api.here.com/6.2/multi-reversegeocode.json?app_id=aerSeN2zm0flQOz3KqZS&app_code=3UpwZJS-ymLTM2zEAEMSfQ' +
				'&locationattributes=in%2Ctz&gen=9&additionaldata=Country2%2Ctrue&mode=retrieveAddresses&maxresults=20&language=en';

				function compareTwoStrings(first, second) {
							first = first.replace(/\s+/g, '');
							second = second.replace(/\s+/g, '');

							if (!first.length && !second.length) return 1; // if both are empty strings
							if (!first.length || !second.length) return 0; // if only one is empty string
							if (first === second) return 1; // identical
							if (first.length === 1 && second.length === 1) return 0; // both are 1-letter strings
							if (first.length < 2 || second.length < 2) return 0; // if either is a 1-letter string

							var firstBigrams = new Map();
							for (var i = 0; i < first.length - 1; i++) {
								var bigram = first.substring(i, i + 2);
								var count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;

								firstBigrams.set(bigram, count);
							};

							var intersectionSize = 0;
							for (var i = 0; i < second.length - 1; i++) {
								var bigram = second.substring(i, i + 2);
								var count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

								if (count > 0) {
									firstBigrams.set(bigram, count - 1);
									intersectionSize++;
								}
							}

							return 2.0 * intersectionSize / (first.length + second.length - 2);
						}

						function findBestMatch(mainString, targetStrings) {
							if (!areArgsValid(mainString, targetStrings)) throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');

							var ratings = [];
							var bestMatchIndex = 0;

							for (var i = 0; i < targetStrings.length; i++) {
								var currentTargetString = targetStrings[i];
								var currentRating = compareTwoStrings(mainString, currentTargetString);
								ratings.push({ target: currentTargetString, rating: currentRating });
								if (currentRating > ratings[bestMatchIndex].rating) {
									bestMatchIndex = i;
								}
							}

							var bestMatch = ratings[bestMatchIndex];

							return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex };
						}

						function areArgsValid(mainString, targetStrings) {
							if (typeof mainString !== 'string') return false;
							if (!Array.isArray(targetStrings)) return false;
							if (!targetStrings.length) return false;
							if (targetStrings.find(function (s) {
								return typeof s !== 'string';
							})) return false;
							return true;
						}

			var errorCallback = function(reason) {
				console.error(reason);
				onFailure();
			};

			var createAddressLabel = function(keys, address) {
			var labelArray = keys
					.map(function (key) {
						return address[key];
					}).filter(function (value) { return value; });
			var geocodeCountryIndex = address.AdditionalData.findIndex(function(el) {
				return el.key === 'CountryName';
			});
			var country = address.AdditionalData[geocodeCountryIndex].value;
			labelArray.push(country);

			return labelArray.join(', ');
		};

		function onSuccess(results) {
		    var resAddress0 = results[0] && results[0].Location.Address;
		    if (resAddress0 && resAddress0.Country === 'GBR') {
		        var resPostalCode0 = resAddress0.PostalCode;
						var resPostalCode1 = results[1] && results[1].Location.Address.PostalCode;
						if (resPostalCode0 && resPostalCode1 && resPostalCode0 === resPostalCode1) {
							results.splice(0, 1);
						}
				}

			onResult(results);
		}

		var ukPlacesResult, placesResult;

		var ukPlacesUrl = placesUrl + '&X-Map-Viewport=-17.3088,47.5205,14.2219,59.0657';
		axios(ukPlacesUrl, { headers: { 'Accept-Language': 'en-US' } })
				.then(function(response) {
					return response.data;
				}, errorCallback)
				.then(function(json) {
					var places = json.results.filter(function(r) {
						return r.position;
					});

					if (places && places.length > 0) {
						var data = '';
						var place, position;
						for (var i = 0; i < places.length; i++) {
							place = places[i];
							position = place.position;

							var vicinity = place.vicinity ? place.vicinity.replace(/<br\/>/g, ',') : '';
							place.placeAddress = place.resultType === 'place'
									? vicinity
									: place.title + ', ' + vicinity;

							data += 'id=' + i + '&prox=' + position[0] + ',' + position[1] + ',1000\n';
						}

						axios.post(multiReverseUrl, data, { headers: { 'Content-Type': 'text/plain' } })
								.then(function(response) {
									return response.data;
								}, function (reason) {
									console.error(reason);
								})
								.then(function (json) {
									var items = json.Response.Item;
									var ukResult;
									var place, placeAddress;
									for (var i = 0; i < items.length; i++) {
										place = places[i];
										placeAddress = place.placeAddress;

										var results = items[i].Result;

										ukResult = results.find(function (r) {
										    var postalCode = r.Location.Address.PostalCode;
											return postalCode && postalCode.toLowerCase().startsWith(queryString.toLowerCase());
										});

										if (ukResult) {
											var geocodeAddress = ukResult.Location.Address;
											geocodeAddress.PostalCode = queryString.length < geocodeAddress.PostalCode.length
													? geocodeAddress.PostalCode.split(' ')[0]
													: geocodeAddress.PostalCode;
											geocodeAddress.Label = createAddressLabel(
													['USA', 'CAN'].includes(geocodeAddress.Country) ? ['City', 'State', 'PostalCode'] : ['City', 'PostalCode'],
													geocodeAddress
											);
											delete geocodeAddress.HouseNumber;
											delete geocodeAddress.Street;
											ukPlacesResult = [ukResult];
											break;
										}
									}

									if (ukResult) {
										if (placesResult) {
											placesResult.splice(0, 0, ukResult);
											onSuccess(ukResult);
										}
									} else {
										geocodeUrl += '&postalcode=' + encodeURIComponent(queryString);
										axios(geocodeUrl)
												.then(function (response) {
													return response.data;
												}, errorCallback)
												.then(function(json) {
													var geocodeResult = json.Response.View[0] && json.Response.View[0].Result.find(function(r) {
														var address = r.Location.Address;
														var postCodeLowCase = address.PostalCode.toLowerCase();
														var queryStringLowCase = queryString.toLowerCase();
														return address.Country === 'GBR' &&
																(postCodeLowCase.startsWith(queryStringLowCase) || postCodeLowCase.startsWith(queryStringLowCase.split(' ')[0]));
													});

													if (geocodeResult) {
														var address = geocodeResult.Location.Address;
														address.PostalCode = address.PostalCode.toLowerCase() === queryString.toLowerCase()
																? address.PostalCode
																: address.PostalCode.split(' ')[0];
														address.Label = createAddressLabel(
																['USA', 'CAN'].includes(address.Country) ? ['City', 'State', 'PostalCode'] : ['City', 'PostalCode'],
																address
														);

														ukPlacesResult = [geocodeResult];
													} else {
														ukPlacesResult = [];
													}

													if (placesResult) {
														if (geocodeResult) {
															placesResult.splice(0, 0, geocodeResult);
														}
														onSuccess(placesResult);
													}
												}, errorCallback);
									}
								}, errorCallback);
					} else {
						errorCallback();
					}
				}, errorCallback);

				placesUrl += '&at=0,0&size=5';
		axios(placesUrl, { headers: { 'Accept-Language': 'en-US' } })
			.then(function(response) {
				return response.data;
			}, errorCallback)
			.then(function(json) {
			    var places = json.results.filter(function(r) {
			        return r.position;
			    });

			    if (places && places.length > 0) {
			        var data = '';
			        var place, position, params, postalAddress;
			        for (var i = 0; i < places.length; i++) {
			            place = places[i];
			            position = place.position;

						var vicinity = place.vicinity ? place.vicinity.replace(/<br\/>/g, ',') : '';
						place.placeAddress = place.resultType === 'place'
								? vicinity
								: place.title + ', ' + vicinity;

			            params = place.category === 'city-town-village' ? { mode: 'retrieveAreas', level: 'city'} : {mode: 'retrieveAddresses', level: 'postalCode'};
						data += 'id=' + i + '&mode=' + params.mode + '&level=' + params.level + '&prox=' + position[0] + ',' + position[1] + ',500\n';
					}

					axios.post(multiReverseUrl, data, { headers: { 'Content-Type': 'text/plain' } })
							.then(function(response) {
								return response.data;
							}, function (reason) {
							    console.error(reason);
							})
							.then(function (json) {
								var items = json.Response.Item;
								var result = [];
								var place, placeAddress;
								for (var i = 0; i < items.length; i++) {
								    place = places[i];
									placeAddress = place.placeAddress;

								    var results = items[i].Result;
								    if (place.category === 'building') {
										results = results.filter(function(r) {
											return 'houseNumber' === r.MatchLevel;
										})
									}

								    if (!results.length) {
								        continue;
									}

								    var resultsLabels = results.map(function(r) {
										return r.Location.Address.Label;
									});
									var match = findBestMatch(placeAddress, resultsLabels);

								    var bestResult = results[match.bestMatchIndex];

								    var addressComponentsKeys = ['County', 'City', 'District'];

									var placeAddressComponents = placeAddress.split(',').map(function (p) {
										return p.trim();
									});
									var geocodeAddress = bestResult.Location.Address;
									var resAddress = {};
									resAddress.AdditionalData = [];
//								    if (match.bestMatch.rating > 0.7) {

										addressComponentsKeys.forEach(function(key) {
											var value = geocodeAddress[key];

											var index = placeAddressComponents.findIndex(function(el) {

												return value && el.toLowerCase() === value.toLowerCase();
											});
										    if (index > -1) {
										        var placeComponent = placeAddressComponents[index];
										        var clearedPlaceComponent = placeComponent.replace(value, '');
										        if (clearedPlaceComponent.trim()) {
										            placeAddressComponents[index] = clearedPlaceComponent;
												} else {
//													placeAddressComponents.splice(index, 1);
													resAddress[key] = placeComponent;
												}
											}
										});

										var geocodeCountryIndex = geocodeAddress.AdditionalData.findIndex(function(el) {
										    return el.key === 'CountryName';
										});
										var country = geocodeAddress.AdditionalData[geocodeCountryIndex].value;
										var placeCountryIndex = placeAddressComponents.findIndex(function(addressComponent) {
										    return addressComponent === country;
										});
										if (placeCountryIndex > -1) {
										    placeAddressComponents.splice(placeCountryIndex, 1);
										    resAddress.Country = geocodeAddress.Country;
										    resAddress.AdditionalData.push(geocodeAddress.AdditionalData[geocodeCountryIndex]);

											var country2Index = geocodeAddress.AdditionalData.findIndex(function(el) {
												return el.key === 'Country2';
											});

											resAddress.AdditionalData.push(geocodeAddress.AdditionalData[country2Index]);
										}

										var streetIndex = geocodeAddress.Street && placeAddressComponents.findIndex(function(component) {
											return component.includes(geocodeAddress.Street);
										});
										if (streetIndex > -1) {
										    resAddress.Street = geocodeAddress.Street;
											if (place.category === 'building' || place.resultType === 'place') {
												var street = placeAddressComponents[streetIndex];
												var placeHouseNumber = street.match(/^(\d+) /);
												if (placeHouseNumber && placeHouseNumber !== geocodeAddress.HouseNumber) {
													resAddress.HouseNumber = placeHouseNumber[1];
													bestResult.Location.DisplayPosition = {
														Latitude: place.position[0],
														Longitude: place.position[1]
													};
													placeAddressComponents.splice(streetIndex, 1);
												}
											} else {
												geocodeAddress.HouseNumber = null;
											}

											if (geocodeAddress.PostalCode) {
												var placePostcodeIndex = placeAddressComponents.reverse().findIndex(function(component) {
													return component.startsWith(geocodeAddress.PostalCode.split(' ')[0])
//														|| geocodeAddress.PostalCode.startsWith(component);
												});

												if (placePostcodeIndex > -1) {
													var placePostalCode = placeAddressComponents[placePostcodeIndex];
													if (placePostalCode.length >= geocodeAddress.PostalCode.length) {
														resAddress.PostalCode = placePostalCode;
														bestResult.Location.DisplayPosition = {
															Latitude: place.position[0],
															Longitude: place.position[1]
														};
													} else {
														resAddress.PostalCode = geocodeAddress.PostalCode;
													}
													placeAddressComponents.splice(placePostcodeIndex, 1);
												}
											}
										} else if (place.category === 'postal-area') {
											resAddress.PostalCode = geocodeAddress.PostalCode;
										}
//									}

									if (['city-town-village', 'administrative-region'].includes(place.category)) {
										delete resAddress.HouseNumber;
										delete resAddress.Street;
										delete resAddress.PostalCode;
										delete resAddress.District;
									}

									var partsToCreateAddressLabel = ['USA', 'CAN'].includes(geocodeAddress.Country)
											? ['HouseNumber', 'Street', 'District', 'City', 'State', 'PostalCode']
											: ['HouseNumber', 'Street', 'District', 'City', 'PostalCode'];
									if (place.category === 'administrative-region') {
									    delete resAddress.City;
									    partsToCreateAddressLabel = ['USA', 'CAN'].includes(geocodeAddress.Country) ? ['County', 'State'] : ['County'];
									}

									if (!resAddress.Country) {
										var countryIndex = geocodeAddress.AdditionalData.findIndex(function(el) {
											return el.key === 'CountryName';
										});
										resAddress.Country = geocodeAddress.Country;
										resAddress.AdditionalData.push(geocodeAddress.AdditionalData[countryIndex]);

										var code2Idx = geocodeAddress.AdditionalData.findIndex(function(el) {
											return el.key === 'Country2';
										});

										resAddress.AdditionalData.push(geocodeAddress.AdditionalData[code2Idx]);
									}

									if (placeAddressComponents.includes(geocodeAddress.State)) {
									    var stateIndex = geocodeAddress.AdditionalData.findIndex(function(el) {
											return el.key === 'StateName';
										});

									    if (stateIndex > -1) {
											resAddress.AdditionalData.push(geocodeAddress.AdditionalData[stateIndex]);
										}
										resAddress.State = geocodeAddress.State;
									}

									var addressLabel = createAddressLabel(partsToCreateAddressLabel, resAddress);
									resAddress.Label = (place.resultType === 'place' ? place.title + ', ' : '') + addressLabel;
									bestResult.Location.Address = resAddress;
									result.push(bestResult);
								}
								placesResult = result;
								if (ukPlacesResult) {
								    if (ukPlacesResult.length !== 0) {
										result.splice(0, 0, ukPlacesResult[0]);
									}
								    onSuccess(result);
								}
							}, errorCallback);
				} else {
					errorCallback();
				}
			}, errorCallback);
}

module.exports = getSuggestions;
getSuggestions("LE9", "GB", (result) => console.log(result.map(r => r.Location.Address.Label)), (error) => console.log(error));
