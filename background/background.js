let popup_port,
  ebay_port,
  amazon_port,
  ebay_end_port,
  main_tab,
  process_status = false,
  pagination_offset = -50,
  total_active_listings,
  page_items_count = 0,
  iteration_items_count = 0,
  totalPageNumber = 0,
  currentPageNumber = 0,
  endListing_tab,
  didItemFailToUpdate = false,
  amazon_tab_id;

function test_option_settings() {
  var out_of_stock_check_box_value = JSON.parse(
    localStorage.getItem("out_of_stock_check_box_value")
  );
  console.log("out_of_stock_check_box_value", out_of_stock_check_box_value);
}

// Checks connections and waits the popup
chrome.extension.onConnect.addListener((port) => {
  // Checks the connection source
  if (port.name === "popup") {
    popup_port = port;

    // Begins to listen messages from popup
    popup_port.onMessage.addListener((request) => {
      // Checks the form submission
      if (request.type === "start") {
        //startProcess();

        pagination_offset = pagination_offset + (request.pgNumber - 1) * 50;
        startNextPage();
      }
    });

    popup_port.onDisconnect.addListener(() => (popup_port = null));
  }

  if (port.name === "ebay_list") {
    ebay_port = port;

    // Begins to listen messages from Ebay
    ebay_port.onMessage.addListener((request) => {
      if (request.type === "SKU_codes") {
        checkSKUList(request.sku_list);
      }

      if (request.type === "total_active_listings") {
        total_active_listings = request.count;
      }

      if (request.type === "pgNumber") {
        totalPageNumber = request.totalPageNumber;
        currentPageNumber = request.currentPageNumber;

        console.log(currentPageNumber + "/" + totalPageNumber);
      }
    });

    ebay_port.onDisconnect.addListener(() => (ebay_port = null));
  }

  if (port.name === "amazon") {
    amazon_port = port;
  }
});

function startNextPage() {
  process_status = true;

  return new Promise((resolve) => {
    setTimeout(() => {
      page_items_count = 0;
      pagination_offset += 50;

      // Closing previous tab
      try {
        chrome.tabs.remove(main_tab);
        main_tab = null;
      } catch (err) {}

      chrome.tabs.create(
        {
          url:
            "https://www.ebay.ca/sh/lst/active?offset=" +
            pagination_offset +
            "&limit=50&sort=timeRemaining",
          active: false,
        },
        function (tab) {
          // Saving ID of Ebay listing page tab
          main_tab = tab.id;

          // Defining of needed page inside a script
          chrome.tabs.executeScript(main_tab, {
            code: "let isWorkingPage = true;",
            runAt: "document_end",
          });
        }
      );

      let messageListener = (request) => {
        chrome.runtime.onMessage.removeListener(messageListener);

        if (
          request.type === "from_ebay_list" &&
          request.command === "fetched_data_proceed"
        ) {
          resolve();
        }

        if (
          request.type === "from_ebay_list" &&
          request.command === "restart_ebay_page"
        ) {
          //close browser,
          chrome.tabs.remove(main_tab, () => {
            pagination_offset -= 50;

            startNextPage();
            resolve();
          });
        }
      };

      chrome.runtime.onMessage.addListener(messageListener);
    }, 1000);
  });
}

async function checkSKUList(list) {
  total_page_items = list.length;

  for (item of list) {
    ebay_port.postMessage({
      type: "scroll_to_itemNumber",
      itemNumber: item.itemNumber,
    });

    //If item SkU has zero Chars
    if (!item.SKU.length) {
      page_items_count++;
      console.log("ItemNumber " + item.itemNumber + ": Please Add SKU");

      if (item.quantity > 0) {
        await setItemQuantity(item.itemNumber, 0);
      }

      continue;
    }

    await checkItem(item);

    //await checkToEndItemListing(item.itemNumber);

    page_items_count++;
  }

  await checkNextPage();
}



