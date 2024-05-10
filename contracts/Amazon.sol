// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Amazon {
    address public owner;
    uint256 public itemCount = 1;

    struct Item {
        uint256 id;
        string name;
        string category;
        string imageUrl;
        uint256 cost;
        uint256 stock;
        address payable seller;
        string manufacturer;
        string dimensions;
        uint256 weight;
    }

    struct ShippingInfo {
        string name;
        string street;
        string city;
        string postalCode;
        string country;
    }

    mapping(uint256 => Item) public items;
    mapping(address => bool) public isSeller;
    mapping(address => uint256[]) public orders;
    mapping(address => ShippingInfo) public shippingInfo;

    event ItemListed(
        uint256 indexed itemId, 
        string name, 
        string imageUrl, 
        uint256 cost, 
        uint256 stock, 
        address indexed seller, 
        string manufacturer, 
        string dimensions, 
        uint256 weight
    );
    event ItemPurchased(address indexed buyer, uint256 itemId, uint256 quantity);
    event ShippingInfoUpdated(address indexed user, string name, string street, string city, string postalCode, string country);
    event ItemDeleted(uint256 indexed itemId);
    event SellerAdded(address seller);
    event SellerRemoved(address seller);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    modifier onlySeller() {
        require(isSeller[msg.sender], "Only approved sellers can perform this action.");
        _;
    }

    constructor() {
        owner = msg.sender;
        isSeller[owner] = true;
    }

    function addSeller(address _seller) public onlyOwner {
        isSeller[_seller] = true;
        emit SellerAdded(_seller);
    }

    function removeSeller(address _seller) public onlyOwner {
        isSeller[_seller] = false;
        emit SellerRemoved(_seller);
    }

    function list(
        string memory _name,
        string memory _category,
        string memory _imageUrl,
        uint256 _costWei,
        uint256 _stock,
        string memory _manufacturer,
        string memory _dimensions,
        uint256 _weight
        ) public onlySeller {
            uint256 newItemId = itemCount++;
            items[newItemId] = Item(
                newItemId,
                _name,
                _category,
                _imageUrl,
                _costWei,
                _stock,
                payable(msg.sender),
                _manufacturer,
                _dimensions,
                _weight
            );
            emit ItemListed(
                newItemId, 
                _name, 
                _imageUrl, 
                _costWei, 
                _stock, 
                msg.sender, 
                _manufacturer, 
                _dimensions, 
                _weight
            );
    }

    function buy(uint256 _id, uint256 _quantity) public payable {
        require(_id > 0 && _id < itemCount, "Item does not exist");
        Item storage item = items[_id];
        require(msg.value >= item.cost * _quantity, "Not enough ether sent");
        require(item.stock >= _quantity, "Not enough items in stock");

        item.stock -= _quantity;
        orders[msg.sender].push(_id);
        item.seller.transfer(msg.value);
        emit ItemPurchased(msg.sender, _id, _quantity);
    }

    function setShippingInfo(string memory _name, string memory _street, string memory _city, string memory _postalCode, string memory _country) public {
        shippingInfo[msg.sender] = ShippingInfo(_name, _street, _city, _postalCode, _country);
        emit ShippingInfoUpdated(msg.sender, _name, _street, _city, _postalCode, _country);
    }

    function getShippingInfo(address _user) public view returns (ShippingInfo memory) {
        return shippingInfo[_user];
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Balance is 0");
        payable(owner).transfer(balance);
    }

    function deleteItem(uint256 itemId) public onlyOwner {
        require(items[itemId].seller == msg.sender || msg.sender == owner, "Unauthorized");
        delete items[itemId];
        emit ItemDeleted(itemId);
    }
}
