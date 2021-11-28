const Funding = artifacts.require("Donation");
require("chai").use(require("chai-bignumber")(web3.BigNumber)).should();

contract("Donation", function([account, firstDonator, secondDonator]) {

    //check the owner is valid    
    let donationContract = null;

      it("should check the owner is valid", async () => {
        donationContract = await Donation.deployed();
        const owner = await donationContract.owner.call()
        owner.should.be.bignumber.equal(account);
    });

    //check acceptance of donations from the donators
    const ETHERS = 10**18;
    const GAS_PRICE = 10**6;

    let donationContract = null;
    let txEvent;

    function findEvent(logs, eventName) {
    let result = null;
      for (let log of logs) {
        if (log.event === eventName) {
          result = log;
         break;
        }
       }
      return result;
    };

     it("should accept donations from the donator 1", async () => {
    const bFirstDonator= web3.eth.getBalance(firstDonator);

    const donate = await donationContract.donate({ 
        from: firstDonator, 
                                                  value: 5 * ETHERS, 
                                                  gasPrice: GAS_PRICE
                                               });
    txEvent = findEvent(donate.logs, "Donated");
    txEvent.args.donation.should.be.bignumber.equal(5 * ETHERS);

    const difference = bFirstDonator.sub(web3.eth.getBalance(firstDonator)).sub(new web3.BigNumber(donate.receipt.gasUsed * GAS_PRICE));
    difference.should.be.bignumber.equal(5 * ETHERS);
      });


    //check withdrawal of donations
      it("should allow the owner to withdraw donations", async () => {
        const bAccount = web3.eth.getBalance(account);

        const transferToOwner = await donationContract.transferToOwner({ gasPrice: GAS_PRICE });
        txEvent = findEvent(transferToOwner.logs, "Withdrew");
        txEvent.args.amount.should.be.bignumber.equal(20 * ETHERS);

        const difference = web3.eth.getBalance(account).sub(bAccount);
        difference.should.be.bignumber.equal(await donationContract.raised.call() - transferToOwner.receipt.gasUsed * GAS_PRICE); 
    })
})
