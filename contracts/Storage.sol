pragma solidity >=0.4.22 <0.9.0;

contract Storage {
    //keccak256(concat(key,slot)) for mapping since it cannot store directly
    mapping(uint => uint) public aa;
    mapping (address => uint) public bb;

    uint[] public cc;


    uint8 public a = 7;
    uint16 public b = 10;
    address public c = 0x3164076453C8DFd05D431ce18be4CC0a66C7f632;
    bool d = true;
    uint64 public e = 15;

    //'0x 0f 01 3164076453c8dfd05d431ce18be4cc0a66c7f632 000a 07'


    uint256 public f = 200;
    uint8 public g = 40;
    uint256 public h = 789;

    constructor() {
        cc.push(1);
        cc.push(10);
        cc.push(100);

        aa[2] = 4;
        aa[3] = 10;

        bb[0x3164076453C8DFd05D431ce18be4CC0a66C7f632] = 100;
    }
}