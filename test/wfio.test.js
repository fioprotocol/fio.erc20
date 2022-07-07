const { assert } = require("chai");

const WFIO = artifacts.require("WFIO");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("WFIO", (address) => {

    let wfio;

    before(async function() {
        wfio = await WFIO.deployed()
        //console.log(wfio); //will show all deployment inforamtion
        ;});

        describe("Deployment", async () => {

            it("contract has an address", async () => {

                try {

                    const address = await wfio.address;
                    assert.notEqual(address, 0x0);
                    assert.notEqual(address, "");
                    assert.notEqual(address, null);
                    assert.notEqual(address, undefined);
                    console.log(address); //for tracking if needed

                } catch (error) {
                
                    console.log(error);

                }   
            
            });

            it("checks oracle count", async () => {
                
                try {

                    const oracles = await wfio.getOracles();
                    //console.log(oracles); //for tracking if needed

                } catch (error) {
                
                    console.log(error);

                }

            });

            it("gets custodians", async () => {
                
                var number = 0;

                do {
                         
                    try {

                        const custodians = await wfio.getCustodian(address[number]);
                        //console.log(custodians); //for tracking if needed
                        number++;
                        //console.log(number); //for tracking if needed

                    } catch (error) {
                    
                        console.log(error);
                        
                    }

                }while (number < 10);

            });

        });

        describe("Oracles", async () =>{
                        
            it("registers by non custodian", async () => {

                try {

                    const regoracle = await wfio.regoracle(address[1], {from: 0x7A0301bCAEFD2529Ec3780c3282F087279aC481E});
                    //console.log(regoracle); //for tracking if needed

                } catch (error) {
                
                    console.dir("Failed - Non Custodian cannot register oracle");

                }   

                
            });
            
            it("Register Oracle 1", async () => {
                
                var number = 2;

                do{
                    try{

                        //console.log(number); //for tracking if needed
                        const regoracle = await wfio.regoracle(address[1], {from: address[number]});
                        //console.log(regoracle); //for tracking if needed
                        number++;     

                    } catch (error) {
                
                        console.log(error);

                    } 

                }while (number != 9)
                                         
            });

            it("Register Oracle 2", async () => {

                var number = 1;

                do{
                    try{
                        if(number != 2 && 8){

                            //console.log(number); //for tracking if needed
                            const regoracle = await wfio.regoracle(address[2], {from: address[number]});
                            //console.log(regoracle); //for tracking if needed
                            number++;     

                        }else

                            number++;
                            
                    } catch (error) {
                
                        console.log(error);

                    } 

                }while (number < 9)

            });

            it("Register Oracle 3", async () => {

                var number = 1;

                do{
                    try{
                        if(number != 3){

                            //console.log(number); //for tracking if needed
                            const regoracle = await wfio.regoracle(address[3], {from: address[number]});
                            //console.log(regoracle); //for tracking if needed
                            number++;

                        }else

                            number ++;
                    
                    } catch (error) {
                
                        console.log(error);
    
                    } 

                }while (number < 9)

            });

            it("registers existing oracle", async () => {
                
                try{

                    const regoracle = await wfio.regoracle(address[1], {from: address[2]});
                    //console.log(regoracle); //for tracking if needed

                } catch (error) {
                    
                    console.dir("Failed - Oracle already registered");

                }

            });

            it("view oracles", async () => {
            
                try{
                    for(var a = 1; a < 4; a++){

                        const isreg = await wfio.getOracle(address[a]);
                        //console.log(isreg); //for tracking if needed
                        //console.log(a); //for tracking if needed

                    }

                } catch (error) {
                    
                    console.log(error);

                }

            });

        });

        describe("Checks Oracles and Custodians", async() => {

            it("checks oracle count", async () => {

                try {

                    const oracles = await wfio.getOracles();
                    //console.log(oracles) //for tracking if needed
                

                } catch (error) {
                
                    console.log(error);

                }     
                
            });

            it("gets custodians", async () => {
                
                var number = 0;

                do {
                    try{

                        const custodians = await wfio.getCustodian(address[number]);
                        //console.log(custodians) //for tracking if needed
                        number++;
                        //console.log(number); //for tracking if needed

                    } catch (error) {
                
                    console.log(error);

                    } 
                }while (number < 10);

            });
        });

        describe("Pausing and Unpausing", async() => {
            
            it("pauses and tries to wrap", async () =>{

                try{

                    const pause = await wfio.pause({from: address[1]});
                    //console.log(pause); //for tracking if needed
                    
                } catch (error) {
                
                    console.log(error);

                } 

                try{

                    const ac1 = await wfio.wrap(address[5], "amazon", "0x123456789", {from: address[1]});
                    // console.log(ac1); //for tracking if needed

                } catch (error){

                    console.dir("Failed - Contract paused, unable to wrap")

                }

            });

            it("unpauses", async () => {

                try{

                    const unpause = await wfio.unpause({from: address[1]});
                    //console.log(unpause); //for tracking if needed

                } catch (error) {
                
                    console.log(error);

                } 

            })
            

        });

        describe("Wrap", async() =>{

            it("wrap from oracle 1", async() => {

                try{

                    const ac1 = await wfio.wrap(address[5], "1", "0x123456789", {from: address[1]});
                    //console.log(ac1); //for tracking if needed

                } catch (error) {
                
                    console.log(error);

                }

             });

            it("wrap from oracle 2", async () => {
                
                try{

                    const ac2 = await wfio.wrap(address[5], "1", "0x123456789", {from: address[2]});
                    //console.log(ac2); //for tracking if needed

                } catch (error) {
                
                    console.log(error);

                }

            });

            it("wrap from oracle 3", async () => {
            
                try{

                    const ac3 = await wfio.wrap(address[5], "1", "0x123456789", {from: address[3]});
                    //console.log(ac3); //for tracking if needed

                } catch (error) {
                
                    console.log(error);

                }

            });

            it("wrapping already wrapped", async() => {

                try{

                    const ac1 = await wfio.wrap(address[5], "1", "0x123456789", {from: address[1]});
                    //console.log(ac1); //for tracking if needed

                } catch (error) {
                
                    console.dir("Failed - Already wrapped");

                }

             });

        });

        describe("Unwrap", async() =>{

            it("unrapping", async() => {

                try{

                    const unw = await wfio.unwrap("0x123456789", "1", {from: address[5]});
                    //console.log(unw); //for tracking if needed

                }catch (error){

                    console.log(error);

                }

            });

            it("unwraps with nothing wrapped", async() => {

                try{

                    const unw = await wfio.unwrap("0x123456789", "1", {from: address[5]});

                }catch (error){

                    console.dir("Failed - Nothing wrapped")

                }

            });

        });

        describe("Oracle", async() =>{

            it("unregister oracle 1", async() => {

                try{

                    const unrego = await wfio.unregoracle(address[1], {from: address[3]});
                    //console.log(unrego); //for tracking if needed

                }catch (error){

                    console.log(error);

                }

            });

            it("unregisters unregistered oracle", async() => {

                try{

                    const unrego = await wfio.unregoracle(address[1], {from: address[3]});
                    //console.log(unrego); //for tracking if needed

                }catch (error){

                    console.dir("Failed - Oracle not registered");

                }

            });

        });

        describe("Custodian", async() =>{

            it("unregister custodian 1", async() => {

                try{

                    const unregc = await wfio.unregcust(address[1], {from: address [3]});
                    //console.log(unregc); //for tracking if needed

                }catch (error){

                    console.log(error);

                }

            });

            it("unregisters unregistered custodian", async() => {

                try{

                    const unregc = await wfio.unregcust(address[1], {from: address [3]});
                    //console.log(unregc); //for tracking if needed

                }catch (error){

                    console.dir("Failed - Custodian not registered");

                }

            });

        });

});