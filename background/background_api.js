var amazon_captcha_port,
options_port;


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

    if (request.type == "amazon_captcha_found_2")
    {
      //var captchaKey = await getSolvedCaptcha(imgUrl);
      
      getSolvedCaptcha(request.captchaImgUrl).then(function(captchaKey)
      {
        console.log("captchaKey amazon_captcha_found_2",captchaKey);
        sendResponse({type: 'amazon_captcha_solved', captchaKey:captchaKey});
       
      });
      
     
      
    }
    //return true to indicate you want to send a response asynchronously
    return true;
     
  });



chrome.extension.onConnect.addListener(port => {

    // Checks the connection source
    if(port.name === 'popup') 
    {

        popup_port = port;

        // Begins to listen messages from popup
        popup_port.onMessage.addListener(request => {

 
            if(request.type === 'captcha') 
            {
                var imgUrl = "https://images-na.ssl-images-amazon.com/captcha/bcxmjlko/Captcha_ftrsgxbmvh.jpg";
                console.log("Captcha Solver Start");
                getSolvedCaptcha(imgUrl);
                

            }


        });

        popup_port.onDisconnect.addListener(() => popup_port = null );
    }




        // Checks the connection source
        if(port.name === 'amazon') 
        {
    
          amazon_port = port;
    
            // Begins to listen messages from popup
            amazon_port.onMessage.addListener(request => {
    
     
                if(request.type === 'amazon_captcha_found') 
                {
                    console.log("amazon_captcha_found");
                  console.log("amazon_port",amazon_port);

                    //var imgUrl = "https://images-na.ssl-images-amazon.com/captcha/bcxmjlko/Captcha_ftrsgxbmvh.jpg";
                    getSolvedCaptcha(request.captchaImgUrl);
                    
                    
                }
    
    
            });
    
            amazon_port.onDisconnect.addListener(() => amazon_port = null );
        }


            // Checks the connection source
    if(port.name === 'options') 
    {

        options_port = port;

        // Begins to listen messages from popup
        options_port.onMessage.addListener(request => {

 
            if(request.type === 'open_chrome_settings') 
            {
              chrome.tabs.create({ url: 'chrome://settings/content/javascript', active: false }, function (tab) {

              });

              chrome.tabs.create({ url: 'chrome://settings/content/images', active: false }, function (tab) {

              });

            }


        });

        options_port.onDisconnect.addListener(() => options_port = null );
    }





});



async function getSolvedCaptcha(imgUrl)
{
  

    console.log("Getting Solved Captcha")
    var captchaKey =  await solveCaptcha(imgUrl);

    
    console.log("Solved Captcha: "+captchaKey);
  
  
    //amazon_captcha_port.postMessage({ type: 'amazon_captcha_solved', captchaKey: captchaKey});
    //console.log("Sending captcha Key");
    //amazon_port.postMessage({ type: 'amazon_captcha_solved', captchaKey: captchaKey});
  
    //chrome.runtime.sendMessage({type: "amazon_captcha_solved"});
    //chrome.tabs.sendMessage(null, {type: "amazon_captcha_solved"});
  
    return captchaKey;
   
  


}




function getB64Image(imgUrl)
{

  console.log();
  return new Promise(resolve =>{

    toDataURL(imgUrl, async function(dataUrl) 
    {
      var imgb64 = dataUrl.replace("data:image/jpeg;base64,","");
      resolve(imgb64);

    });

  });

}


function toDataURL(url, callback) 
{
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }




async function solveCaptcha(imgUrl)
{
 
console.log("Solve Cpatcha Starterd: ");

var b64 = await getB64Image(imgUrl);

 var obj = {
    "signature_name":"serving_default",
    "inputs":{
       "input":{
          "b64":b64
       }
    }
 };



return new Promise(resolve =>{

    fetch('http://localhost:8501/v1/models/resnet:predict', {
        method: 'POST',
        body: JSON.stringify(obj), 
        headers: {
            'cache-control': 'no-cache',
            'content-type' : 'application/json'
        }
    }).then(resp => resp.json()).then(data => {
    
        var outputs = data.outputs;
        captchaKey = outputs.output;

        console.log(captchaKey);
        resolve(captchaKey);
    

})

 


})



}

