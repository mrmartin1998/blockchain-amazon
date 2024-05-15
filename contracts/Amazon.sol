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

    struct Order {
        uint256 orderId;
        uint256 itemId;
        uint256 quantity;
    }

    struct ShippingInfo {
        string name;
        string street;
        string city;
        string postalCode;
        string country;
    }

    mapping(address => uint256[]) public orders;
    mapping(uint256 => Item) public items;
    mapping(uint256 => Order) public orderDetails;
    mapping(address => bool) public isSeller;
    mapping(address => ShippingInfo) public shippingInfo;

    event ItemListed(uint256 indexed itemId, string name, string imageUrl, uint256 cost, uint256 stock, address indexed seller, string manufacturer, string dimensions, uint256 weight);
    event ItemPurchased(uint256 indexed orderId, uint256 indexed itemId, uint256 quantity, address indexed buyer);
    event ShippingInfoUpdated(string name, string street, string city, string postalCode, string country, address indexed user);
    event ItemDeleted(uint256 indexed itemId);
    event SellerAdded(address indexed seller);
    event SellerRemoved(address indexed seller);
    event OrderCreated(uint256 orderId, address buyer);

    constructor() {
        owner = msg.sender;
        isSeller[owner] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    modifier onlySeller() {
        require(isSeller[msg.sender], "Only approved sellers can perform this action.");
        _;
    }

    function addSeller(address _seller) public onlyOwner {
        isSeller[_seller] = true;
        emit SellerAdded(_seller);
    }

    function removeSeller(address _seller) public onlyOwner {
        isSeller[_seller] = false;
        emit SellerRemoved(_seller);
    }

    function list(string memory _name, string memory _category, string memory _imageUrl, uint256 _costWei, uint256 _stock, string memory _manufacturer, string memory _dimensions, uint256 _weight) public onlySeller {
        items[itemCount] = Item(itemCount, _name, _category, _imageUrl, _costWei, _stock, payable(msg.sender), _manufacturer, _dimensions, _weight);
        emit ItemListed(itemCount, _name, _imageUrl, _costWei, _stock, msg.sender, _manufacturer, _dimensions, _weight);
        itemCount++;
    }

    function buy(uint256 _itemId, uint256 _quantity) public payable {
        require(_itemId < itemCount && _itemId > 0, "Item does not exist.");
        require(_quantity > 0, "Quantity must be greater than zero.");
        Item storage item = items[_itemId];
        uint256 totalCost = item.cost * _quantity;
        require(msg.value >= totalCost, "Not enough ether sent.");
        require(item.stock >= _quantity, "Not enough items in stock.");
        item.stock -= _quantity;
        
        uint256 orderId = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, _itemId, _quantity)));
        orders[msg.sender].push(orderId);
        orderDetails[orderId] = Order(orderId, _itemId, _quantity);

        emit OrderCreated(orderId, msg.sender);  // Emit the order creation event
        
        item.seller.transfer(msg.value);
        emit ItemPurchased(orderId, _itemId, _quantity, msg.sender);
    }

    function setShippingInfo(string memory _name, string memory _street, string memory _city, string memory _postalCode, string memory _country) public {
        shippingInfo[msg.sender] = ShippingInfo(_name, _street, _city, _postalCode, _country);
        emit ShippingInfoUpdated(_name, _street, _city, _postalCode, _country, msg.sender);
    }

    function getShippingInfo(address _user) public view returns (ShippingInfo memory) {
        return shippingInfo[_user];
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Balance is 0.");
        payable(owner).transfer(balance);
    }

    function deleteItem(uint256 itemId) public onlyOwner {
        require(items[itemId].seller == msg.sender || msg.sender == owner, "Unauthorized.");
        delete items[itemId];
        emit ItemDeleted(itemId);
    }

    function getOrderIds(address user) public view returns (uint256[] memory) {
        return orders[user];
    }
}
