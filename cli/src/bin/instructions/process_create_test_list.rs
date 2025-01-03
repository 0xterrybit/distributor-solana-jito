use crate::*;

// pub fn process_create_test_list(_args: &Args, func_args: &CreateTestListArgs) {
    
//     let pre_list = get_pre_list();

//     let mut csv_wtr = Writer::from_path(&func_args.csv_path).unwrap();
//     csv_wtr.write_record(&["pubkey", "amount"]).unwrap();

//     for addr in pre_list.iter() {
//         csv_wtr.write_record(&[addr, &format!("{}", func_args.amount)]).unwrap();
//     }
//     csv_wtr.flush().unwrap();

//     let inner_args = &CreateMerkleTreeArgs {
//         csv_path: func_args.csv_path.clone(),
//         merkle_tree_path: func_args.merkle_tree_path.clone(),
//         max_nodes_per_tree: 10,
//         amount: func_args.amount,
//         decimals: func_args.decimals,
//     };

//     process_create_merkle_tree(inner_args);
// }
