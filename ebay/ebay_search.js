

console.log("Starting Ebay SKU!");

setInterval(() => {
    console.log("Time out!");
    location.reload();
}, 90000);

if (/complete|interactive|loaded/.test(document.readyState)) {
    // In case the document has finished parsing, document's readyState will
    // be one of "complete", "interactive" or (non-standard) "loaded".
    startPage();
} else {
    // The document is not ready yet, so wait for the DOMContentLoaded event
    console.log("Page Not Ready Yet!");

    document.addEventListener('DOMContentLoaded', startPage, false);
}




async function startPage() 
{
	var searchResults = await getSearchResults();
	//bg_port.postMessage({ type: "from_search", searchResults: searchResults });
	chrome.runtime.sendMessage({
		type: 'from_search',
		searchResults: searchResults
    });
}

async function getSearchResults() 
{
	var searchResults = [];

	var items = mainContent.getElementsByClassName("s-item__info");

	for (var index = 0; index < items.length; index++) 
	{
		var item = items[index];
		try {
			var price = item.getElementsByClassName("s-item__price")[0].innerText;
			//var price = document.getElementsByClassName("s-item__price")[1].innerText;
			var priceDecimalArray = price.match(/(\d+(?:\.\d{1,2})?)/g);


			priceDecimalArray.forEach(priceDecimal => 
				searchResults.push(priceDecimal)
				);

		//searchResults.push(price);
		} catch (error) {
			
		}

	}

	console.log("unsorted results",searchResults);



	searchResults = await sortResults(searchResults);

	console.log("sorted Results",searchResults);

	return searchResults;
}


function sortResults(searchResults){
	return new Promise((resolve, reject) => {
		searchResults.sort(function (a, b) 
		{
			return a - b;
		});

		resolve(searchResults);
	
	});
}