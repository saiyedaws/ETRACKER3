let bg_port = chrome.runtime.connect({ name: "options" });


function save_settings()
{
    if (document.getElementById('out_of_stock_check_box').checked === true) 
    {
        localStorage.setItem('out_of_stock_check_box_value', true);
        console.log('out_of_stock_check_box_value',true);

        var out_of_stock_local_storage = JSON.parse(localStorage.getItem('out_of_stock_check_box_value'));
        console.log("out_of_stock_local_storage",out_of_stock_local_storage);
      
    }

    if (document.getElementById('out_of_stock_check_box').checked === false) 
    {
        localStorage.setItem('out_of_stock_check_box_value', false);
        console.log('out_of_stock_check_box_value',false);

        var out_of_stock_local_storage = JSON.parse(localStorage.getItem('out_of_stock_check_box_value'));
        console.log("out_of_stock_local_storage",out_of_stock_local_storage);
    }

    if (document.getElementById('price_check_box').checked === true) 
    {
        localStorage.setItem('price_check_box_value', true);
        console.log('price_check_box',true);
      
    }

    if (document.getElementById('price_check_box').checked === false) 
    {
        localStorage.setItem('price_check_box_value', false);
        console.log('price_check_box',false);
      
    }


    
    

}

function addEventListener(){
    document.querySelector('#out_of_stock_check_box').addEventListener('click', save_settings);
    document.querySelector("#select_new_quantity").addEventListener("change",save_new_quantity);

    document.querySelector('#price_check_box').addEventListener('click', save_settings);
    document.querySelector('#price_percent').addEventListener('click', save_price_percent);


    document.querySelector('#chrome_settings').addEventListener('click', open_chrome_settings);


}addEventListener();

function open_chrome_settings()
{
    copyToClipboard('https://www.amazon.ca');

    bg_port.postMessage({ type: "open_chrome_settings"});
}






function save_price_percent(){
    var price_percent = document.querySelector("#price_percent").value;
    localStorage.setItem('price_percent', price_percent);
    console.log("price_percent",price_percent);

}

function save_new_quantity()
{

    var new_quantity = document.querySelector("#select_new_quantity").value;
    localStorage.setItem('new_quantity', new_quantity);
    console.log("new_quantity",new_quantity);

   // var new_quantity_local_storage = JSON.parse(localStorage.getItem('new_quantity'));
   // console.log("new_quantity_local_storage",new_quantity_local_storage);

}

function restore_settings(){

   
    var out_of_stock_check_box_value = JSON.parse(localStorage.getItem('out_of_stock_check_box_value'));
    console.log("out_of_stock_check_box_value",out_of_stock_check_box_value);
    document.getElementById('out_of_stock_check_box').checked = out_of_stock_check_box_value;


    var price_check_box_value = JSON.parse(localStorage.getItem('price_check_box_value'));
    console.log("price_check_box_value",price_check_box_value);
    document.getElementById('price_check_box').checked = price_check_box_value;

      
    var new_quantity = JSON.parse(localStorage.getItem('new_quantity'));
    console.log("new_quantity",new_quantity);
    document.querySelector("#select_new_quantity").value = new_quantity;

    var price_percent = JSON.parse(localStorage.getItem('price_percent'));
    console.log("price_percent",price_percent);
    document.querySelector("#price_percent").value = price_percent;

}restore_settings();