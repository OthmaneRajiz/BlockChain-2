const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductRegistry", function () {
  it("Should create a new product", async function () {
    const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
    const productRegistry = await ProductRegistry.deploy();
    await productRegistry.deployed();

    const initialProductCount = await productRegistry.productCounter();
    expect(initialProductCount).to.equal(0);

    const farmerAddress = "0xf39Fd6e51aad88F6F4ce6aB8829539884F6cc5e";
    const qualityMetrics = {
        grade: 90,
        testResults: ["Test1", "Test2"],
        lastInspection: 1678886400,
        inspector: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    };

    await productRegistry.createProduct(
        "Tomato",
        farmerAddress,
        100,
        "Farm Location",
        1678886400,
        ["Organic", "Fair Trade"],
        qualityMetrics
    );

    const finalProductCount = await productRegistry.productCounter();
    expect(finalProductCount).to.equal(1);
  });
});
