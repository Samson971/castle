{

let Promise = require('promise');
let rp = require('request-promise');
var request = require('request');
var cheerio = require('cheerio');
const fs = require('fs');

var ListHotels = [];








function GetListHotels() {
	
		var options = {
			method: 'POST',
			uri: 'https://www.relaischateaux.com/fr/site-map/etablissements',
			transform: function (body) {
				return cheerio.load(body);
			}
		};
	 
		rp(options)
			.then(function ($) {
				var res = $('h3:contains("France")').next()
				res.find('li').each (function(element,i){
					var current = $(this);
					var name = current.find('a').first().text();
					var chef = String(current.find('a:contains("Chef")').text().split(' - ')[1]);
					var url = String(current.find('a').attr('href'));
					ListHotels.push({ "name": name.trim(),  "chef": chef.trim(), "url": url,"postalCode" :"", "price": "" });
					return (ListHotels);
				});	
				//console.log(ListHotels);	
			})
			.then (function(){
				for(var i =0;i<ListHotels.length;i++)
				{
					
					CompleteListHotels(i);
				}
				return ListHotels;
			})
			/*.then (function(ListHotels){
				ToJSON();
			})*/
			.catch(function (err) {
				return console.log(err);
			})
		
		
}



function CompleteListHotels(i) {
	
			var options = {
				method: 'POST',
				uri: ListHotels[i].url,
				transform: function (body) {
					return cheerio.load(body);
				}
			};
			
			rp(options)
				.then(function ($) {
					$('span[itemprop="postalCode"]').first().each(function () {
						let current = $(this);
						let pc = current.text();
						ListHotels[i].postalCode = String(pc.split(',')[0]).trim();
					})

					$('.price').first().each(function () {
						let current = $(this);
						let price =current.text();
						ListHotels[i].price = String(price);
					})
					//console.log(ListHotels[index].postalCode);
					//console.log(ListHotels[index].price);
					return console.log("Added postal code and price of " + i + "th hotel")	;
					
					
				})
				.then(ToJSON)
				.catch(function (err) {
					return console.log(err);
				});
		
}

function ToJSON()
{
	return new Promise(function(resolve){
		var HotelsJson = JSON.stringify(ListHotels);
		fs.writeFile("Chateaux-Relais.Json", HotelsJson, function(err) {
			if(err) {
				return console.log(err);
			}
			else {
				return console.log("Json file created",ListHotels);
			}
		});
	resolve();
	});
}
	GetListHotels();

	
}