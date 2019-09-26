search = function(cb) {

    if (!this.validateOptions())
        return cb({}, 'Bad options');

    var combinedUri = 'https://' + this.options.apiHost + this.options.apiPath;
    combinedUri = combinedUri + '?action=' + this.options.searchAction;
    combinedUri = combinedUri + '&language=' + this.options.language;
    combinedUri = combinedUri + '&search=' + encodeURIComponent(this.options.search);
    combinedUri = combinedUri + '&type=' + this.options.type;
    combinedUri = combinedUri + '&limit=' + this.options.limit;
    combinedUri = combinedUri + '&format=json'; //we always want JSON back...


    var requestOptions = {
        uri: combinedUri,
        method: 'GET'
    };

    //Send the response
    request(requestOptions, function (error, response, wikidataResponse) {

        //Make sure we have no errors.
        if (error)
            return cb({}, error);

        if (response === undefined) {
            return cb({}, 'Undefined WikiData response');
        } else if (response.statusCode === 200) {
            var result = (typeof wikidataResponse === 'string') ? JSON.parse(wikidataResponse) : wikidataResponse;

            //Make sure we got the results list back.
            if (!result.hasOwnProperty('search'))
                return cb({}, wikidataResponse.errors);


            //Now lets trim some uneeded data.
            var trimmedResults = [ ];
            for (var i = 0, len = result.search.length; i < len; i++) {
                var searchResult = result.search[i];
                var trimmed = {};

                if (searchResult.hasOwnProperty('url'))
                    trimmed.url = searchResult.url;
                if (searchResult.hasOwnProperty('id'))
                    trimmed.id = searchResult.id;
                if (searchResult.hasOwnProperty('label'))
                    trimmed.label = searchResult.label;
                if (searchResult.hasOwnProperty('description'))
                    trimmed.description = searchResult.description;


                if (("url" in trimmed) && ("id" in trimmed) && ("label" in trimmed))
                    trimmedResults.push(trimmed);

            }

            return cb({ 'results' : trimmedResults }, wikidataResponse.errors);
        } else
            return cb({}, 'Request error: ' + (typeof response === 'string' ? response : JSON.stringify(response)));


    });
},