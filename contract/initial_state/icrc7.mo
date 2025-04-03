import ICRC7 "mo:icrc7-mo";

module{
  public let defaultConfig = func(caller: Principal) : ICRC7.InitArgs{
      ?{
        symbol = ?"W2ENFT";
        name = ?"Waste2Earn NFT";
        description = ?"Waste2Earn NFT";
        logo = ?"https://github.com/Wastopia/waste-wallet-final/blob/main/frontend/assets/svg/files/w2e-nft.svg";
        supply_cap = null;
        allow_transfers = null;
        max_query_batch_size = ?100;
        max_update_batch_size = ?100;
        default_take_value = ?1000;
        max_take_value = ?10000;
        max_memo_size = ?512;
        permitted_drift = null;
        tx_window = null;
        burn_account = null; //burned nfts are deleted
        deployer = caller;
        supported_standards = null;
      };
  };
};