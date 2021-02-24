        // Connecting with the background
let bg_port = chrome.runtime.connect({ name: "ebay_list" }),
table_rows_pattern = 'tbody[id*=grid-row]';

var totalPageNumber = 0;
var currentPageNumber = 0;  


setInterval(() => {
    console.log("Time out!");
    location.reload();
}, 600000);



console.log("ebay Start");


if (/complete|interactive|loaded/.test(document.readyState)) {
    // In case the document has finished parsing, document's readyState will
    // be one of "complete", "interactive" or (non-standard) "loaded".
    startPage();
} else {
    // The document is not ready yet, so wait for the DOMContentLoaded event
    console.log("Page Not Ready Yet!");

    document.addEventListener('DOMContentLoaded', startPage, false);
}



function startPage()
{
    console.log("Starting Page");
/*

        // Connecting with the background
    let bg_port = chrome.runtime.connect({ name: "ebay_list" }),
    table_rows_pattern = 'tbody[id*=grid-row]';


    var totalPageNumber = 0;
    var currentPageNumber = 0;  

    */
    

    console.log("isWorkingPage:",isWorkingPage);

    if(typeof isWorkingPage !== 'undefined' && isWorkingPage)
    {

        console.log("isWorkingPage:",isWorkingPage);


    try 
    {
        getCurrentPgNumber();
        chrome.runtime.sendMessage({ type: 'from_ebay_list', command: "fetched_data_proceed" });
    // Send
        sendDataToBackground();
    } catch (error) 
    {
        console.log(error);
        //send to background page their was error and then refresh with is working page
        chrome.runtime.sendMessage({ type: 'from_ebay_list', command: "restart_ebay_page", error:error});
    }




    }




    
bg_port.onMessage.addListener((request) => 
{

    if(request.type === 'set_item_quantity') 
    {
        setItemQuantity(request.itemNumber, request.quantity);

    }

    if(request.type === 'from_background'&& request.command === "set_item_price") 
    {
        setItemPrice(request.itemNumber, request.price);

    }




    if(request.type === 'getItemQuantityAndSku') 
    {
        getItemQuantityAndSku(request.itemNumber);

    }



    if(request.type === 'scroll_to_itemNumber')
        scrollToIndex(request.itemNumber);


});




}





function sendDataToBackground()
{
    // Send
    var totalActiveListings = parseInt($("span.results-count").html().replace(/[^0-9]/g, ''));
    bg_port.postMessage({ type: 'total_active_listings', count: totalActiveListings });
    bg_port.postMessage({ type: 'SKU_codes', sku_list: getSKUsList() });


    bg_port.postMessage({ type: 'pgNumber', totalPageNumber: totalPageNumber, currentPageNumber : currentPageNumber  });
}







function getItemQuantityAndSku(itemNumber)
{


    var table_row_pattern = 'tbody[id*=grid-row-'+itemNumber+']';
    $row = $(table_row_pattern).first();

    var SKU = $row.find('td[class*="listingSKU"]').find('.cell-wrapper').text();
    var quantity = parseInt($row.find('td[class*="availableQuantity"]').find('.cell-wrapper').text().replace(/[^0-9]/g, ''));
    var itemNumber = $row.find(".grid-row").attr("data-id");
    var price = parseFloat($row.find('td[class*="price"]').find('.cell-wrapper').text().replace(/[^0-9.]/g, ''));
    var title = $row.find('td[class*="title"]').find('.cell-wrapper').text();

    bg_port.postMessage(
        { 
            type: 'sentItemQuantityAndSku', 
            itemNumber: itemNumber,
            SKU: SKU,
            quantity: quantity,
            price: price,
            title:title
        });


}

function getSKUsList() {

    let items = [];

    // Looping through all table row elements on ebay active listing page
    // using jquery elements with $
    for(row of $(table_rows_pattern)) {

        //Setting variable in jQuery, this is how you select an item and make it into a jQeury element.
        let $row = $(row);
        var SKU = $row.find('td[class*="listingSKU"]').find('.cell-wrapper').text();
        var quantity = parseInt($row.find('td[class*="availableQuantity"]').find('.cell-wrapper').text().replace(/[^0-9]/g, ''));
        var itemNumber = $row.find(".grid-row").attr("data-id");
        var price = parseFloat($row.find('td[class*="price"]').find('.cell-wrapper').text().replace(/[^0-9.]/g, ''));
        var title = $row.find('td[class*="title"]').find('.cell-wrapper').text();

        items.push({

            SKU: SKU,
            quantity: quantity,
            itemNumber: itemNumber,
            price: price,
            title:title
        
        });

    }

    return items;
}

function scrollToIndex(itemNumber) 
{
    var table_row_pattern = 'tbody[id*=grid-row-'+itemNumber+']';

    $row = $(table_row_pattern).first();

    $row.addClass('highlighted').siblings().removeClass('highlighted');
    
    $('html,body').animate({ scrollTop: $row.offset().top - 350 }, 80);
}



