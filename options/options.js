let bg_port = chrome.runtime.connect({ name: "options" });


function save_settings()
{
    if (document.getElementById('competitor_watch_check_box').checked === true) 
    {
        localStorage.setItem('competitor_watch_check_box', true);
        var competitor_watch_check_box = JSON.parse(localStorage.getItem('competitor_watch_check_box'));
        console.log("competitor_watch_check_box",competitor_watch_check_box);

      
    }

    if (document.getElementById('competitor_watch_check_box').checked === false) 
    {
        localStorage.setItem('competitor_watch_check_box', false);
        var competitor_watch_check_box = JSON.parse(localStorage.getItem('competitor_watch_check_box'));
        console.log("competitor_watch_check_box",competitor_watch_check_box);


    }


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

    if (document.getElementById('max_item_price_check_box').checked === true) 
    {
        localStorage.setItem('max_item_price_check_box_value', true);
        var max_item_price_check_box_value = JSON.parse(localStorage.getItem('max_item_price_check_box_value'));
        console.log("max_item_price_check_box_value",max_item_price_check_box_value);
       
      
    }

    if (document.getElementById('max_item_price_check_box').checked === false) 
    {
        localStorage.setItem('max_item_price_check_box_value', false);
        var max_item_price_check_box_value = JSON.parse(localStorage.getItem('max_item_price_check_box_value'));
        console.log("max_item_price_check_box_value",max_item_price_check_box_value);
       
      
    }

    
    

}

function addEventListener(){
    document.querySelector('#out_of_stock_check_box').addEventListener('click', save_settings);
    document.querySelector("#select_new_quantity").addEventListener("change",save_new_quantity);

    document.querySelector('#price_check_box').addEventListener('click', save_settings);
    document.querySelector('#price_percent').addEventListener('click', save_price_percent);


    document.querySelector('#max_item_price_check_box').addEventListener('click', save_settings);
    document.querySelector('#max_item_price_input').addEventListener('click', save_max_item_price);

    document.querySelector('#competitor_watch_check_box').addEventListener('click', save_settings);



    document.querySelector('#chrome_settings').addEventListener('click', open_chrome_settings);

    document.querySelector('#get_errors_button').addEventListener('click', display_errors);


}addEventListener();


function display_errors(){

    try {
        var local_error_list = JSON.parse( localStorage.getItem('local_error_list'));
        console.log("local_error_list",local_error_list);
    
    } catch (error) {
        console.log("error",error);
    }


  


    
}

function save_max_item_price(){
    var max_item_price_input = document.querySelector("#max_item_price_input").value;
    localStorage.setItem('max_item_price_input', max_item_price_input);
    console.log("max_item_price_input",max_item_price_input);

}


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

    var new_quantity = JSON.parse(localStorage.getItem('new_quantity'));
    console.log("new_quantity",new_quantity);
    document.querySelector("#select_new_quantity").value = new_quantity;


    var price_check_box_value = JSON.parse(localStorage.getItem('price_check_box_value'));
    console.log("price_check_box_value",price_check_box_value);
    document.getElementById('price_check_box').checked = price_check_box_value;

    var price_percent = JSON.parse(localStorage.getItem('price_percent'));
    console.log("price_percent",price_percent);
    document.querySelector("#price_percent").value = price_percent;

    var max_item_price_check_box_value = JSON.parse(localStorage.getItem('max_item_price_check_box_value'));
    console.log("max_item_price_check_box_value",max_item_price_check_box_value);
    document.getElementById('max_item_price_check_box').checked = max_item_price_check_box_value;

    var max_item_price_input = JSON.parse(localStorage.getItem('max_item_price_input'));
    console.log("max_item_price_input",max_item_price_input);
    document.querySelector("#max_item_price_input").value = max_item_price_input;

    var competitor_watch_check_box = JSON.parse(localStorage.getItem('competitor_watch_check_box'));
    console.log("competitor_watch_check_box",competitor_watch_check_box);
    document.querySelector("#competitor_watch_check_box").checked = competitor_watch_check_box;

}restore_settings();