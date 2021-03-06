import contract from "@truffle/contract"
export const loadContract = async (name, provider) => {
    const result = await fetch(`/contracts/${name}.json`)
    const Artifact = await result.json();

    const _contract = contract(Artifact);
    _contract.setProvider(provider);

    let deployedContract; 
    try {
      deployedContract  = await _contract.deployed();
    } catch {
        console.error("You are connected to the wrong network");
    }

    

    return deployedContract;
}