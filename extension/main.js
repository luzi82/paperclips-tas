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
        //this.trust100();
        this.autoInvest();
        
        // earth
        this.autoEarth();
        this.autoMakeFarm();
        this.autoP102();
        
        // space
        this.autoSpace();
        //this.autoSpaceProcessor();
        
        // common
        this.autoQuantum();
        this.autoTournament();
        this.watchScore();
        this.autoProject();
        this.autoComputationalResources();
        this.saveSwarm();
        
        this.tickEnd();
    };

    this.tickNow = 0;
    this.lastStage = "init";
    this.stage = "unknown";
    this.tickBegin=function(){
        this.tickNow = Date.now();
        if(milestoneFlag>=15){
            this.stage = "end";
        }else if(humanFlag==1){
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
        if(this.stage=="end")return;
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
    
    this.lastT100 = 0;
    this.trust100 = function(){
        if(this.stage!="human")return;
        if(trust>=100)return;
        if(this.tickNow < this.lastT100)return;
        
        var tt = trust;
        var p40done = project40.flag;
        var p37done = project37.flag;
        var p38done = project38.flag;
        var p40bb = bribe;
        var cost = 0;
        
        while(tt<100){
            if(p40done==0){
                cost+=500000;
                p40done=1;
            }else if(p37done==0){
                cost+=1000000;
                p37done=1;
            }else if(p40bb<10000000){
                cost+=p40bb;
                p40bb*=2;
            }else if(p38done==0){
                cost+=10000000;
                p38done=1;
            }else{
                cost+=p40bb;
                p40bb*=2;
            }
            ++tt;
        }
        
        console.log("t100 cost="+spellf(cost));
        this.lastT100 = this.tickNow + 1000;
    };
    
    this.autoInvest = function(){
        if(!this.getCtrlBool("pctas_ctrl_human_auto_invest"))return;
        if(this.stage!="human")return;
        if(investmentEngineFlag==0)return;
        var lowLimit = 0.509;
        var medLimit = 0.5125;
        var hiLimit  = 0.563;
        if(stockGainThreshold > hiLimit){
            investStratElement.value = "hi";
        }else if(stockGainThreshold > medLimit){
            investStratElement.value = "med";
        }else{
            investStratElement.value = "low";
        }
        if((portTotal<1000)&&(funds>=1000)&&(wire>clipRate*10)&&(stockGainThreshold>=lowLimit)){
            investDeposit();
        }
        if(secTotal>=300000000){
            investWithdraw();
        }
        if(yomi>investUpgradeCost){
            investUpgrade();
        }
    };
    
    this.autoTournament = function(){
        if(!this.getCtrlBool("pctas_ctrl_common_auto_yomi"))return;
        if(this.stage=="end")return;
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
        if(this.stage=="end")return;
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
        if(!this.getCtrlBool("pctas_ctrl_earth_autoearth"))return;
        if(project127.flag==0)return;
        if(unusedClips<farmCost)return;
        var supply = this.calPowerSupply();
        var demand = this.calPowerDemand();
        var diff = demand + (factoryPowerRate/100) - supply;
        if(diff>0){
            diff /= (farmRate/100);
            diff = Math.ceil(diff);
            makeFarm(diff);
        }
        
        var cap = batteryLevel * batterySize;
        if((storedPower>=cap)&&(unusedClips >= batteryCost)&&(batteryLevel<1000)){
            var newBatteryCount = 1;
            if(availableMatter+acquiredMatter+wire<=0){
                newBatteryCount = 1000-batteryLevel;
            }
            newBatteryCount = Math.max(0,newBatteryCount);
            if((newBatteryCount>=100)&&(unusedClips >= p100b)){
                newBatteryCount=100;
            }else if((newBatteryCount>=10)&&(unusedClips >= p10b)){
                newBatteryCount=10;
            }else if((newBatteryCount>=1)&&(unusedClips >= batteryCost)){
                newBatteryCount=1;
            }else{
                newBatteryCount=0;
            }
            if(newBatteryCount>0){
                makeBattery(newBatteryCount);
            }
        }
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
        if(this.calPowerSupply()<this.calPowerDemand())return;
        
        var ii;

        var factoryOutput = this.calFactoryOutput(factoryLevel);
        var harvesterOutput = this.calHarvesterOutput(harvesterLevel,parseInt(sliderPos));
        var wireOutput = this.calWireOutput(wireDroneLevel,parseInt(sliderPos));
        
        var outputMin = this.SEXDECILLION;
        if(availableMatter>0)                    {outputMin=Math.min(outputMin,harvesterOutput);}
        if(availableMatter+acquiredMatter>0)     {outputMin=Math.min(outputMin,wireOutput);}
        if(availableMatter+acquiredMatter+wire>0){outputMin=Math.min(outputMin,factoryOutput);}

        var outputMax = 0;
        if(availableMatter>0)                    {outputMax=Math.max(outputMax,harvesterOutput);}
        if(availableMatter+acquiredMatter>0)     {outputMax=Math.max(outputMax,wireOutput);}
        if(availableMatter+acquiredMatter+wire>0){outputMax=Math.max(outputMax,factoryOutput);}
        
        // move slider to solve problem
        if((this.getCtrlBool("pctas_ctrl_earth_autoslider")!="none")&&(swarmFlag==1)){
            var bestSlider = 1;
            var best_wireHarvMin = Math.min(
                this.calHarvesterOutput(harvesterLevel,bestSlider),
                this.calWireOutput(wireDroneLevel,bestSlider)
            );
            for(ii=1;ii<=199;ii++){
                var wireHarvMin = Math.min(
                    this.calHarvesterOutput(harvesterLevel,ii),
                    this.calWireOutput(wireDroneLevel,ii)
                );
                if(wireHarvMin<factoryOutput)continue;
                if(wireHarvMin>=best_wireHarvMin)continue;
                bestSlider = ii;
                best_wireHarvMin = wireHarvMin;
            }
            //console.log("bestSlider "+bestSlider);
            //var changeSlider = false;
            //if((this.getCtrlBool("pctas_ctrl_earth_autoslider")=="max_think")&&(parseInt(sliderPos)<bestSlider)){changeSlider=true;}
            //if((this.getCtrlBool("pctas_ctrl_earth_autoslider")=="max_work" )&&(parseInt(sliderPos)>bestSlider)){changeSlider=true;}
            if(parseInt(sliderPos)!=bestSlider){
                sliderPos=bestSlider;
                sliderElement.value=bestSlider;
                return;
            }
        }
        
        var improveHarv = false;
        var improveWire = false;
        var improveFac  = false;
        var more_think = (swarmFlag==1)&&(this.getCtrlBool("pctas_ctrl_earth_autoslider")=="max_think")&&(parseInt(sliderPos)<199);
        var more_work  = (swarmFlag==1)&&(this.getCtrlBool("pctas_ctrl_earth_autoslider")=="max_work" )&&(parseInt(sliderPos)>1);
        
        if(availableMatter+acquiredMatter+wire<=0){
            // no build
        }else if(availableMatter+acquiredMatter<=0){
            improveFac = true;
        }else if(availableMatter<=0){
            if(more_think){
                improveWire = true;
            }else if(more_work){
                improveFac  = true;
            }else{
                improveWire = (wireOutput<=outputMin);
                improveFac  = (factoryOutput<=outputMin);
            }
        }else{
            if(more_think){
                var wireHarvMin=Math.min(wireOutput,harvesterOutput);
                improveWire = (wireOutput     <=wireHarvMin);
                improveHarv = (harvesterOutput<=wireHarvMin);
            }else if(more_work){
                improveFac  = true;
            }else{
                improveWire = (wireOutput<=outputMin);
                improveHarv = (harvesterOutput<=outputMin);
                improveFac  = (factoryOutput<=outputMin);
            }
        }
        
        var tarSlider = parseInt(sliderPos);
        if((this.getCtrlBool("pctas_ctrl_earth_autoslider")!="max_think")&&(swarmFlag==1)){
            tarSlider = 199;
        }
        if((this.getCtrlBool("pctas_ctrl_earth_autoslider")!="max_work")&&(swarmFlag==1)){
            tarSlider = 199;
        }
        
        if(improveHarv){
            if(unusedClips>=p1000h*20){
                makeHarvester(1000);
            }else if((unusedClips>=p1000h)&&(this.calHarvesterOutput(harvesterLevel+618,tarSlider)<outputMax)){
                makeHarvester(1000);
            }else if(unusedClips>=p1000h){
                makeHarvester(100);
            }else if((unusedClips>=p100h)&&(this.calHarvesterOutput(harvesterLevel+62,tarSlider)<outputMax)){
                makeHarvester(100);
            }else if(unusedClips>=p100h){
                makeHarvester(10);
            }else if((unusedClips>=p10h)&&(this.calHarvesterOutput(harvesterLevel+6,tarSlider)<outputMax)){
                makeHarvester(10);
            }else if(unusedClips>=harvesterCost){
                makeHarvester(1);
            }
        }
        if(improveWire){
            if(unusedClips>=p1000w*20){
                makeWireDrone(1000);
            }else if((unusedClips>=p1000w)&&(this.calWireOutput(wireDroneLevel+618,tarSlider)<outputMax)){
                makeWireDrone(1000);
            }else if(unusedClips>=p1000w){
                makeWireDrone(100);
            }else if((unusedClips>=p100w)&&(this.calWireOutput(wireDroneLevel+62,tarSlider)<outputMax)){
                makeWireDrone(100);
            }else if(unusedClips>=p100w){
                makeWireDrone(10);
            }else if((unusedClips>=p10w)&&(this.calWireOutput(wireDroneLevel+6,tarSlider)<outputMax)){
                makeWireDrone(10);
            }else if(unusedClips>=wireDroneCost){
                makeWireDrone(1);
            }
        }
        if(improveFac){
            do{ // for break
                if(unusedClips<factoryCost){break;}
                makeFactory();
            }while(false);
        }
        if((availableMatter                    <=0)&&(harvesterLevel>0)){harvesterReboot();}
        if((availableMatter+acquiredMatter     <=0)&&(wireDroneLevel>0)){wireDroneReboot();}
        if((availableMatter+acquiredMatter+wire<=0)&&(factoryLevel>0  )){factoryReboot();}
    };
    this.calFactoryOutput=function(_factoryLevel){
        var fbst = 1;
        if (factoryBoost > 1){
            fbst = factoryBoost * _factoryLevel;
        }      
        return powMod*fbst*(Math.floor(_factoryLevel)*factoryRate);
    };
    this.calHarvesterOutput=function(_harvesterLevel,_sliderPos){
        var dbsth = 1;
        if (droneBoost>1){
            dbsth = droneBoost * Math.floor(_harvesterLevel);
        }
        var mtr = powMod*dbsth*Math.floor(_harvesterLevel)*harvesterRate;
        mtr = mtr * ((200-_sliderPos)/100);
        return mtr;
    };
    this.calWireOutput=function(_wireDroneLevel,_sliderPos){
        var dbstw = 1;
        if (droneBoost>1){
            dbstw = droneBoost * Math.floor(_wireDroneLevel);
        }
        var a = powMod*dbstw*Math.floor(_wireDroneLevel)*wireDroneRate;
        a = a * ((200-_sliderPos)/100);
        return a;
    };
    this.calXRateOutput=function(){
        return Math.floor(probeCount) * probeXBaseRate * probeSpeed * probeNav;
    };
    
    this.autoP102=function(){
        if(this.stage!="earth")return;
        if(!this.getCtrlBool("pctas_ctrl_earth_p102"))return;
        if(activeProjects.indexOf(project102)<0)return;
        if(project102.flag==1)return;
        if(factoryLevel<=0)return;
        
        var cost = 0;
        cost += 1000000000000000000000; // p102
        cost += 100000000; // first factory
        if(unusedClips + factoryBill < cost)return;
        
        factoryReboot();
    };
    
    this.autoSpaceTimeout=0;
    this.autoSpace=function(){
        if(this.stage!="space")return;
        
        if(!(yomi < probeTrustCost || probeTrust >= maxTrust)){
            increaseProbeTrust();
        }
        if(!(honor<maxTrustCost)){
            increaseMaxTrust();
        }
        
        if((probeCount<=100)&&(!(unusedClips<probeCost))){
            makeProbe();
        }
        
        if(parseInt(sliderPos)<199){
            sliderPos=199;
            sliderElement.value=sliderPos;
        }
        
        if(this.tickNow<this.autoSpaceTimeout)return;
        var tarSpeed=0;
        var tarNav=1;
        var tarRep=0;
        var tarHaz=0;
        var tarFac=0;
        var tarHarv=0;
        var tarWire=0;
        var tarCombat=0;
        
        var remainTrust = probeTrust;
        remainTrust-=tarNav;
        if((project131.flag==1)&&(probesLostCombat >= 10000000)){ // need "Name the battles" appear
            if(attackSpeedFlag){
                tarSpeed=this.bestSpeedCombat(8);
                tarCombat=8-tarSpeed;
            }else{
                tarSpeed=1;
                tarCombat=6;
            }
        }else{
            tarSpeed=1;
        }
        remainTrust-=tarCombat;
        remainTrust-=tarSpeed;
        
        var xRateOutput = this.calXRateOutput();
        var harvesterOutput = this.calHarvesterOutput(harvesterLevel,parseInt(sliderPos));
        var wireOutput      = this.calWireOutput(wireDroneLevel,parseInt(sliderPos));
        var factoryOutput   = this.calFactoryOutput(factoryLevel);
        
        var maxOutput = Math.max(harvesterOutput,wireOutput,factoryOutput);
        maxOutput = Math.min(maxOutput,xRateOutput);
        
        var minOutput = Math.min(harvesterOutput,wireOutput,factoryOutput,xRateOutput);
        
        //if(factoryOutput<maxOutput){tarFac++;remainTrust--;}
        //if(wireOutput<maxOutput){tarWire++;remainTrust--;}
        //if(harvesterOutput<maxOutput){tarHarv++;remainTrust--;}
        if(factoryOutput<=minOutput){tarFac++;remainTrust--;}
        if(wireOutput<=minOutput){tarWire++;remainTrust--;}
        if(harvesterOutput<=minOutput){tarHarv++;remainTrust--;}
        
        tarRep=this.bestRepHaz(remainTrust);
        remainTrust-=tarRep;
        tarHaz=remainTrust;
        remainTrust-=remainTrust;
        
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
    
    this.bestRepHaz=function(trust){
        var ii=0;
        var bestRep=0;
        var bestGrowRate=this.probeGrowRate(0,trust);
        for(ii=0;ii<=trust;ii++){
            var growRate = this.probeGrowRate(ii,trust-ii);
            if(growRate<=bestGrowRate)continue;
            bestRep=ii;
            bestGrowRate=growRate;
        }
        return bestRep;
    };
    this.probeGrowRate=function(_probeRep,_probeHaz){
        var ret = 0;
        ret += this.probeRepFactor(_probeRep);
        ret += this.probeHazFactor(_probeHaz);
        return ret;
    };
    this.probeRepFactor=function(_probeRep){
        var nextGen = probeCount * probeRepBaseRate * _probeRep;
        return nextGen;
    };
    this.probeHazFactor=function(_probeHaz){
        var boost = Math.pow(_probeHaz, 1.6);
        var amount = probeCount * (probeHazBaseRate / ((3*boost)+1));
        if (project129.flag == 1){
            amount = .50 * amount;
        }
        return -amount;
    };
    
    this.bestSpeedCombat=function(trust){
        var ii=0;
        var bestSpeed=1;
        var bestScore=-999; // score=[-1,1]
        for(ii=1;ii<=trust;++ii){
            var dieChance = this.combatDieChance(ii,attackSpeedFlag,drifterCombat);
            var killChance = this.combatKillChance(trust-ii,probeCombatBaseRate);
            var score = (killChance*(1-dieChance))-((1-killChance)*dieChance);
            if(score<=bestScore)continue;
            bestSpeed=ii;
            bestScore=score;
        }
        return bestSpeed;
    };
    this.combatDieChance=function(_probeSpeed,_attackSpeedFlag,_drifterCombat){
        var dX = _drifterCombat;
        var ooda = 0;
        if (_attackSpeedFlag == 1){
            ooda = _probeSpeed * .2;
        }
        var chance = 0.5; // battleDEATH_THRESHOLD
        chance += ooda;
        chance /= ((1)*.5);
        chance /= dX;

        chance = 1-chance;
        chance = Math.min(1,chance);
        chance = Math.max(0,chance);
        
        return chance;
    };
    this.combatKillChance=function(_probeCombat,_probeCombatBaseRate){
        var pX = _probeCombat * _probeCombatBaseRate;
        
        var chance = 0.5; // battleDEATH_THRESHOLD
        chance /= ((1)*.5);
        chance -= (_probeCombat * .1);
        chance /= pX;
        
        chance = 1-chance;
        chance = Math.min(1,chance);
        chance = Math.max(0,chance);
        
        return chance;
    };
    
    this.autoSpaceProcessor=function(){
        if(this.stage!="space")return;
        if((memory>=300)&&(swarmGifts>0)){
            addProc();
        }
    };
    
    this.autoProject=function(){
        if(!this.getCtrlBool("pctas_ctrl_common_auto_project"))return;
        if(projectsFlag==0)return;
        if(project200.flag==1)return;
        if(project201.flag==1)return;
        
        var ii;
        for(ii=0;ii<activeProjects.length;ii++){
            var proj=activeProjects[ii];
            if(!proj.cost())continue;
            if(this.stage=="end"){
                if(proj==project140){proj.effect();break;}
                if(proj==project141){proj.effect();break;}
                if(proj==project142){proj.effect();break;}
                if(proj==project143){proj.effect();break;}
                if(proj==project144){proj.effect();break;}
                if(proj==project145){proj.effect();break;}
                if(proj==project146){proj.effect();break;}
                var choice = this.getCtrlBool("pctas_ctrl_end_choice");
                if(choice=="balance"){
                    if(prestigeU<prestigeS){choice = "demand";}
                    else{choice = "creative";}
                }
                if((choice=="demand")&&(proj==project147)){proj.effect();break;} // accept
                if((choice=="demand")&&(proj==project200)){proj.effect();break;} // demand
                if((choice=="creative")&&(proj==project147)){proj.effect();break;} // accept
                if((choice=="creative")&&(proj==project201)){proj.effect();break;} // creativity
                continue;
            }
            if(proj==project147)continue; // accept
            if(proj==project148)continue; // reject
            if(proj==project200)continue; // reset +10 demand
            if(proj==project201)continue; // reset +10 creativity
            if(proj==project219)continue; // Xavier Re-initialization
            if(proj==project217)continue; // Quantum Temporal Reversion

            if(proj==project35){ // Release the HypnoDrones
                if(processors+memory<trust)continue;
                var limit = 0;
                limit +=  10000000; // earth power
                limit +=   1000000; // earth battery
                limit +=   1000000; // earth matter drone
                limit +=   1000000; // earth wire drone
                limit += 100000000; // earth factory
                if(clips<limit)continue;
            }

            if(proj==project120){ // do ooda after "Name the battles" appear
                if(probesLostCombat < 10000000){
                    continue;
                }
            }
            
            if(proj==project133){
                // do 132 first if 132 ready
                var good = false;
                good = good || (project132.flag==1);
                good = good || (memory<250);
                good = good || (unusedClips < Math.pow(10,30)*50);
                good = good || (project121.flag==0);
                good = good || ((honor+10000>=maxTrustCost)&&(threnodyCost<125000)); // if max trust upgrade avaliable next
                if(!good)continue;
                
                // save yomi for increase max trust
                if(probeTrust<maxTrust)continue;
            }

            console.log("auto project "+proj.title);
            proj.effect();
            break;
        }
    };
    
    this.autoComputationalResources=function(){
        if(!this.getCtrlBool("pctas_ctrl_autoComputationalResources"))return;
        if(this.stage=="end")return;
        var ii;
        
        var trustRemain = 0;
        if(this.stage=="human"){
            trustRemain = trust;
        }
        
        trustRemain -= processors;
        trustRemain -= memory;
        trustRemain = Math.max(0,trustRemain);
        trustRemain += swarmGifts;
        
        if(trustRemain<=0)return;
        
        var tarProc=0;
        var tarMem =0;
        for(ii=0;ii<this.autoComputationalResourcesCompList.length;++ii){
            var procMem = this.autoComputationalResourcesCompList[ii];
            tarProc = procMem[0];
            tarMem  = procMem[1];
            if(processors<tarProc)break;
            if(memory<tarMem)break;
            if(memory+processors<tarProc+tarMem)break;
        }
        
        tarProc -= processors;
        tarProc = Math.max(0,tarProc);
        tarMem  -= memory;
        tarMem  = Math.max(0,tarMem);
        
        var tarTotal = tarProc+tarMem;
        if(tarTotal<=0)return;

        if(tarProc<=0){ addMem();return;};
        if(tarMem <=0){addProc();return;};

        var ran = tarTotal * Math.random();
        if(ran<tarProc){addProc();return;}
        else{addMem();return;}
    };
    this.autoComputationalResourcesCompList=[
        [5,10],
        [20,80],
        [100,100],
        [125,125],
        [200,200],
        [250,250],
        [300,300],
        [316,316],
        [Number.MAX_SAFE_INTEGER-1000,310],
    ];
    
    this.saveSwarm=function(){
        if( (disorgFlag==1)&&
            (swarmStatus==5)&&
            (swarmStatusElement.innerHTML=="Disorganized")&&
            (synchButtonDivElement.style.display=="")&&
            (yomi>=synchCost)&&
            (btnSynchSwarmElement.disabled==false)
        ){synchSwarm();}

        if( (boredomFlag==1)&&
            (swarmStatus==3)&&
            (swarmStatusElement.innerHTML=="Bored")&&
            (entertainButtonDivElement.style.display=="")&&
            (creativity>=entertainCost)&&
            (btnEntertainSwarmElement.disabled==false)
        ){entertainSwarm();}
    };
    
    this.getCtrlBool=function(key){
        var ii;
        var ele = document.getElementById(key);
        if(ele!=null){
            if(ele.type=="checkbox"){
                return document.getElementById(key).checked;
            }
        };
        var eleList = document.getElementsByName(key);
        if(eleList!=null){
            for(ii=0;ii<eleList.length;++ii){
                ele = eleList[ii];
                if((ele.type=="radio")&&(ele.checked)){
                    return ele.value;
                }
            }
        }
    };
    
    this.initCtrl=function(){
        if(this.lastStage!="init")return;
        var ii;
        for(var key in this.ctrlDefault){
            var value = this.ctrlDefault[key];
            var ele = document.getElementById(key);
            if(ele!=null){
                var inputType = ele.type;
                if(inputType=="checkbox"){
                    ele.checked = value;
                }
            }
            var eleList = document.getElementsByName(key);
            if(eleList!=null){
                for(ii=0;ii<eleList.length;++ii){
                    ele = eleList[ii];
                    if((ele.type=="radio")&&(ele.value==value)){
                        ele.checked = true;
                    }
                }
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
        pctas_ctrl_common_auto_project: true, //false,
        pctas_ctrl_autoComputationalResources: true, //false,

        pctas_ctrl_human_auto_buy_wire: true,
        pctas_ctrl_human_auto_buy_clipper: true,
        pctas_ctrl_human_auto_invest: true, //false,
        
        pctas_ctrl_earth_autoearth: true,
        pctas_ctrl_earth_p102: true, // false
        pctas_ctrl_earth_autoslider: "max_think",
        
        pctas_ctrl_end_choice: "balance",
    };
    
    this.SEXDECILLION = 1000000000000000000000000000000000000000000000000000;

}

var paperclipTasMain = new PaperclipTasMain();
paperclipTasMain.start();
