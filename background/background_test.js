chrome.extension.onConnect.addListener((port) => {
  // Checks the connection source
  if (port.name === "popup") {
    popup_port = port;

    // Begins to listen messages from popup
    popup_port.onMessage.addListener((request) => {
      // Checks the form submission
      if (request.type === "checkSkuWithItemNumber") {
        testCheckSku(request.itemNumber);
      }

      // Checks the form submission
      if (request.type === "setQuantityWithItemNumber") {
        console.log("Debug Mode");
        testSetItemQuantity(request.itemNumber, request.quantity);
      }

      // Checks the form submission
      if (
        request.type === "from_popup" &&
        request.command === "set_price_with_item_number"
      ) {
        console.log("Debug Mode");
        testSetPrice(request.itemNumber, request.price);
      }

      // Checks the form submission
      if (
        request.type === "from_popup" &&
        request.command === "print_amazon_data"
      ) {
        console.log("Debug Mode - print_amazon_data");
        printAmazonData();
      }

     // Checks the form submission
     if (
      request.type === "from_popup" &&
      request.command === "check_competitor"
    ) {
      console.log("Debug Mode - check_competitor");
      checkCompetitor(request.itemNumber);
    }

    });

    popup_port.onDisconnect.addListener(() => (popup_port = null));
  }
});


async function checkCompetitor(itemNumber){
  var ebayItem = await GetItemQuantityAndSku(itemNumber);
  console.log("ebayItem",ebayItem);

  var amazonItem = await fetchAmazonProductDetails(ebayItem);
  console.log("amazonItem",amazonItem);
  

  var ebaySearchResults = await fetchEbaySearchResults(ebayItem.title);
  console.log('ebaySearchResults',ebaySearchResults);

  await checkCompetitors(ebayItem, amazonItem, ebaySearchResults);


}

function printAmazonData() {
  console.log("print_amazon_data");

  amazon_port.postMessage({
    from: "from_background_test",
    type: "print_amazon_data",
  });
}

async function testCheckSku(itemNumber) 
{
  //itemNumber = '352709133364';

  var ebayItem = await GetItemQuantityAndSku(itemNumber);
  console.log("ebayItem background test",ebayItem);

  var amazonItem = await fetchAmazonProductDetails(ebayItem);

  if (amazonItem.isPageCorrectlyOpened) 
  {
    console.log("Test Check Out of Stock, start");
    await checkIfItemIsOutOfStock(amazonItem, ebayItem);
  }

  if (amazonItem.isPageCorrectlyOpened) 
  {
    await checkPriceOfItem(amazonItem, ebayItem);
  }


}

async function testSetItemQuantity(testItemNumber, testQuantity) {
  await setItemQuantity(testItemNumber, testQuantity);
  console.log("setItemQuantity Resolved");
}

async function testSetPrice(testItemNumber, testPrice) {
  await setItemPrice(testItemNumber, testPrice);
  console.log("setItemPrice Resolved");
}

function GetItemQuantityAndSku(itemNumber) {
  var item;

  return new Promise((resolve) => 
  {
    ebay_port.postMessage({
      type: "getItemQuantityAndSku",
      itemNumber: itemNumber,
    });

    ebay_port.onMessage.addListener(
      function ebayReceiveItemQuantityAndSkuRequest(request) {
        if (
          request.type === "sentItemQuantityAndSku" &&
          request.itemNumber === itemNumber
        ) {
          ebay_port.onMessage.removeListener(
            ebayReceiveItemQuantityAndSkuRequest
          );

          item = {
            itemNumber: request.itemNumber,
            SKU: request.SKU,
            quantity: request.quantity,
            price: request.price,
            title:request.title
          };

          resolve(item);
        }
      }
    );

    
  });
}
