var tickNow = 0;
function tick(){
    //console.log("GOBAUPRZ humanFlag="+humanFlag);
    //console.log("UQTNBIZP unsoldClips="+unsoldClips);
    tickNow = Date.now();
    autoPrice();
    autoQ();
}

var autoPriceCooldown = 0;
function autoPrice(){
    if(!humanFlag)return;
    if(wire<1)return;
    if(autoPriceCooldown>tickNow)return;
    var positive = (clipRate-avgSales)>0;
    var clipLevel = unsoldClips/clipRate;
    if(positive && (clipLevel>4) && (margin>0.015)){
        lowerPrice();
        autoPriceCooldown = tickNow+1000;
    }else if((!positive) && (clipLevel<2)){
        raisePrice();
        autoPriceCooldown = tickNow+1000;
    }
}

function autoQ(){
    var calQ = calQComp();
    if(calQ>0){
        qComp();
    }
}

function calQComp(){
    if(qChips[0].active == 0) return 0;
    var q = 0;
    for (var i = 0; i<qChips.length; i++){
        q = q+qChips[i].value;
    }
    var qq = Math.ceil(q*360);
    return qq;
}

setInterval(tick,200);

console.log("Paperclips TAS started");
