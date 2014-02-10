parsedJSON = null;
locationGlobal = null;
map = null;
timer = null;
place = null;

$(document).ready(function() {
	
	$.ajax({
	    type: 'GET',
	    url: 'http://freegeoip.net/json/',
	    dataType: 'json',
	    success: function(location) { 
			locationGlobal = location;
		  // example where I update content on the page.
		  //jQuery('#city').html(location.city);
		  //jQuery('#region-code').html(location.region_code);
		  // jQuery('#region-name').html(location.region_name);
		  // jQuery('#areacode').html(location.areacode);
	 // 	  jQuery('#ip').html(location.ip);
	 // 	  jQuery('#zipcode').html(location.zipcode);
	 // 	  jQuery('#longitude').html(location.longitude);
	 // 	  jQuery('#latitude').html(location.latitude);
	 // 	  jQuery('#country-name').html(location.country_name);
	 // 	  jQuery('#country-code').html(location.country_code);
	 		var googleLatAndLong = new google.maps.LatLng(parseFloat(location.latitude), parseFloat(location.longitude));
	   	 	var mapOptions = { zoom: 15, center: googleLatAndLong, mapTypeId:   google.maps.MapTypeId.ROADMAP};
	 	   	var mapDiv = document.getElementById('map');
	 	  	map = new google.maps.Map(mapDiv, mapOptions);
		},
		async: false
	});
	
	google.maps.event.addDomListener(map, 'idle', function() {
   	    $.ajax({
   	        url: "http://127.0.0.1:9393/koniky",
			type: 'GET',
   			// data: {lon: locationGlobal.longitude,lat: locationGlobal.latitude}
   			data: {nelo: map.getBounds().getNorthEast().lng(), nela: map.getBounds().getNorthEast().lat(), swlo: map.getBounds().getSouthWest().lng(), swla: map.getBounds().getSouthWest().lat()}
   	    }).then(function(data) {
   			parsedJSON = data;
   			var list = $("#konikyList").listview();
   			$(list).empty();
   			$(data).each(function(index){
   			    $(list).append('<li><a href="#detail?id=' + this._id.$oid + '">' + this.type + " of name " + this.name + '</a></li>');
				// add removing markers
   				new google.maps.Marker({
   					position: new google.maps.LatLng(this.loc.coordinates[1], this.loc.coordinates[0]),
   					map: map,
   					title: this.name
   				});
   			});
   			$(list).listview('refresh');
   	       //$('.greeting-id').append(data[0].name);
   	       //$('.greeting-content').append(data.content);
   	    });
	})

	
	$("#verify").click(function (e) {
	    e.stopImmediatePropagation();
	    e.preventDefault();
	    //Do important stuff....
	    
	});
	
	$( "#addForm" ).on('submit', function( event ) {
 	   
		//cache the form element for use in this function
		var $this = $(this); 
				 
		// Stop form from submitting normally
		event.preventDefault();

	    //run an AJAX post request to your server-side script, $this.serialize() is the data from your form being added to the request
	    $.post($this.attr('action'), $this.serialize(), function (responseData) {
			$('#result').html(JSON.stringify(responseData));
			$( '#addForm' ).each(function(){
			    this.reset();
			});
	        //in here you can analyze the output from your server-side script (responseData) and validate the user's login without leaving the page
	    });
	});
	
	
	// This example displays an address form, using the autocomplete feature
	// of the Google Places API to help users fill in the information.

	var placeSearch, autocomplete;
	var componentForm = {
	  street_number: 'short_name',
	  latitude: 'long_name',
	  longitude: 'long_name'
	};

	  // Create the autocomplete object, restricting the search
	  // to geographical location types.
	  autocomplete = new google.maps.places.Autocomplete(
	      /** @type {HTMLInputElement} */(document.getElementById('autocomplete')),
	      { types: ['geocode'] });
	  // When the user selects an address from the dropdown,
	  // populate the address fields in the form.
	  google.maps.event.addListener(autocomplete, 'place_changed', function() {
	    fillInAddress();
	  });
	

	// The START and END in square brackets define a snippet for our documentation:
	function fillInAddress() {
	  // Get the place details from the autocomplete object.
	  place = autocomplete.getPlace();
	  
	  for (var component in componentForm) {
	    document.getElementById(component).value = '';
		$('#'+component).textinput('enable');
	  }

	  // Get each component of the address from the place details
	  // and fill the corresponding field on the form.
	   document.getElementById('latitude').value = place.geometry.location.lat();
	   document.getElementById('longitude').value = place.geometry.location.lng();
	  
	  for (var i = 0; i < place.address_components.length; i++) {
	    var addressType = place.address_components[i].types[0];
	    if (componentForm[addressType]) {
	      var val = place.address_components[i][componentForm[addressType]];
	      document.getElementById(addressType).value = val;
	    }
	  }
	}

	// Bias the autocomplete object to the user's geographical location,
	// as supplied by the browser's 'navigator.geolocation' object.
	function geolocate() {
	  if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position) {
	      var geolocation = new google.maps.LatLng(
	          position.coords.latitude, position.coords.longitude);
	      autocomplete.setBounds(new google.maps.LatLngBounds(geolocation,
	          geolocation));
	    });
	  }
	}
	
	function populate_detail(id) {
		$.mobile.loading('show');
		$("#konik_detail").html('');
   	    $.ajax({
   	        url: "http://127.0.0.1:9393/koniky/" + id,
			complete: function() { $.mobile.loading('hide'); }, //Hide spinner
			type: 'GET'
   	    }).then(function(data) {
			$("#detail_name").html("Name: " + data[0].name);
			$("#detail_type").html("Type: " + data[0].type);
			$("#detail_latitude").html("Latitude: " + data[0].loc.coordinates[1]);
			$("#detail_longitude").html("Longitude: " + data[0].loc.coordinates[0]);
   	    });
	}
	
	// Given a query string, convert all the name/value pairs
	// into a property/value object. If a name appears more than
	// once in a query string, the value is automatically turned
	// into an array.
	function queryStringToObject( qstr )
	{
		var result = {},
			nvPairs = ( ( qstr || "" ).replace( /^\?/, "" ).split( /&/ ) ),
			i, pair, n, v;

		for ( i = 0; i < nvPairs.length; i++ ) {
			var pstr = nvPairs[ i ];
			if ( pstr ) {
				pair = pstr.split( /=/ );
				n = pair[ 0 ];
				v = pair[ 1 ];
				if ( result[ n ] === undefined ) {
					result[ n ] = v;
				} else {
					if ( typeof result[ n ] !== "object" ) {
						result[ n ] = [ result[ n ] ];
					}
					result[ n ].push( v );
				}
			}
		}

		return result;
	}
	
	
	// The idea here is to listen for any pagebeforechange notifications from
	// jQuery Mobile, and then muck with the toPage and options so that query
	// params can be passed to embedded/internal pages. So for example, if a
	// changePage() request for a URL like:
	//
	//    http://mycompany.com/myapp/#page-1?foo=1&bar=2
	//
	// is made, the page that will actually get shown is:
	//
	//    http://mycompany.com/myapp/#page-1
	//
	// The browser's location will still be updated to show the original URL.
	// The query params for the embedded page are also added as a property/value
	// object on the options object. You can access it from your page notifications
	// via data.options.pageData.
	$( document ).bind( "pagebeforechange", function( e, data ) {

		// We only want to handle the case where we are being asked
		// to go to a page by URL, and only if that URL is referring
		// to an internal page by id.
		if ( typeof data.toPage === "string" ) {
			var u = $.mobile.path.parseUrl( data.toPage );
			if ( $.mobile.path.isEmbeddedPage( u ) ) {

				// The request is for an internal page, if the hash
				// contains query (search) params, strip them off the
				// toPage URL and then set options.dataUrl appropriately
				// so the location.hash shows the originally requested URL
				// that hash the query params in the hash.

				var u2 = $.mobile.path.parseUrl( u.hash.replace( /^#/, "" ) );
				if ( u2.search ) {
					if ( !data.options.dataUrl ) {
						data.options.dataUrl = data.toPage;
					}
					data.options.pageData = queryStringToObject( u2.search );
					data.toPage = u.hrefNoHash + "#" + u2.pathname;
					populate_detail(data.options.pageData["id"]);
				}
			}
		}
	});
	
});