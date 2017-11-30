function PaperclipTasMain(){

    this.tick=function(){
        //console.log("GOBAUPRZ humanFlag="+humanFlag);
        //console.log("UQTNBIZP unsoldClips="+unsoldClips);
        this.tickBegin();
        
        // human
        this.autoClipClick();
        this.autoBuyWire();
        this.autoPrice();
        this.highlightBestCliper();
        
        // earth
        this.autoMakeFarm();
        this.autoEarth();
        
        // common
        this.autoQuantum();
        this.autoTournament();
    };

    this.tickNow = 0;
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
    }
    
    this.autoClipClick=function(){
        if(this.stage!="human")return;
        if(clipmakerLevel>=10)return;
        clipClick(1);
    };
    
    this.autoBuyWire=function(){
        if(this.shouldBuyWire()){
            buyWire();
        }
    }
    this.shouldBuyWire=function(){
        if(this.stage!="human")return false;
        if(wire<1)return true;
        if(clipRate<=0)return false;
        if(wireCost>Math.ceil(wireBasePrice-5))return false; // hardcode
        if(wire/clipRate>60)return false; // hardcode
        return true;
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
        var autoClipperCp = this.calAutoClipperRate() / clipperCost;
        var megaClipperCp = this.calMegaClipperRate() / megaClipperCost;
        if(megaClipperCp>autoClipperCp){
            this.autoClipperDivElement.style.backgroundColor="white";
            this.megaClipperDivElement.style.backgroundColor="yellow";
        }else{
            this.autoClipperDivElement.style.backgroundColor="yellow";
            this.megaClipperDivElement.style.backgroundColor="white";
        }
    };
    
    this.calAutoClipperRate = function(){
        return clipperBoost/100;
    };
    this.calMegaClipperRate = function(){
        return megaClipperBoost*5;
    };
    
    this.autoTournament = function(){
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

        var factoryOutput = this.calFactoryOutput();
        var harvesterOutput = this.calHarvesterOutput();
        var wireOutput = this.calWireOutput();
        
        var outputMin = Math.min(factoryOutput,harvesterOutput,wireOutput);
        if((wireOutput<=outputMin)&&(unusedClips>=wireDroneCost)){
            makeWireDrone(1);
        }
        if((harvesterOutput<=outputMin)&&(unusedClips>=harvesterCost)){
            makeHarvester(1);
        }
        if((factoryOutput<=outputMin)&&(unusedClips>=factoryCost)){
            makeFactory();
        }
    };
    this.calFactoryOutput=function(){
        var fbst = 1;
        if (factoryBoost > 1){
            fbst = factoryBoost * factoryLevel;
        }      
        return powMod*fbst*(Math.floor(factoryLevel)*factoryRate);
    };
    this.calHarvesterOutput=function(){
        var dbsth = 1;
        if (droneBoost>1){
            dbsth = droneBoost * Math.floor(harvesterLevel);
        }
        var mtr = powMod*dbsth*Math.floor(harvesterLevel)*harvesterRate;
        mtr = mtr * ((200-sliderPos)/100);
        return mtr;
    };
    this.calWireOutput=function(){
        var dbstw = 1;
        if (droneBoost>1){
            dbstw = droneBoost * Math.floor(wireDroneLevel);
        }
        var a = powMod*dbstw*Math.floor(wireDroneLevel)*wireDroneRate;
        a = a * ((200-sliderPos)/100);
        return a;
    };
    
    this.start=function(){
        var _this = this;
        setInterval(function(){_this.tick();},200);
        console.log("Paperclips TAS start");
    };

}

var paperclipTasMain = new PaperclipTasMain();
paperclipTasMain.start();
