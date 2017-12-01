function PaperclipTasMain(){

    this.tick=function(){
        //console.log("GOBAUPRZ humanFlag="+humanFlag);
        //console.log("UQTNBIZP unsoldClips="+unsoldClips);
        if(document.getElementById("pctas_main")==null)return;

        this.tickBegin();
        
        this.initCtrl();
        
        // human
        this.autoClipClick();
        this.autoBuyWire();
        this.autoPrice();
        this.highlightBestCliper();
        this.autoBuyCliper();
        
        // earth
        this.autoMakeFarm();
        this.autoEarth();
        
        // common
        this.autoQuantum();
        this.autoTournament();
        
        this.tickEnd();
    };

    this.tickNow = 0;
    this.lastStage = "init";
    this.stage = "unknown";
    this.tickBegin=function(){
        this.tickNow = Date.now();
        if(humanFlag==1){
            this.stage = "human";
        }else if(spaceFlag==1){
            this.stage = "space";
        }else{
            this.stage = "earth";
        }
    };
    this.tickEnd=function(){
        this.lastStage=this.stage;
    };
    
    
    this.autoClipClick=function(){
        if(this.stage!="human")return;
        if(clipmakerLevel>=10)return;
        clipClick(1);
    };
    
    this.autoBuyWire=function(){
        if(!this.getCtrlBool("pctas_ctrl_human_auto_buy_wire"))return;
        if(this.stage!="human")return;
        
        // turn off wirebuyer
        if((wireBuyerFlag==1)&&(wireBuyerStatus==1)){
            toggleWireBuyer();
        }
        
        // buy wire in condition
        do{ // for skip
            if(funds<wireCost)return;
            if(wire<1)break;
            if(clipRate<=0)return;
            if(wire/clipRate<0.5)break;
            if(wireCost>Math.ceil(wireBasePrice-5))return; // hardcode
            if(wire/clipRate>60)return; // hardcode
        }while(false);
        buyWire();
    }
    
    this.autoPriceCooldown = 0;
    this.autoPrice=function(){
        if(this.stage!="human")return;
        if(wire<1)return;
        if(this.autoPriceCooldown>this.tickNow)return;
        if(clipRate<=0)return;
        var positive = (clipRate-avgSales)>0;
        var clipLevel = unsoldClips/clipRate;
        if(positive && (clipLevel>4) && (margin>0.015)){
            lowerPrice();
            this.autoPriceCooldown = this.tickNow+1000;
        }else if((!positive) && (clipLevel<2)){
            raisePrice();
            this.autoPriceCooldown = this.tickNow+1000;
        }else if(clipLevel<0.5){
            raisePrice();
            this.autoPriceCooldown = this.tickNow+1000;
        }
    };
    
    this.autoQuantum=function(){
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

    this.autoClipperDivElement = document.getElementById("autoClipperDiv");
    this.megaClipperDivElement = document.getElementById("megaClipperDiv");
    this.highlightBestCliper=function(){
        if(this.stage!="human")return;
        if(megaClipperFlag==0){
            this.autoClipperDivElement.style.backgroundColor="white";
            return;
        }
        var bestClipper = this.calBestClipper();
        if(bestClipper=="megaclipper"){
            this.autoClipperDivElement.style.backgroundColor="white";
            this.megaClipperDivElement.style.backgroundColor="yellow";
        }else{
            this.autoClipperDivElement.style.backgroundColor="yellow";
            this.megaClipperDivElement.style.backgroundColor="white";
        }
    };
    this.autoBuyCliper=function(){
        if(!this.getCtrlBool("pctas_ctrl_human_auto_buy_clipper"))return;
        if(this.stage!="human")return;
        
        // buy market
        var maxClipperCost = clipperCost;
        if(megaClipperFlag==1){
            maxClipperCost=Math.max(maxClipperCost,megaClipperCost);
        }
        if(adCost<megaClipperCost){
            if(funds<(adCost+wireCost))return;
            buyAds();
            return;
        }
        
        // buy clipper
        var bestClipper = this.calBestClipper();
        if(bestClipper=="megaclipper"){
            if(funds<(wireCost+megaClipperCost))return;
            makeMegaClipper();
        }else{
            if(funds<(wireCost+clipperCost))return;
            makeClipper();
        }
    };
    
    this.calAutoClipperRate = function(){
        return clipperBoost/100;
    };
    this.calMegaClipperRate = function(){
        return megaClipperBoost*5;
    };
    this.calBestClipper=function(){
        if(megaClipperFlag==0){
            return "autoclipper";
        }
        var autoClipperCp = this.calAutoClipperRate() / clipperCost;
        var megaClipperCp = this.calMegaClipperRate() / megaClipperCost;
        if(autoClipperCp>megaClipperCp){
            return "autoclipper";
        }else{
            return "megaclipper";
        }
    };
    
    this.autoTournament = function(){
        if(!this.getCtrlBool("pctas_ctrl_common_auto_yomi"))return;
        if(strategyEngineFlag==0)return;
        if(tourneyInProg==1)return;
        if(operations<tourneyCost)return;
        if(operations<standardOps)return;
        newTourney();
        runTourney();
    };
    
    this.autoMakeFarm = function(){
        if(this.stage!="earth")return;
        if(project127.flag==0)return;
        if(unusedClips<farmCost)return;
        var supply = this.calPowerSupply();
        var demand = this.calPowerDemand();
        var diff = demand - supply;
        if(diff<=0)return;
        diff /= (farmRate/100);
        diff = Math.ceil(diff);
        makeFarm(diff);
    };
    
    this.calPowerSupply=function(){
        return farmLevel * farmRate/100;
    };
    this.calPowerDemand=function(){
        var dDemand = (harvesterLevel * dronePowerRate/100) + (wireDroneLevel * dronePowerRate/100);
        var fDemand = (factoryLevel * factoryPowerRate/100);
        var demand = dDemand + fDemand;
        return demand;
    };
    
    this.autoEarth=function(){
        if(this.stage!="earth")return;
        if(harvesterFlag==0)return;
        if(wireProductionFlag==0)return;
        if(wireDroneFlag==0)return;
        if(factoryFlag==0)return;

        var factoryOutput = this.calFactoryOutput(factoryLevel);
        var harvesterOutput = this.calHarvesterOutput(harvesterLevel);
        var wireOutput = this.calWireOutput(wireDroneLevel);
        
        var outputMin = Math.min(factoryOutput,harvesterOutput,wireOutput);
        var outputMax = Math.max(factoryOutput,harvesterOutput,wireOutput);
        if(harvesterOutput<=outputMin){
            if((unusedClips>=p1000h)&&(this.calHarvesterOutput(harvesterLevel+999)<outputMax)){
                makeHarvester(1000);
            }else if((unusedClips>=p100h)&&(this.calHarvesterOutput(harvesterLevel+99)<outputMax)){
                makeHarvester(100);
            }else if((unusedClips>=p10h)&&(this.calHarvesterOutput(harvesterLevel+9)<outputMax)){
                makeHarvester(10);
            }else if(unusedClips>=harvesterCost){
                makeHarvester(1);
            }
        }
        if(wireOutput<=outputMin){
            if((unusedClips>=p1000w)&&(this.calWireOutput(wireDroneLevel+999)<outputMax)){
                makeWireDrone(1000);
            }else if((unusedClips>=p100w)&&(this.calWireOutput(wireDroneLevel+99)<outputMax)){
                makeWireDrone(100);
            }else if((unusedClips>=p10w)&&(this.calWireOutput(wireDroneLevel+9)<outputMax)){
                makeWireDrone(10);
            }else if(unusedClips>=wireDroneCost){
                makeWireDrone(1);
            }
        }
        if(factoryOutput<=outputMin){
            var shouldMarkFactory = false;
            while(1){ // for break
                if(activeProjects.indexOf(project102)>=0){
                    if(outputMin*60>=1000000000000000000000){
                        shouldMarkFactory = false;
                        break;
                    }
                }
                if(unusedClips<factoryCost){
                    shouldMarkFactory = false;
                    break;
                }
                shouldMarkFactory = true;
                break;
            }
            if(shouldMarkFactory)makeFactory();
        }
    };
    this.calFactoryOutput=function(_factoryLevel){
        var fbst = 1;
        if (factoryBoost > 1){
            fbst = factoryBoost * _factoryLevel;
        }      
        return powMod*fbst*(Math.floor(_factoryLevel)*factoryRate);
    };
    this.calHarvesterOutput=function(_harvesterLevel){
        var dbsth = 1;
        if (droneBoost>1){
            dbsth = droneBoost * Math.floor(_harvesterLevel);
        }
        var mtr = powMod*dbsth*Math.floor(_harvesterLevel)*harvesterRate;
        mtr = mtr * ((200-sliderPos)/100);
        return mtr;
    };
    this.calWireOutput=function(_wireDroneLevel){
        var dbstw = 1;
        if (droneBoost>1){
            dbstw = droneBoost * Math.floor(_wireDroneLevel);
        }
        var a = powMod*dbstw*Math.floor(_wireDroneLevel)*wireDroneRate;
        a = a * ((200-sliderPos)/100);
        return a;
    };
    
    this.getCtrlBool=function(key){
        return document.getElementById(key).checked;
    };
    
    this.initCtrl=function(){
        if(this.lastStage!="init")return;
        for(var key in this.ctrlDefault){
            var value = this.ctrlDefault[key];
            var inputType = document.getElementById(key).type;
            if(inputType=="checkbox"){
                document.getElementById(key).checked = value;
            }
        }
    }
    
    this.start=function(){
        var _this = this;
        setInterval(function(){_this.tick();},200);
        console.log("Paperclips TAS start");
    };
    
    this.ctrlDefault={
        pctas_ctrl_common_auto_yomi: true,

        pctas_ctrl_human_auto_buy_wire: true,
        pctas_ctrl_human_auto_buy_clipper: true,
    };

}

var paperclipTasMain = new PaperclipTasMain();
paperclipTasMain.start();
