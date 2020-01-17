function fillCountry(geocodeAddress, placeAddressComponents, resAddress) {
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
}

function fillState(geocodeAddress, placeAddressComponents, resAddress) {
    var stateIndex = geocodeAddress.AdditionalData.findIndex(function(el) {
        return el.key === 'StateName';
    });

    if (stateIndex > -1) {
        resAddress.AdditionalData.push(geocodeAddress.AdditionalData[stateIndex]);
    }
    resAddress.State = geocodeAddress.State;
}

function fillByKey(keys, geocodeAddress, placeAddressComponents, resAddress) {
    keys.forEach(function(key) {
        var value = geocodeAddress[key];

        var index = placeAddressComponents.findIndex(function(el) {

            return value && el.toLowerCase().includes(value.toLowerCase());
        });
        if (index > -1) {
            var placeComponent = placeAddressComponents[index];
            // var clearedPlaceComponent = placeComponent.replace(value, '');
            // if (clearedPlaceComponent.trim()) {
            //     placeAddressComponents[index] = clearedPlaceComponent;
            // } else {
//													placeAddressComponents.splice(index, 1);
                resAddress[key] = value;
            // }
        }
    });
}

function fillPostCodeStreetNumber(bestResult, placeAddressComponents, resAddress, place) {
    var geocodeAddress = bestResult.Location.Address;
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
                if (placePostalCode.length >= geocodeAddress.PostalCode.length && geocodeAddress.Country === 'GBR') {
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
}

module.exports = {
    fillCountry, fillState, fillByKey, fillPostCodeStreetNumber
};

