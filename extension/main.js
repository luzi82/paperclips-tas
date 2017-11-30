function PaperclipTasMain(){

    this.tickNow = 0;
    this.tick=function(){
        //console.log("GOBAUPRZ humanFlag="+humanFlag);
        //console.log("UQTNBIZP unsoldClips="+unsoldClips);
        this.tickNow = Date.now();
        this.autoPrice();
        this.autoQ();
    };
    
    this.autoPriceCooldown = 0;
    this.autoPrice=function(){
        if(!humanFlag)return;
        if(wire<1)return;
        if(this.autoPriceCooldown>this.tickNow)return;
        var positive = (clipRate-avgSales)>0;
        var clipLevel = unsoldClips/clipRate;
        if(positive && (clipLevel>4) && (margin>0.015)){
            this.lowerPrice();
            this.autoPriceCooldown = this.tickNow+1000;
        }else if((!positive) && (clipLevel<2)){
            this.raisePrice();
            this.autoPriceCooldown = this.tickNow+1000;
        }
    };
    
    this.autoQ=function(){
        var calQ = this.calQComp();
        if(calQ>0){
            qComp();
        }
    };
    
    this.calQComp=function(){
        if(qChips[0].active == 0) return 0;
        var q = 0;
        for (var i = 0; i<qChips.length; i++){
            q = q+qChips[i].value;
        }
        var qq = Math.ceil(q*360);
        return qq;
    };
    
    this.start=function(){
        var tthis = this;
        setInterval(function(){tthis.tick();},200);
        console.log("Paperclips TAS started");
    };

}

var paperclipTasMain = new PaperclipTasMain();
paperclipTasMain.start();
