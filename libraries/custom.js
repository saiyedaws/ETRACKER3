var waitUntilElementExists = (selector, callback) => 
{
        var el = document.querySelector(selector);
        console.log("Checking");
        
        if (el){
            console.log("Found");
            return callback(el);
        }
        
        setTimeout(() => waitUntilElementExists(selector, callback), 500);
}
        



var waitLimitedTimeUntilInnerTextExists = (selector, loopNumber, callback) => 
{
   
        var el = document.querySelector(selector);




        console.log("Loop# "+loopNumber);
        
        if (el){
            console.log("Found");

            console.log(el);

            return callback(el);
        }
        
        if(loopNumber === 10)
        {

            return callback(null);
        }
        
    
        setTimeout(() => waitLimitedTimeUntilInnerTextExists(selector, loopNumber+1, callback), 500);
}



var waitUnitEitherElementExists = (selector, selector2, loopNumber, callback) => 
{
    console.log("Loop# "+loopNumber);

        var el = document.querySelector(selector);

        var consoleMessage1 = `Searching for selector #1: '${selector}'`;
        console.log(consoleMessage1);
        var consoleMessage2 = `Searching for selector #2: '${selector2}'`;
        console.log(consoleMessage2);
   
        if (el)
        {
            console.log("Found el");
            console.log(el);
            return callback(el);
        }

        var el2 = document.querySelector(selector2);

        if (el2)
        {
            console.log("Found el2");
            console.log(el2);
            return callback(el2);
        }
        


        if(loopNumber === 10)
        {

            return callback(null);
        }
        

        console.log(`Loop #${loopNumber} Done1`);

       
      
        setTimeout(() => 
        {
            //console.log(`timeout Done`);

            waitUnitEitherElementExists(selector, selector2, loopNumber, callback);
        }, 500);
}

        
