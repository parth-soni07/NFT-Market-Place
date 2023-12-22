import { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";
import lighthouse from "@lighthouse-web3/sdk";

const api_key = "b09256dcda4e414d8dc706f34d79372e";
const api_key_secret = "Yum7I8plLI4eg8oOji+hIG4t4DssLXPgu64KJq2Tl0UhscPLbOvhcQ";
console.log(api_key);
console.log(api_key_secret);
const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("1");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createNFT = async () => {
    console.log(JSON.stringify({ image, name, description }));
    if (!image || !price || !name || !description) return;
    try {
      const output = await lighthouse.uploadText(
        JSON.stringify({ image, name, description }),
        "63fe8fba.f282a770b18c45b9b7541fdb3f548323",
        "nft",
        progressCallback
      );
      console.log('out', output);
      mintThenList(output);
    } catch (error) {
      console.log("ipfs url upload error: ", error);
    }
  };
  const mintThenList = async (result) => {
    try {
      const uri = `https://gateway.lighthouse.storage/ipfs/${result.data.Hash}`;
      //mint nft
      await (await nft.mint(uri)).wait();
      //get tokenID of new nft
      const id = await nft.tokenCount();
      // approve marketplace to spend nft
      await (await nft.setApprovalForAll(marketplace.address, true)).wait();
      // add nft to marketplace
      const listingPrice = ethers.utils.parseEther(price.toString());
      await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
    } catch (e) {
      console.log(e);
    }
  };

  const progressCallback = (progressData) => {
    let percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log(percentageDone);
  };

  const uploadFile = async (event) => {
    // Push file to lighthouse node
    // Both file and folder are supported by upload function
    // Third parameter is for multiple files, if multiple files are to be uploaded at once make it true
    // Fourth parameter is the deal parameters, default null

    let file = event.target.files;

    console.log(file);

    const output = await lighthouse.upload(
      file,
      "63fe8fba.f282a770b18c45b9b7541fdb3f548323",
      false,
      null,
      progressCallback
    );
    console.log("File Status:", output);

    setImage(output.data.Hash);

    console.log(
      "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
    );
  };
  return (
    <div className="container-fluid-mt-5">
      <div className="row"></div>
      <main
        role="main"
        className="col-lg-12 mx-auto"
        style={{ maxWidth: "1000px" }}
      >
        <div className="content mx-auto">
          <Row className="g-4">
            <Form.Control
              type="file"
              required
              name="file"
              onChange={uploadFile}
            />
            <Form.Control
              onChange={(e) => setName(e.target.value)}
              size="lg"
              required
              type="text"
              placeholder="Name"
            />
            <Form.Control
              onChange={(e) => setDescription(e.target.value)}
              size="lg"
              required
              as="textarea"
              placeholder="Description"
            />
            <Form.Control
              onChange={(e) => setPrice(e.target.value)}
              size="lg"
              required
              type="number"
              placeholder="Price in ETH"
            />
            <div className="d-grid px-0">
              <Button onClick={createNFT} variant="primary" size="lg">
                Create & List NFT!
              </Button>
            </div>
          </Row>
        </div>
      </main>
    </div>
  );
};
export default Create;
