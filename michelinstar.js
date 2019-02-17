{
let rp = require('request-promise');
var request = require('request');
let Promise = require('promise');
var cheerio = require('cheerio');
const fs = require('fs');





var ListRestaurants = [];




function GetMichelinRestaurants() {
	for(var i =0;i<35;i++){
		var options = {
			method: 'POST',
			uri: 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-' + i.toString(),
			transform: function (body) {
				return cheerio.load(body);
			}
		};
	 
		rp(options)
			.then(function ($) {
				$('a.poi-card-link').each(function() {
					var current = $(this);
					var url = "https://restaurant.michelin.fr/" + current.attr("href");
					var name = current.find('div.poi_card-display-title').text();
					ListRestaurants.push({ "name": name, "chef": "", "url": url })
				});
				console.log("add restau" + i);
			})
			.catch(function (err) {
				return console.log(err);
			})
	}
	wait(1000);
	for(var i =0;i<ListRestaurants.length;i++)
	{
		CompleteMichelinRestaurants(i);
	}
	

}


function CompleteMichelinRestaurants(i) {

	var options = {
		method: 'POST',
		uri: ListRestaurants[i].url,
		transform: function (body) {
			return cheerio.load(body);
		}
	};

	rp(options)
		.then(function ($) {
			$('.poi_intro-display-title').first().each(function () { //For the name
				let data = $(this);
				let name = data.text();
				name = name.replace(/\n/g, ""); //We need to take out all the newlines because this would cause some problems for the json
				ListRestaurants[index].name = name.trim();
			})

			$('.postal-code').first().each(function () {
				let data = $(this);
				let pc = data.text();
				ListRestaurants[index].postalCode = pc;
			})

			$('#node_poi-menu-wrapper > div.node_poi-chef > div.node_poi_description > div.field.field--name-field-chef.field--type-text.field--label-above > div.field__items > div').first().each(function () {
				let data = $(this);
				let chefname = data.text();
				ListRestaurants[index].chef = chefname;
			})
			console.log("Added info of " + index + "th restaurant")
		})
		.then(ToJSON)
		
		.catch(function (err) {
			return console.log(err);
		});
			
}

function ToJSON()
{
	return new Promise(function(resolve){
		var Rstaujson = JSON.stringify(ListRestaurants);
		fs.writeFile("Restaurants_Michelins.json", Restaujson, function(err) {
			if(err) {
				return console.log(err);
			}
			else {
				return console.log("Json file created",ListRestaurants);
			}
		});
	resolve();
	});
}



GetMichelinRestaurants();

}
    