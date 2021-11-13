
var priceElement = document.getElementById("corePrice_desktop");



function getPriceElement() {




    var priceElement =
        document.getElementById("price_inside_buybox") ||
        document.getElementById("newBuyBoxPrice") ||
        document.getElementById("priceblock_ourprice") ||
        document.getElementById("priceblock_saleprice") ||
        document.getElementById("buyNewSection") ||
        document.getElementById("buyNew_noncbb") ||
        document.getElementById("priceblock_dealprice") ||
        document.getElementById("usedBuyBoxPrice") ||
        document.getElementById("newBuyBoxPrice") ||
        document.getElementById("priceblock_ourprice") 
        ;

     
    //Elements with weird options
    if(document.querySelectorAll("#buybox-see-all-buying-choices-announce").length > 0)
    {
        var priceElement = document.createElement("div");
        priceElement.innerText = "-99999.00"

        
    }    



    if(document.querySelectorAll("#price").length > 0 && !priceElement)
    {
        var priceElement = document.getElementById("price");
        console.log("priceElement.innerText:",priceElement.innerText);

        if(priceElement.innerText.search("	See price in cart"))
        {
            console.log("	found error {See price in cart}, creating temporary fix");


            priceElement = document.createElement("div");
            priceElement.innerText = "-99999.00"
        }
        
    }  
    


    console.log("priceElement",priceElement);
    return priceElement;

}


function getAmazonPrice() {
    var filteredPrice = "-1";


 
        try {
            var priceElement = document.getElementById("corePrice_desktop");
            priceString = priceElement.innerText;
    
        } catch (error) {

            console.log("error getting priceString price");
            return Number(filteredPrice);
        }



        priceString = priceString.replace("CDN$ ", "");
        var filteredPrices = priceString.match(/\d{1,5}\.\d{0,2}/);

        filteredPrice = filteredPrices[0];
        
        console.log("filteredPrice,",filteredPrice);


        try 
        {
            if(Number(priceString) < 0)
            {
                return Number(priceString);
            }
    
        } catch (error) {
            console.log(error);
        }
      



    return Number(filteredPrice);

}

var price = getAmazonPrice();
console.log("price",price);