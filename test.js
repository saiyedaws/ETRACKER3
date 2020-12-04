var key = 'price';
var itemNumber = '352814156356';

var table_row_pattern = `tbody[id*=grid-row-${itemNumber}]`;
$row = $(table_row_pattern).first();
$row.find(`td[class*="${key}"]`).find('button[data]').click();


//var elms = document.getElementsByClassName("gift_card_balance");
var elms = document.getElementsByClassName("total_pending_value");

var total = 0;

for (let index = 0; index < elms.length; index++) {
    var price = elms[index].innerText;
    price = parseInt(price);
    total = total + price;
    
    
}

console.log("total",total);