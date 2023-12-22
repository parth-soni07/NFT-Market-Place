const lighthouse = require('@lighthouse-web3/sdk');

const uploadResponse = await async() => { lighthouse.upload(
  "./img.png",
  "63fe8fba.f282a770b18c45b9b7541fdb3f548323"
);} 

uploadResponse();
