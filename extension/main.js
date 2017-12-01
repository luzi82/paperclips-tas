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
        
        // space
        this.autoSpace();
        this.autoSpaceProcessor();
        
        // common
        this.autoQuantum();
        this.autoTournament();
        this.watchScore();
        
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
        }else if(bestClipper=="autoclipper"){
            this.autoClipperDivElement.style.backgroundColor="yellow";
            this.megaClipperDivElement.style.backgroundColor="white";
        }
    };
    this.autoBuyCliper=function(){
        if(!this.getCtrlBool("pctas_ctrl_human_auto_buy_clipper"))return;
        if(this.stage!="human")return;
        
        // buy market
        var shouldBuyMarket=false;
        do{
            if(((clipRate-avgSales)>0)&&(margin<0.015)){shouldBuyMarket=true;break;} // over produce
            var maxClipperCost = clipperCost;
            if(megaClipperFlag==1){
                maxClipperCost=Math.max(maxClipperCost,megaClipperCost);
            }
            if(adCost<maxClipperCost){shouldBuyMarket=true;break;}
        }while(false);
        if(shouldBuyMarket){
            if(funds<(adCost+wireCost))return;
            buyAds();
            return;
        }
        
        // buy clipper
        var bestClipper = this.calBestClipper();
        if(bestClipper=="megaclipper"){
            if(funds<(wireCost+megaClipperCost))return;
            makeMegaClipper();
        }else if(bestClipper=="autoclipper"){
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
        if(autoClipperFlag==0){
            return "none";
        }
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
        
        // turn off autoTourney
        if((autoTourneyFlag==1)&&(autoTourneyStatus==1)){
            toggleAutoTourney();
        }
        
        if((pick=="10")||(pick==10)){
            pick = 0;
            stratPickerElement.value=0;
        }
        if(!(btnNewTournamentElement.disabled)){newTourney();}
        if(!(btnRunTournamentElement.disabled)){runTourney();}
    };
    
    this.lastWatch_tourneyLvl = 0;
    this.watchScore = function(){
        if(!this.getCtrlBool("pctas_ctrl_common_auto_strat"))return;
        if(strategyEngineFlag==0)return;

        if(tourneyInProg==0)return;
        if(tourneyLvl==this.lastWatch_tourneyLvl)return;
        if(currentRound<rounds-2)return;
        this.hackScoreLoop_tourneyLvl=tourneyLvl;
        var _this=this;
        setTimeout(function(){_this.hackScoreLoop();},10);
        this.lastWatch_tourneyLvl=tourneyLvl;
    };

    this.hackScoreLoop_tourneyLvl=0;
    this.hackScoreLoop=function(){
        if(tourneyInProg==0)return;
        if(tourneyLvl!=this.hackScoreLoop_tourneyLvl)return;
        var bestPick = 0;
        var bestPickScore = -1;
        var ii;
        for(ii=0;ii<strats.length;ii++){
            var score = strats[ii].currentScore;
            if(score<=bestPickScore)continue;
            bestPickScore=score;
            bestPick=ii;
        }
        pick = bestPick;
        stratPickerElement.value=bestPick;
        var _this=this;
        setTimeout(function(){_this.hackScoreLoop();},10);
    }
    
    this.autoMakeFarm = function(){
        if(this.stage!="earth")return;
        if(project127.flag==0)return;
        if(unusedClips<farmCost)return;
        var supply = this.calPowerSupply();
        var demand = this.calPowerDemand();
        var diff = demand + (factoryPowerRate/100) - supply;
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
        if(!this.getCtrlBool("pctas_ctrl_earth_autoearth"))return;
        if(this.stage!="earth")return;
        if(harvesterFlag==0)return;
        if(wireProductionFlag==0)return;
        if(wireDroneFlag==0)return;
        if(factoryFlag==0)return;
        if(availableMatter<=0)return;
        if(this.calPowerSupply()<this.calPowerDemand())return;

        var factoryOutput = this.calFactoryOutput(factoryLevel);
        var harvesterOutput = this.calHarvesterOutput(harvesterLevel);
        var wireOutput = this.calWireOutput(wireDroneLevel);
        
        var outputMin = Math.min(factoryOutput,harvesterOutput,wireOutput);
        var outputMax = Math.max(factoryOutput,harvesterOutput,wireOutput);
        if(harvesterOutput<=outputMin){
            if((unusedClips>=p1000h)&&(this.calHarvesterOutput(harvesterLevel+999)<outputMax)){
                makeHarvester(1000);
            }else if(unusedClips>=p1000h){
                makeHarvester(100);
            }else if((unusedClips>=p100h)&&(this.calHarvesterOutput(harvesterLevel+99)<outputMax)){
                makeHarvester(100);
            }else if(unusedClips>=p100h){
                makeHarvester(10);
            }else if((unusedClips>=p10h)&&(this.calHarvesterOutput(harvesterLevel+9)<outputMax)){
                makeHarvester(10);
            }else if(unusedClips>=harvesterCost){
                makeHarvester(1);
            }
        }
        if(wireOutput<=outputMin){
            if((unusedClips>=p1000w)&&(this.calWireOutput(wireDroneLevel+999)<outputMax)){
                makeWireDrone(1000);
            }else if(unusedClips>=p1000w){
                makeWireDrone(100);
            }else if((unusedClips>=p100w)&&(this.calWireOutput(wireDroneLevel+99)<outputMax)){
                makeWireDrone(100);
            }else if(unusedClips>=p100w){
                makeWireDrone(10);
            }else if((unusedClips>=p10w)&&(this.calWireOutput(wireDroneLevel+9)<outputMax)){
                makeWireDrone(10);
            }else if(unusedClips>=wireDroneCost){
                makeWireDrone(1);
            }
        }
        if(factoryOutput<=outputMin){
            if((swarmFlag==1)&&(parseInt(sliderPos)<199)){
                sliderPos=parseInt(sliderPos);
                sliderPos+=10;
                sliderPos=Math.min(199,sliderPos);
                sliderElement.value=sliderPos;
            }else{
                do{ // for break
                    if(activeProjects.indexOf(project102)>=0){
                        if(outputMin*60>=1000000000000000000000){
                            break;
                        }
                    }
                    if(unusedClips<factoryCost){break;}
                    makeFactory();
                }while(false);
            }
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
    this.calXRateOutput=function(){
        return Math.floor(probeCount) * probeXBaseRate * probeSpeed * probeNav;
    };
    
    this.autoSpaceTimeout=0;
    this.autoSpace=function(){
        if(this.stage!="space")return;
        if(this.tickNow<this.autoSpaceTimeout)return;
        var tarSpeed=1;
        var tarNav=1;
        var tarRep=0;
        var tarHaz=0;
        var tarFac=0;
        var tarHarv=0;
        var tarWire=0;
        var tarCombat=0;
        
        var remainTrust = probeTrust;
        remainTrust-=tarSpeed;
        remainTrust-=tarNav;
        if(project131.flag==1){
            tarCombat=6;
            remainTrust-=tarCombat;
        }
        
        var xRateOutput = this.calXRateOutput();
        var harvesterOutput = this.calHarvesterOutput(harvesterLevel);
        var wireOutput = this.calWireOutput(wireDroneLevel);
        var factoryOutput = this.calFactoryOutput(factoryLevel);
        
        if(wireOutput>factoryOutput){tarFac++;remainTrust--;}
        else if(harvesterOutput>wireOutput){tarWire++;remainTrust--;}
        else if(xRateOutput>harvesterOutput){tarHarv++;remainTrust--;}
        
        if(remainTrust>0){tarRep++;remainTrust--;}
        while(remainTrust>0){
            if(remainTrust>0){tarRep++;remainTrust--;}
            if(remainTrust>0){tarHaz++;remainTrust--;}
        }
        
        if(probeSpeed >tarSpeed ){lowerProbeSpeed();}
        if(probeNav   >tarNav   ){lowerProbeNav();}
        if(probeRep   >tarRep   ){lowerProbeRep();}
        if(probeHaz   >tarHaz   ){lowerProbeHaz();}
        if(probeFac   >tarFac   ){lowerProbeFac();}
        if(probeHarv  >tarHarv  ){lowerProbeHarv();}
        if(probeWire  >tarWire  ){lowerProbeWire();}
        if(probeCombat>tarCombat){lowerProbeCombat();}
        
        do{
            if((probeSpeed+probeNav+probeRep+probeHaz+probeFac+probeHarv+probeWire+probeCombat)>=probeTrust)break;
            if(probeSpeed <tarSpeed ){raiseProbeSpeed();}
            if((probeSpeed+probeNav+probeRep+probeHaz+probeFac+probeHarv+probeWire+probeCombat)>=probeTrust)break;
            if(probeNav   <tarNav   ){raiseProbeNav();}
            if((probeSpeed+probeNav+probeRep+probeHaz+probeFac+probeHarv+probeWire+probeCombat)>=probeTrust)break;
            if(probeRep   <tarRep   ){raiseProbeRep();}
            if((probeSpeed+probeNav+probeRep+probeHaz+probeFac+probeHarv+probeWire+probeCombat)>=probeTrust)break;
            if(probeHaz   <tarHaz   ){raiseProbeHaz();}
            if((probeSpeed+probeNav+probeRep+probeHaz+probeFac+probeHarv+probeWire+probeCombat)>=probeTrust)break;
            if(probeFac   <tarFac   ){raiseProbeFac();}
            if((probeSpeed+probeNav+probeRep+probeHaz+probeFac+probeHarv+probeWire+probeCombat)>=probeTrust)break;
            if(probeHarv  <tarHarv  ){raiseProbeHarv();}
            if((probeSpeed+probeNav+probeRep+probeHaz+probeFac+probeHarv+probeWire+probeCombat)>=probeTrust)break;
            if(probeWire  <tarWire  ){raiseProbeWire();}
            if((probeSpeed+probeNav+probeRep+probeHaz+probeFac+probeHarv+probeWire+probeCombat)>=probeTrust)break;
            if(probeCombat<tarCombat){raiseProbeCombat();}
        }while(false);

        do{
            if(probeSpeed !=tarSpeed ){break;}
            if(probeNav   !=tarNav   ){break;}
            if(probeRep   !=tarRep   ){break;}
            if(probeHaz   !=tarHaz   ){break;}
            if(probeFac   !=tarFac   ){break;}
            if(probeHarv  !=tarHarv  ){break;}
            if(probeWire  !=tarWire  ){break;}
            if(probeCombat!=tarCombat){break;}
            this.autoSpaceTimeout=this.tickNow+2000;
        }while(false);
    };
    
    this.autoSpaceProcessor=function(){
        if(this.stage!="space")return;
        if(swarmGifts>0){
            addProc();
        }
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
        pctas_ctrl_common_auto_strat: true,

        pctas_ctrl_human_auto_buy_wire: true,
        pctas_ctrl_human_auto_buy_clipper: true,
        
        pctas_ctrl_earth_autoearth: true,
    };

}

var paperclipTasMain = new PaperclipTasMain();
paperclipTasMain.start();