async function checkItem(ebayItem) 
{
 var isCheckOutOfStockEnabled = JSON.parse(localStorage.getItem('out_of_stock_check_box_value'));
console.log("isCheckOutOfStockEnabled", isCheckOutOfStockEnabled);

var isPriceCheckEnabled = JSON.parse(localStorage.getItem('price_percent'));
console.log("price_percent",isPriceCheckEnabled);

  var amazonItem = await fetchAmazonProductDetails(ebayItem);

  if(amazonItem.isPageCorrectlyOpened && isCheckOutOfStockEnabled)
  {
    await checkIfItemIsOutOfStock(amazonItem,ebayItem);
  }

  if(amazonItem.isPageCorrectlyOpened && isPriceCheckEnabled)
  {
    await checkPriceOfItem(amazonItem,ebayItem);
  }



  

}

async function checkPriceOfItem(amazonItem, ebayItem){

    return new Promise((resolve, reject) => {
        var price_percent = JSON.parse(localStorage.getItem('price_percent'));
        var price_percent = (price_percent + 100)/100;
        var ebay_optimal_price = amazonItem.price*price_percent;
        ebay_optimal_price = ebay_optimal_price.toFixed(2);


        console.log("\nprice_percent", price_percent);
        console.log("Current EbayPrice", ebayItem.price);
        console.log("Current Amazon Price", amazonItem.price);
        console.log("ebay_optimal_price", `${amazonItem.price} * ${price_percent} = ${ebay_optimal_price}`);
        
       
        console.log("amazonItem",amazonItem);


        if (amazonItem.isItemAvailable && amazonItem.isEligibleForPrime) 
        {

           if (ebayItem.price != ebay_optimal_price) 
           {
   

               var consoleMessage = `Ebay-Price(${ebayItem.price}) is not the Optimal-Price(${ebay_optimal_price}), Changing Now...`
               console.log(consoleMessage);

              // resolve();


               setItemPrice(ebayItem.itemNumber, ebay_optimal_price).then(() => resolve());

    
           } else 
           {
               resolve();
           }


        
       }else{
           resolve();
       }
    });
}

async function checkIfItemIsOutOfStock(amazonItem, ebayItem)
{

    return new Promise((resolve, reject) => 
    {
        //get new quantity from options
        var new_quantity = JSON.parse(localStorage.getItem('new_quantity'));
        console.log("New Quantity background", new_quantity);


        if (amazonItem.isItemAvailable && amazonItem.isEligibleForPrime && ebayItem.quantity === 0) 
        {
       
            setItemQuantity(ebayItem.itemNumber, new_quantity).then(() => resolve());
        }else{
            resolve();
        }
        
    });
    
}

function checkNextPage() 
{
  return new Promise((resolve) => {
    if (currentPageNumber === totalPageNumber) {
      console.log("On the Last Page!");
      pagination_offset = -50;
      page_items_count = 0;

      var minute = 60 * 1000;

      console.log("Waiting 30 minutes");
      setTimeout(() => {
        startNextPage().then(() => resolve());
      }, minute * 30);
    } else if (page_items_count >= total_page_items) {
      //console.log("Starting Next Page");
      startNextPage().then(() => resolve());
    }
  });
}