function setItemQuantity(itemNumber ,quantity) 
{

    setRowCellValue(itemNumber, 'availableQuantity', quantity).then(() => 
    {

        var doesFailToEditAlertExist = checkForFailToEditAlert();

        bg_port.postMessage({ type: 'item_quantity_set', itemNumber: itemNumber, doesFailToEditAlertExist: doesFailToEditAlertExist  });

    });

}


function setItemPrice(itemNumber, price)
{

    setRowCellValue(itemNumber, 'price', price).then(() => 
    {

        var doesFailToEditAlertExist = checkForFailToEditAlert();

        //bg_port.postMessage({ type: 'item_quantity_set', itemNumber: itemNumber, doesFailToEditAlertExist: doesFailToEditAlertExist  });
        bg_port.postMessage({ type: 'item_price_set', itemNumber: itemNumber, doesFailToEditAlertExist: doesFailToEditAlertExist  });

    });

}





var waitForEditValueBox = (loopNumber ,itemNumber, key, value, callback) => 
{

    console.log(`Loop #${loopNumber} for: ${itemNumber} - ${key}`);
    

    var table_row_pattern = `tbody[id*=grid-row-${itemNumber}]`;
    $row = $(table_row_pattern).first();
    $row.find(`td[class*="${key}"]`).find('button[data]').click();

    setTimeout(() => 
    {
        var selector = `input[name="members[0][${key}]"]`;
        var priceBox = document.querySelector(selector);
    
        console.log(`Waiting for ${selector}.`);
    
        if (priceBox)
        {
           console.log(`Found ${selector} on loopNumber: ${loopNumber}`);
            return callback(priceBox);
        }else{
            loopNumber++;    
            setTimeout(() => waitForEditValueBox(loopNumber, itemNumber, key, value, callback), 5000);
        }
           
    }, 1000);
    
    
   
}


async function setRowCellValue(itemNumber, key, value) 
{

    console.log(`starting setRowCellValue of ${itemNumber}, ${key}, ${value}`);
  

    return new Promise (resolve => {

        /* old method
        var table_row_pattern = `tbody[id*=grid-row-${itemNumber}]`;
        $row = $(table_row_pattern).first();
        $row.find(`td[class*="${key}"]`).find('button[data]').click();

        setTimeout(() => {
            var table_row_pattern = `tbody[id*=grid-row-${itemNumber}]`;
            $row = $(table_row_pattern).first();
            $row.find(`td[class*="${key}"]`).find('button[data]').click();
        }, 50);
        */
            

       waitForEditValueBox(1, itemNumber, key, value, (priceBox1) =>
       {
           
        setTimeout(
            function() 
            {
              
              //new method 
                console.log("value to insert",value);
                var selector = `input[name="members[0][${key}]"]`;
                var priceBox = document.querySelector(selector);
                priceBox.value = value;
                priceBox.dispatchEvent(new Event("input", { bubbles: true }));
                focusOnTextBoxAtEndOfTheLine(priceBox);


                //old method
               // document.execCommand('insertText', false, value);
           
             


              setTimeout(
                function() 
                {
                    $form = $('form[id*="inline-editors"]');
                    $form.find('button[type="submit"]').click();


                    setTimeout(() => resolve(), 8000); // Third Wait - After Submitting clicking


                }, 900);//Second Wait - After Text Enetered

            }, 500);//First Wait - After Form openm


       });



    });
}

function focusOnTextBoxAtEndOfTheLine(elementToFocusOn) {
    var varCtlLen = elementToFocusOn.value.length;
    // For Most Web Browsers
    if (elementToFocusOn.setSelectionRange) {
      elementToFocusOn.focus();
      elementToFocusOn.setSelectionRange(varCtlLen, varCtlLen);
      // IE8 and below
    } else if (elementToFocusOn.createTextRange) {
      var range = elementToFocusOn.createTextRange();
      range.collapse(true);
      range.moveEnd("character", varCtlLen);
      range.moveStart("character", varCtlLen);
      range.select();
    }
  }
  

function getCurrentPgNumber()
{
    var pgNumberElement = document.getElementsByClassName("go-to-page")[0];


   // currentPageNumber = pgNumberElement.getElementsByClassName("textbox__control1")[0].value;
    currentPageNumber = pgNumberElement.getElementsByClassName("textbox__control")[0].value

    totalPageNumber = pgNumberElement.getElementsByClassName("label")[0].innerText.replace(/\D/g, "");

    console.log("currentPageNumber",currentPageNumber);
    console.log("totalPageNumber",totalPageNumber);



}


function checkForFailToEditAlert()
{
    var doesFailToEditAlertExist = document.getElementsByClassName("inline-alert inline-alert--priority").length;

    return doesFailToEditAlertExist;
}