async function fetchAmazonProductDetails(item) {
  //console.log(item);

  await launchAmazonItemPage(item.SKU);

  var amazonItemUrl = `https://www.amazon.ca/dp/${sku}`;
  var quantity = item.quantity;
  var itemNumber = item.itemNumber;
  var ebayPrice = item.price;

  console.log("fetchAmazonProductDetails");

  return new Promise((resolve) => {
    //add check that right asin is being checked
    let messageListener = function (request) {

      console.log("request",request);
      console.log("amazonItemUrl:",amazonItemUrl.toLowerCase().replace(/(\s\s\s*)/g, " "));
      console.log("request.amazonItemUrl:",request.amazonItemData.amazonItemUrl
      .toLowerCase()
      .replace(/(\s\s\s*)/g, " "));
      
      
      if (
        request.type === "from_amazon" &&
        request.command === "fetched_data" &&
        amazonItemUrl.toLowerCase().replace(/(\s\s\s*)/g, " ") ===
          request.amazonItemData.amazonItemUrl
            .toLowerCase()
            .replace(/(\s\s\s*)/g, " ")
      ) {
        chrome.runtime.onMessage.removeListener(messageListener);

        amazonItemData = request.amazonItemData;

        //console.log(amazonItemData);

        chrome.tabs.remove(amazon_tab_id, () => {
            resolve(amazonItemData);
        });

        
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
  });
}

function setItemQuantity(itemNumber, quantity) {
  return new Promise((resolve) => {
    ebay_port.postMessage({
      type: "set_item_quantity",
      itemNumber: itemNumber,
      quantity: quantity,
    });

    ebay_port.onMessage.addListener(function ebayReceiveOnceQuantityRequest(
      request
    ) {
      if (
        request.type === "item_quantity_set" &&
        request.itemNumber === itemNumber &&
        !request.doesFailToEditAlertExist
      ) {
        ebay_port.onMessage.removeListener(ebayReceiveOnceQuantityRequest);
        resolve();
      }

      if (request.doesFailToEditAlertExist) {
        console.log(
          "ItemNumber " +
            itemNumber +
            ": Failed to Update Quantity/Price, Please Delete/End Listing"
        );
        didItemFailToUpdate = true;
        resolve();
      }
    });
  });
}

function setItemPrice(itemNumber, price) {
  return new Promise((resolve) => {
    ebay_port.postMessage({
      type: "from_background",
      command: "set_item_price",
      itemNumber: itemNumber,
      price: price,
    });

    ebay_port.onMessage.addListener(function ebayReceiveOnceQuantityRequest(
      request
    ) {
      if (
        request.type === "item_price_set" &&
        request.itemNumber === itemNumber &&
        !request.doesFailToEditAlertExist
      ) {
        ebay_port.onMessage.removeListener(ebayReceiveOnceQuantityRequest);
        resolve();
      }

      if (request.doesFailToEditAlertExist) {
        console.log(
          "itemNumber " + request.itemNumber + ": Failure Messages Exists"
        );
        didItemFailToUpdate = true;
        resolve();
      }
    });
  });
}

function checkToEndItemListing(itemNumber) {
  return new Promise((resolve) => {
    if (didItemFailToUpdate === true) {
      console.log("Start End Listing!");

      chrome.tabs.create(
        {
          url:
            "https://offer.ebay.ca/ws/eBayISAPI.dll?VerifyStop&item=" +
            itemNumber,
          active: false,
        },
        function (tab) {
          // Saving ID of Ebay listing page tab
          endListing_tab = tab.id;

          // Checks connections and waits the ebay_end
          chrome.extension.onConnect.addListener((port) => {
            // Checks the connection source
            if (port.name === "ebay_end") {
              ebay_end_port = port;

              // Begins to listen messages from ebay_end
              ebay_end_port.onMessage.addListener((request) => {
                // Checks the form submission
                if (request.type === "ebay_end_loaded") {
                  //startProcess();
                  console.log("ebay_end_loaded");

                  ebay_end_port.postMessage({ type: "end_listing_now" });
                }

                if (request.type === "ended_listing") {
                  //startProcess();
                  console.log("ended_listing : " + itemNumber);

                  chrome.tabs.remove(endListing_tab);
                  didItemFailToUpdate = false;
                  resolve();
                }
              });

              ebay_end_port.onDisconnect.addListener(
                () => (ebay_end_port = null)
              );
            }
          });
        }
      );
    } else {
      didItemFailToUpdate = false;
      resolve();
    }
  });
}
//---------------------------------------Refactored Functions---------------------------------------------------

function decodeSKU(b64SKU) {
  sku = atob(b64SKU);

  if (sku.charAt(sku.length - 1) === "@") {
    sku = sku.slice(0, -1) + "?th=1&psc=1";
  }

  sku = sku.replace(/\s+/g, "");

  return sku;
}

function launchAmazonItemPage(b64SKU) {
  return new Promise((resolve) => {
    var sku = decodeSKU(b64SKU);

    var amazonItemUrl = `https://www.amazon.ca/dp/${sku}`;
    chrome.tabs.create({ url: amazonItemUrl, active: false }, function (tab) {
      amazon_tab_id = tab.id;
      var codeToInject = `let checkThisProduct = true, asin = "${sku}";`;

      chrome.tabs.executeScript(
        amazon_tab_id,
        { code: codeToInject, runAt: "document_start" },
        () => {
          resolve();
        }
      );
    });
  });
}